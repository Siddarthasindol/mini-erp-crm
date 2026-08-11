import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export interface CustomerFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export const createCustomer = async (data: {
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType?: any;
  address: string;
  status?: any;
  followUpDate?: string | Date;
  notes?: string;
}) => {
  return prisma.customer.create({
    data: {
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      businessName: data.businessName.trim(),
      gstNumber: data.gstNumber ? data.gstNumber.trim().toUpperCase() : null,
      customerType: data.customerType || 'WHOLESALE',
      address: data.address.trim(),
      status: data.status || 'LEAD',
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes ? data.notes.trim() : null,
    },
  });
};

export const getCustomers = async (query: CustomerFilterQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.customerType) {
    where.customerType = query.customerType;
  }

  if (query.search) {
    const searchLower = query.search.trim();
    where.OR = [
      { name: { contains: searchLower } },
      { businessName: { contains: searchLower } },
      { mobile: { contains: searchLower } },
      { email: { contains: searchLower } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { followUps: true, challans: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCustomerById = async (id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: 'desc' },
      },
      challans: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: true,
        },
      },
    },
  });

  if (!customer) {
    throw new NotFoundError(`Customer with ID ${id} not found`);
  }

  return customer;
};

export const updateCustomer = async (id: number, data: any) => {
  await getCustomerById(id);

  return prisma.customer.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.mobile && { mobile: data.mobile.trim() }),
      ...(data.email !== undefined && { email: data.email ? data.email.trim().toLowerCase() : null }),
      ...(data.businessName && { businessName: data.businessName.trim() }),
      ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber ? data.gstNumber.trim().toUpperCase() : null }),
      ...(data.customerType && { customerType: data.customerType }),
      ...(data.address && { address: data.address.trim() }),
      ...(data.status && { status: data.status }),
      ...(data.followUpDate !== undefined && { followUpDate: data.followUpDate ? new Date(data.followUpDate) : null }),
      ...(data.notes !== undefined && { notes: data.notes ? data.notes.trim() : null }),
    },
  });
};

export const deleteCustomer = async (id: number) => {
  await getCustomerById(id);
  return prisma.customer.delete({ where: { id } });
};

export const addCustomerFollowUp = async (
  customerId: number,
  note: string,
  followUpDate?: string | Date,
  userId?: number
) => {
  await getCustomerById(customerId);

  const parsedDate = followUpDate ? new Date(followUpDate) : null;

  const [followUp] = await prisma.$transaction([
    prisma.customerFollowUp.create({
      data: {
        customerId,
        note: note.trim(),
        followUpDate: parsedDate,
        createdBy: userId || null,
      },
    }),
    prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(parsedDate && { followUpDate: parsedDate }),
      },
    }),
  ]);

  return followUp;
};

export const getCustomerFollowUps = async (customerId: number) => {
  await getCustomerById(customerId);
  return prisma.customerFollowUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
};
