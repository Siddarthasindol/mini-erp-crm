import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';

export type MovementTypeStr = 'IN' | 'OUT';

export const createStockMovement = async (data: {
  productId: number;
  quantity: number;
  movementType: MovementTypeStr;
  reason: string;
  userId: number;
}) => {
  const quantity = Number(data.quantity);
  if (quantity <= 0) {
    throw new BadRequestError('Quantity must be greater than zero');
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${data.productId} not found`);
    }

    let newStock = product.currentStock;

    if (data.movementType === 'IN') {
      newStock += quantity;
    } else if (data.movementType === 'OUT') {
      if (product.currentStock < quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${quantity}`
        );
      }
      newStock -= quantity;
    } else {
      throw new BadRequestError('Invalid stock movement type');
    }

    // Update product stock
    await tx.product.update({
      where: { id: data.productId },
      data: { currentStock: newStock },
    });

    // Create stock movement audit record
    const movement = await tx.stockMovement.create({
      data: {
        productId: data.productId,
        quantity,
        movementType: data.movementType as any,
        reason: data.reason.trim(),
        createdBy: data.userId,
      },
      include: {
        product: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return movement;
  });
};

export const getStockMovements = async (page = 1, limit = 20) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
    prisma.stockMovement.count(),
  ]);

  return {
    data: movements,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};
