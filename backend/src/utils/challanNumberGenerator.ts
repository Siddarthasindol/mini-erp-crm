import { prisma } from '../config/prisma';

export const generateChallanNumber = async (): Promise<string> => {
  const latestChallan = await prisma.challan.findFirst({
    orderBy: { id: 'desc' },
    select: { challanNumber: true }
  });

  if (!latestChallan) {
    return 'CH-00001';
  }

  const match = latestChallan.challanNumber.match(/CH-(\d+)/);
  if (match) {
    const nextSeq = parseInt(match[1], 10) + 1;
    return `CH-${nextSeq.toString().padStart(5, '0')}`;
  }

  const count = await prisma.challan.count();
  return `CH-${(count + 1).toString().padStart(5, '0')}`;
};
