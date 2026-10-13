const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.findUnique({
    where: { email: 'demo@partsphere.in' }
  });
  if (!customer) {
    console.error('Customer demo@partsphere.in not found');
    return;
  }

  // Clear existing garage for demo customer to have exact 3 clean vehicles
  await prisma.customerVehicle.deleteMany({
    where: { userId: customer.id }
  });

  const nexonVariant = await prisma.vehicleVariant.findFirst({
    where: { model: { name: { contains: 'Nexon' } } }
  });
  const swiftVariant = await prisma.vehicleVariant.findFirst({
    where: { model: { name: { contains: 'Swift' } } }
  });
  const activaVariant = await prisma.vehicleVariant.findFirst({
    where: { model: { name: { contains: 'Activa' } } }
  });

  console.log('Found variants:', {
    nexon: nexonVariant?.id,
    swift: swiftVariant?.id,
    activa: activaVariant?.id
  });

  // Create Vehicle A: Tata Nexon (Primary)
  const vA = await prisma.customerVehicle.create({
    data: {
      userId: customer.id,
      variantId: nexonVariant.id,
      nickname: 'My Nexon',
      regNumber: 'DL 01 AB 1234',
      isPrimary: true
    }
  });

  // Create Vehicle B: Maruti Swift
  const vB = await prisma.customerVehicle.create({
    data: {
      userId: customer.id,
      variantId: swiftVariant.id,
      nickname: 'Daily Swift',
      regNumber: 'KA 01 MJ 4321',
      isPrimary: false
    }
  });

  // Create Vehicle C: Honda Activa 6G
  const vC = await prisma.customerVehicle.create({
    data: {
      userId: customer.id,
      variantId: activaVariant.id,
      nickname: 'City Activa',
      regNumber: 'MH 02 CD 5678',
      isPrimary: false
    }
  });

  console.log('Created 3 vehicles for demo@partsphere.in:');
  console.log('Vehicle A (Tata Nexon, Primary):', vA.id);
  console.log('Vehicle B (Maruti Swift):', vB.id);
  console.log('Vehicle C (Honda Activa 6G):', vC.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
