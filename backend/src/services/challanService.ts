import { prisma } from '../config/prisma';
import { generateChallanNumber } from '../utils/challanNumberGenerator';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface CreateChallanItemInput {
  productId: number;
  quantity: number;
}

export const createChallan = async (
  customerId: number,
  items: CreateChallanItemInput[],
  userId: number
) => {
  // 1. Verify customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) {
    throw new NotFoundError(`Customer with ID ${customerId} not found`);
  }

  // 2. Fetch all products to create snapshots & calculate total quantity
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalQuantity = 0;
  const itemsToCreate: any[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${item.productId} not found`);
    }

    if (item.quantity <= 0) {
      throw new BadRequestError(`Quantity for product '${product.name}' must be greater than zero`);
    }

    totalQuantity += item.quantity;

    // Snapshot product information into ChallanItem
    itemsToCreate.push({
      productId: product.id,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      unitPriceSnapshot: product.unitPrice,
      quantity: item.quantity,
    });
  }

  const challanNumber = await generateChallanNumber();

  // Create DRAFT Challan - Stock is NOT reduced here!
  const challan = await prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      status: 'DRAFT' as any,
      createdBy: userId,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return challan;
};

export const getChallans = async (page = 1, limit = 10, status?: string, search?: string) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    const searchLower = search.trim();
    where.OR = [
      { challanNumber: { contains: searchLower } },
      { customer: { name: { contains: searchLower } } },
      { customer: { businessName: { contains: searchLower } } },
    ];
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return {
    data: challans,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getChallanById = async (id: number) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!challan) {
    throw new NotFoundError(`Challan with ID ${id} not found`);
  }

  return challan;
};

export const updateChallan = async (
  id: number,
  customerId?: number,
  items?: CreateChallanItemInput[]
) => {
  const existingChallan = await getChallanById(id);

  if (existingChallan.status !== 'DRAFT') {
    throw new BadRequestError(`Only DRAFT challans can be edited`);
  }

  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }
  }

  if (items && items.length > 0) {
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    const itemsToCreate: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId} not found`);
      }
      totalQuantity += item.quantity;
      itemsToCreate.push({
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
      });
    }

    return prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.challanItem.deleteMany({ where: { challanId: id } });

      // Update challan
      return tx.challan.update({
        where: { id },
        data: {
          ...(customerId && { customerId }),
          totalQuantity,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    });
  }

  return prisma.challan.update({
    where: { id },
    data: {
      ...(customerId && { customerId }),
    },
    include: {
      customer: true,
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

export const confirmChallan = async (id: number, userId: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. Check challan exists
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });

    if (!challan) {
      throw new NotFoundError(`Challan with ID ${id} not found`);
    }

    // 2. Check challan is currently DRAFT
    if (challan.status !== 'DRAFT') {
      throw new BadRequestError(
        `Challan ${challan.challanNumber} is currently in '${challan.status}' status and cannot be confirmed`
      );
    }

    // 3. Load all challan items and current stock for every product
    const productIds = challan.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 4 & 5. Check stock for every product. If any product has insufficient stock, reject entire confirmation!
    for (const item of challan.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId} not found`);
      }

      if (product.currentStock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    // 8, 9, 10. Perform atomic updates: Reduce stock & Create OUT StockMovements
    for (const item of challan.items) {
      const product = productMap.get(item.productId)!;
      const newStock = product.currentStock - item.quantity;

      // Reduce stock
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newStock },
      });

      // Create OUT Stock Movement record
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: item.quantity,
          movementType: 'OUT' as any,
          reason: `Sales Challan Confirmation (${challan.challanNumber} - Customer: ${challan.customer.name})`,
          createdBy: userId,
        },
      });
    }

    // Update challan status to CONFIRMED
    const updatedChallan = await tx.challan.update({
      where: { id },
      data: { status: 'CONFIRMED' as any },
      include: {
        customer: true,
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return updatedChallan;
  });
};

export const cancelChallan = async (id: number) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
  });

  if (!challan) {
    throw new NotFoundError(`Challan with ID ${id} not found`);
  }

  if (challan.status === 'CANCELLED') {
    throw new BadRequestError(`Challan ${challan.challanNumber} is already cancelled`);
  }

  if (challan.status === 'CONFIRMED') {
    throw new BadRequestError(
      `Confirmed challan ${challan.challanNumber} cannot be cancelled directly to maintain audit trail and prevent inventory discrepancy.`
    );
  }

  // Cancel DRAFT challan
  return prisma.challan.update({
    where: { id },
    data: { status: 'CANCELLED' as any },
    include: {
      customer: true,
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};
