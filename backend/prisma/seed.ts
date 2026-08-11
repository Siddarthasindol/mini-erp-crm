import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // Clean existing data
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Hash password helper
  const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, 10);

  // 1. Seed Users
  console.log('👤 Seeding 4 default system users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashPassword('Admin@123'),
      role: 'ADMIN' as any,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sales Manager',
      email: 'sales@test.com',
      password: hashPassword('Sales@123'),
      role: 'SALES' as any,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Warehouse Supervisor',
      email: 'warehouse@test.com',
      password: hashPassword('Warehouse@123'),
      role: 'WAREHOUSE' as any,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Accounts Officer',
      email: 'accounts@test.com',
      password: hashPassword('Accounts@123'),
      role: 'ACCOUNTS' as any,
    },
  });

  // 2. Seed Customers
  console.log('🏢 Seeding 10 realistic Indian wholesale/distribution customers...');
  const customerData = [
    {
      name: 'Rajesh Sharma',
      businessName: 'Apex Electricals & Cables Ltd',
      mobile: '+91 98200 11223',
      email: 'contact@apexelectricals.co.in',
      gstNumber: '27AAACA12341Z1',
      customerType: 'WHOLESALE' as any,
      address: 'Plot 45, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
      status: 'ACTIVE' as any,
      followUpDate: new Date(Date.now() + 86400000 * 3),
      notes: 'Key distributor for Western region. High monthly volume requirements.',
    },
    {
      name: 'Sanjay Verma',
      businessName: 'Bharat Infrastructure & Hardware',
      mobile: '+91 98450 33445',
      email: 'procurement@bharatinfra.in',
      gstNumber: '29BBBCA56782Z5',
      customerType: 'DISTRIBUTOR' as any,
      address: 'Industrial Suburb, Rajajinagar, Bengaluru, Karnataka 560010',
      status: 'ACTIVE' as any,
      followUpDate: new Date(Date.now() + 86400000 * 5),
      notes: 'Interested in bulk orders for commercial hardware supplies.',
    },
    {
      name: 'Vikram Patel',
      businessName: 'Delta Industrial Supplies',
      mobile: '+91 97120 55667',
      email: 'sales@deltasupplies.com',
      gstNumber: '24CCCCA90123Z9',
      customerType: 'WHOLESALE' as any,
      address: 'GIDC Estate, Makarpura, Vadodara, Gujarat 390010',
      status: 'LEAD' as any,
      followUpDate: new Date(Date.now() + 86400000 * 1),
      notes: 'Met at Trade Expo 2026. Requested product catalog and price list.',
    },
    {
      name: 'Amit Agarwal',
      businessName: 'Eastern Hardware Mart',
      mobile: '+91 98310 77889',
      email: 'eastern.hardware@gmail.com',
      gstNumber: '19DDDDA34564Z3',
      customerType: 'RETAIL' as any,
      address: '12 Strand Road, Bara Bazar, Kolkata, West Bengal 700001',
      status: 'ACTIVE' as any,
      followUpDate: new Date(Date.now() + 86400000 * 7),
      notes: 'Regular retail buyer for copper fittings and cables.',
    },
    {
      name: 'Priya Sundaram',
      businessName: 'Southern Machinery & Tools Co',
      mobile: '+91 94440 99001',
      email: 'priya@southernmachinery.co.in',
      gstNumber: '33EEEEA78905Z8',
      customerType: 'DISTRIBUTOR' as any,
      address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu 600058',
      status: 'ACTIVE' as any,
      followUpDate: new Date(Date.now() + 86400000 * 2),
      notes: 'Requested updated quarterly pricing schedule for Q3.',
    },
    {
      name: 'Karan Malhotra',
      businessName: 'North Star Enterprise',
      mobile: '+91 98110 22334',
      email: 'karan@northstar.co.in',
      gstNumber: '07FFFFA12346Z2',
      customerType: 'WHOLESALE' as any,
      address: 'Okhla Industrial Area Phase 3, New Delhi 110020',
      status: 'LEAD' as any,
      followUpDate: new Date(Date.now() + 86400000 * 4),
      notes: 'Prospect for upcoming infrastructural tender in NCR.',
    },
    {
      name: 'Suresh Reddy',
      businessName: 'Deccan Electrical Solutions',
      mobile: '+91 99890 44556',
      email: 'suresh@deccanelectrical.com',
      gstNumber: '36GGGGA56787Z6',
      customerType: 'WHOLESALE' as any,
      address: 'Sanathnagar Industrial Estate, Hyderabad, Telangana 500018',
      status: 'ACTIVE' as any,
      followUpDate: new Date(Date.now() + 86400000 * 6),
      notes: 'Prompt payment history. Eligible for 5% volume rebate.',
    },
    {
      name: 'Rohan Gupta',
      businessName: 'Gupta Steel & Hardware',
      mobile: '+91 94150 66778',
      email: 'guptasteel.kanpur@gmail.com',
      gstNumber: '09HHHHA90128Z0',
      customerType: 'RETAIL' as any,
      address: 'Transport Nagar, Kanpur, Uttar Pradesh 208023',
      status: 'INACTIVE' as any,
      followUpDate: null,
      notes: 'No recent orders in 6 months. Account flagged for re-engagement.',
    },
    {
      name: 'Sunil Mehta',
      businessName: 'Pacific Auto Parts & Distribution',
      mobile: '+91 98250 88990',
      email: 'sunil@pacificauto.com',
      gstNumber: '24IIIIA34569Z4',
      customerType: 'DISTRIBUTOR' as any,
      address: 'Changodar Industrial Zone, Ahmedabad, Gujarat 382213',
      status: 'ACTIVE' as any,
      followUpDate: new Date(Date.now() + 86400000 * 8),
      notes: 'Distributes specialized pneumatic tools and power switches.',
    },
    {
      name: 'Manoj Joshi',
      businessName: 'Royal Techno Equipment',
      mobile: '+91 98220 12345',
      email: 'manoj@royaltechno.in',
      gstNumber: '27JJJJA78900Z7',
      customerType: 'WHOLESALE' as any,
      address: 'Bhosari Industrial Area, Pune, Maharashtra 411026',
      status: 'LEAD' as any,
      followUpDate: new Date(Date.now() + 86400000 * 2),
      notes: 'Follow up required regarding customized packaging options.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);

    if (cust.status !== 'INACTIVE') {
      await prisma.customerFollowUp.create({
        data: {
          customerId: cust.id,
          note: `Initial CRM contact: ${cust.notes}`,
          followUpDate: cust.followUpDate,
          createdBy: salesUser.id,
        },
      });
    }
  }

  // 3. Seed Products
  console.log('📦 Seeding 15 products with stock levels and low-stock items...');
  const productData = [
    {
      name: 'Heavy Duty Copper Cable 3-Core 100m',
      sku: 'CABL-3C-100',
      category: 'Electrical & Cables',
      unitPrice: 4500.0,
      currentStock: 120,
      minimumStock: 25,
      warehouseLocation: 'Bay A1 - Rack 04',
    },
    {
      name: 'Industrial Circuit Breaker 63A MCB',
      sku: 'MCB-63A-4P',
      category: 'Electrical & Cables',
      unitPrice: 1250.0,
      currentStock: 45,
      minimumStock: 15,
      warehouseLocation: 'Bay A2 - Shelf 02',
    },
    {
      name: 'Digital Multimeter Pro 1000V',
      sku: 'TOOL-DMM-PRO',
      category: 'Test & Measurement',
      unitPrice: 3200.0,
      currentStock: 8,
      minimumStock: 10,
      warehouseLocation: 'Bay B1 - Cabinet 01',
    },
    {
      name: 'Pneumatic Impact Wrench 1/2 Inch',
      sku: 'PNEM-IMP-50',
      category: 'Power Tools',
      unitPrice: 8500.0,
      currentStock: 30,
      minimumStock: 5,
      warehouseLocation: 'Bay B3 - Rack 01',
    },
    {
      name: 'Stainless Steel Flange Valve 2 Inch',
      sku: 'VALV-SS-02',
      category: 'Pipes & Valves',
      unitPrice: 2800.0,
      currentStock: 4,
      minimumStock: 15,
      warehouseLocation: 'Bay C1 - Rack 03',
    },
    {
      name: 'High Pressure Hydraulic Hose 10m',
      sku: 'HOSE-HYD-10M',
      category: 'Pipes & Valves',
      unitPrice: 1950.0,
      currentStock: 60,
      minimumStock: 20,
      warehouseLocation: 'Bay C2 - Rack 02',
    },
    {
      name: 'LED Industrial Bay Light 150W',
      sku: 'LGT-BAY-150W',
      category: 'Lighting & Fixtures',
      unitPrice: 2200.0,
      currentStock: 85,
      minimumStock: 30,
      warehouseLocation: 'Bay D1 - Pallet 05',
    },
    {
      name: 'Variable Frequency Drive VFD 7.5kW',
      sku: 'VFD-7KW-3P',
      category: 'Automation & Drives',
      unitPrice: 24500.0,
      currentStock: 2,
      minimumStock: 5,
      warehouseLocation: 'Bay D3 - Secure Lock 02',
    },
    {
      name: 'Safety Helmet Industrial Grade Class E',
      sku: 'PPE-HLMT-BLU',
      category: 'Safety & Protection',
      unitPrice: 450.0,
      currentStock: 300,
      minimumStock: 50,
      warehouseLocation: 'Bay E1 - Bin 12',
    },
    {
      name: 'Protective Safety Goggles Anti-Fog',
      sku: 'PPE-GGL-AF',
      category: 'Safety & Protection',
      unitPrice: 180.0,
      currentStock: 15,
      minimumStock: 40,
      warehouseLocation: 'Bay E1 - Bin 14',
    },
    {
      name: 'Industrial Rubber Safety Boots Size 9',
      sku: 'PPE-BOOT-09',
      category: 'Safety & Protection',
      unitPrice: 1400.0,
      currentStock: 55,
      minimumStock: 20,
      warehouseLocation: 'Bay E2 - Shelf 05',
    },
    {
      name: '3-Phase Asynchronous Electric Motor 5HP',
      sku: 'MOTR-3P-05HP',
      category: 'Automation & Drives',
      unitPrice: 16500.0,
      currentStock: 12,
      minimumStock: 4,
      warehouseLocation: 'Bay D2 - Heavy Rack 01',
    },
    {
      name: 'Brass Ball Valve 1 Inch BSP',
      sku: 'VALV-BRS-01',
      category: 'Pipes & Valves',
      unitPrice: 350.0,
      currentStock: 450,
      minimumStock: 100,
      warehouseLocation: 'Bay C3 - Bin 08',
    },
    {
      name: 'Synthetic Grease Lubricant 18kg Drum',
      sku: 'LUB-GRS-18K',
      category: 'Chemicals & Lubricants',
      unitPrice: 6200.0,
      currentStock: 18,
      minimumStock: 10,
      warehouseLocation: 'Hazardous Store H1',
    },
    {
      name: 'Precision Vernier Caliper 150mm',
      sku: 'TOOL-CAL-150',
      category: 'Test & Measurement',
      unitPrice: 1600.0,
      currentStock: 3,
      minimumStock: 8,
      warehouseLocation: 'Bay B1 - Cabinet 03',
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);

    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.currentStock + 20,
        movementType: 'IN' as any,
        reason: 'Initial Inventory Inward Procurement',
        createdBy: warehouseUser.id,
      },
    });
  }

  // 4. Seed Sales Challans & ChallanItems
  console.log('📋 Seeding Sales Challans (DRAFT and CONFIRMED)...');

  // Challan 1: CONFIRMED Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-00001',
      customerId: createdCustomers[0].id,
      totalQuantity: 15,
      status: 'CONFIRMED' as any,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productNameSnapshot: createdProducts[0].name,
            skuSnapshot: createdProducts[0].sku,
            unitPriceSnapshot: createdProducts[0].unitPrice,
            quantity: 10,
          },
          {
            productId: createdProducts[1].id,
            productNameSnapshot: createdProducts[1].name,
            skuSnapshot: createdProducts[1].sku,
            unitPriceSnapshot: createdProducts[1].unitPrice,
            quantity: 5,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[0].id,
      quantity: 10,
      movementType: 'OUT' as any,
      reason: `Sales Challan Confirmation (CH-00001 - Customer: ${createdCustomers[0].name})`,
      createdBy: salesUser.id,
    },
  });
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[1].id,
      quantity: 5,
      movementType: 'OUT' as any,
      reason: `Sales Challan Confirmation (CH-00001 - Customer: ${createdCustomers[0].name})`,
      createdBy: salesUser.id,
    },
  });

  // Challan 2: DRAFT Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-00002',
      customerId: createdCustomers[1].id,
      totalQuantity: 20,
      status: 'DRAFT' as any,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[6].id,
            productNameSnapshot: createdProducts[6].name,
            skuSnapshot: createdProducts[6].sku,
            unitPriceSnapshot: createdProducts[6].unitPrice,
            quantity: 15,
          },
          {
            productId: createdProducts[8].id,
            productNameSnapshot: createdProducts[8].name,
            skuSnapshot: createdProducts[8].sku,
            unitPriceSnapshot: createdProducts[8].unitPrice,
            quantity: 5,
          },
        ],
      },
    },
  });

  // Challan 3: DRAFT Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-00003',
      customerId: createdCustomers[4].id,
      totalQuantity: 2,
      status: 'DRAFT' as any,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[11].id,
            productNameSnapshot: createdProducts[11].name,
            skuSnapshot: createdProducts[11].sku,
            unitPriceSnapshot: createdProducts[11].unitPrice,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('====================================================');
  console.log('Test Credentials:');
  console.log('1. Admin:     admin@test.com     / Admin@123');
  console.log('2. Sales:     sales@test.com     / Sales@123');
  console.log('3. Warehouse: warehouse@test.com / Warehouse@123');
  console.log('4. Accounts:  accounts@test.com  / Accounts@123');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
