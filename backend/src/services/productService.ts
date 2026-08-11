import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export const createProduct = async (data: {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}) => {
  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku.trim().toUpperCase() },
  });

  if (existingSku) {
    throw new BadRequestError(`Product with SKU '${data.sku.trim().toUpperCase()}' already exists`);
  }

  return prisma.product.create({
    data: {
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category: data.category.trim(),
      unitPrice: Number(data.unitPrice),
      currentStock: Number(data.currentStock),
      minimumStock: Number(data.minimumStock),
      warehouseLocation: data.warehouseLocation.trim(),
    },
  });
};

export const getProducts = async (query: ProductFilterQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.category) {
    where.category = { equals: query.category.trim() };
  }

  if (query.search) {
    const searchLower = query.search.trim();
    where.OR = [
      { name: { contains: searchLower } },
      { sku: { contains: searchLower } },
      { category: { contains: searchLower } },
      { warehouseLocation: { contains: searchLower } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minimumStock,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getLowStockProducts = async () => {
  const products = await prisma.product.findMany({
    orderBy: { currentStock: 'asc' },
  });

  const lowStock = products
    .filter((p) => p.currentStock <= p.minimumStock)
    .map((p) => ({
      ...p,
      isLowStock: true,
    }));

  return lowStock;
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }

  return {
    ...product,
    isLowStock: product.currentStock <= product.minimumStock,
  };
};

export const updateProduct = async (id: number, data: any) => {
  await getProductById(id);

  if (data.sku) {
    const existingSku = await prisma.product.findFirst({
      where: {
        sku: data.sku.trim().toUpperCase(),
        NOT: { id },
      },
    });
    if (existingSku) {
      throw new BadRequestError(`Product with SKU '${data.sku.trim().toUpperCase()}' already exists`);
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.sku && { sku: data.sku.trim().toUpperCase() }),
      ...(data.category && { category: data.category.trim() }),
      ...(data.unitPrice !== undefined && { unitPrice: Number(data.unitPrice) }),
      ...(data.currentStock !== undefined && { currentStock: Number(data.currentStock) }),
      ...(data.minimumStock !== undefined && { minimumStock: Number(data.minimumStock) }),
      ...(data.warehouseLocation && { warehouseLocation: data.warehouseLocation.trim() }),
    },
  });
};

export const deleteProduct = async (id: number) => {
  await getProductById(id);
  return prisma.product.delete({ where: { id } });
};

export const getProductStockMovements = async (productId: number) => {
  await getProductById(productId);
  return prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
};
