import { prisma } from '../config/prisma';

export const getDashboardStats = async () => {
  const [
    totalCustomers,
    totalProducts,
    allProducts,
    draftChallansCount,
    confirmedChallansCount,
    recentCustomers,
    recentChallans,
    upcomingFollowUps,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.product.findMany({ select: { id: true, name: true, sku: true, currentStock: true, minimumStock: true, category: true, warehouseLocation: true } }),
    prisma.challan.count({ where: { status: 'DRAFT' as any } }),
    prisma.challan.count({ where: { status: 'CONFIRMED' as any } }),
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, businessName: true, status: true, customerType: true, createdAt: true },
    }),
    prisma.challan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
      },
    }),
    prisma.customer.findMany({
      where: {
        followUpDate: { not: null },
      },
      take: 5,
      orderBy: { followUpDate: 'asc' },
      select: { id: true, name: true, businessName: true, followUpDate: true, status: true },
    }),
  ]);

  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);

  return {
    summary: {
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      draftChallansCount,
      confirmedChallansCount,
      upcomingFollowUpsCount: upcomingFollowUps.length,
    },
    lowStockProducts,
    recentCustomers,
    recentChallans,
    upcomingFollowUps,
  };
};
