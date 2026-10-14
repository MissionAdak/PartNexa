import {
  PrismaClient,
  UserRole,
  UserStatus,
  VehicleType,
  FuelType,
  ProductCondition,
  ProductStatus,
  StockAvailability,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PartSphere (PartNexa) database seed...');

  // ------------------------------------------------------------
  // 1. DEFAULT USERS FOR ALL 4 ROLES
  // ------------------------------------------------------------
  console.log('👤 Creating default users for all 4 roles...');
  const salt = 12;
  const adminPassword = await bcrypt.hash('Admin@1234', salt);
  const demoPassword = await bcrypt.hash('Demo@1234', salt);
  const shopPassword = await bcrypt.hash('Shop@1234', salt);
  const riderPassword = await bcrypt.hash('Rider@1234', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@partsphere.in' },
    update: {},
    create: {
      email: 'admin@partsphere.in',
      password: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      phone: '+919876500001',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'demo@partsphere.in' },
    update: {},
    create: {
      email: 'demo@partsphere.in',
      password: demoPassword,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+919876500002',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      cart: { create: {} },
      addresses: {
        create: {
          label: 'Home',
          fullName: 'Aarav Sharma',
          phone: '+919876500002',
          line1: 'Flat 402, Green Palms Heights',
          line2: '18th Main Road, 4th Block, HSR Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560102',
          landmark: 'Near BDA Complex',
          isDefault: true,
        },
      },
    },
  });

  const shopOwner1 = await prisma.user.upsert({
    where: { email: 'apex.shop@partsphere.in' },
    update: {},
    create: {
      email: 'apex.shop@partsphere.in',
      password: shopPassword,
      firstName: 'Ramesh',
      lastName: 'Gowda',
      phone: '+919876500003',
      role: UserRole.SHOP_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const shopOwner2 = await prisma.user.upsert({
    where: { email: 'speedy.shop@partsphere.in' },
    update: {},
    create: {
      email: 'speedy.shop@partsphere.in',
      password: shopPassword,
      firstName: 'Vikram',
      lastName: 'Mehta',
      phone: '+919876500004',
      role: UserRole.SHOP_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const shopOwner3 = await prisma.user.upsert({
    where: { email: 'sai.clinic@partsphere.in' },
    update: {},
    create: {
      email: 'sai.clinic@partsphere.in',
      password: shopPassword,
      firstName: 'Sunil',
      lastName: 'Verma',
      phone: '+919876500005',
      role: UserRole.SHOP_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const deliveryUser = await prisma.user.upsert({
    where: { email: 'rider.rajesh@partsphere.in' },
    update: {},
    create: {
      email: 'rider.rajesh@partsphere.in',
      password: riderPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+919876500006',
      role: UserRole.DELIVERY_PARTNER,
      status: UserStatus.ACTIVE,
      deliveryPartner: {
        create: {
          vehicleType: 'Bike',
          vehicleNum: 'KA-01-EQ-9876',
          licenseNumber: 'KA-20210009876',
          isOnline: true,
          rating: 4.9,
          totalDeliveries: 342,
        },
      },
    },
  });

  // ------------------------------------------------------------
  // 2. AT LEAST 3 VERIFIED REGIONAL SHOPS
  // ------------------------------------------------------------
  console.log('🏪 Creating verified physical repair & spare parts shops...');
  const shop1 = await prisma.shop.upsert({
    where: { slug: 'apex-auto-care-bangalore' },
    update: {},
    create: {
      ownerId: shopOwner1.id,
      name: 'Apex Auto Care & Spares',
      slug: 'apex-auto-care-bangalore',
      description: 'Authorized Bosch Car Service Centre & Genuine Spares Distributor. Specializing in Diagnostics & Mechanical Overhaul.',
      phone: '+918025551234',
      email: 'contact@apexautocare.in',
      gstNumber: '29ABCDE1234F1Z5',
      addressLine1: '#42, 80 Feet Road, 5th Block',
      addressLine2: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      latitude: 12.9352,
      longitude: 77.6245,
      isVerified: true,
      isActive: true,
      serviceAvailable: true,
      rating: 4.8,
      totalRatings: 142,
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { slug: 'speedy-wheels-mumbai' },
    update: {},
    create: {
      ownerId: shopOwner2.id,
      name: 'Speedy Wheels Garage & Spares',
      slug: 'speedy-wheels-mumbai',
      description: 'Premier Multi-brand Two & Four Wheeler Service Hub with extensive spare parts warehouse in Western Suburbs.',
      phone: '+912228309876',
      email: 'mumbai@speedywheels.in',
      gstNumber: '27AABCS5678D1Z2',
      addressLine1: 'Unit 12, Industrial Area, M.V. Road',
      addressLine2: 'Chakala, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400099',
      latitude: 19.1136,
      longitude: 72.8697,
      isVerified: true,
      isActive: true,
      serviceAvailable: true,
      rating: 4.6,
      totalRatings: 98,
    },
  });

  const shop3 = await prisma.shop.upsert({
    where: { slug: 'sai-car-clinic-delhi' },
    update: {},
    create: {
      ownerId: shopOwner3.id,
      name: 'Sai Car Clinic & Genuine Parts',
      slug: 'sai-car-clinic-delhi',
      description: 'Leading North India automotive components supplier and certified DIFM home-visit service provider.',
      phone: '+911143217890',
      email: 'delhi@saicarclinic.in',
      gstNumber: '07AAACS9988C1Z8',
      addressLine1: 'Shop 8-9, Regal Building Complex',
      addressLine2: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
      isVerified: true,
      isActive: true,
      serviceAvailable: true,
      rating: 4.9,
      totalRatings: 210,
    },
  });

  // ------------------------------------------------------------
  // 3. TOP AUTOMOTIVE BRANDS
  // ------------------------------------------------------------
  console.log('🏷️  Creating automotive brands...');
  const brandsData = [
    { name: 'Bosch', slug: 'bosch', isOem: true, country: 'Germany', logoUrl: '/brands/bosch.svg' },
    { name: 'Brembo', slug: 'brembo', isOem: true, country: 'Italy', logoUrl: '/brands/brembo.svg' },
    { name: 'Motul', slug: 'motul', isOem: true, country: 'France', logoUrl: '/brands/motul.svg' },
    { name: 'Exide', slug: 'exide', isOem: true, country: 'India', logoUrl: '/brands/exide.svg' },
    { name: 'Amaron', slug: 'amaron', isOem: true, country: 'India', logoUrl: '/brands/amaron.svg' },
    { name: 'Lumax', slug: 'lumax', isOem: true, country: 'India', logoUrl: '/brands/lumax.svg' },
    { name: 'Uno Minda', slug: 'uno-minda', isOem: true, country: 'India', logoUrl: '/brands/unominda.svg' },
    { name: 'Castrol', slug: 'castrol', isOem: false, country: 'United Kingdom', logoUrl: '/brands/castrol.svg' },
    { name: 'Mann-Filter', slug: 'mann-filter', isOem: true, country: 'Germany', logoUrl: '/brands/mann.svg' },
    { name: 'Valeo', slug: 'valeo', isOem: true, country: 'France', logoUrl: '/brands/valeo.svg' },
    { name: 'Gabriel', slug: 'gabriel', isOem: true, country: 'India', logoUrl: '/brands/gabriel.svg' },
    { name: 'SKF', slug: 'skf', isOem: true, country: 'Sweden', logoUrl: '/brands/skf.svg' },
    { name: 'Denso', slug: 'denso', isOem: true, country: 'Japan', logoUrl: '/brands/denso.svg' },
    { name: 'Continental', slug: 'continental', isOem: true, country: 'Germany', logoUrl: '/brands/continental.svg' },
    { name: 'Behr', slug: 'behr', isOem: true, country: 'Germany', logoUrl: '/brands/behr.svg' },
    { name: 'NGK', slug: 'ngk', isOem: true, country: 'Japan', logoUrl: '/brands/ngk.svg' },
    { name: 'Shell', slug: 'shell', isOem: false, country: 'Netherlands', logoUrl: '/brands/shell.svg' },
    { name: 'Delphi', slug: 'delphi', isOem: true, country: 'United States', logoUrl: '/brands/delphi.svg' },
    { name: 'Rolon', slug: 'rolon', isOem: true, country: 'India', logoUrl: '/brands/rolon.svg' },
    { name: 'KBX', slug: 'kbx', isOem: true, country: 'India', logoUrl: '/brands/kbx.svg' },
    { name: 'Purolator', slug: 'purolator', isOem: true, country: 'United States', logoUrl: '/brands/purolator.svg' },
    { name: 'Hyundai Mobis', slug: 'hyundai-mobis', isOem: true, country: 'South Korea', logoUrl: '/brands/hyundai.svg' },
  ];

  const brandsMap = new Map();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandsMap.set(b.name, brand);
  }

  // ------------------------------------------------------------
    // ------------------------------------------------------------
  // 4. VEHICLES (CARS, BIKES, SCOOTERS)
  // ------------------------------------------------------------
  console.log('🚗 Creating vehicles (Cars, Bikes, Scooters)...');

  // --- 13 CAR MAKES ---
  const maruti = await prisma.vehicleMake.upsert({
    where: { name: 'Maruti Suzuki' },
    update: {},
    create: { name: 'Maruti Suzuki', type: VehicleType.CAR },
  });
  const hyundai = await prisma.vehicleMake.upsert({
    where: { name: 'Hyundai' },
    update: {},
    create: { name: 'Hyundai', type: VehicleType.CAR },
  });
  const tata = await prisma.vehicleMake.upsert({
    where: { name: 'Tata' },
    update: {},
    create: { name: 'Tata', type: VehicleType.CAR },
  });
  const mahindra = await prisma.vehicleMake.upsert({
    where: { name: 'Mahindra' },
    update: {},
    create: { name: 'Mahindra', type: VehicleType.CAR },
  });
  const hondaCar = await prisma.vehicleMake.upsert({
    where: { name: 'Honda' },
    update: {},
    create: { name: 'Honda', type: VehicleType.CAR },
  });
  const toyota = await prisma.vehicleMake.upsert({
    where: { name: 'Toyota' },
    update: {},
    create: { name: 'Toyota', type: VehicleType.CAR },
  });
  const kia = await prisma.vehicleMake.upsert({
    where: { name: 'Kia' },
    update: {},
    create: { name: 'Kia', type: VehicleType.CAR },
  });
  const skoda = await prisma.vehicleMake.upsert({
    where: { name: 'Skoda' },
    update: {},
    create: { name: 'Skoda', type: VehicleType.CAR },
  });
  const volkswagen = await prisma.vehicleMake.upsert({
    where: { name: 'Volkswagen' },
    update: {},
    create: { name: 'Volkswagen', type: VehicleType.CAR },
  });
  const renault = await prisma.vehicleMake.upsert({
    where: { name: 'Renault' },
    update: {},
    create: { name: 'Renault', type: VehicleType.CAR },
  });
  const nissan = await prisma.vehicleMake.upsert({
    where: { name: 'Nissan' },
    update: {},
    create: { name: 'Nissan', type: VehicleType.CAR },
  });
  const mg = await prisma.vehicleMake.upsert({
    where: { name: 'MG' },
    update: {},
    create: { name: 'MG', type: VehicleType.CAR },
  });
  const jeep = await prisma.vehicleMake.upsert({
    where: { name: 'Jeep' },
    update: {},
    create: { name: 'Jeep', type: VehicleType.CAR },
  });

  // --- 10 BIKE / SCOOTER MAKES ---
  const hero = await prisma.vehicleMake.upsert({
    where: { name: 'Hero' },
    update: {},
    create: { name: 'Hero', type: VehicleType.BIKE },
  });
  const hondaBike = await prisma.vehicleMake.upsert({
    where: { name: 'Honda 2-Wheelers' },
    update: {},
    create: { name: 'Honda 2-Wheelers', type: VehicleType.SCOOTER },
  });
  const bajaj = await prisma.vehicleMake.upsert({
    where: { name: 'Bajaj' },
    update: {},
    create: { name: 'Bajaj', type: VehicleType.BIKE },
  });
  const tvs = await prisma.vehicleMake.upsert({
    where: { name: 'TVS' },
    update: {},
    create: { name: 'TVS', type: VehicleType.SCOOTER },
  });
  const royalEnfield = await prisma.vehicleMake.upsert({
    where: { name: 'Royal Enfield' },
    update: {},
    create: { name: 'Royal Enfield', type: VehicleType.BIKE },
  });
  const yamaha = await prisma.vehicleMake.upsert({
    where: { name: 'Yamaha' },
    update: {},
    create: { name: 'Yamaha', type: VehicleType.BIKE },
  });
  const suzuki = await prisma.vehicleMake.upsert({
    where: { name: 'Suzuki' },
    update: {},
    create: { name: 'Suzuki', type: VehicleType.SCOOTER },
  });
  const ktm = await prisma.vehicleMake.upsert({
    where: { name: 'KTM' },
    update: {},
    create: { name: 'KTM', type: VehicleType.BIKE },
  });
  const ather = await prisma.vehicleMake.upsert({
    where: { name: 'Ather' },
    update: {},
    create: { name: 'Ather', type: VehicleType.SCOOTER },
  });
  const ola = await prisma.vehicleMake.upsert({
    where: { name: 'Ola Electric' },
    update: {},
    create: { name: 'Ola Electric', type: VehicleType.SCOOTER },
  });

  // Popular Models & Variants
  // 1. Maruti Suzuki
  const swiftModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: maruti.id, name: 'Swift' } },
    update: {},
    create: { makeId: maruti.id, name: 'Swift', type: VehicleType.CAR },
  });
  const swiftVXi = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: swiftModel.id, name: 'VXi', year: 2022, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: swiftModel.id, name: 'VXi', year: 2022, fuelType: FuelType.PETROL, engineCC: 1197 },
  });
  const swiftZXi = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: swiftModel.id, name: 'ZXi', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: swiftModel.id, name: 'ZXi', year: 2023, fuelType: FuelType.PETROL, engineCC: 1197 },
  });

  const balenoModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: maruti.id, name: 'Baleno' } },
    update: {},
    create: { makeId: maruti.id, name: 'Baleno', type: VehicleType.CAR },
  });
  const balenoDelta = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: balenoModel.id, name: 'Delta', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: balenoModel.id, name: 'Delta', year: 2023, fuelType: FuelType.PETROL, engineCC: 1197 },
  });

  const brezzaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: maruti.id, name: 'Brezza' } },
    update: {},
    create: { makeId: maruti.id, name: 'Brezza', type: VehicleType.CAR },
  });
  const brezzaVXi = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: brezzaModel.id, name: 'VXi', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: brezzaModel.id, name: 'VXi', year: 2023, fuelType: FuelType.PETROL, engineCC: 1462 },
  });

  // 2. Hyundai
  const cretaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hyundai.id, name: 'Creta' } },
    update: {},
    create: { makeId: hyundai.id, name: 'Creta', type: VehicleType.CAR },
  });
  const cretaSX = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: cretaModel.id, name: 'SX', year: 2022, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: cretaModel.id, name: 'SX', year: 2022, fuelType: FuelType.PETROL, engineCC: 1497 },
  });

  const i20Model = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hyundai.id, name: 'i20' } },
    update: {},
    create: { makeId: hyundai.id, name: 'i20', type: VehicleType.CAR },
  });
  const i20Magna = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: i20Model.id, name: 'Magna', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: i20Model.id, name: 'Magna', year: 2023, fuelType: FuelType.PETROL, engineCC: 1197 },
  });

  // 3. Tata
  const nexonModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: tata.id, name: 'Nexon' } },
    update: {},
    create: { makeId: tata.id, name: 'Nexon', type: VehicleType.CAR },
  });
  const nexonCreative = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: nexonModel.id, name: 'Creative', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: nexonModel.id, name: 'Creative', year: 2023, fuelType: FuelType.PETROL, engineCC: 1199 },
  });

  // 4. Mahindra
  const tharModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: mahindra.id, name: 'Thar' } },
    update: {},
    create: { makeId: mahindra.id, name: 'Thar', type: VehicleType.CAR },
  });
  const thar4x4 = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: tharModel.id, name: 'LX 4x4', year: 2023, fuelType: FuelType.DIESEL } },
    update: {},
    create: { modelId: tharModel.id, name: 'LX 4x4', year: 2023, fuelType: FuelType.DIESEL, engineCC: 2184 },
  });

  // 5. Honda Car
  const cityModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hondaCar.id, name: 'City' } },
    update: {},
    create: { makeId: hondaCar.id, name: 'City', type: VehicleType.CAR },
  });
  const cityV = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: cityModel.id, name: 'V', year: 2022, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: cityModel.id, name: 'V', year: 2022, fuelType: FuelType.PETROL, engineCC: 1498 },
  });

  // 6. Toyota
  const innovaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: toyota.id, name: 'Innova Crysta' } },
    update: {},
    create: { makeId: toyota.id, name: 'Innova Crysta', type: VehicleType.CAR },
  });
  const innovaGX = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: innovaModel.id, name: 'GX', year: 2023, fuelType: FuelType.DIESEL } },
    update: {},
    create: { modelId: innovaModel.id, name: 'GX', year: 2023, fuelType: FuelType.DIESEL, engineCC: 2393 },
  });

  // 7. Kia
  const seltosModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: kia.id, name: 'Seltos' } },
    update: {},
    create: { makeId: kia.id, name: 'Seltos', type: VehicleType.CAR },
  });
  const seltosHTX = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: seltosModel.id, name: 'HTX', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: seltosModel.id, name: 'HTX', year: 2023, fuelType: FuelType.PETROL, engineCC: 1497 },
  });

  // 8. Skoda
  const kushaqModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: skoda.id, name: 'Kushaq' } },
    update: {},
    create: { makeId: skoda.id, name: 'Kushaq', type: VehicleType.CAR },
  });
  const kushaqStyle = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: kushaqModel.id, name: 'Style', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: kushaqModel.id, name: 'Style', year: 2023, fuelType: FuelType.PETROL, engineCC: 1498 },
  });

  // 9. Volkswagen
  const taigunModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: volkswagen.id, name: 'Taigun' } },
    update: {},
    create: { makeId: volkswagen.id, name: 'Taigun', type: VehicleType.CAR },
  });
  const taigunGT = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: taigunModel.id, name: 'GT Plus', year: 2024, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: taigunModel.id, name: 'GT Plus', year: 2024, fuelType: FuelType.PETROL, engineCC: 1498 },
  });

  // 2-WHEELERS MODELS & VARIANTS
  // Hero
  const splendorModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hero.id, name: 'Splendor Plus' } },
    update: {},
    create: { makeId: hero.id, name: 'Splendor Plus', type: VehicleType.BIKE },
  });
  const splendorDrum = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: splendorModel.id, name: 'Drum Self-Cast', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: splendorModel.id, name: 'Drum Self-Cast', year: 2023, fuelType: FuelType.PETROL, engineCC: 97 },
  });

  // Bajaj
  const pulsarModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: bajaj.id, name: 'Pulsar 150' } },
    update: {},
    create: { makeId: bajaj.id, name: 'Pulsar 150', type: VehicleType.BIKE },
  });
  const pulsarTwin = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: pulsarModel.id, name: 'Twin Disc', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: pulsarModel.id, name: 'Twin Disc', year: 2023, fuelType: FuelType.PETROL, engineCC: 149 },
  });

  // Royal Enfield
  const classicModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: royalEnfield.id, name: 'Classic 350' } },
    update: {},
    create: { makeId: royalEnfield.id, name: 'Classic 350', type: VehicleType.BIKE },
  });
  const classicRe = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: classicModel.id, name: 'Halcyon', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: classicModel.id, name: 'Halcyon', year: 2023, fuelType: FuelType.PETROL, engineCC: 349 },
  });

  // Honda 2-Wheelers
  const activaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hondaBike.id, name: 'Activa 6G' } },
    update: {},
    create: { makeId: hondaBike.id, name: 'Activa 6G', type: VehicleType.SCOOTER },
  });
  const activaStd = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: activaModel.id, name: 'Standard', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: activaModel.id, name: 'Standard', year: 2023, fuelType: FuelType.PETROL, engineCC: 109 },
  });

  // TVS
  const jupiterModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: tvs.id, name: 'Jupiter' } },
    update: {},
    create: { makeId: tvs.id, name: 'Jupiter', type: VehicleType.SCOOTER },
  });
  const jupiterZX = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: jupiterModel.id, name: 'ZX Disc SmartXonnect', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: jupiterModel.id, name: 'ZX Disc SmartXonnect', year: 2023, fuelType: FuelType.PETROL, engineCC: 109 },
  });

  // KTM
  const dukeModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: ktm.id, name: 'Duke 200' } },
    update: {},
    create: { makeId: ktm.id, name: 'Duke 200', type: VehicleType.BIKE },
  });
  const duke200 = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: dukeModel.id, name: 'Standard', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: dukeModel.id, name: 'Standard', year: 2023, fuelType: FuelType.PETROL, engineCC: 199 },
  });

  // Ather
  const atherModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: ather.id, name: '450X' } },
    update: {},
    create: { makeId: ather.id, name: '450X', type: VehicleType.SCOOTER },
  });
  const ather450x = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: atherModel.id, name: 'Gen 3 (3.7 kWh)', year: 2023, fuelType: FuelType.ELECTRIC } },
    update: {},
    create: { modelId: atherModel.id, name: 'Gen 3 (3.7 kWh)', year: 2023, fuelType: FuelType.ELECTRIC, engineCC: 0 },
  });

  // Ola
  const olaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: ola.id, name: 'S1 Pro' } },
    update: {},
    create: { makeId: ola.id, name: 'S1 Pro', type: VehicleType.SCOOTER },
  });
  const olaS1Pro = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: olaModel.id, name: 'Gen 2 (4 kWh)', year: 2024, fuelType: FuelType.ELECTRIC } },
    update: {},
    create: { modelId: olaModel.id, name: 'Gen 2 (4 kWh)', year: 2024, fuelType: FuelType.ELECTRIC, engineCC: 0 },
  });

  // Customer vehicle in garage
  await prisma.customerVehicle.upsert({
    where: { id: 'demo-customer-garage-car-1' },
    update: {},
    create: {
      id: 'demo-customer-garage-car-1',
      userId: customerUser.id,
      variantId: swiftVXi.id,
      nickname: 'My Daily Swift',
      regNumber: 'KA-01-MJ-4321',
      isPrimary: true,
    },
  });

  // ------------------------------------------------------------
  // 5. CATEGORIES
  // ------------------------------------------------------------
  console.log('📦 Creating product categories...');
  const catEngine = await prisma.category.upsert({
    where: { slug: 'engine-parts' },
    update: {},
    create: { name: 'Engine & Ignition', slug: 'engine-parts', sortOrder: 1 },
  });

  const catBraking = await prisma.category.upsert({
    where: { slug: 'braking-system' },
    update: {},
    create: { name: 'Braking System', slug: 'braking-system', sortOrder: 2 },
  });

  const catElectrical = await prisma.category.upsert({
    where: { slug: 'electrical-lighting' },
    update: {},
    create: { name: 'Electrical & Lighting', slug: 'electrical-lighting', sortOrder: 3 },
  });

  const catBatteries = await prisma.category.upsert({
    where: { slug: 'batteries-power' },
    update: {},
    create: { name: 'Batteries & Power', slug: 'batteries-power', sortOrder: 4 },
  });

  const catFluids = await prisma.category.upsert({
    where: { slug: 'oils-lubricants' },
    update: {},
    create: { name: 'Oils & Lubricants', slug: 'oils-lubricants', sortOrder: 5 },
  });

  // ------------------------------------------------------------
  // 6. COMPATIBLE SPARE PARTS & MULTI-SHOP INVENTORY
  // ------------------------------------------------------------
  console.log('🔧 Creating products, specifications & inventory records...');

    const productsToSeed = [
    // 1. Spark Plugs (Car)
    {
      name: 'Bosch Super 4 Spark Plug FR78X (Set of 4)',
      slug: 'bosch-super-4-spark-plug-fr78x',
      description: 'Bosch Super 4 with 4 ground electrodes and a silver-plated center electrode for maximum ignition reliability and combustion efficiency.',
      sku: 'BOSCH-SP-FR78X',
      partNumber: '0242232502',
      categoryId: catEngine.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 850.0,
      mrp: 999.0,
      weight: 0.25,
      dimensions: '10x8x3',
      tags: ['spark plug', 'ignition', 'bosch', 'engine'],
      images: [
        { url: '/uploads/products/spark_plug.jpg', isPrimary: true },
      ],
      specs: [
        { key: 'Electrode Material', value: 'Silver Plated Yttrium', unit: '' },
        { key: 'Thread Size', value: '14mm x 1.25', unit: 'mm' },
        { key: 'Hex Size', value: '16', unit: 'mm' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, cretaSX.id, cityV.id, balenoDelta.id],
      stocks: [
        { shopId: shop1.id, qty: 45, price: 820.0 },
        { shopId: shop2.id, qty: 28, price: 850.0 },
        { shopId: shop3.id, qty: 60, price: 799.0 },
      ],
    },

    // 2. Spark Plugs (Bike)
    {
      name: 'NGK Laser Iridium Spark Plug CR9EIX',
      slug: 'ngk-laser-iridium-spark-plug-cr9eix',
      description: 'Precision laser-welded iridium center electrode tip ensures high durability and consistently stable spark.',
      sku: 'NGK-CR9EIX-IR',
      partNumber: '3521-CR9EIX',
      categoryId: catEngine.id,
      brand: 'NGK',
      brandId: brandsMap.get('NGK')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 680.0,
      mrp: 799.0,
      weight: 0.08,
      dimensions: '8x2x2',
      tags: ['spark plug', 'ngk', 'iridium', 'motorcycle', 'pulsar'],
      images: [
        { url: '/uploads/products/spark_plug.jpg', isPrimary: true },
      ],
      specs: [
        { key: 'Center Electrode Tip', value: 'Laser Iridium 0.6mm', unit: 'mm' },
        { key: 'Thread Diameter', value: '10', unit: 'mm' },
      ],
      compatibleVariantIds: [pulsarTwin.id, classicRe.id, duke200.id],
      stocks: [
        { shopId: shop1.id, qty: 35, price: 650.0 },
        { shopId: shop2.id, qty: 20, price: 680.0 },
      ],
    },

    // 3. Brake Pads (Car)
    {
      name: 'Brembo Ceramic Front Brake Pad Set',
      slug: 'brembo-ceramic-front-brake-pad-set',
      description: 'Ultra-low dust ceramic friction formulation offering exceptional stopping distance, zero brake squeal, and extended rotor longevity.',
      sku: 'BREMBO-BP-P83024',
      partNumber: 'P83024N',
      categoryId: catBraking.id,
      brand: 'Brembo',
      brandId: brandsMap.get('Brembo')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 2850.0,
      mrp: 3400.0,
      weight: 1.6,
      dimensions: '16x10x8',
      tags: ['brake', 'pads', 'ceramic', 'brembo', 'front brake'],
      images: [
        { url: '/uploads/products/brake_pads.jpg', isPrimary: true },
      ],
      specs: [
        { key: 'Friction Material', value: 'Ceramic Low-Metallic', unit: '' },
        { key: 'Position', value: 'Front Axle', unit: '' },
      ],
      compatibleVariantIds: [cretaSX.id, seltosHTX.id, kushaqStyle.id, taigunGT.id],
      stocks: [
        { shopId: shop1.id, qty: 15, price: 2799.0 },
        { shopId: shop2.id, qty: 22, price: 2850.0 },
        { shopId: shop3.id, qty: 10, price: 2899.0 },
      ],
    },

    // 4. Brake Discs
    {
      name: 'Brembo High Carbon Vented Front Brake Rotor Disc (Pair)',
      slug: 'brembo-high-carbon-vented-front-brake-rotor-disc',
      description: 'Pillar vented high carbon cast iron front brake rotor disc pair with anti-corrosion UV coating.',
      sku: 'BREMBO-BD-099772',
      partNumber: '09.9772.11',
      categoryId: catBraking.id,
      brand: 'Brembo',
      brandId: brandsMap.get('Brembo')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 3850.0,
      mrp: 4600.0,
      weight: 9.8,
      dimensions: '28x28x12',
      tags: ['brake disc', 'rotor', 'brembo', 'vented'],
      images: [
        { url: '/uploads/products/brake_disc.jpg', isPrimary: true },
      ],
      specs: [
        { key: 'Disc Type', value: 'Internally Vented', unit: '' },
        { key: 'Outer Diameter', value: '256', unit: 'mm' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, balenoDelta.id, brezzaVXi.id],
      stocks: [
        { shopId: shop1.id, qty: 12, price: 3750.0 },
        { shopId: shop2.id, qty: 8, price: 3850.0 },
      ],
    },

    // 5. Air Filters (Car)
    {
      name: 'Mann-Filter C 25 004 High Airflow Engine Air Filter',
      slug: 'mann-filter-c-25-004-engine-air-filter',
      description: 'Original equipment quality air filter with specially embossed paper pleats for superior dust holding capacity.',
      sku: 'MANN-AF-C25004',
      partNumber: 'C25004-IN',
      categoryId: catFilters.id,
      brand: 'Mann-Filter',
      brandId: brandsMap.get('Mann-Filter')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 420.0,
      mrp: 525.0,
      weight: 0.32,
      dimensions: '24x14x5',
      tags: ['air filter', 'mann filter', 'engine filter'],
      images: [
        { url: '/uploads/products/car_air_filter.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Filter Media', value: 'Micro-grade Cellulose Fiber', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, balenoDelta.id, brezzaVXi.id],
      stocks: [
        { shopId: shop1.id, qty: 50, price: 399.0 },
        { shopId: shop2.id, qty: 35, price: 420.0 },
      ],
    },

    // 6. Oil Filters
    {
      name: 'Uno Minda High Efficiency Spin-On Oil Filter',
      slug: 'uno-minda-high-efficiency-oil-filter',
      description: 'High efficiency spin-on engine oil filter with synthetic blend media and silicone anti-drainback valve.',
      sku: 'MINDA-OF-8812',
      partNumber: 'OF-8812',
      categoryId: catFilters.id,
      brand: 'Uno Minda',
      brandId: brandsMap.get('Uno Minda')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 240.0,
      mrp: 310.0,
      weight: 0.28,
      dimensions: '8x8x9',
      tags: ['oil filter', 'uno minda', 'filters'],
      images: [
        { url: '/uploads/products/oil_filter.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Filter Type', value: 'Spin-on Canister', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, cretaSX.id, nexonCreative.id, cityV.id, seltosHTX.id],
      stocks: [
        { shopId: shop1.id, qty: 60, price: 225.0 },
        { shopId: shop2.id, qty: 40, price: 240.0 },
      ],
    },

    // 7. Fuel Filters
    {
      name: 'Bosch High Efficiency In-Line Fuel Filter Assembly',
      slug: 'bosch-high-efficiency-fuel-filter-assembly',
      description: 'High-pressure in-line fuel filter with multilayer micropore filtering media.',
      sku: 'BOSCH-FF-0450905',
      partNumber: '0450905901',
      categoryId: catFilters.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 550.0,
      mrp: 680.0,
      weight: 0.35,
      dimensions: '16x8x8',
      tags: ['fuel filter', 'bosch', 'diesel filter'],
      images: [
        { url: '/uploads/products/fuel_filter.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Housing Material', value: 'Corrosion-Resistant Aluminum', unit: '' },
      ],
      compatibleVariantIds: [cretaSX.id, nexonCreative.id, thar4x4.id],
      stocks: [
        { shopId: shop1.id, qty: 30, price: 520.0 },
        { shopId: shop2.id, qty: 25, price: 550.0 },
      ],
    },

    // 8. Batteries (Car)
    {
      name: 'Exide Epiq 12V 45Ah Maintenance-Free Car Battery',
      slug: 'exide-epiq-12v-45ah-car-battery',
      description: 'Heavy-duty automotive battery engineered with Special Tetramesh grid technology for extreme heat tolerance and zero water loss.',
      sku: 'EXIDE-EPIQ-45L',
      partNumber: 'EPIQ45L-BH',
      categoryId: catBatteries.id,
      brand: 'Exide',
      brandId: brandsMap.get('Exide')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 5200.0,
      mrp: 5999.0,
      weight: 12.5,
      dimensions: '23x13x22',
      tags: ['battery', 'exide', 'car battery', '12v', 'epiq'],
      images: [
        { url: '/uploads/products/car_battery.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Nominal Voltage', value: '12', unit: 'V' },
        { key: 'Rated Capacity', value: '45', unit: 'Ah' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, cretaSX.id, cityV.id, nexonCreative.id],
      stocks: [
        { shopId: shop1.id, qty: 8, price: 5100.0 },
        { shopId: shop2.id, qty: 12, price: 5200.0 },
        { shopId: shop3.id, qty: 14, price: 4999.0 },
      ],
    },

    // 9. Batteries (Bike/Scooter)
    {
      name: 'Amaron Pro Rider BTZ4 12V 4Ah Motorcycle Battery',
      slug: 'amaron-pro-rider-btz4-motorcycle-battery',
      description: 'VRLA maintenance-free motorcycle battery with patented Silven-X alloy grids and extreme vibration resistance.',
      sku: 'AMARON-PR-BTZ4',
      partNumber: 'AAM-PR-0BTZ4',
      categoryId: catBatteries.id,
      brand: 'Amaron',
      brandId: brandsMap.get('Amaron')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1150.0,
      mrp: 1350.0,
      weight: 1.5,
      dimensions: '11x7x9',
      tags: ['battery', 'amaron', 'bike battery', 'activa', 'scooter'],
      images: [
        { url: '/uploads/products/bike_battery.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Voltage', value: '12', unit: 'V' },
        { key: 'Capacity', value: '4', unit: 'Ah' },
      ],
      compatibleVariantIds: [activaStd.id, jupiterZX.id, splendorDrum.id, pulsarTwin.id],
      stocks: [
        { shopId: shop1.id, qty: 25, price: 1100.0 },
        { shopId: shop2.id, qty: 18, price: 1150.0 },
      ],
    },

    // 10. Headlights
    {
      name: 'Lumax H4 All-Weather Xenon White Headlight Bulb (Set of 2)',
      slug: 'lumax-h4-all-weather-headlight-bulb-set',
      description: 'H4 12V 60/55W quartz glass halogen headlight bulbs with a 4300K all-weather crisp beam.',
      sku: 'LUMAX-H4-6055W',
      partNumber: 'H4-6055W',
      categoryId: catElectrical.id,
      brand: 'Lumax',
      brandId: brandsMap.get('Lumax')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 499.0,
      mrp: 699.0,
      weight: 0.15,
      dimensions: '10x10x6',
      tags: ['headlight', 'bulb', 'lumax', 'h4', 'lighting'],
      images: [
        { url: '/uploads/products/car_headlight.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Base Type', value: 'P43t (H4)', unit: '' },
        { key: 'Power', value: '60/55', unit: 'W' },
      ],
      compatibleVariantIds: [swiftVXi.id, nexonCreative.id, brezzaVXi.id, activaStd.id, splendorDrum.id],
      stocks: [
        { shopId: shop1.id, qty: 30, price: 475.0 },
        { shopId: shop2.id, qty: 25, price: 499.0 },
      ],
    },

    // 11. Tail Lamps
    {
      name: 'Lumax Rear LED Combination Tail Lamp Assembly (Right)',
      slug: 'lumax-rear-led-tail-lamp-assembly-right',
      description: 'OEM grade complete right-hand rear combination lamp cluster with high-intensity stop light and running LEDs.',
      sku: 'LUMAX-TL-SW-22R',
      partNumber: '052-RTL-SWF',
      categoryId: catElectrical.id,
      brand: 'Lumax',
      brandId: brandsMap.get('Lumax')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1850.0,
      mrp: 2350.0,
      weight: 1.4,
      dimensions: '32x22x18',
      tags: ['tail lamp', 'rear light', 'lumax', 'led'],
      images: [
        { url: '/uploads/products/car_taillamp.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Fitment Position', value: 'Rear Right', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id],
      stocks: [
        { shopId: shop1.id, qty: 14, price: 1799.0 },
        { shopId: shop2.id, qty: 9, price: 1850.0 },
      ],
    },

    // 12. Wiper Blades
    {
      name: 'Bosch Aerotwin Frameless Wiper Blade Set (24" + 16")',
      slug: 'bosch-aerotwin-frameless-wiper-blade-set',
      description: 'Aerodynamic curved beam frameless wiper blades with graphite-coated dual rubber edge for streak-free wiping.',
      sku: 'BOSCH-WB-A925S',
      partNumber: '3397118925',
      categoryId: catBodyWipers.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 950.0,
      mrp: 1250.0,
      weight: 0.45,
      dimensions: '65x8x4',
      tags: ['wiper', 'aerotwin', 'bosch', 'frameless'],
      images: [
        { url: '/uploads/products/wiper_blades.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Sizes', value: '24 Inch + 16 Inch', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id, cretaSX.id, nexonCreative.id, cityV.id],
      stocks: [
        { shopId: shop1.id, qty: 40, price: 899.0 },
        { shopId: shop2.id, qty: 28, price: 950.0 },
      ],
    },

    // 13. Clutch Plates
    {
      name: 'Valeo Clutch Plate & Pressure Cover Assembly Kit',
      slug: 'valeo-clutch-plate-pressure-cover-kit',
      description: 'Heavy duty replacement clutch kit featuring organic low-wear friction linings and diaphragm pressure plate.',
      sku: 'VALEO-CK-826842',
      partNumber: '826842-IN',
      categoryId: catTransmission.id,
      brand: 'Valeo',
      brandId: brandsMap.get('Valeo')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 3450.0,
      mrp: 4200.0,
      weight: 5.8,
      dimensions: '26x26x8',
      tags: ['clutch', 'valeo', 'transmission'],
      images: [
        { url: '/uploads/products/clutch_plate.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Diameter', value: '190', unit: 'mm' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id],
      stocks: [
        { shopId: shop1.id, qty: 15, price: 3350.0 },
        { shopId: shop2.id, qty: 10, price: 3450.0 },
      ],
    },

    // 14. Shock Absorbers
    {
      name: 'Gabriel Ultra Gas Strut Shock Absorber (Front)',
      slug: 'gabriel-ultra-gas-strut-shock-absorber-front',
      description: 'Nitrogen gas charged suspension shock absorber strut with G-Force damping technology.',
      sku: 'GABRIEL-SA-G51892',
      partNumber: 'G51892-FL',
      categoryId: catSuspension.id,
      brand: 'Gabriel',
      brandId: brandsMap.get('Gabriel')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1980.0,
      mrp: 2450.0,
      weight: 3.9,
      dimensions: '52x14x14',
      tags: ['shock absorber', 'gabriel', 'suspension', 'strut'],
      images: [
        { url: '/uploads/products/shock_absorber.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Type', value: 'Gas Pressurized Twin-Tube', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, balenoDelta.id, brezzaVXi.id],
      stocks: [
        { shopId: shop1.id, qty: 18, price: 1920.0 },
        { shopId: shop2.id, qty: 12, price: 1980.0 },
      ],
    },

    // 15. Wheel Bearings
    {
      name: 'SKF Double Row Angular Contact Front Wheel Hub Bearing',
      slug: 'skf-double-row-angular-contact-wheel-bearing',
      description: 'Precision double-row angular contact ball bearing engineered to withstand heavy radial and axial cornering loads.',
      sku: 'SKF-WB-VKBA6589',
      partNumber: 'VKBA6589',
      categoryId: catSuspension.id,
      brand: 'SKF',
      brandId: brandsMap.get('SKF')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1250.0,
      mrp: 1550.0,
      weight: 0.85,
      dimensions: '10x10x6',
      tags: ['wheel bearing', 'skf', 'hub bearing'],
      images: [
        { url: '/uploads/products/wheel_bearing.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Bore Diameter', value: '40', unit: 'mm' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id, cretaSX.id, nexonCreative.id],
      stocks: [
        { shopId: shop1.id, qty: 22, price: 1199.0 },
        { shopId: shop2.id, qty: 15, price: 1250.0 },
      ],
    },

    // 16. Starter Motors
    {
      name: 'Bosch Certified Refurbished Starter Motor Assembly (12V 1.2kW)',
      slug: 'bosch-refurbished-starter-motor-assembly',
      description: 'Factory refurbished starter motor assembly rebuilt with new copper windings and heavy-duty solenoid switch.',
      sku: 'RF-SM-3310',
      partNumber: '0001108422',
      categoryId: catElectrical.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.REFURBISHED,
      basePrice: 2850.0,
      mrp: 5500.0,
      weight: 3.4,
      dimensions: '22x14x12',
      tags: ['starter motor', 'bosch', 'refurbished', 'electrical'],
      images: [
        { url: '/uploads/products/starter_motor.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Output', value: '1.2 kW', unit: '' },
      ],
      compatibleVariantIds: [cretaSX.id, i20Magna.id],
      stocks: [
        { shopId: shop1.id, qty: 6, price: 2750.0 },
        { shopId: shop2.id, qty: 4, price: 2850.0 },
      ],
    },

    // 17. Alternators
    {
      name: 'Denso 12V 90A High Output Alternator Assembly',
      slug: 'denso-12v-90a-high-output-alternator-assembly',
      description: 'High-efficiency 90 Ampere automotive alternator for stable electrical current and rapid battery charging.',
      sku: 'DENSO-ALT-104210',
      partNumber: '104210-3560',
      categoryId: catElectrical.id,
      brand: 'Denso',
      brandId: brandsMap.get('Denso')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 6850.0,
      mrp: 8200.0,
      weight: 5.2,
      dimensions: '22x18x16',
      tags: ['alternator', 'denso', 'charging', '12v'],
      images: [
        { url: '/uploads/products/car_alternator.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Current Output', value: '90', unit: 'A' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id],
      stocks: [
        { shopId: shop1.id, qty: 8, price: 6650.0 },
        { shopId: shop2.id, qty: 5, price: 6850.0 },
      ],
    },

    // 18. Sensors
    {
      name: 'Bosch 4-Wire Planar Heated Exhaust Oxygen (O2) Sensor',
      slug: 'bosch-4-wire-planar-heated-oxygen-sensor',
      description: 'Pre-catalytic exhaust lambda oxygen sensor with patented planar ceramic technology for precise closed-loop fueling.',
      sku: 'BOSCH-O2-0258006',
      partNumber: '0258006028',
      categoryId: catEngine.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1950.0,
      mrp: 2450.0,
      weight: 0.22,
      dimensions: '18x6x5',
      tags: ['sensor', 'oxygen sensor', 'lambda', 'bosch'],
      images: [
        { url: '/uploads/products/oxygen_sensor.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Wires', value: '4 Wires Heated', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id, cretaSX.id, nexonCreative.id, cityV.id],
      stocks: [
        { shopId: shop1.id, qty: 18, price: 1899.0 },
        { shopId: shop2.id, qty: 12, price: 1950.0 },
      ],
    },

    // 19. Belts
    {
      name: 'Continental Multi-Rib Poly-V Serpentine Drive Belt (5PK1150)',
      slug: 'continental-multi-rib-poly-v-drive-belt-5pk1150',
      description: 'Ultra quiet synthetic EPDM rubber multi-rib accessory serpentine belt eliminating squealing and slippage.',
      sku: 'CONTI-BELT-5PK1150',
      partNumber: '5PK1150',
      categoryId: catEngine.id,
      brand: 'Continental',
      brandId: brandsMap.get('Continental')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 520.0,
      mrp: 680.0,
      weight: 0.18,
      dimensions: '28x10x3',
      tags: ['drive belt', 'serpentine', 'continental'],
      images: [
        { url: '/uploads/products/drive_belt.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Profile', value: '5PK1150', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id, cretaSX.id, i20Magna.id],
      stocks: [
        { shopId: shop1.id, qty: 30, price: 495.0 },
        { shopId: shop2.id, qty: 22, price: 520.0 },
      ],
    },

    // 20. Radiators
    {
      name: 'Behr Aluminum Core Engine Cooling Radiator Assembly',
      slug: 'behr-aluminum-core-engine-cooling-radiator-assembly',
      description: 'High-performance cross-flow aluminum radiator core with high-tensile glass-fiber reinforced end tanks.',
      sku: 'BEHR-RAD-CR8921',
      partNumber: 'CR-8921-000S',
      categoryId: catCooling.id,
      brand: 'Behr',
      brandId: brandsMap.get('Behr')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 3450.0,
      mrp: 4300.0,
      weight: 4.2,
      dimensions: '56x42x12',
      tags: ['radiator', 'behr', 'cooling', 'aluminum radiator'],
      images: [
        { url: '/uploads/products/car_radiator.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Core Construction', value: 'Brazed Aluminum Tubes & Fins', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, balenoDelta.id],
      stocks: [
        { shopId: shop1.id, qty: 10, price: 3350.0 },
        { shopId: shop2.id, qty: 6, price: 3450.0 },
      ],
    },

    // 21. Coolant Components
    {
      name: 'Castrol Radicool Long-Life OAT Anti-Freeze Engine Coolant (1L Premix)',
      slug: 'castrol-radicool-long-life-coolant-1l',
      description: 'Pre-diluted 50:50 Organic Acid Technology (OAT) long-life engine coolant for year-round corrosion protection.',
      sku: 'CASTROL-COOL-RAD1L',
      partNumber: '3418721',
      categoryId: catCooling.id,
      brand: 'Castrol',
      brandId: brandsMap.get('Castrol')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 295.0,
      mrp: 375.0,
      weight: 1.1,
      dimensions: '22x10x6',
      tags: ['coolant', 'castrol', 'antifreeze', 'oat'],
      images: [
        { url: '/uploads/products/coolant_bottle.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Technology', value: 'OAT Organic Acid Technology', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, cretaSX.id, nexonCreative.id, cityV.id, seltosHTX.id, pulsarTwin.id, duke200.id],
      stocks: [
        { shopId: shop1.id, qty: 45, price: 280.0 },
        { shopId: shop2.id, qty: 30, price: 295.0 },
      ],
    },

    // 22. Engine Oil (Bike)
    {
      name: 'Motul 7100 4T 10W-40 Fully Synthetic Motor Oil (1L)',
      slug: 'motul-7100-4t-10w40-synthetic-1l',
      description: '100% Synthetic 4-Stroke motorcycle engine lubricant with Ester Technology. Meets JASO MA2 specifications for optimum wet clutch performance.',
      sku: 'MOTUL-7100-10W40-1L',
      partNumber: '104099',
      categoryId: catFluids.id,
      brand: 'Motul',
      brandId: brandsMap.get('Motul')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 799.0,
      mrp: 925.0,
      weight: 0.95,
      dimensions: '22x11x7',
      tags: ['engine oil', 'motul', 'synthetic', 'bike oil', '10w40'],
      images: [
        { url: '/uploads/products/engine_oil_bottle.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Viscosity Grade', value: '10W-40', unit: '' },
        { key: 'Standard', value: 'API SN / JASO MA2', unit: '' },
      ],
      compatibleVariantIds: [splendorDrum.id, pulsarTwin.id, classicRe.id, duke200.id],
      stocks: [
        { shopId: shop1.id, qty: 35, price: 780.0 },
        { shopId: shop2.id, qty: 50, price: 799.0 },
        { shopId: shop3.id, qty: 40, price: 770.0 },
      ],
    },

    // 23. Engine Oil (Car)
    {
      name: 'Shell Helix Ultra 5W-40 PurePlus Fully Synthetic Engine Oil (3.5L)',
      slug: 'shell-helix-ultra-5w40-synthetic-3-5l',
      description: 'PurePlus synthetic motor oil made from natural gas for maximum sludge protection and fuel economy.',
      sku: 'SHELL-HU-5W40-35L',
      partNumber: '550046358',
      categoryId: catFluids.id,
      brand: 'Shell',
      brandId: brandsMap.get('Shell')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 2650.0,
      mrp: 3199.0,
      weight: 3.2,
      dimensions: '28x22x12',
      tags: ['engine oil', 'shell', 'helix ultra', 'fully synthetic', '5w40'],
      images: [
        { url: '/uploads/products/engine_oil_bottle.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Viscosity Grade', value: '5W-40', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, balenoDelta.id, cretaSX.id, nexonCreative.id, cityV.id, kushaqStyle.id, taigunGT.id],
      stocks: [
        { shopId: shop1.id, qty: 20, price: 2550.0 },
        { shopId: shop2.id, qty: 15, price: 2650.0 },
      ],
    },

    // 24. Brake Fluid
    {
      name: 'Bosch High Performance DOT 4 Brake & Clutch Fluid (500ml)',
      slug: 'bosch-high-performance-dot-4-brake-fluid-500ml',
      description: 'High boiling point synthetic brake fluid designed for modern hydraulic braking systems with ABS.',
      sku: 'BOSCH-BF-DOT4-500',
      partNumber: '1987479106',
      categoryId: catFluids.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 230.0,
      mrp: 290.0,
      weight: 0.58,
      dimensions: '18x7x7',
      tags: ['brake fluid', 'dot 4', 'bosch', 'brakes'],
      images: [
        { url: '/uploads/products/brake_fluid.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Boiling Point', value: '260C Dry / 165C Wet', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, cretaSX.id, nexonCreative.id, cityV.id, pulsarTwin.id, classicRe.id, activaStd.id],
      stocks: [
        { shopId: shop1.id, qty: 50, price: 215.0 },
        { shopId: shop2.id, qty: 35, price: 230.0 },
      ],
    },

    // 25. Horn
    {
      name: 'Bosch Symphony 12V 420Hz/500Hz Dual Electric Horn Set',
      slug: 'bosch-symphony-dual-electric-horn-set',
      description: 'European acoustic luxury tone dual-disc horn set with 110 dB sound pressure level.',
      sku: 'BOSCH-HN-SYMPH-12V',
      partNumber: '0986AH0503',
      categoryId: catElectrical.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 850.0,
      mrp: 1150.0,
      weight: 0.72,
      dimensions: '14x12x10',
      tags: ['horn', 'bosch', 'symphony', 'dual tone'],
      images: [
        { url: '/uploads/products/dual_horns.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Sound Pressure', value: '110 dB', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, cretaSX.id, nexonCreative.id, brezzaVXi.id, cityV.id, seltosHTX.id, innovaGX.id],
      stocks: [
        { shopId: shop1.id, qty: 28, price: 799.0 },
        { shopId: shop2.id, qty: 20, price: 850.0 },
      ],
    },

    // 26. Ignition Coils
    {
      name: 'Delphi High-Energy Direct Ignition Coil Pencil Pack',
      slug: 'delphi-high-energy-direct-ignition-coil',
      description: 'Direct-mount pencil ignition coil with silicone steel core generating 35,000+ volts spark output.',
      sku: 'DELPHI-IC-GN10314',
      partNumber: 'GN10314-12B1',
      categoryId: catEngine.id,
      brand: 'Delphi',
      brandId: brandsMap.get('Delphi')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1450.0,
      mrp: 1850.0,
      weight: 0.32,
      dimensions: '18x5x5',
      tags: ['ignition coil', 'delphi', 'coil pack'],
      images: [
        { url: '/uploads/products/ignition_coil.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Output Voltage', value: '35,000 V', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, balenoDelta.id],
      stocks: [
        { shopId: shop1.id, qty: 20, price: 1399.0 },
        { shopId: shop2.id, qty: 15, price: 1450.0 },
      ],
    },

    // 27. Chain/Sprocket
    {
      name: 'Rolon Heavy-Duty Brass Finish Drive Chain & Sprocket Combo Kit',
      slug: 'rolon-heavy-duty-chain-sprocket-kit-re350',
      description: 'High tensile induction hardened carbon steel front and rear sprocket combo with brass coated drive chain.',
      sku: 'ROLON-CSK-RE350',
      partNumber: 'ROL-CSK-530-110',
      categoryId: catTransmission.id,
      brand: 'Rolon',
      brandId: brandsMap.get('Rolon')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 2150.0,
      mrp: 2650.0,
      weight: 2.8,
      dimensions: '24x24x6',
      tags: ['chain sprocket', 'rolon', 'brass chain', 'royal enfield'],
      images: [
        { url: '/uploads/products/chain_sprocket.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Chain Pitch', value: '530 - 110 Links', unit: '' },
      ],
      compatibleVariantIds: [classicRe.id],
      stocks: [
        { shopId: shop1.id, qty: 18, price: 2099.0 },
        { shopId: shop2.id, qty: 12, price: 2150.0 },
      ],
    },

    // 28. Bike Brake Shoes
    {
      name: 'KBX High Friction Rear Drum Brake Shoe Set with Return Springs',
      slug: 'kbx-high-friction-rear-drum-brake-shoes',
      description: 'High-friction semi-metallic curved motorcycle drum brake shoes with dual return springs.',
      sku: 'KBX-BS-HERO-110',
      partNumber: 'KBX-BS-110MM',
      categoryId: catBraking.id,
      brand: 'KBX',
      brandId: brandsMap.get('KBX')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 290.0,
      mrp: 375.0,
      weight: 0.35,
      dimensions: '14x14x4',
      tags: ['brake shoes', 'kbx', 'drum brake', 'splendor', 'activa'],
      images: [
        { url: '/uploads/products/bike_brake_shoes.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Drum Diameter', value: '110 mm', unit: '' },
      ],
      compatibleVariantIds: [splendorDrum.id, activaStd.id, jupiterZX.id],
      stocks: [
        { shopId: shop1.id, qty: 45, price: 275.0 },
        { shopId: shop2.id, qty: 30, price: 290.0 },
      ],
    },

    // 29. Scooter Air Filters
    {
      name: 'Purolator Dry Type High Performance Scooter Air Filter Element',
      slug: 'purolator-dry-type-scooter-air-filter-activa-6g',
      description: 'Dry type pleated cellulose paper air filter cartridge designed for commuter scooters.',
      sku: 'PURO-SAF-ACTIVA6G',
      partNumber: 'SAF-ACT-6G-01',
      categoryId: catFilters.id,
      brand: 'Purolator',
      brandId: brandsMap.get('Purolator')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 195.0,
      mrp: 260.0,
      weight: 0.16,
      dimensions: '16x11x4',
      tags: ['air filter', 'scooter filter', 'activa', 'purolator'],
      images: [
        { url: '/uploads/products/scooter_air_filter.svg', isPrimary: true },
      ],
      specs: [
        { key: 'Media', value: 'Dry Pleated Cellulose', unit: '' },
      ],
      compatibleVariantIds: [activaStd.id, jupiterZX.id],
      stocks: [
        { shopId: shop1.id, qty: 50, price: 185.0 },
        { shopId: shop2.id, qty: 35, price: 195.0 },
      ],
    },
  ];

  for (const item of productsToSeed) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        sku: item.sku,
        partNumber: item.partNumber,
        categoryId: item.categoryId,
        brandId: item.brandId,
        brand: item.brand,
        condition: item.condition,
        basePrice: item.basePrice,
        mrp: item.mrp,
        weight: item.weight,
        dimensions: item.dimensions,
        tags: item.tags,
        status: ProductStatus.ACTIVE,
        images: {
          create: item.images.map((img, idx) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: idx,
          })),
        },
        specifications: {
          create: item.specs.map((sp, idx) => ({
            key: sp.key,
            value: sp.value,
            unit: sp.unit,
            sortOrder: idx,
          })),
        },
      },
    });

    // Compatibility mappings
    for (const vId of item.compatibleVariantIds) {
      await prisma.productCompatibility.upsert({
        where: { productId_variantId: { productId: product.id, variantId: vId } },
        update: {},
        create: { productId: product.id, variantId: vId, notes: 'OEM standard fitment verified' },
      });
    }

    // Shop Inventory stocks
    for (const stk of item.stocks) {
      await prisma.inventory.upsert({
        where: { productId_shopId: { productId: product.id, shopId: stk.shopId } },
        update: {},
        create: {
          productId: product.id,
          shopId: stk.shopId,
          quantity: stk.qty,
          sellingPrice: stk.price,
          availabilityStatus: StockAvailability.IN_STOCK,
          isAvailable: true,
          lowStockThreshold: 5,
        },
      });
    }
  }

  // ------------------------------------------------------------
  // 7. SUBSCRIPTION PLANS & ENTITLEMENTS
  // ------------------------------------------------------------
  console.log('💳 Creating tiered subscription maintenance plans...');
  const planBasic = await prisma.subscriptionPlan.upsert({
    where: { slug: 'basic-roadside-assist' },
    update: {},
    create: {
      name: 'Basic Roadside Assistance',
      slug: 'basic-roadside-assist',
      description: 'Emergency 24/7 on-demand roadside assistance package for cars and bikes.',
      price: 499.0,
      durationDays: 90,
      features: [
        '2 Free emergency tows (up to 25 km)',
        'Doorstep battery jumpstart support',
        'Flat tyre puncture repair service',
        'Emergency fuel delivery (fuel cost extra)',
      ],
      isActive: true,
      entitlements: {
        create: [
          { featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 2 },
          { featureCode: 'BATTERY_JUMPSTART', featureName: 'Battery Jump Start', limitValue: 3 },
          { featureCode: 'FLAT_TYRE_ASSIST', featureName: 'Flat Tyre Assist', limitValue: 2 },
        ],
      },
    },
  });

  const planSilver = await prisma.subscriptionPlan.upsert({
    where: { slug: 'silver-preventive-care' },
    update: {},
    create: {
      name: 'Silver Preventive Care',
      slug: 'silver-preventive-care',
      description: 'Comprehensive quarterly maintenance & repair discount membership.',
      price: 1499.0,
      durationDays: 180,
      features: [
        'All Basic plan features included',
        '1 Free 40-point computer diagnostic inspection',
        '15% flat discount on labor at verified partner garages',
        'Doorstep wiper & fluid health checkup',
      ],
      isActive: true,
      entitlements: {
        create: [
          { featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 5 },
          { featureCode: 'DIAGNOSTIC_SCAN', featureName: 'Computer Diagnostic Scan', limitValue: 1 },
          { featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount', limitValue: 15 },
        ],
      },
    },
  });

  const planGold = await prisma.subscriptionPlan.upsert({
    where: { slug: 'gold-total-vehicle-protection' },
    update: {},
    create: {
      name: 'Gold Total Vehicle Protection',
      slug: 'gold-total-vehicle-protection',
      description: 'Annual VIP vehicle coverage with free scheduled general services and priority DIFM.',
      price: 2999.0,
      durationDays: 365,
      features: [
        'Unlimited 24/7 breakdown towing nationwide',
        '2 Free Periodic General Services (labor included)',
        '20% exclusive discount on genuine spare parts',
        'Dedicated master technician & priority slot booking',
      ],
      isActive: true,
      entitlements: {
        create: [
          { featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', isUnlimited: true },
          { featureCode: 'FREE_GENERAL_SERVICE', featureName: 'Free General Service', limitValue: 2 },
          { featureCode: 'SPARE_PARTS_DISCOUNT_PCT', featureName: 'Parts Discount', limitValue: 20 },
        ],
      },
    },
  });

  // ------------------------------------------------------------
  // 8. SAMPLE REVIEWS & COUPONS
  // ------------------------------------------------------------
  console.log('🏷️  Creating demo coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% instant discount on your first spare parts order',
      discountType: 'PERCENT',
      discountValue: 10.0,
      minOrderValue: 499.0,
      maxDiscount: 200.0,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FREEDIFM' },
    update: {},
    create: {
      code: 'FREEDIFM',
      description: 'Free home visit installation on orders over ₹1,999',
      discountType: 'FLAT',
      discountValue: 199.0,
      minOrderValue: 1999.0,
      isActive: true,
    },
  });

  // ------------------------------------------------------------ 
  // WORKSHOP SEED DATA — ShopJobs, Deliveries, UsedParts, Tickets, Commission
  // ------------------------------------------------------------
  console.log('🔧 Seeding workshop operational data for Apex Auto Care...');

  // Get the shop1 record (Apex Auto Care) — we need its actual DB id
  const apexShop = await prisma.shop.findUnique({ where: { slug: 'apex-auto-care-bangalore' } });

  if (apexShop) {
    // SHOP JOBS — 6 realistic DIFM jobs
    const jobDefs = [
      {
        id: 'job-apex-001',
        orderNumber: 'PN-2024-001001',
        customerName: 'Aarav Sharma',
        customerPhone: '+919876500002',
        vehicleInfo: 'Maruti Swift 2021 Petrol',
        vehicleNumber: 'KA-01-AB-1234',
        serviceName: 'Front Brake Pad Replacement',
        jobType: 'DIFM_SHOP_VISIT',
        locationType: 'SHOP',
        status: 'COMPLETED' as const,
        totalServiceAmount: 2400,
        serviceFee: 250,
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        scheduledSlot: '10:00 AM - 12:00 PM',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'job-apex-002',
        orderNumber: 'PN-2024-001002',
        customerName: 'Priya Nair',
        customerPhone: '+919876501234',
        vehicleInfo: 'Hyundai Creta 2022 Diesel',
        vehicleNumber: 'KA-05-CD-5678',
        serviceName: 'Battery Replacement (Exide 60Ah)',
        jobType: 'DIFM_DOORSTEP_VISIT',
        locationType: 'DOORSTEP',
        status: 'COMPLETED' as const,
        totalServiceAmount: 5800,
        serviceFee: 250,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        scheduledSlot: '2:00 PM - 4:00 PM',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'job-apex-003',
        orderNumber: 'PN-2024-001003',
        customerName: 'Vikram Mehta',
        customerPhone: '+919876502345',
        vehicleInfo: 'Tata Nexon 2020 Petrol',
        vehicleNumber: 'MH-01-EF-9012',
        serviceName: 'Engine Oil & Filter Change (Mobil 10W-40)',
        jobType: 'DIFM_SHOP_VISIT',
        locationType: 'SHOP',
        status: 'IN_PROGRESS' as const,
        totalServiceAmount: 3200,
        serviceFee: 250,
        scheduledDate: new Date(),
        scheduledSlot: '11:00 AM - 1:00 PM',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'job-apex-004',
        orderNumber: 'PN-2024-001004',
        customerName: 'Deepa Krishnan',
        customerPhone: '+919876503456',
        vehicleInfo: 'Honda City 2019 Petrol',
        vehicleNumber: 'KA-03-GH-3456',
        serviceName: 'Spark Plug Set Replacement (NGK)',
        jobType: 'DIFM_SHOP_VISIT',
        locationType: 'SHOP',
        status: 'ACCEPTED' as const,
        totalServiceAmount: 1800,
        serviceFee: 250,
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        scheduledSlot: '3:00 PM - 5:00 PM',
      },
      {
        id: 'job-apex-005',
        orderNumber: 'PN-2024-001005',
        customerName: 'Rajan Pillai',
        customerPhone: '+919876504567',
        vehicleInfo: 'Maruti Baleno 2023 Petrol',
        vehicleNumber: 'KA-09-IJ-7890',
        serviceName: 'Wiper Blade Replacement & Washer Fluid',
        jobType: 'DIFM_DOORSTEP_VISIT',
        locationType: 'DOORSTEP',
        status: 'SCHEDULED' as const,
        totalServiceAmount: 900,
        serviceFee: 250,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduledSlot: '9:00 AM - 11:00 AM',
      },
      {
        id: 'job-apex-006',
        orderNumber: 'PN-2024-001006',
        customerName: 'Anita Shetty',
        customerPhone: '+919876505678',
        vehicleInfo: 'Kia Seltos 2022 Diesel',
        vehicleNumber: 'KA-41-KL-2345',
        serviceName: 'Air Filter & Cabin Filter Replacement',
        jobType: 'DIFM_SHOP_VISIT',
        locationType: 'SHOP',
        status: 'SCHEDULED' as const,
        totalServiceAmount: 2100,
        serviceFee: 250,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        scheduledSlot: '1:00 PM - 3:00 PM',
      },
    ];

    for (const job of jobDefs) {
      await prisma.shopJob.upsert({
        where: { id: job.id },
        update: {},
        create: {
          id: job.id,
          shopId: apexShop.id,
          orderNumber: job.orderNumber,
          customerName: job.customerName,
          customerPhone: job.customerPhone,
          vehicleInfo: job.vehicleInfo,
          vehicleNumber: job.vehicleNumber,
          serviceName: job.serviceName,
          jobType: job.jobType,
          locationType: job.locationType,
          status: job.status,
          totalServiceAmount: job.totalServiceAmount,
          serviceFee: job.serviceFee,
          scheduledDate: job.scheduledDate,
          scheduledSlot: job.scheduledSlot || null,
          startedAt: (job as any).startedAt || null,
          completedAt: (job as any).completedAt || null,
        },
      });
    }

    // SHOP DELIVERIES — 3 incoming parts shipments
    const deliveryDefs = [
      {
        id: 'del-apex-001',
        trackingNumber: 'PN-DEL-KA-78901',
        status: 'DELIVERED',
        eta: 'Received on Sep 22, 2024',
        items: JSON.stringify([{ productName: 'Bosch Front Brake Pads (Toyota Innova)', qty: 2 }]),
      },
      {
        id: 'del-apex-002',
        trackingNumber: 'PN-DEL-KA-78902',
        status: 'OUT_FOR_DELIVERY',
        eta: 'Today by 5:00 PM',
        items: JSON.stringify([{ productName: 'NGK Spark Plug Set (Honda City 1.5L)', qty: 4 }]),
      },
      {
        id: 'del-apex-003',
        trackingNumber: 'PN-DEL-KA-78903',
        status: 'IN_TRANSIT',
        eta: 'Tomorrow by 2:00 PM',
        items: JSON.stringify([{ productName: 'Motul 10W-40 Engine Oil 4L + Mahle Oil Filter', qty: 1 }]),
      },
    ];

    for (const del of deliveryDefs) {
      await prisma.shopDelivery.upsert({
        where: { id: del.id },
        update: {},
        create: {
          id: del.id,
          shopId: apexShop.id,
          trackingNumber: del.trackingNumber,
          status: del.status,
          eta: del.eta,
          items: JSON.parse(del.items),
          receivedAt: del.status === 'DELIVERED' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null,
          receivedBy: del.status === 'DELIVERED' ? 'Ramesh Gowda (Shop Counter)' : null,
        },
      });
    }

    // USED PART INTAKES — 3 records
    const intakeDefs = [
      {
        id: 'intake-apex-001',
        partTitle: 'Maruti Swift 2018 Front Shock Absorber (Driver Side)',
        sellerName: 'Customer Walk-In: Rajesh Kumar',
        vehicleModel: 'Maruti Swift 2018',
        physicalCondition: 'GOOD',
        technicalTestStatus: 'PASSED',
        technicianNotes: 'Bench tested — damping within spec. No oil leak. Approved for listing.',
        status: 'VERIFIED_ACCEPTED',
      },
      {
        id: 'intake-apex-002',
        partTitle: 'Honda City 2016 Radiator Assembly',
        sellerName: 'Customer Walk-In: Priya Menon',
        vehicleModel: 'Honda City 2016',
        physicalCondition: 'FAIR',
        technicalTestStatus: 'NEEDS_TESTING',
        technicianNotes: 'Minor dents on fins. Pressure test pending.',
        status: 'PENDING_INSPECTION',
      },
      {
        id: 'intake-apex-003',
        partTitle: 'Hyundai i20 2019 Left Rear Tail Lamp Assembly',
        sellerName: 'Customer Walk-In: Suresh Naidu',
        vehicleModel: 'Hyundai i20 2019',
        physicalCondition: 'GOOD',
        technicalTestStatus: 'PASSED',
        technicianNotes: 'All LEDs functional. Housing intact with no cracks.',
        status: 'VERIFIED_ACCEPTED',
      },
    ];

    for (const intake of intakeDefs) {
      await prisma.usedPartIntake.upsert({
        where: { id: intake.id },
        update: {},
        create: {
          id: intake.id,
          shopId: apexShop.id,
          partTitle: intake.partTitle,
          sellerName: intake.sellerName,
          vehicleModel: intake.vehicleModel,
          physicalCondition: intake.physicalCondition,
          technicalTestStatus: intake.technicalTestStatus,
          technicianNotes: intake.technicianNotes,
          status: intake.status,
        },
      });
    }

    // SHOP TICKETS — 2 support tickets
    await prisma.shopTicket.upsert({
      where: { id: 'ticket-apex-001' },
      update: {},
      create: {
        id: 'ticket-apex-001',
        shopId: apexShop.id,
        category: 'COMMISSION',
        subject: 'Commission payout delay for September',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        messages: [
          {
            id: 'msg-001',
            senderName: 'Ramesh Gowda',
            senderRole: 'SHOP_OWNER',
            message: 'The September commission payout has not been credited yet. Please check.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'msg-002',
            senderName: 'PartNexa Support',
            senderRole: 'ADMIN',
            message: 'Hi Ramesh, we have escalated this to our finance team. Expected resolution within 48 hours.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    });

    await prisma.shopTicket.upsert({
      where: { id: 'ticket-apex-002' },
      update: {},
      create: {
        id: 'ticket-apex-002',
        shopId: apexShop.id,
        category: 'TECHNICAL',
        subject: 'Used part inspection tool calibration needed',
        priority: 'LOW',
        status: 'OPEN',
        messages: [
          {
            id: 'msg-003',
            senderName: 'Ramesh Gowda',
            senderRole: 'SHOP_OWNER',
            message: 'Our bench testing equipment needs calibration. Can PartNexa assist with a certified technician?',
            createdAt: new Date(),
          },
        ],
      },
    });

    // COMMISSION LEDGER — 5 records (for completed jobs with real order data)
    const commLedgers = [
      {
        id: 'comm-apex-001',
        grossAmount: 2400,
        commissionRate: 12,
        commissionAmount: 288,
        platformCut: 288,
        shopPayout: 2112,
        serviceStatus: 'COMPLETED',
        paymentStatus: 'CAPTURED',
        releaseStatus: 'RELEASED',
        payoutStatus: 'RELEASED',
        jobId: 'job-apex-001',
      },
      {
        id: 'comm-apex-002',
        grossAmount: 5800,
        commissionRate: 12,
        commissionAmount: 696,
        platformCut: 696,
        shopPayout: 5104,
        serviceStatus: 'COMPLETED',
        paymentStatus: 'CAPTURED',
        releaseStatus: 'RELEASED',
        payoutStatus: 'RELEASED',
        jobId: 'job-apex-002',
      },
      {
        id: 'comm-apex-003',
        grossAmount: 3200,
        commissionRate: 12,
        commissionAmount: 384,
        platformCut: 384,
        shopPayout: 2816,
        serviceStatus: 'PENDING',
        paymentStatus: 'CAPTURED',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        jobId: 'job-apex-003',
      },
      {
        id: 'comm-apex-004',
        grossAmount: 1800,
        commissionRate: 12,
        commissionAmount: 216,
        platformCut: 216,
        shopPayout: 1584,
        serviceStatus: 'PENDING',
        paymentStatus: 'PENDING',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        jobId: 'job-apex-004',
      },
      {
        id: 'comm-apex-005',
        grossAmount: 900,
        commissionRate: 12,
        commissionAmount: 108,
        platformCut: 108,
        shopPayout: 792,
        serviceStatus: 'PENDING',
        paymentStatus: 'PENDING',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        jobId: 'job-apex-005',
      },
    ];

    // Commission ledger records need a valid orderId — use a placeholder approach
    // We use findFirst to find any existing order, or skip if none
    const anyOrder = await prisma.order.findFirst();
    if (anyOrder) {
      for (const ledger of commLedgers) {
        await prisma.commissionLedger.upsert({
          where: { id: ledger.id },
          update: {},
          create: {
            id: ledger.id,
            orderId: anyOrder.id,
            shopId: apexShop.id,
            jobId: ledger.jobId,
            grossAmount: ledger.grossAmount,
            commissionRate: ledger.commissionRate,
            commissionAmount: ledger.commissionAmount,
            platformCut: ledger.platformCut,
            shopPayout: ledger.shopPayout,
            serviceStatus: ledger.serviceStatus,
            paymentStatus: ledger.paymentStatus,
            releaseStatus: ledger.releaseStatus,
            payoutStatus: ledger.payoutStatus,
          },
        });
      }
    }

    console.log('✅ Workshop seed data created for Apex Auto Care!');
    console.log(`   Shop ID: ${apexShop.id}`);
    console.log(`   Jobs: ${jobDefs.length} | Deliveries: ${deliveryDefs.length} | Intakes: ${intakeDefs.length}`);
  } else {
    console.log('⚠️  Apex Auto Care shop not found — skipping workshop seed data');
  }

  console.log('✅ Seed completed successfully!');
  console.log('---------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('  Customer:         demo@partsphere.in / Demo@1234');
  console.log('  Admin:            admin@partsphere.in / Admin@1234');
  console.log('  Shop Owner 1:     apex.shop@partsphere.in / Shop@1234');
  console.log('  Shop Owner 2:     speedy.shop@partsphere.in / Shop@1234');
  console.log('  Shop Owner 3:     sai.clinic@partsphere.in / Shop@1234');
  console.log('  Delivery Partner: rider.rajesh@partsphere.in / Rider@1234');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
