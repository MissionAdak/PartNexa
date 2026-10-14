import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ============================================================================
// 1. VEHICLE CATALOG
// ============================================================================
export const initialMakes = [
  // 4-WHEELERS (20 Major Manufacturers)
  { id: 'make-maruti', name: 'Maruti Suzuki', type: 'CAR', logoUrl: '/brands/maruti.svg', createdAt: new Date() },
  { id: 'make-hyundai', name: 'Hyundai', type: 'CAR', logoUrl: '/brands/hyundai.svg', createdAt: new Date() },
  { id: 'make-tata', name: 'Tata', type: 'CAR', logoUrl: '/brands/tata.svg', createdAt: new Date() },
  { id: 'make-honda-car', name: 'Honda', type: 'CAR', logoUrl: '/brands/honda.svg', createdAt: new Date() },
  { id: 'make-toyota', name: 'Toyota', type: 'CAR', logoUrl: '/brands/toyota.svg', createdAt: new Date() },
  { id: 'make-kia', name: 'Kia', type: 'CAR', logoUrl: '/brands/kia.svg', createdAt: new Date() },
  { id: 'make-mahindra', name: 'Mahindra', type: 'CAR', logoUrl: '/brands/mahindra.svg', createdAt: new Date() },
  { id: 'make-volkswagen', name: 'Volkswagen', type: 'CAR', logoUrl: '/brands/volkswagen.svg', createdAt: new Date() },
  { id: 'make-skoda', name: 'Skoda', type: 'CAR', logoUrl: '/brands/skoda.svg', createdAt: new Date() },
  { id: 'make-renault', name: 'Renault', type: 'CAR', logoUrl: '/brands/renault.svg', createdAt: new Date() },
  { id: 'make-nissan', name: 'Nissan', type: 'CAR', logoUrl: '/brands/nissan.svg', createdAt: new Date() },
  { id: 'make-mg', name: 'MG Motor', type: 'CAR', logoUrl: '/brands/mg.svg', createdAt: new Date() },
  { id: 'make-jeep', name: 'Jeep', type: 'CAR', logoUrl: '/brands/jeep.svg', createdAt: new Date() },
  { id: 'make-ford', name: 'Ford', type: 'CAR', logoUrl: '/brands/ford.svg', createdAt: new Date() },
  { id: 'make-bmw', name: 'BMW', type: 'CAR', logoUrl: '/brands/bmw.svg', createdAt: new Date() },
  { id: 'make-mercedes', name: 'Mercedes-Benz', type: 'CAR', logoUrl: '/brands/mercedes.svg', createdAt: new Date() },
  { id: 'make-audi', name: 'Audi', type: 'CAR', logoUrl: '/brands/audi.svg', createdAt: new Date() },
  { id: 'make-isuzu', name: 'Isuzu', type: 'CAR', logoUrl: '/brands/isuzu.svg', createdAt: new Date() },
  { id: 'make-citroen', name: 'Citroen', type: 'CAR', logoUrl: '/brands/citroen.svg', createdAt: new Date() },
  { id: 'make-volvo', name: 'Volvo', type: 'CAR', logoUrl: '/brands/volvo.svg', createdAt: new Date() },

  // 2-WHEELERS (Major Manufacturers)
  { id: 'make-hero', name: 'Hero', type: 'BIKE', logoUrl: '/brands/hero.svg', createdAt: new Date() },
  { id: 'make-bajaj', name: 'Bajaj', type: 'BIKE', logoUrl: '/brands/bajaj.svg', createdAt: new Date() },
  { id: 'make-re', name: 'Royal Enfield', type: 'BIKE', logoUrl: '/brands/royalenfield.svg', createdAt: new Date() },
  { id: 'make-yamaha', name: 'Yamaha', type: 'BIKE', logoUrl: '/brands/yamaha.svg', createdAt: new Date() },
  { id: 'make-ktm', name: 'KTM', type: 'BIKE', logoUrl: '/brands/ktm.svg', createdAt: new Date() },
  { id: 'make-honda-bike', name: 'Honda Motorcycles', type: 'BIKE', logoUrl: '/brands/honda-bike.svg', createdAt: new Date() },
  { id: 'make-tvs', name: 'TVS', type: 'SCOOTER', logoUrl: '/brands/tvs.svg', createdAt: new Date() },
  { id: 'make-suzuki-sc', name: 'Suzuki', type: 'SCOOTER', logoUrl: '/brands/suzuki.svg', createdAt: new Date() },
  { id: 'make-ola', name: 'Ola Electric', type: 'SCOOTER', logoUrl: '/brands/ola.svg', createdAt: new Date() },
  { id: 'make-ather', name: 'Ather', type: 'SCOOTER', logoUrl: '/brands/ather.svg', createdAt: new Date() },
];

export const initialModels = [
  // 1. Maruti Suzuki
  { id: 'model-swift', makeId: 'make-maruti', name: 'Swift', type: 'CAR', imageUrl: null },
  { id: 'model-baleno', makeId: 'make-maruti', name: 'Baleno', type: 'CAR', imageUrl: null },
  { id: 'model-brezza', makeId: 'make-maruti', name: 'Brezza', type: 'CAR', imageUrl: null },
  { id: 'model-dzire', makeId: 'make-maruti', name: 'Dzire', type: 'CAR', imageUrl: null },
  { id: 'model-fronx', makeId: 'make-maruti', name: 'Fronx', type: 'CAR', imageUrl: null },
  { id: 'model-grand-vitara', makeId: 'make-maruti', name: 'Grand Vitara', type: 'CAR', imageUrl: null },
  { id: 'model-ertiga', makeId: 'make-maruti', name: 'Ertiga', type: 'CAR', imageUrl: null },
  { id: 'model-s-presso', makeId: 'make-maruti', name: 'S-Presso', type: 'CAR', imageUrl: null },

  // 2. Hyundai
  { id: 'model-i20', makeId: 'make-hyundai', name: 'i20', type: 'CAR', imageUrl: null },
  { id: 'model-creta', makeId: 'make-hyundai', name: 'Creta', type: 'CAR', imageUrl: null },
  { id: 'model-venue', makeId: 'make-hyundai', name: 'Venue', type: 'CAR', imageUrl: null },
  { id: 'model-verna', makeId: 'make-hyundai', name: 'Verna', type: 'CAR', imageUrl: null },
  { id: 'model-exter', makeId: 'make-hyundai', name: 'Exter', type: 'CAR', imageUrl: null },
  { id: 'model-tucson', makeId: 'make-hyundai', name: 'Tucson', type: 'CAR', imageUrl: null },
  { id: 'model-aura', makeId: 'make-hyundai', name: 'Aura', type: 'CAR', imageUrl: null },

  // 3. Tata
  { id: 'model-nexon', makeId: 'make-tata', name: 'Nexon', type: 'CAR', imageUrl: null },
  { id: 'model-punch', makeId: 'make-tata', name: 'Punch', type: 'CAR', imageUrl: null },
  { id: 'model-altroz', makeId: 'make-tata', name: 'Altroz', type: 'CAR', imageUrl: null },
  { id: 'model-tiago', makeId: 'make-tata', name: 'Tiago', type: 'CAR', imageUrl: null },
  { id: 'model-harrier', makeId: 'make-tata', name: 'Harrier', type: 'CAR', imageUrl: null },
  { id: 'model-safari', makeId: 'make-tata', name: 'Safari', type: 'CAR', imageUrl: null },
  { id: 'model-tigor', makeId: 'make-tata', name: 'Tigor', type: 'CAR', imageUrl: null },

  // 4. Honda
  { id: 'model-city', makeId: 'make-honda-car', name: 'City', type: 'CAR', imageUrl: null },
  { id: 'model-amaze', makeId: 'make-honda-car', name: 'Amaze', type: 'CAR', imageUrl: null },
  { id: 'model-elevate', makeId: 'make-honda-car', name: 'Elevate', type: 'CAR', imageUrl: null },
  { id: 'model-wrv', makeId: 'make-honda-car', name: 'WR-V', type: 'CAR', imageUrl: null },

  // 5. Toyota
  { id: 'model-innova-crysta', makeId: 'make-toyota', name: 'Innova Crysta', type: 'CAR', imageUrl: null },
  { id: 'model-fortuner', makeId: 'make-toyota', name: 'Fortuner', type: 'CAR', imageUrl: null },
  { id: 'model-hyryder', makeId: 'make-toyota', name: 'Urban Cruiser Hyryder', type: 'CAR', imageUrl: null },
  { id: 'model-glanza', makeId: 'make-toyota', name: 'Glanza', type: 'CAR', imageUrl: null },
  { id: 'model-hilux', makeId: 'make-toyota', name: 'Hilux', type: 'CAR', imageUrl: null },

  // 6. Kia
  { id: 'model-seltos', makeId: 'make-kia', name: 'Seltos', type: 'CAR', imageUrl: null },
  { id: 'model-sonet', makeId: 'make-kia', name: 'Sonet', type: 'CAR', imageUrl: null },
  { id: 'model-carens', makeId: 'make-kia', name: 'Carens', type: 'CAR', imageUrl: null },
  { id: 'model-ev6', makeId: 'make-kia', name: 'EV6', type: 'CAR', imageUrl: null },

  // 7. Mahindra
  { id: 'model-scorpio-n', makeId: 'make-mahindra', name: 'Scorpio-N', type: 'CAR', imageUrl: null },
  { id: 'model-xuv700', makeId: 'make-mahindra', name: 'XUV700', type: 'CAR', imageUrl: null },
  { id: 'model-xuv300', makeId: 'make-mahindra', name: 'XUV300 / 3XO', type: 'CAR', imageUrl: null },
  { id: 'model-thar', makeId: 'make-mahindra', name: 'Thar', type: 'CAR', imageUrl: null },
  { id: 'model-bolero', makeId: 'make-mahindra', name: 'Bolero Neo', type: 'CAR', imageUrl: null },

  // 8. Volkswagen
  { id: 'model-taigun', makeId: 'make-volkswagen', name: 'Taigun', type: 'CAR', imageUrl: null },
  { id: 'model-virtus', makeId: 'make-volkswagen', name: 'Virtus', type: 'CAR', imageUrl: null },
  { id: 'model-tiguan', makeId: 'make-volkswagen', name: 'Tiguan', type: 'CAR', imageUrl: null },
  { id: 'model-polo', makeId: 'make-volkswagen', name: 'Polo', type: 'CAR', imageUrl: null },

  // 9. Skoda
  { id: 'model-kushaq', makeId: 'make-skoda', name: 'Kushaq', type: 'CAR', imageUrl: null },
  { id: 'model-slavia', makeId: 'make-skoda', name: 'Slavia', type: 'CAR', imageUrl: null },
  { id: 'model-kodiaq', makeId: 'make-skoda', name: 'Kodiaq', type: 'CAR', imageUrl: null },
  { id: 'model-octavia', makeId: 'make-skoda', name: 'Octavia', type: 'CAR', imageUrl: null },

  // 10. Renault
  { id: 'model-kiger', makeId: 'make-renault', name: 'Kiger', type: 'CAR', imageUrl: null },
  { id: 'model-kwid', makeId: 'make-renault', name: 'Kwid', type: 'CAR', imageUrl: null },
  { id: 'model-triber', makeId: 'make-renault', name: 'Triber', type: 'CAR', imageUrl: null },
  { id: 'model-duster', makeId: 'make-renault', name: 'Duster', type: 'CAR', imageUrl: null },

  // 11. Nissan
  { id: 'model-magnite', makeId: 'make-nissan', name: 'Magnite', type: 'CAR', imageUrl: null },
  { id: 'model-kicks', makeId: 'make-nissan', name: 'Kicks', type: 'CAR', imageUrl: null },
  { id: 'model-xtrail', makeId: 'make-nissan', name: 'X-Trail', type: 'CAR', imageUrl: null },

  // 12. MG Motor
  { id: 'model-hector', makeId: 'make-mg', name: 'Hector', type: 'CAR', imageUrl: null },
  { id: 'model-astor', makeId: 'make-mg', name: 'Astor', type: 'CAR', imageUrl: null },
  { id: 'model-gloster', makeId: 'make-mg', name: 'Gloster', type: 'CAR', imageUrl: null },
  { id: 'model-comet', makeId: 'make-mg', name: 'Comet EV', type: 'CAR', imageUrl: null },
  { id: 'model-zsev', makeId: 'make-mg', name: 'ZS EV', type: 'CAR', imageUrl: null },

  // 13. Jeep
  { id: 'model-compass', makeId: 'make-jeep', name: 'Compass', type: 'CAR', imageUrl: null },
  { id: 'model-meridian', makeId: 'make-jeep', name: 'Meridian', type: 'CAR', imageUrl: null },
  { id: 'model-wrangler', makeId: 'make-jeep', name: 'Wrangler', type: 'CAR', imageUrl: null },
  { id: 'model-grand-cherokee', makeId: 'make-jeep', name: 'Grand Cherokee', type: 'CAR', imageUrl: null },

  // 14. Ford
  { id: 'model-ecosport', makeId: 'make-ford', name: 'EcoSport', type: 'CAR', imageUrl: null },
  { id: 'model-endeavour', makeId: 'make-ford', name: 'Endeavour', type: 'CAR', imageUrl: null },
  { id: 'model-figo', makeId: 'make-ford', name: 'Figo', type: 'CAR', imageUrl: null },

  // 15. BMW
  { id: 'model-bmw-3series', makeId: 'make-bmw', name: '3 Series', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-5series', makeId: 'make-bmw', name: '5 Series', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-x1', makeId: 'make-bmw', name: 'X1', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-x3', makeId: 'make-bmw', name: 'X3', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-x5', makeId: 'make-bmw', name: 'X5', type: 'CAR', imageUrl: null },

  // 16. Mercedes-Benz
  { id: 'model-merc-c-class', makeId: 'make-mercedes', name: 'C-Class', type: 'CAR', imageUrl: null },
  { id: 'model-merc-e-class', makeId: 'make-mercedes', name: 'E-Class', type: 'CAR', imageUrl: null },
  { id: 'model-merc-gla', makeId: 'make-mercedes', name: 'GLA', type: 'CAR', imageUrl: null },
  { id: 'model-merc-glc', makeId: 'make-mercedes', name: 'GLC', type: 'CAR', imageUrl: null },
  { id: 'model-merc-gle', makeId: 'make-mercedes', name: 'GLE', type: 'CAR', imageUrl: null },

  // 17. Audi
  { id: 'model-audi-a4', makeId: 'make-audi', name: 'A4', type: 'CAR', imageUrl: null },
  { id: 'model-audi-a6', makeId: 'make-audi', name: 'A6', type: 'CAR', imageUrl: null },
  { id: 'model-audi-q3', makeId: 'make-audi', name: 'Q3', type: 'CAR', imageUrl: null },
  { id: 'model-audi-q5', makeId: 'make-audi', name: 'Q5', type: 'CAR', imageUrl: null },
  { id: 'model-audi-q7', makeId: 'make-audi', name: 'Q7', type: 'CAR', imageUrl: null },

  // 18. Isuzu
  { id: 'model-isuzu-vcross', makeId: 'make-isuzu', name: 'D-Max V-Cross', type: 'CAR', imageUrl: null },
  { id: 'model-isuzu-mux', makeId: 'make-isuzu', name: 'MU-X', type: 'CAR', imageUrl: null },
  { id: 'model-isuzu-hilander', makeId: 'make-isuzu', name: 'Hi-Lander', type: 'CAR', imageUrl: null },

  // 19. Citroen
  { id: 'model-citroen-c3', makeId: 'make-citroen', name: 'C3', type: 'CAR', imageUrl: null },
  { id: 'model-citroen-c3-aircross', makeId: 'make-citroen', name: 'C3 Aircross', type: 'CAR', imageUrl: null },
  { id: 'model-citroen-basalt', makeId: 'make-citroen', name: 'Basalt', type: 'CAR', imageUrl: null },
  { id: 'model-citroen-c5', makeId: 'make-citroen', name: 'C5 Aircross', type: 'CAR', imageUrl: null },

  // 20. Volvo
  { id: 'model-volvo-xc40', makeId: 'make-volvo', name: 'XC40', type: 'CAR', imageUrl: null },
  { id: 'model-volvo-xc60', makeId: 'make-volvo', name: 'XC60', type: 'CAR', imageUrl: null },
  { id: 'model-volvo-xc90', makeId: 'make-volvo', name: 'XC90', type: 'CAR', imageUrl: null },

  // --- 2-WHEELERS ---
  // Hero
  { id: 'model-splendor', makeId: 'make-hero', name: 'Splendor Plus', type: 'BIKE', imageUrl: null },
  { id: 'model-hf-deluxe', makeId: 'make-hero', name: 'HF Deluxe', type: 'BIKE', imageUrl: null },
  { id: 'model-passion-pro', makeId: 'make-hero', name: 'Passion Pro', type: 'BIKE', imageUrl: null },
  { id: 'model-xpulse', makeId: 'make-hero', name: 'Xpulse 200 4V', type: 'BIKE', imageUrl: null },

  // Bajaj
  { id: 'model-pulsar', makeId: 'make-bajaj', name: 'Pulsar 150', type: 'BIKE', imageUrl: null },
  { id: 'model-pulsar-ns', makeId: 'make-bajaj', name: 'Pulsar NS200', type: 'BIKE', imageUrl: null },
  { id: 'model-pulsar-n250', makeId: 'make-bajaj', name: 'Pulsar N250', type: 'BIKE', imageUrl: null },
  { id: 'model-dominar', makeId: 'make-bajaj', name: 'Dominar 400', type: 'BIKE', imageUrl: null },
  { id: 'model-avenger', makeId: 'make-bajaj', name: 'Avenger Street 160', type: 'BIKE', imageUrl: null },

  // Royal Enfield
  { id: 'model-classic-350', makeId: 'make-re', name: 'Classic 350', type: 'BIKE', imageUrl: null },
  { id: 'model-hunter-350', makeId: 'make-re', name: 'Hunter 350', type: 'BIKE', imageUrl: null },
  { id: 'model-meteor-350', makeId: 'make-re', name: 'Meteor 350', type: 'BIKE', imageUrl: null },
  { id: 'model-bullet-350', makeId: 'make-re', name: 'Bullet 350', type: 'BIKE', imageUrl: null },
  { id: 'model-himalayan', makeId: 'make-re', name: 'Himalayan 450', type: 'BIKE', imageUrl: null },

  // Yamaha
  { id: 'model-r15', makeId: 'make-yamaha', name: 'YZF R15 V4', type: 'BIKE', imageUrl: null },
  { id: 'model-mt15', makeId: 'make-yamaha', name: 'MT-15 V2', type: 'BIKE', imageUrl: null },
  { id: 'model-fzs', makeId: 'make-yamaha', name: 'FZS-FI V4', type: 'BIKE', imageUrl: null },
  { id: 'model-fascino', makeId: 'make-yamaha', name: 'Fascino 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ray-zr', makeId: 'make-yamaha', name: 'Ray-ZR 125', type: 'SCOOTER', imageUrl: null },

  // KTM
  { id: 'model-duke-200', makeId: 'make-ktm', name: 'Duke 200', type: 'BIKE', imageUrl: null },
  { id: 'model-duke-390', makeId: 'make-ktm', name: 'Duke 390', type: 'BIKE', imageUrl: null },
  { id: 'model-rc390', makeId: 'make-ktm', name: 'RC 390', type: 'BIKE', imageUrl: null },

  // Honda Motorcycles & Scooters
  { id: 'model-cb300r', makeId: 'make-honda-bike', name: 'CB300R', type: 'BIKE', imageUrl: null },
  { id: 'model-unicorn', makeId: 'make-honda-bike', name: 'Unicorn', type: 'BIKE', imageUrl: null },
  { id: 'model-shine', makeId: 'make-honda-bike', name: 'Shine 125', type: 'BIKE', imageUrl: null },
  { id: 'model-activa', makeId: 'make-honda-bike', name: 'Activa 6G', type: 'SCOOTER', imageUrl: null },
  { id: 'model-dio', makeId: 'make-honda-bike', name: 'Dio 125', type: 'SCOOTER', imageUrl: null },

  // TVS
  { id: 'model-jupiter', makeId: 'make-tvs', name: 'Jupiter 110', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ntorq', makeId: 'make-tvs', name: 'Ntorq 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-iqube', makeId: 'make-tvs', name: 'iQube Electric', type: 'SCOOTER', imageUrl: null },
  { id: 'model-raider', makeId: 'make-tvs', name: 'Raider 125', type: 'BIKE', imageUrl: null },
  { id: 'model-apache', makeId: 'make-tvs', name: 'Apache RTR 160 4V', type: 'BIKE', imageUrl: null },

  // Suzuki
  { id: 'model-access', makeId: 'make-suzuki-sc', name: 'Access 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-burgman', makeId: 'make-suzuki-sc', name: 'Burgman Street 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-gixxer', makeId: 'make-suzuki-sc', name: 'Gixxer SF 250', type: 'BIKE', imageUrl: null },

  // Ola Electric
  { id: 'model-ola-s1', makeId: 'make-ola', name: 'S1 Pro', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ola-s1x', makeId: 'make-ola', name: 'S1 X', type: 'SCOOTER', imageUrl: null },

  // Ather Energy
  { id: 'model-ather-450x', makeId: 'make-ather', name: '450X', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ather-450s', makeId: 'make-ather', name: '450S', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ather-rizta', makeId: 'make-ather', name: 'Rizta', type: 'SCOOTER', imageUrl: null },
];

export const initialVariants = [
  // --- 1. Maruti Suzuki ---
  { id: 'var-swift-vxi', modelId: 'model-swift', name: 'VXi', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-swift-zxi', modelId: 'model-swift', name: 'ZXi', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-swift-zxi-plus', modelId: 'model-swift', name: 'ZXi Plus AMT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-baleno-delta', modelId: 'model-baleno', name: 'Delta', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-baleno-alpha', modelId: 'model-baleno', name: 'Alpha CVT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-brezza-vxi', modelId: 'model-brezza', name: 'VXi', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1462 },
  { id: 'var-brezza-zxi', modelId: 'model-brezza', name: 'ZXi AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1462 },
  { id: 'var-dzire-vxi', modelId: 'model-dzire', name: 'VXi CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-dzire-zxi', modelId: 'model-dzire', name: 'ZXi AMT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-fronx-delta', modelId: 'model-fronx', name: 'Delta Plus 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-fronx-alpha', modelId: 'model-fronx', name: 'Alpha 1.0 Turbo AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 998 },
  { id: 'var-gv-zeta', modelId: 'model-grand-vitara', name: 'Zeta Mild-Hybrid MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1462 },
  { id: 'var-gv-alpha-hybrid', modelId: 'model-grand-vitara', name: 'Alpha Plus Strong Hybrid e-CVT', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1490 },
  { id: 'var-ertiga-vxi', modelId: 'model-ertiga', name: 'VXi CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1462 },
  { id: 'var-ertiga-zxi', modelId: 'model-ertiga', name: 'ZXi Plus AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1462 },
  { id: 'var-spresso-vxi', modelId: 'model-s-presso', name: 'VXi Plus', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 998 },

  // --- 2. Hyundai ---
  { id: 'var-i20-magna', modelId: 'model-i20', name: 'Magna 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-i20-asta', modelId: 'model-i20', name: 'Asta (O) IVT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-creta-sx', modelId: 'model-creta', name: 'SX Executive', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-creta-sx-o', modelId: 'model-creta', name: 'SX (O) Turbo DCT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-creta-n-line', modelId: 'model-creta', name: 'N Line N8 DCT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-venue-s', modelId: 'model-venue', name: 'S Turbo iMT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 998 },
  { id: 'var-venue-sx', modelId: 'model-venue', name: 'SX (O) Turbo DCT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 998 },
  { id: 'var-verna-s', modelId: 'model-verna', name: 'S 1.5 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-verna-sx-turbo', modelId: 'model-verna', name: 'SX (O) 1.5 Turbo DCT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-exter-sx', modelId: 'model-exter', name: 'SX 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-exter-sx-cng', modelId: 'model-exter', name: 'SX 1.2 Hy-CNG Dual Cylinder', year: 2024, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-tucson-signature', modelId: 'model-tucson', name: 'Signature 2.0 4WD Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1997 },
  { id: 'var-aura-sx', modelId: 'model-aura', name: 'SX 1.2 CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1197 },

  // --- 3. Tata ---
  { id: 'var-nexon-creative', modelId: 'model-nexon', name: 'Creative Plus 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-nexon-fearless', modelId: 'model-nexon', name: 'Fearless Plus DCA', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-nexon-ev-empowered', modelId: 'model-nexon', name: 'EV Empowered Plus LR', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-punch-accomplished', modelId: 'model-punch', name: 'Accomplished Dazzle MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-punch-creative-cng', modelId: 'model-punch', name: 'Creative i-CNG', year: 2024, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-altroz-xz', modelId: 'model-altroz', name: 'XZ Plus i-Turbo MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-altroz-racer', modelId: 'model-altroz', name: 'Racer R3 1.2 Turbo', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-tiago-xz', modelId: 'model-tiago', name: 'XZ Plus i-CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-tiago-ev-xz', modelId: 'model-tiago', name: 'EV XZ Plus Tech LUX', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-harrier-xz', modelId: 'model-harrier', name: 'XZ Plus Dark Edition', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-harrier-fearless', modelId: 'model-harrier', name: 'Fearless Plus Dark AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-safari-accomplished', modelId: 'model-safari', name: 'Accomplished Plus 6-Str AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },

  // --- 4. Honda ---
  { id: 'var-city-v', modelId: 'model-city', name: 'V 5th Gen MT', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1498 },
  { id: 'var-city-zx', modelId: 'model-city', name: 'ZX e:HEV Strong Hybrid', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-amaze-vx', modelId: 'model-amaze', name: 'VX CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-amaze-s', modelId: 'model-amaze', name: 'S MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-elevate-zx', modelId: 'model-elevate', name: 'ZX CVT ADAS', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-elevate-v', modelId: 'model-elevate', name: 'V MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1498 },

  // --- 5. Toyota ---
  { id: 'var-innova-crysta-gx', modelId: 'model-innova-crysta', name: 'GX 7-Str Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2393 },
  { id: 'var-innova-crysta-zx', modelId: 'model-innova-crysta', name: 'ZX 7-Str Diesel MT', year: 2024, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2393 },
  { id: 'var-fortuner-4x4', modelId: 'model-fortuner', name: '4x4 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2755 },
  { id: 'var-fortuner-legender', modelId: 'model-fortuner', name: 'Legender 4x4 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2755 },
  { id: 'var-hyryder-s-hybrid', modelId: 'model-hyryder', name: 'S Grand Strong Hybrid e-CVT', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1490 },
  { id: 'var-glanza-g', modelId: 'model-glanza', name: 'G AMT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-hilux-high', modelId: 'model-hilux', name: 'High 4x4 Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2755 },

  // --- 6. Kia ---
  { id: 'var-seltos-htx', modelId: 'model-seltos', name: 'HTX 1.5 Turbo DCT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-seltos-gtx', modelId: 'model-seltos', name: 'GTX Plus 1.5 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1493 },
  { id: 'var-sonet-htx', modelId: 'model-sonet', name: 'HTX 1.5 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1493 },
  { id: 'var-carens-luxury', modelId: 'model-carens', name: 'Luxury Plus 1.5 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1493 },
  { id: 'var-ev6-gt-line', modelId: 'model-ev6', name: 'GT-Line AWD Electric', year: 2023, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },

  // --- 7. Mahindra ---
  { id: 'var-scorpio-n-z8', modelId: 'model-scorpio-n', name: 'Z8 L 4x4 Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2198 },
  { id: 'var-scorpio-n-z4', modelId: 'model-scorpio-n', name: 'Z4 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2198 },
  { id: 'var-xuv700-ax7', modelId: 'model-xuv700', name: 'AX7 L AWD Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2198 },
  { id: 'var-xuv300-w8', modelId: 'model-xuv300', name: 'W8 Option Turbo MT', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-thar-4x4', modelId: 'model-thar', name: 'LX Hard Top 4x4 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2184 },
  { id: 'var-bolero-n10', modelId: 'model-bolero', name: 'N10 Option Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1493 },

  // --- 8. Volkswagen ---
  { id: 'var-taigun-topline', modelId: 'model-taigun', name: 'Topline 1.0 TSI AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-taigun-gt-plus', modelId: 'model-taigun', name: 'GT Plus 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-virtus-highline', modelId: 'model-virtus', name: 'Highline 1.0 TSI AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-virtus-gt-edge', modelId: 'model-virtus', name: 'GT Edge 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-tiguan-elegance', modelId: 'model-tiguan', name: 'Elegance 2.0 TSI 4MOTION DSG', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-polo-gt-tsi', modelId: 'model-polo', name: 'GT 1.0 TSI AT', year: 2021, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },

  // --- 9. Skoda ---
  { id: 'var-kushaq-style', modelId: 'model-kushaq', name: 'Style 1.5 TSI AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-kushaq-monte-carlo', modelId: 'model-kushaq', name: 'Monte Carlo 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-slavia-style', modelId: 'model-slavia', name: 'Style 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-kodiaq-l-and-k', modelId: 'model-kodiaq', name: 'L&K 2.0 TSI 4x4 DSG', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },

  // --- 10. Renault ---
  { id: 'var-kiger-rxt', modelId: 'model-kiger', name: 'RXT Turbo CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-kwid-rxt', modelId: 'model-kwid', name: 'RXT AMT', year: 2022, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-triber-rzx', modelId: 'model-triber', name: 'RZX EASY-R AMT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },

  // --- 11. Nissan ---
  { id: 'var-magnite-tekna', modelId: 'model-magnite', name: 'Tekna Plus Turbo CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-magnite-geza', modelId: 'model-magnite', name: 'GEZA Edition 1.0 MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 999 },
  { id: 'var-xtrail-hybrid', modelId: 'model-xtrail', name: 'e-POWER Hybrid 4WD', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1498 },

  // --- 12. MG Motor ---
  { id: 'var-hector-smart', modelId: 'model-hector', name: 'Smart Pro 2.0 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1956 },
  { id: 'var-hector-sharp-pro', modelId: 'model-hector', name: 'Sharp Pro 1.5 Turbo CVT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1451 },
  { id: 'var-astor-super', modelId: 'model-astor', name: 'Super CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1349 },
  { id: 'var-comet-plush', modelId: 'model-comet', name: 'Plush Fast-Charging EV', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-zsev-exclusive', modelId: 'model-zsev', name: 'Exclusive Plus EV', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },

  // --- 13. Jeep ---
  { id: 'var-compass-limited', modelId: 'model-compass', name: 'Limited 2.0 Diesel 4x4 AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-compass-model-s', modelId: 'model-compass', name: 'Model S (O) 4x4 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-meridian-limited-plus', modelId: 'model-meridian', name: 'Limited Plus 4x4 AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-wrangler-rubicon', modelId: 'model-wrangler', name: 'Rubicon 4x4 2.0 Turbo AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1995 },

  // --- 14. Ford ---
  { id: 'var-ecosport-titanium', modelId: 'model-ecosport', name: 'Titanium 1.5 Petrol MT', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-endeavour-titanium-plus', modelId: 'model-endeavour', name: 'Titanium Plus 4x4 2.0 AT', year: 2021, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1996 },
  { id: 'var-figo-titanium', modelId: 'model-figo', name: 'Titanium Blu 1.2 MT', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1194 },

  // --- 15. BMW ---
  { id: 'var-bmw-330li-m', modelId: 'model-bmw-3series', name: '330Li M Sport Gran Limousine', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1998 },
  { id: 'var-bmw-m340i', modelId: 'model-bmw-3series', name: 'M340i xDrive 3.0 Turbo', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 2998 },
  { id: 'var-bmw-520d-luxury', modelId: 'model-bmw-5series', name: '520d Luxury Line', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1995 },
  { id: 'var-bmw-x1-sdrive18d', modelId: 'model-bmw-x1', name: 'sDrive18d M Sport', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1995 },
  { id: 'var-bmw-x1-sdrive18i', modelId: 'model-bmw-x1', name: 'sDrive18i xLine', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1499 },
  { id: 'var-bmw-x3-xdrive20d', modelId: 'model-bmw-x3', name: 'xDrive20d M Sport', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1995 },
  { id: 'var-bmw-x5-xdrive30d', modelId: 'model-bmw-x5', name: 'xDrive30d xLine', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2993 },

  // --- 16. Mercedes-Benz ---
  { id: 'var-merc-c200-petrol', modelId: 'model-merc-c-class', name: 'C 200 Avantgarde Mild Hybrid', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1496 },
  { id: 'var-merc-c220d-diesel', modelId: 'model-merc-c-class', name: 'C 220d 4MATIC', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1993 },
  { id: 'var-merc-e200-exclusive', modelId: 'model-merc-e-class', name: 'E 200 Exclusive LWB', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1991 },
  { id: 'var-merc-gla200', modelId: 'model-merc-gla', name: 'GLA 200 Progressive Line', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1332 },
  { id: 'var-merc-glc300', modelId: 'model-merc-glc', name: 'GLC 300 4MATIC Coupe', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1999 },
  { id: 'var-merc-gle300d', modelId: 'model-merc-gle', name: 'GLE 300d 4MATIC LWB', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1993 },

  // --- 17. Audi ---
  { id: 'var-audi-a4-technology', modelId: 'model-audi-a4', name: '40 TFSI Technology', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-a4-premium', modelId: 'model-audi-a4', name: '40 TFSI Premium Plus', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-a6-technology', modelId: 'model-audi-a6', name: '45 TFSI Technology Matrix', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-q3-premium-plus', modelId: 'model-audi-q3', name: '40 TFSI quattro Premium Plus', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-q5-technology', modelId: 'model-audi-q5', name: '45 TFSI quattro Technology', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-q7-technology', modelId: 'model-audi-q7', name: '55 TFSI quattro Technology', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 2995 },

  // --- 18. Isuzu ---
  { id: 'var-isuzu-vcross-z-prestige', modelId: 'model-isuzu-vcross', name: 'Z-Prestige 4x4 AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1898 },
  { id: 'var-isuzu-vcross-4x4-mt', modelId: 'model-isuzu-vcross', name: 'Z 4x4 MT', year: 2024, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1898 },
  { id: 'var-isuzu-mux-4x4', modelId: 'model-isuzu-mux', name: '4x4 3.0 Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2999 },
  { id: 'var-isuzu-hilander-4x2', modelId: 'model-isuzu-hilander', name: '4x2 Crew Cab MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1898 },

  // --- 19. Citroen ---
  { id: 'var-citroen-c3-shine-turbo', modelId: 'model-citroen-c3', name: 'Shine 1.2 PureTech Turbo MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-citroen-c3-feel', modelId: 'model-citroen-c3', name: 'Feel 1.2 MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1198 },
  { id: 'var-citroen-c3-aircross-max', modelId: 'model-citroen-c3-aircross', name: 'Max 7-Str 1.2 Turbo AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-citroen-basalt-max-turbo', modelId: 'model-citroen-basalt', name: 'Max 1.2 Turbo AT Coupe', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-citroen-c5-shine', modelId: 'model-citroen-c5', name: 'Shine 2.0 HDi Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1997 },

  // --- 20. Volvo ---
  { id: 'var-volvo-xc40-b4-ultimate', modelId: 'model-volvo-xc40', name: 'B4 Ultimate Mild Hybrid AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1969 },
  { id: 'var-volvo-xc40-recharge', modelId: 'model-volvo-xc40', name: 'Recharge Twin Motor EV', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-volvo-xc60-b5-ultimate', modelId: 'model-volvo-xc60', name: 'B5 Ultimate AWD AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1969 },
  { id: 'var-volvo-xc90-b6-ultimate', modelId: 'model-volvo-xc90', name: 'B6 Ultimate 7-Str AWD AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1969 },

  // --- 2-WHEELERS ---
  // Hero
  { id: 'var-splendor-drum', modelId: 'model-splendor', name: 'Drum Self-Cast BS6', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 97 },
  { id: 'var-splendor-xtec', modelId: 'model-splendor', name: 'XTEC Bluetooth', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 97 },
  { id: 'var-passion-pro-xtec', modelId: 'model-passion-pro', name: 'XTEC Disc', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 113 },
  { id: 'var-xpulse-4v', modelId: 'model-xpulse', name: 'Pro 4V Rally Edition', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 199 },

  // Bajaj
  { id: 'var-pulsar-twin', modelId: 'model-pulsar', name: 'Twin Disc BS6', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-pulsar-single', modelId: 'model-pulsar', name: 'Single Disc', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-ns200-standard', modelId: 'model-pulsar-ns', name: 'Dual-Channel ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 199 },
  { id: 'var-n250-standard', modelId: 'model-pulsar-n250', name: 'Dual-Channel ABS', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 249 },
  { id: 'var-dominar-standard', modelId: 'model-dominar', name: 'Touring Edition 400', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 373 },

  // Royal Enfield
  { id: 'var-classic-halcyon', modelId: 'model-classic-350', name: 'Halcyon Series Dual-ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-classic-dark', modelId: 'model-classic-350', name: 'Dark Stealth Black Dual-ABS', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-hunter-dapper', modelId: 'model-hunter-350', name: 'Dapper Ash Retro', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-meteor-fireball', modelId: 'model-meteor-350', name: 'Fireball Yellow', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-himalayan-standard', modelId: 'model-himalayan', name: 'Hanle Black Tubeless', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 452 },

  // Yamaha
  { id: 'var-r15-v4', modelId: 'model-r15', name: 'V4 Racing Blue Quickshifter', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 155 },
  { id: 'var-mt15-v2', modelId: 'model-mt15', name: 'V2 Ice Fluo Vermillion', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 155 },
  { id: 'var-fzs-v4', modelId: 'model-fzs', name: 'V4 Deluxe Traction Control', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-fascino-std', modelId: 'model-fascino', name: 'Disc Hybrid Fi', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 125 },
  { id: 'var-ray-zr-std', modelId: 'model-ray-zr', name: 'Street Rally 125 Fi Hybrid', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 125 },

  // KTM
  { id: 'var-duke200-standard', modelId: 'model-duke-200', name: 'Electronic Orange', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 199 },
  { id: 'var-duke390-standard', modelId: 'model-duke-390', name: 'Gen 3 Quickshifter Plus', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 398 },

  // Honda Motorcycles & Scooters
  { id: 'var-unicorn-standard', modelId: 'model-unicorn', name: 'Standard Alloy CBS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 162 },
  { id: 'var-shine-standard', modelId: 'model-shine', name: 'Celebration Edition CBS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 124 },
  { id: 'var-activa-std', modelId: 'model-activa', name: 'Standard BS6', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 109 },
  { id: 'var-activa-deluxe', modelId: 'model-activa', name: 'Deluxe Smart Key H-Smart', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 109 },
  { id: 'var-dio-125-std', modelId: 'model-dio', name: 'H-Smart 125', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },

  // TVS
  { id: 'var-jupiter-zx', modelId: 'model-jupiter', name: 'ZX SmartXonnect Disc', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 113 },
  { id: 'var-ntorq-race', modelId: 'model-ntorq', name: 'Race XP Stealth Edition', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },
  { id: 'var-iqube-std', modelId: 'model-iqube', name: 'Standard 3.4 kWh', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-apache-160-4v', modelId: 'model-apache', name: 'RTR 160 4V Special Edition', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 159 },

  // Suzuki
  { id: 'var-access-std', modelId: 'model-access', name: 'Ride Connect Bluetooth Edition', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },
  { id: 'var-burgman-std', modelId: 'model-burgman', name: 'EX Executive Luxury Maxi', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },
  { id: 'var-gixxer-sf', modelId: 'model-gixxer', name: 'SF 250 Dual Channel ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 249 },

  // Ola Electric
  { id: 'var-ola-s1-pro', modelId: 'model-ola-s1', name: 'S1 Pro Gen 2 (4 kWh)', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-ola-s1x-2kw', modelId: 'model-ola-s1x', name: 'S1 X (3 kWh)', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },

  // Ather
  { id: 'var-ather-450x-gen3', modelId: 'model-ather-450x', name: '450X Gen 3 (3.7 kWh)', year: 2023, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-ather-450s-std', modelId: 'model-ather-450s', name: '450S (2.9 kWh)', year: 2023, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-ather-rizta-z', modelId: 'model-ather-rizta', name: 'Rizta Z (3.7 kWh)', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
];

// ============================================================================
// 2. CATEGORIES & BRANDS
// ============================================================================
export const initialCategories = [
  { id: 'cat-engine', name: 'Engine & Ignition', slug: 'engine-parts', sortOrder: 1, isActive: true, parentId: null },
  { id: 'cat-braking', name: 'Braking System', slug: 'braking-system', sortOrder: 2, isActive: true, parentId: null },
  { id: 'cat-electrical', name: 'Electrical & Lighting', slug: 'electrical-lighting', sortOrder: 3, isActive: true, parentId: null },
  { id: 'cat-batteries', name: 'Batteries & Power', slug: 'batteries-power', sortOrder: 4, isActive: true, parentId: null },
  { id: 'cat-oils', name: 'Oils & Lubricants', slug: 'oils-lubricants', sortOrder: 5, isActive: true, parentId: null },
  { id: 'cat-filters', name: 'Filters & Maintenance', slug: 'filters-maintenance', sortOrder: 6, isActive: true, parentId: null },
  { id: 'cat-suspension', name: 'Suspension & Steering', slug: 'suspension-steering', sortOrder: 7, isActive: true, parentId: null },
  { id: 'cat-transmission', name: 'Clutch & Transmission', slug: 'clutch-transmission', sortOrder: 8, isActive: true, parentId: null },
  { id: 'cat-cooling', name: 'Cooling & Radiators', slug: 'cooling-system', sortOrder: 9, isActive: true, parentId: null },
  { id: 'cat-body-wipers', name: 'Body & Wipers', slug: 'body-wipers', sortOrder: 10, isActive: true, parentId: null },
];

export const initialBrands = [
  { id: 'brand-bosch', name: 'Bosch', slug: 'bosch', isOem: true, country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' },
  { id: 'brand-brembo', name: 'Brembo', slug: 'brembo', isOem: true, country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=100' },
  { id: 'brand-motul', name: 'Motul', slug: 'motul', isOem: true, country: 'France', logoUrl: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=100' },
  { id: 'brand-exide', name: 'Exide', slug: 'exide', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100' },
  { id: 'brand-amaron', name: 'Amaron', slug: 'amaron', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100' },
  { id: 'brand-lumax', name: 'Lumax', slug: 'lumax', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100' },
  { id: 'brand-unominda', name: 'Uno Minda', slug: 'uno-minda', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100' },
  { id: 'brand-castrol', name: 'Castrol', slug: 'castrol', isOem: false, country: 'United Kingdom', logoUrl: '/brands/castrol.svg' },
  { id: 'brand-mann', name: 'Mann-Filter', slug: 'mann-filter', isOem: true, country: 'Germany', logoUrl: '/brands/mann.svg' },
  { id: 'brand-valeo', name: 'Valeo', slug: 'valeo', isOem: true, country: 'France', logoUrl: '/brands/valeo.svg' },
  { id: 'brand-gabriel', name: 'Gabriel', slug: 'gabriel', isOem: true, country: 'India', logoUrl: '/brands/gabriel.svg' },
  { id: 'brand-skf', name: 'SKF', slug: 'skf', isOem: true, country: 'Sweden', logoUrl: '/brands/skf.svg' },
  { id: 'brand-denso', name: 'Denso', slug: 'denso', isOem: true, country: 'Japan', logoUrl: '/brands/denso.svg' },
  { id: 'brand-conti', name: 'Continental', slug: 'continental', isOem: true, country: 'Germany', logoUrl: '/brands/continental.svg' },
  { id: 'brand-behr', name: 'Behr', slug: 'behr', isOem: true, country: 'Germany', logoUrl: '/brands/behr.svg' },
  { id: 'brand-ngk', name: 'NGK', slug: 'ngk', isOem: true, country: 'Japan', logoUrl: '/brands/ngk.svg' },
  { id: 'brand-shell', name: 'Shell', slug: 'shell', isOem: false, country: 'Netherlands', logoUrl: '/brands/shell.svg' },
  { id: 'brand-delphi', name: 'Delphi', slug: 'delphi', isOem: true, country: 'United States', logoUrl: '/brands/delphi.svg' },
  { id: 'brand-rolon', name: 'Rolon', slug: 'rolon', isOem: true, country: 'India', logoUrl: '/brands/rolon.svg' },
  { id: 'brand-kbx', name: 'KBX', slug: 'kbx', isOem: true, country: 'India', logoUrl: '/brands/kbx.svg' },
  { id: 'brand-purolator', name: 'Purolator', slug: 'purolator', isOem: true, country: 'United States', logoUrl: '/brands/purolator.svg' },
  { id: 'brand-hyundai-mobis', name: 'Hyundai Mobis', slug: 'hyundai-mobis', isOem: true, country: 'South Korea', logoUrl: '/brands/hyundai.svg' },
];

export const initialShops = [
  {
    id: 'shop-1',
    name: 'Apex Auto Care & Spares',
    slug: 'apex-auto-care',
    ownerId: 'shop-owner-1',
    ownerName: 'Rajesh Verma',
    email: 'apex.auto@partsphare.test',
    city: 'Bengaluru',
    state: 'Karnataka',
    rating: 4.8,
    totalRatings: 128,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 12,
    vehicleCategories: ['CAR', 'BIKE', 'SCOOTER'],
    address: '12th Main Road, HAL 2nd Stage, Indiranagar',
    addressLine1: '12th Main Road, HAL 2nd Stage, Indiranagar',
    pincode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '+91 98450 12345',
    operatingHours: '08:30 AM - 08:30 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Brake Fitment', 'Battery Replacement', 'Electrical Systems', 'Doorstep Mechanic', 'Engine Diagnostics', 'Periodic Maintenance'],
    serviceAvailable: true,
    isActive: true,
  },
  {
    id: 'shop-2',
    name: 'Speedy Wheels Garage & Spares',
    slug: 'speedy-wheels-garage',
    ownerId: 'shop-owner-2',
    ownerName: 'Sunil Rao',
    email: 'speedy.wheels@partsphare.test',
    city: 'Mumbai',
    state: 'Maharashtra',
    rating: 4.6,
    totalRatings: 94,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 10,
    vehicleCategories: ['CAR'],
    address: 'Link Road, Andheri West',
    addressLine1: 'Link Road, Andheri West',
    pincode: '400053',
    latitude: 19.1363,
    longitude: 72.8277,
    phone: '+91 98200 54321',
    operatingHours: '09:00 AM - 08:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Engine Diagnostics', 'Spark Plug & Ignition', 'Suspension', 'Lubrication'],
    serviceAvailable: true,
    isActive: true,
  },
  {
    id: 'shop-3',
    name: 'Sai Car Clinic & Genuine Parts',
    slug: 'sai-car-clinic',
    ownerId: 'shop-owner-3',
    ownerName: 'Manoj Gupta',
    email: 'sai.clinic@partsphare.test',
    city: 'New Delhi',
    state: 'Delhi',
    rating: 4.9,
    totalRatings: 180,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 15,
    vehicleCategories: ['CAR', 'BIKE'],
    address: 'Block C, Connaught Place',
    addressLine1: 'Block C, Connaught Place',
    pincode: '110001',
    latitude: 28.6315,
    longitude: 77.2167,
    phone: '+91 98110 98765',
    operatingHours: '09:00 AM - 09:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['OEM Fitment', 'Brakes & Hydraulics', 'Electrical Lighting', 'Used Part Fitting'],
    serviceAvailable: true,
    isActive: true,
  },
  {
    id: 'shop-4',
    name: 'Precision Auto Works & Tuners',
    slug: 'precision-auto-works',
    ownerId: 'shop-owner-4',
    ownerName: 'Kavita Reddy',
    email: 'precision.auto@partsphare.test',
    city: 'Bengaluru',
    state: 'Karnataka',
    rating: 4.9,
    totalRatings: 215,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 12,
    vehicleCategories: ['CAR', 'BIKE', 'SCOOTER'],
    address: '80 Feet Road, 4th Block, Koramangala',
    addressLine1: '80 Feet Road, 4th Block, Koramangala',
    pincode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '+91 98451 99887',
    operatingHours: '08:00 AM - 08:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Performance Brakes', 'Starter Motor Replacement', 'Battery Diagnostics', 'Doorstep Mechanic'],
    serviceAvailable: true,
    isActive: true,
  },
];

// ============================================================================
// 3. PRODUCTS CATALOG & SEEDS
// ============================================================================
export const initialProducts = [
  // 1. SPARK PLUGS (Car)
  {
    id: 'prod-bosch-spark',
    name: 'Bosch Super 4 Spark Plug FR78X (Set of 4)',
    slug: 'bosch-super-4-spark-plug-fr78x',
    description: 'Bosch Super 4 with 4 ground electrodes and a silver-plated center electrode for maximum ignition reliability and combustion efficiency. Improves fuel economy and smoother cold starting.',
    sku: 'BOSCH-SP-FR78X',
    partNumber: '0242232502',
    categoryId: 'cat-engine',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 850,
    mrp: 999,
    warranty: '1 Year Manufacturer Warranty',
    rating: 4.8,
    weight: 0.25,
    dimensions: '10x8x3 cm',
    tags: ['spark plug', 'ignition', 'bosch', 'engine', 'fuel economy'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 299,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-1-1', url: '/uploads/products/spark_plug.jpg', isPrimary: true, altText: 'Bosch Super 4 Spark Plug Set', sortOrder: 0 },
    ],
    specs: [
      { key: 'Electrode Material', value: 'Silver Plated Yttrium', unit: '' },
      { key: 'Thread Size', value: '14mm x 1.25', unit: 'mm' },
      { key: 'Hex Size', value: '16', unit: 'mm' },
      { key: 'Ground Electrodes', value: '4', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-creta-sx', 'var-city-v', 'var-baleno-delta'],
    inventories: [
      { id: 'inv-1-1', shopId: 'shop-1', shop: initialShops[0], quantity: 45, sellingPrice: 820, isAvailable: true },
      { id: 'inv-1-2', shopId: 'shop-2', shop: initialShops[1], quantity: 28, sellingPrice: 850, isAvailable: true },
      { id: 'inv-1-3', shopId: 'shop-3', shop: initialShops[2], quantity: 60, sellingPrice: 799, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-1', userId: 'user-1', user: { id: 'user-1', firstName: 'Vikram', lastName: 'Rao', avatar: null }, rating: 5, title: 'Noticeable pickup improvement', body: 'Fitted these on my Maruti Swift VXi. Cold starts are instant now.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },

  // 2. SPARK PLUGS (Bike)
  {
    id: 'prod-ngk-spark-bike',
    name: 'NGK Laser Iridium Spark Plug CR9EIX',
    slug: 'ngk-laser-iridium-spark-plug-cr9eix',
    description: 'Precision laser-welded iridium center electrode tip ensures high durability and consistently stable spark. Outstanding acceleration, high fuel efficiency, and anti-fouling performance.',
    sku: 'NGK-CR9EIX-IR',
    partNumber: '3521-CR9EIX',
    categoryId: 'cat-engine',
    brandId: 'brand-ngk',
    brand: 'NGK',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 680,
    mrp: 799,
    warranty: '1 Year Warranty',
    rating: 4.9,
    weight: 0.08,
    dimensions: '8x2x2 cm',
    tags: ['spark plug', 'ngk', 'iridium', 'motorcycle', 'pulsar', 'ktm'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 99,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-01-15'),
    images: [
      { id: 'img-ngk-1', url: '/uploads/products/spark_plug.jpg', isPrimary: true, altText: 'NGK Laser Iridium Spark Plug', sortOrder: 0 },
    ],
    specs: [
      { key: 'Center Electrode Tip', value: 'Laser Iridium 0.6mm', unit: 'mm' },
      { key: 'Thread Diameter', value: '10', unit: 'mm' },
      { key: 'Thread Pitch', value: '1.0', unit: 'mm' },
      { key: 'Heat Range', value: '9', unit: '' },
    ],
    compatibleVariantIds: ['var-pulsar-twin', 'var-classic-halcyon', 'var-apache-160-4v', 'var-duke200-standard', 'var-dominar-standard'],
    inventories: [
      { id: 'inv-ngk-1', shopId: 'shop-1', shop: initialShops[0], quantity: 35, sellingPrice: 650, isAvailable: true },
      { id: 'inv-ngk-2', shopId: 'shop-2', shop: initialShops[1], quantity: 20, sellingPrice: 680, isAvailable: true },
    ],
    reviews: [],
  },

  // 3. BRAKE PADS (Car - Brembo)
  {
    id: 'prod-brembo-brakes',
    name: 'Brembo Ceramic Front Brake Pad Set',
    slug: 'brembo-ceramic-front-brake-pad-set',
    description: 'Ultra-low dust ceramic friction formulation offering exceptional stopping distance, zero brake squeal, and extended rotor longevity. Pre-scorched for immediate bedding-in.',
    sku: 'BREMBO-BP-P83024',
    partNumber: 'P83024N',
    categoryId: 'cat-braking',
    brandId: 'brand-brembo',
    brand: 'Brembo',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 2850,
    mrp: 3400,
    warranty: '18 Months / 30,000 km Warranty',
    rating: 4.9,
    weight: 1.6,
    dimensions: '16x10x8 cm',
    tags: ['brake', 'pads', 'ceramic', 'brembo', 'front brake', 'low dust'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 399,
    estimatedInstallTimeMinutes: 45,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-2-1', url: '/uploads/products/brake_pads.jpg', isPrimary: true, altText: 'Brembo Ceramic Brake Pads Front Set', sortOrder: 0 },
    ],
    specs: [
      { key: 'Friction Material', value: 'Ceramic Low-Metallic NAO', unit: '' },
      { key: 'Position', value: 'Front Axle', unit: '' },
      { key: 'Wear Indicator', value: 'Acoustic Clip Included', unit: '' },
      { key: 'Thickness', value: '17.5', unit: 'mm' },
    ],
    compatibleVariantIds: ['var-creta-sx', 'var-creta-sx-o', 'var-seltos-htx', 'var-seltos-gtx', 'var-kushaq-style', 'var-taigun-gt-plus'],
    inventories: [
      { id: 'inv-2-1', shopId: 'shop-1', shop: initialShops[0], quantity: 15, sellingPrice: 2799, isAvailable: true },
      { id: 'inv-2-2', shopId: 'shop-2', shop: initialShops[1], quantity: 22, sellingPrice: 2850, isAvailable: true },
      { id: 'inv-2-3', shopId: 'shop-3', shop: initialShops[2], quantity: 10, sellingPrice: 2899, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-3', userId: 'user-3', user: { id: 'user-3', firstName: 'Karan', lastName: 'Singhania', avatar: null }, rating: 5, title: 'Incredible stopping power', body: 'Upgraded from factory pads on my Creta SX. The pedal bite is progressive and no brake dust on alloy wheels.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },

  // 4. BRAKE PADS (Car - Bosch Nexon/Tata)
  {
    id: 'prod-bosch-brake-nexon',
    name: 'Bosch Front Ceramic Brake Pad Set (Tata Nexon/Punch)',
    slug: 'bosch-front-ceramic-brake-pad-set-nexon',
    description: 'High-performance ceramic brake pads engineered specifically for Tata Nexon & Punch. Provides instant bite, silent braking, and minimum rotor wear in city driving.',
    sku: 'BOSCH-BP-TN-204',
    partNumber: 'BP-TN-204',
    categoryId: 'cat-braking',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 2100,
    mrp: 2499,
    warranty: '12 Months / 20,000 km Warranty',
    rating: 4.8,
    weight: 1.2,
    dimensions: '15x10x5 cm',
    tags: ['brake pad', 'bosch', 'tata nexon', 'brakes', 'ceramic'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 399,
    estimatedInstallTimeMinutes: 45,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-b-1', url: '/uploads/products/brake_pads.jpg', isPrimary: true, altText: 'Bosch Front Brake Pads Tata Nexon', sortOrder: 0 },
    ],
    specs: [
      { key: 'Material', value: 'Advanced Semi-Metallic Ceramic', unit: '' },
      { key: 'Axle', value: 'Front', unit: '' },
      { key: 'Shims', value: 'Multi-layer Noise Dampening', unit: '' },
    ],
    compatibleVariantIds: ['var-nexon-creative', 'var-punch-accomplished', 'var-altroz-xz'],
    inventories: [
      { id: 'inv-b-1', shopId: 'shop-1', shop: initialShops[0], quantity: 24, sellingPrice: 2050, isAvailable: true },
      { id: 'inv-b-2', shopId: 'shop-2', shop: initialShops[1], quantity: 18, sellingPrice: 2100, isAvailable: true },
    ],
    reviews: [],
  },

  // 5. BRAKE DISCS
  {
    id: 'prod-brembo-disc-front',
    name: 'Brembo High Carbon Vented Front Brake Rotor Disc (Pair)',
    slug: 'brembo-high-carbon-vented-front-brake-rotor-disc',
    description: 'Pillar vented high carbon cast iron front brake rotor disc pair. Anti-corrosion UV coating ensures long lasting aesthetic appearance and thermal crack resistance under heavy braking.',
    sku: 'BREMBO-BD-099772',
    partNumber: '09.9772.11',
    categoryId: 'cat-braking',
    brandId: 'brand-brembo',
    brand: 'Brembo',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 3850,
    mrp: 4600,
    warranty: '2 Years / 40,000 km Warranty',
    rating: 4.9,
    weight: 9.8,
    dimensions: '28x28x12 cm',
    tags: ['brake disc', 'rotor', 'brembo', 'vented', 'front brake'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 499,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-01-18'),
    images: [
      { id: 'img-disc-1', url: '/uploads/products/brake_disc.jpg', isPrimary: true, altText: 'Brembo Vented Front Brake Discs', sortOrder: 0 },
    ],
    specs: [
      { key: 'Disc Type', value: 'Internally Vented', unit: '' },
      { key: 'Outer Diameter', value: '256', unit: 'mm' },
      { key: 'Nominal Thickness', value: '22', unit: 'mm' },
      { key: 'Centering Diameter', value: '60', unit: 'mm' },
      { key: 'Number of Holes', value: '4', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-brezza-vxi'],
    inventories: [
      { id: 'inv-bd-1', shopId: 'shop-1', shop: initialShops[0], quantity: 12, sellingPrice: 3750, isAvailable: true },
      { id: 'inv-bd-2', shopId: 'shop-2', shop: initialShops[1], quantity: 8, sellingPrice: 3850, isAvailable: true },
      { id: 'inv-bd-3', shopId: 'shop-3', shop: initialShops[2], quantity: 15, sellingPrice: 3699, isAvailable: true },
    ],
    reviews: [],
  },

  // 6. AIR FILTERS (Car)
  {
    id: 'prod-mann-air-filter',
    name: 'Mann-Filter C 25 004 High Airflow Engine Air Filter',
    slug: 'mann-filter-c-25-004-engine-air-filter',
    description: 'Original equipment quality air filter with specially embossed paper pleats for superior dust holding capacity and optimal air-to-fuel ratio delivery to engine cylinders.',
    sku: 'MANN-AF-C25004',
    partNumber: 'C25004-IN',
    categoryId: 'cat-filters',
    brandId: 'brand-mann',
    brand: 'Mann-Filter',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 420,
    mrp: 525,
    warranty: '6 Months Warranty',
    rating: 4.7,
    weight: 0.32,
    dimensions: '24x14x5 cm',
    tags: ['air filter', 'mann filter', 'engine filter', 'intake', 'fuel economy'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 99,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-01-20'),
    images: [
      { id: 'img-af-1', url: '/uploads/products/car_air_filter.svg', isPrimary: true, altText: 'Mann-Filter Engine Air Filter', sortOrder: 0 },
    ],
    specs: [
      { key: 'Filter Media', value: 'Micro-grade Cellulose Fiber', unit: '' },
      { key: 'Length', value: '238', unit: 'mm' },
      { key: 'Width', value: '136', unit: 'mm' },
      { key: 'Height', value: '48', unit: 'mm' },
      { key: 'Seal Type', value: 'Molded Polyurethane Elastomer', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-ertiga-vxi', 'var-brezza-vxi'],
    inventories: [
      { id: 'inv-af-1', shopId: 'shop-1', shop: initialShops[0], quantity: 50, sellingPrice: 399, isAvailable: true },
      { id: 'inv-af-2', shopId: 'shop-2', shop: initialShops[1], quantity: 35, sellingPrice: 420, isAvailable: true },
    ],
    reviews: [],
  },

  // 7. OIL FILTERS
  {
    id: 'prod-unominda-filter',
    name: 'Uno Minda High Efficiency Spin-On Oil Filter',
    slug: 'uno-minda-high-efficiency-oil-filter',
    description: 'High-efficiency spin-on engine oil filter with synthetic blend media that captures 99% of particulate contaminants. Built-in silicone anti-drainback valve prevents dry cold starts.',
    sku: 'MINDA-OF-8812',
    partNumber: 'OF-8812',
    categoryId: 'cat-filters',
    brandId: 'brand-unominda',
    brand: 'Uno Minda',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 240,
    mrp: 310,
    warranty: '6 Months Warranty',
    rating: 4.6,
    weight: 0.28,
    dimensions: '8x8x9 cm',
    tags: ['oil filter', 'uno minda', 'filters', 'maintenance', 'engine protection'],
    requiresDIFM: true,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-6-1', url: '/uploads/products/oil_filter.svg', isPrimary: true, altText: 'Uno Minda Spin-On Oil Filter', sortOrder: 0 },
    ],
    specs: [
      { key: 'Filter Type', value: 'Spin-on Canister', unit: '' },
      { key: 'Thread Size', value: '3/4-16 UNF', unit: '' },
      { key: 'Outer Diameter', value: '68', unit: 'mm' },
      { key: 'Relief Valve Bypass', value: '1.0', unit: 'Bar' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-creta-sx', 'var-nexon-creative', 'var-city-v', 'var-seltos-htx', 'var-baleno-delta'],
    inventories: [
      { id: 'inv-6-1', shopId: 'shop-1', shop: initialShops[0], quantity: 60, sellingPrice: 225, isAvailable: true },
      { id: 'inv-6-2', shopId: 'shop-2', shop: initialShops[1], quantity: 40, sellingPrice: 240, isAvailable: true },
    ],
    reviews: [],
  },

  // 8. FUEL FILTERS
  {
    id: 'prod-bosch-fuel-filter',
    name: 'Bosch High Efficiency In-Line Fuel Filter Assembly',
    slug: 'bosch-high-efficiency-fuel-filter-assembly',
    description: 'High-pressure in-line fuel filter with multilayer micropore filtering media. Protects common-rail fuel injectors against microscopic dirt, rust particles, and moisture separation.',
    sku: 'BOSCH-FF-0450905',
    partNumber: '0450905901',
    categoryId: 'cat-filters',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 550,
    mrp: 680,
    warranty: '12 Months Warranty',
    rating: 4.8,
    weight: 0.35,
    dimensions: '16x8x8 cm',
    tags: ['fuel filter', 'bosch', 'diesel filter', 'injectors', 'fuel line'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 299,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-01-22'),
    images: [
      { id: 'img-ff-1', url: '/uploads/products/fuel_filter.svg', isPrimary: true, altText: 'Bosch In-Line Fuel Filter', sortOrder: 0 },
    ],
    specs: [
      { key: 'Housing Material', value: 'Corrosion-Resistant Aluminum', unit: '' },
      { key: 'Inlet/Outlet Spigot', value: '8', unit: 'mm' },
      { key: 'Max Working Pressure', value: '6.5', unit: 'Bar' },
      { key: 'Filtration Rating', value: '3 to 5', unit: 'Micron' },
    ],
    compatibleVariantIds: ['var-creta-sx', 'var-nexon-creative', 'var-harrier-xz', 'var-scorpio-n-z8', 'var-thar-4x4'],
    inventories: [
      { id: 'inv-ff-1', shopId: 'shop-1', shop: initialShops[0], quantity: 30, sellingPrice: 520, isAvailable: true },
      { id: 'inv-ff-2', shopId: 'shop-2', shop: initialShops[1], quantity: 25, sellingPrice: 550, isAvailable: true },
    ],
    reviews: [],
  },

  // 9. BATTERIES (Car)
  {
    id: 'prod-exide-battery',
    name: 'Exide Epiq 12V 45Ah Maintenance-Free Car Battery',
    slug: 'exide-epiq-12v-45ah-car-battery',
    description: 'Heavy-duty automotive battery engineered with Special Tetramesh grid technology for extreme heat tolerance and zero water loss. Comes pre-activated and factory sealed.',
    sku: 'EXIDE-EPIQ-45L',
    partNumber: 'EPIQ45L-BH',
    categoryId: 'cat-batteries',
    brandId: 'brand-exide',
    brand: 'Exide',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 5200,
    mrp: 5999,
    warranty: '72 Months (36 Free + 36 Pro-rata)',
    rating: 4.8,
    weight: 12.5,
    dimensions: '23x13x22 cm',
    tags: ['battery', 'exide', 'car battery', '12v', 'epiq', 'maintenance free'],
    requiresDIFM: true,
    installationDifficulty: 'EASY',
    baseServiceFee: 199,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-4-1', url: '/uploads/products/car_battery.svg', isPrimary: true, altText: 'Exide Epiq 12V 45Ah Car Battery', sortOrder: 0 },
    ],
    specs: [
      { key: 'Nominal Voltage', value: '12', unit: 'V' },
      { key: 'Rated Capacity', value: '45', unit: 'Ah' },
      { key: 'Cold Cranking Amps (CCA)', value: '380', unit: 'A' },
      { key: 'Terminal Layout', value: 'Left (-), Right (+)', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-creta-sx', 'var-city-v', 'var-nexon-creative'],
    inventories: [
      { id: 'inv-4-1', shopId: 'shop-1', shop: initialShops[0], quantity: 8, sellingPrice: 5100, isAvailable: true },
      { id: 'inv-4-2', shopId: 'shop-2', shop: initialShops[1], quantity: 12, sellingPrice: 5200, isAvailable: true },
      { id: 'inv-4-3', shopId: 'shop-3', shop: initialShops[2], quantity: 14, sellingPrice: 4999, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-4', userId: 'user-4', user: { id: 'user-4', firstName: 'Deepak', lastName: 'Nair', avatar: null }, rating: 5, title: 'Reliable cold crank', body: 'Replaced original OEM battery on my Swift. Crank is instantaneous even after vehicle parked 2 weeks.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },

  // 10. BATTERIES (Bike/Scooter)
  {
    id: 'prod-amaron-battery-oos',
    name: 'Amaron Pro Rider BTZ4 12V 4Ah Motorcycle Battery',
    slug: 'amaron-pro-rider-btz4-motorcycle-battery',
    description: 'VRLA maintenance-free motorcycle battery with patented Silven-X alloy grids. Extreme vibration resistance and zero spillage design ideal for Indian commuting.',
    sku: 'AMARON-PR-BTZ4',
    partNumber: 'AAM-PR-0BTZ4',
    categoryId: 'cat-batteries',
    brandId: 'brand-amaron',
    brand: 'Amaron',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1150,
    mrp: 1350,
    warranty: '24 Months Replacement Warranty',
    rating: 4.7,
    weight: 1.5,
    dimensions: '11x7x9 cm',
    tags: ['battery', 'amaron', 'motorcycle', 'scooter', 'activa', 'splendor'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 99,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-9-1', url: '/uploads/products/bike_battery.svg', isPrimary: true, altText: 'Amaron Pro Rider Battery', sortOrder: 0 },
    ],
    specs: [
      { key: 'Voltage', value: '12', unit: 'V' },
      { key: 'Capacity', value: '4', unit: 'Ah' },
      { key: 'Battery Type', value: 'VRLA Factory Activated', unit: '' },
    ],
    compatibleVariantIds: ['var-splendor-drum', 'var-activa-std', 'var-pulsar-twin', 'var-jupiter-zx', 'var-shine-standard'],
    inventories: [
      { id: 'inv-9-1', shopId: 'shop-1', shop: initialShops[0], quantity: 25, sellingPrice: 1100, isAvailable: true },
      { id: 'inv-9-2', shopId: 'shop-2', shop: initialShops[1], quantity: 18, sellingPrice: 1150, isAvailable: true },
    ],
    reviews: [],
  },

  // 11. HEADLIGHTS
  {
    id: 'prod-lumax-headlight',
    name: 'Lumax H4 All-Weather Xenon White Headlight Bulb (Set of 2)',
    slug: 'lumax-h4-all-weather-headlight-bulb-set',
    description: 'High-performance H4 12V 60/55W quartz glass halogen headlight bulbs emitting a 4300K all-weather crisp beam. Delivers up to 60% more road visibility in dense rain and fog.',
    sku: 'LUMAX-H4-6055W',
    partNumber: 'H4-6055W',
    categoryId: 'cat-electrical',
    brandId: 'brand-lumax',
    brand: 'Lumax',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 499,
    mrp: 699,
    warranty: '1 Year Replacement Warranty',
    rating: 4.6,
    weight: 0.15,
    dimensions: '10x10x6 cm',
    tags: ['headlight', 'bulb', 'lumax', 'h4', 'lighting', 'halogen'],
    requiresDIFM: true,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-5-1', url: '/uploads/products/car_headlight.svg', isPrimary: true, altText: 'Lumax H4 Headlight Bulbs', sortOrder: 0 },
    ],
    specs: [
      { key: 'Bulb Base Type', value: 'P43t (H4 Dual Filament)', unit: '' },
      { key: 'Rated Power', value: '60/55', unit: 'W' },
      { key: 'Operating Voltage', value: '12', unit: 'V' },
      { key: 'Color Temperature', value: '4300K', unit: 'K' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-nexon-creative', 'var-brezza-vxi', 'var-activa-std', 'var-splendor-drum'],
    inventories: [
      { id: 'inv-5-1', shopId: 'shop-1', shop: initialShops[0], quantity: 30, sellingPrice: 475, isAvailable: true },
      { id: 'inv-5-2', shopId: 'shop-2', shop: initialShops[1], quantity: 25, sellingPrice: 499, isAvailable: true },
    ],
    reviews: [],
  },

  // 12. TAIL LAMPS
  {
    id: 'prod-lumax-tail-lamp',
    name: 'Lumax Rear LED Combination Tail Lamp Assembly (Right)',
    slug: 'lumax-rear-led-tail-lamp-assembly-right',
    description: 'OEM grade complete right-hand rear combination lamp cluster with high-intensity stop light, running LEDs, reversing light, and integrated reflector housing. UV-treated acrylic lens prevents yellowing.',
    sku: 'LUMAX-TL-SW-22R',
    partNumber: '052-RTL-SWF',
    categoryId: 'cat-electrical',
    brandId: 'brand-lumax',
    brand: 'Lumax',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1850,
    mrp: 2350,
    warranty: '1 Year Warranty',
    rating: 4.8,
    weight: 1.4,
    dimensions: '32x22x18 cm',
    tags: ['tail lamp', 'rear light', 'lumax', 'led', 'brake lamp', 'turn signal'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 249,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-01-25'),
    images: [
      { id: 'img-tl-1', url: '/uploads/products/car_taillamp.svg', isPrimary: true, altText: 'Lumax Rear LED Tail Lamp Assembly', sortOrder: 0 },
    ],
    specs: [
      { key: 'Fitment Position', value: 'Rear Right (Driver Side)', unit: '' },
      { key: 'Lens Material', value: 'Optical Grade PMMA', unit: '' },
      { key: 'Housing Material', value: 'High Impact ABS', unit: '' },
      { key: 'Certification', value: 'AIS-012 / ECE Compliant', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-swift-zxi-plus'],
    inventories: [
      { id: 'inv-tl-1', shopId: 'shop-1', shop: initialShops[0], quantity: 14, sellingPrice: 1799, isAvailable: true },
      { id: 'inv-tl-2', shopId: 'shop-2', shop: initialShops[1], quantity: 9, sellingPrice: 1850, isAvailable: true },
    ],
    reviews: [],
  },

  // 13. WIPER BLADES
  {
    id: 'prod-bosch-aerotwin-wipers',
    name: 'Bosch Aerotwin Frameless Wiper Blade Set (24" + 16")',
    slug: 'bosch-aerotwin-frameless-wiper-blade-set',
    description: 'Custom customized aerodynamic curved beam frameless wiper blades. Evodium steel spring strip applies uniform pressure along the entire windshield blade length for streak-free wiping even at highway speeds.',
    sku: 'BOSCH-WB-A925S',
    partNumber: '3397118925',
    categoryId: 'cat-body-wipers',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 950,
    mrp: 1250,
    warranty: '6 Months Warranty',
    rating: 4.8,
    weight: 0.45,
    dimensions: '65x8x4 cm',
    tags: ['wiper', 'aerotwin', 'bosch', 'windshield', 'monsoon', 'frameless'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 99,
    estimatedInstallTimeMinutes: 10,
    createdAt: new Date('2024-01-28'),
    images: [
      { id: 'img-wb-1', url: '/uploads/products/wiper_blades.svg', isPrimary: true, altText: 'Bosch Aerotwin Frameless Wiper Blade Set', sortOrder: 0 },
    ],
    specs: [
      { key: 'Driver Side Length', value: '24 (600mm)', unit: 'Inch' },
      { key: 'Passenger Side Length', value: '16 (400mm)', unit: 'Inch' },
      { key: 'Rubber Coating', value: 'Power Protection Plus Graphite', unit: '' },
      { key: 'Adapter Type', value: 'Universal U-Hook (9x3 & 9x4)', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-creta-sx', 'var-nexon-creative', 'var-city-v', 'var-seltos-htx'],
    inventories: [
      { id: 'inv-wb-1', shopId: 'shop-1', shop: initialShops[0], quantity: 40, sellingPrice: 899, isAvailable: true },
      { id: 'inv-wb-2', shopId: 'shop-2', shop: initialShops[1], quantity: 28, sellingPrice: 950, isAvailable: true },
    ],
    reviews: [],
  },

  // 14. CLUTCH PLATES
  {
    id: 'prod-valeo-clutch-kit',
    name: 'Valeo Clutch Plate & Pressure Cover Assembly Kit',
    slug: 'valeo-clutch-plate-pressure-cover-kit',
    description: 'Heavy duty replacement clutch kit featuring organic low-wear friction linings, precision coil damper springs, and diaphragm spring pressure plate for progressive engagement and light pedal effort.',
    sku: 'VALEO-CK-826842',
    partNumber: '826842-IN',
    categoryId: 'cat-transmission',
    brandId: 'brand-valeo',
    brand: 'Valeo',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 3450,
    mrp: 4200,
    warranty: '12 Months / 20,000 km Warranty',
    rating: 4.8,
    weight: 5.8,
    dimensions: '26x26x8 cm',
    tags: ['clutch', 'valeo', 'pressure plate', 'transmission', 'gearbox'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 999,
    estimatedInstallTimeMinutes: 120,
    createdAt: new Date('2024-01-30'),
    images: [
      { id: 'img-ck-1', url: '/uploads/products/clutch_plate.svg', isPrimary: true, altText: 'Valeo Clutch Plate & Pressure Plate Kit', sortOrder: 0 },
    ],
    specs: [
      { key: 'Diameter', value: '190', unit: 'mm' },
      { key: 'Spline Hub Teeth', value: '18', unit: '' },
      { key: 'Damper Springs', value: '4 Heavy Duty Torsion Springs', unit: '' },
      { key: 'Lining Material', value: 'Non-Asbestos Organic Compound', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-ertiga-vxi'],
    inventories: [
      { id: 'inv-ck-1', shopId: 'shop-1', shop: initialShops[0], quantity: 15, sellingPrice: 3350, isAvailable: true },
      { id: 'inv-ck-2', shopId: 'shop-2', shop: initialShops[1], quantity: 10, sellingPrice: 3450, isAvailable: true },
    ],
    reviews: [],
  },

  // 15. SHOCK ABSORBERS
  {
    id: 'prod-gabriel-shock-absorber',
    name: 'Gabriel Ultra Gas Strut Shock Absorber (Front)',
    slug: 'gabriel-ultra-gas-strut-shock-absorber-front',
    description: 'Precision engineered nitrogen gas charged suspension shock absorber strut with G-Force technology. Stabilizes vehicle body roll over potholes and delivers supreme ride comfort.',
    sku: 'GABRIEL-SA-G51892',
    partNumber: 'G51892-FL',
    categoryId: 'cat-suspension',
    brandId: 'brand-gabriel',
    brand: 'Gabriel',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1980,
    mrp: 2450,
    warranty: '2 Years / 30,000 km Warranty',
    rating: 4.7,
    weight: 3.9,
    dimensions: '52x14x14 cm',
    tags: ['shock absorber', 'gabriel', 'suspension', 'strut', 'gas filled', 'front suspension'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 499,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-02-01'),
    images: [
      { id: 'img-sa-1', url: '/uploads/products/shock_absorber.svg', isPrimary: true, altText: 'Gabriel Ultra Gas Strut Shock Absorber', sortOrder: 0 },
    ],
    specs: [
      { key: 'Shock Absorber Type', value: 'Gas Pressurized Twin-Tube', unit: '' },
      { key: 'Fitting Position', value: 'Front Axle (Left or Right)', unit: '' },
      { key: 'Piston Rod Finish', value: 'Super Finished Hard Chrome Plating', unit: '' },
      { key: 'Seal Type', value: 'Multi-Lip Viton Seal', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-brezza-vxi'],
    inventories: [
      { id: 'inv-sa-1', shopId: 'shop-1', shop: initialShops[0], quantity: 18, sellingPrice: 1920, isAvailable: true },
      { id: 'inv-sa-2', shopId: 'shop-2', shop: initialShops[1], quantity: 12, sellingPrice: 1980, isAvailable: true },
    ],
    reviews: [],
  },

  // 16. WHEEL BEARINGS
  {
    id: 'prod-skf-wheel-bearing',
    name: 'SKF Double Row Angular Contact Front Wheel Hub Bearing',
    slug: 'skf-double-row-angular-contact-wheel-bearing',
    description: 'Precision machined double-row angular contact ball bearing engineered to withstand heavy radial and axial cornering loads. Factory pre-greased with high-temperature lubricant and low-friction seals.',
    sku: 'SKF-WB-VKBA6589',
    partNumber: 'VKBA6589',
    categoryId: 'cat-suspension',
    brandId: 'brand-skf',
    brand: 'SKF',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1250,
    mrp: 1550,
    warranty: '1 Year / 20,000 km Warranty',
    rating: 4.9,
    weight: 0.85,
    dimensions: '10x10x6 cm',
    tags: ['wheel bearing', 'skf', 'hub bearing', 'front axle', 'hub', 'suspension'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 499,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-02-03'),
    images: [
      { id: 'img-wb-1', url: '/uploads/products/wheel_bearing.svg', isPrimary: true, altText: 'SKF Front Wheel Hub Bearing', sortOrder: 0 },
    ],
    specs: [
      { key: 'Inner Diameter (Bore)', value: '40', unit: 'mm' },
      { key: 'Outer Diameter', value: '74', unit: 'mm' },
      { key: 'Width', value: '40', unit: 'mm' },
      { key: 'Bearing Type', value: 'Double Row Angular Contact', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-creta-sx', 'var-nexon-creative', 'var-seltos-htx'],
    inventories: [
      { id: 'inv-skf-1', shopId: 'shop-1', shop: initialShops[0], quantity: 22, sellingPrice: 1199, isAvailable: true },
      { id: 'inv-skf-2', shopId: 'shop-2', shop: initialShops[1], quantity: 15, sellingPrice: 1250, isAvailable: true },
    ],
    reviews: [],
  },

  // 17. STARTER MOTORS
  {
    id: 'prod-refurb-starter',
    name: 'Bosch Certified Refurbished Starter Motor Assembly (12V 1.2kW)',
    slug: 'bosch-refurbished-starter-motor-assembly',
    description: 'Factory refurbished starter motor assembly rebuilt with new copper armature windings, high-torque solenoid switch, and precision bendix pinion. Thoroughly dynamic bench-tested for instant cranking.',
    sku: 'RF-SM-3310',
    partNumber: '0001108422',
    categoryId: 'cat-electrical',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'REFURBISHED',
    status: 'ACTIVE',
    basePrice: 2850,
    mrp: 5500,
    warranty: '6 Months PartNexa Certified Warranty',
    rating: 4.6,
    weight: 3.4,
    dimensions: '22x14x12 cm',
    tags: ['starter motor', 'bosch', 'refurbished', 'cranking', 'electrical', 'engine start'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 499,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-7-1', url: '/uploads/products/starter_motor.svg', isPrimary: true, altText: 'Refurbished Starter Motor', sortOrder: 0 },
    ],
    specs: [
      { key: 'Rated Output', value: '1.2', unit: 'kW' },
      { key: 'Voltage', value: '12', unit: 'V' },
      { key: 'Pinion Teeth Count', value: '9', unit: '' },
      { key: 'Rotation Direction', value: 'Clockwise (CW)', unit: '' },
    ],
    compatibleVariantIds: ['var-creta-sx', 'var-creta-sx-o', 'var-verna-s', 'var-i20-magna'],
    inventories: [
      { id: 'inv-7-1', shopId: 'shop-1', shop: initialShops[0], quantity: 6, sellingPrice: 2750, isAvailable: true },
      { id: 'inv-7-2', shopId: 'shop-2', shop: initialShops[1], quantity: 4, sellingPrice: 2850, isAvailable: true },
    ],
    reviews: [],
  },

  // 18. ALTERNATORS
  {
    id: 'prod-denso-alternator',
    name: 'Denso 12V 90A High Output Alternator Assembly',
    slug: 'denso-12v-90a-high-output-alternator-assembly',
    description: 'High-efficiency 90 Ampere automotive alternator. Delivers stable electrical current across idle and high RPMs to power cabin air conditioning, infotainment, and rapid battery charging.',
    sku: 'DENSO-ALT-104210',
    partNumber: '104210-3560',
    categoryId: 'cat-electrical',
    brandId: 'brand-denso',
    brand: 'Denso',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 6850,
    mrp: 8200,
    warranty: '18 Months Warranty',
    rating: 4.9,
    weight: 5.2,
    dimensions: '22x18x16 cm',
    tags: ['alternator', 'denso', 'charging', '12v', 'electrical', 'generator'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 599,
    estimatedInstallTimeMinutes: 75,
    createdAt: new Date('2024-02-05'),
    images: [
      { id: 'img-alt-1', url: '/uploads/products/car_alternator.svg', isPrimary: true, altText: 'Denso 12V 90A Alternator Assembly', sortOrder: 0 },
    ],
    specs: [
      { key: 'Rated Current Output', value: '90', unit: 'A' },
      { key: 'Voltage', value: '14.4', unit: 'V' },
      { key: 'Pulley Ribs', value: '5-Rib Serpentine Pulley', unit: '' },
      { key: 'Regulator Type', value: 'Integrated Solid-State IC', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-ertiga-vxi'],
    inventories: [
      { id: 'inv-alt-1', shopId: 'shop-1', shop: initialShops[0], quantity: 8, sellingPrice: 6650, isAvailable: true },
      { id: 'inv-alt-2', shopId: 'shop-2', shop: initialShops[1], quantity: 5, sellingPrice: 6850, isAvailable: true },
    ],
    reviews: [],
  },

  // 19. SENSORS (Oxygen / Lambda Sensor)
  {
    id: 'prod-bosch-oxygen-sensor',
    name: 'Bosch 4-Wire Planar Heated Exhaust Oxygen (O2) Sensor',
    slug: 'bosch-4-wire-planar-heated-oxygen-sensor',
    description: 'Pre-catalytic exhaust lambda oxygen sensor with patented planar ceramic technology. Rapid 10-second heating phase allows instant closed-loop air/fuel ratio management to minimize exhaust emissions and maximize mileage.',
    sku: 'BOSCH-O2-0258006',
    partNumber: '0258006028',
    categoryId: 'cat-engine',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1950,
    mrp: 2450,
    warranty: '1 Year / 20,000 km Warranty',
    rating: 4.8,
    weight: 0.22,
    dimensions: '18x6x5 cm',
    tags: ['sensor', 'oxygen sensor', 'lambda', 'bosch', 'engine check', 'fuel ratio'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 299,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-02-08'),
    images: [
      { id: 'img-o2-1', url: '/uploads/products/oxygen_sensor.svg', isPrimary: true, altText: 'Bosch 4-Wire Heated Oxygen Sensor', sortOrder: 0 },
    ],
    specs: [
      { key: 'Sensor Technology', value: 'Heated Planar Zirconia Element', unit: '' },
      { key: 'Number of Wires', value: '4 Wires (Heater + Signal)', unit: '' },
      { key: 'Thread Size', value: 'M18 x 1.5', unit: 'mm' },
      { key: 'Connector Type', value: 'Direct OE Sealed Terminal Plug', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-creta-sx', 'var-nexon-creative', 'var-city-v'],
    inventories: [
      { id: 'inv-o2-1', shopId: 'shop-1', shop: initialShops[0], quantity: 18, sellingPrice: 1899, isAvailable: true },
      { id: 'inv-o2-2', shopId: 'shop-2', shop: initialShops[1], quantity: 12, sellingPrice: 1950, isAvailable: true },
    ],
    reviews: [],
  },

  // 20. BELTS
  {
    id: 'prod-continental-drive-belt',
    name: 'Continental Multi-Rib Poly-V Serpentine Drive Belt (5PK1150)',
    slug: 'continental-multi-rib-poly-v-drive-belt-5pk1150',
    description: 'Ultra quiet synthetic EPDM rubber multi-rib accessory serpentine belt. Fiber-reinforced ribs eliminate squealing, slippage, and high thermal degradation under extreme engine bay temperatures.',
    sku: 'CONTI-BELT-5PK1150',
    partNumber: '5PK1150',
    categoryId: 'cat-engine',
    brandId: 'brand-conti',
    brand: 'Continental',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 520,
    mrp: 680,
    warranty: '1 Year / 30,000 km Warranty',
    rating: 4.8,
    weight: 0.18,
    dimensions: '28x10x3 cm',
    tags: ['drive belt', 'serpentine', 'continental', 'alternator belt', 'ac belt'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 249,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-02-10'),
    images: [
      { id: 'img-db-1', url: '/uploads/products/drive_belt.svg', isPrimary: true, altText: 'Continental Multi-Rib Poly-V Drive Belt', sortOrder: 0 },
    ],
    specs: [
      { key: 'Profile / Ribs', value: '5 Ribs (PK Profile)', unit: '' },
      { key: 'Effective Length', value: '1150', unit: 'mm' },
      { key: 'Material', value: 'EPDM Rubber with Polyester Tensile Cords', unit: '' },
      { key: 'Temperature Range', value: '-40C to +140C', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-creta-sx', 'var-i20-magna'],
    inventories: [
      { id: 'inv-db-1', shopId: 'shop-1', shop: initialShops[0], quantity: 30, sellingPrice: 495, isAvailable: true },
      { id: 'inv-db-2', shopId: 'shop-2', shop: initialShops[1], quantity: 22, sellingPrice: 520, isAvailable: true },
    ],
    reviews: [],
  },

  // 21. RADIATORS
  {
    id: 'prod-behr-car-radiator',
    name: 'Behr Aluminum Core Engine Cooling Radiator Assembly',
    slug: 'behr-aluminum-core-engine-cooling-radiator-assembly',
    description: 'High-performance cross-flow aluminum radiator core with high-tensile glass-fiber reinforced plastic end tanks. Maximizes heat dissipation efficiency and keeps cylinder head temperatures safe in peak summer traffic.',
    sku: 'BEHR-RAD-CR8921',
    partNumber: 'CR-8921-000S',
    categoryId: 'cat-cooling',
    brandId: 'brand-behr',
    brand: 'Behr',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 3450,
    mrp: 4300,
    warranty: '2 Years Warranty',
    rating: 4.8,
    weight: 4.2,
    dimensions: '56x42x12 cm',
    tags: ['radiator', 'behr', 'cooling', 'engine cooling', 'aluminum radiator'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 699,
    estimatedInstallTimeMinutes: 90,
    createdAt: new Date('2024-02-12'),
    images: [
      { id: 'img-rad-1', url: '/uploads/products/car_radiator.svg', isPrimary: true, altText: 'Behr Aluminum Core Engine Radiator', sortOrder: 0 },
    ],
    specs: [
      { key: 'Core Construction', value: 'Brazed Aluminum Tubes & Fins', unit: '' },
      { key: 'Core Length', value: '480', unit: 'mm' },
      { key: 'Core Width', value: '375', unit: 'mm' },
      { key: 'Core Depth', value: '16', unit: 'mm' },
      { key: 'Inlet/Outlet Diameter', value: '32', unit: 'mm' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-ertiga-vxi'],
    inventories: [
      { id: 'inv-rad-1', shopId: 'shop-1', shop: initialShops[0], quantity: 10, sellingPrice: 3350, isAvailable: true },
      { id: 'inv-rad-2', shopId: 'shop-2', shop: initialShops[1], quantity: 6, sellingPrice: 3450, isAvailable: true },
    ],
    reviews: [],
  },

  // 22. COOLANT COMPONENTS
  {
    id: 'prod-castrol-radicool',
    name: 'Castrol Radicool Long-Life OAT Anti-Freeze Engine Coolant (1L Premix)',
    slug: 'castrol-radicool-long-life-coolant-1l',
    description: 'Pre-diluted 50:50 Organic Acid Technology (OAT) long-life engine coolant. Provides year-round corrosion protection for all engine metals including aluminum, copper, and cast iron alloys down to -37C.',
    sku: 'CASTROL-COOL-RAD1L',
    partNumber: '3418721',
    categoryId: 'cat-cooling',
    brandId: 'brand-castrol',
    brand: 'Castrol',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 295,
    mrp: 375,
    warranty: '5 Years / 250,000 km Service Life',
    rating: 4.9,
    weight: 1.1,
    dimensions: '22x10x6 cm',
    tags: ['coolant', 'castrol', 'antifreeze', 'oat', 'radiator fluid', 'engine cooling'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-02-14'),
    images: [
      { id: 'img-cl-1', url: '/uploads/products/coolant_bottle.svg', isPrimary: true, altText: 'Castrol Radicool Premix Coolant Bottle', sortOrder: 0 },
    ],
    specs: [
      { key: 'Coolant Technology', value: 'Organic Acid Technology (OAT)', unit: '' },
      { key: 'Color', value: 'Fluorescent Red/Pink', unit: '' },
      { key: 'Boiling Point', value: '+129C (with 15 psi cap)', unit: '' },
      { key: 'Freezing Point', value: '-37C', unit: '' },
      { key: 'Formulation', value: '50:50 Pre-diluted Ready-to-Use', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-creta-sx', 'var-nexon-creative', 'var-city-v', 'var-seltos-htx', 'var-pulsar-twin', 'var-duke200-standard'],
    inventories: [
      { id: 'inv-cl-1', shopId: 'shop-1', shop: initialShops[0], quantity: 45, sellingPrice: 280, isAvailable: true },
      { id: 'inv-cl-2', shopId: 'shop-2', shop: initialShops[1], quantity: 30, sellingPrice: 295, isAvailable: true },
    ],
    reviews: [],
  },

  // 23. ENGINE OIL (Bike)
  {
    id: 'prod-motul-oil',
    name: 'Motul 7100 4T 10W-40 Fully Synthetic Motor Oil (1L)',
    slug: 'motul-7100-4t-10w40-synthetic-1l',
    description: '100% Synthetic 4-Stroke motorcycle engine lubricant with Ester Technology. Meets JASO MA2 specifications for optimum wet clutch performance and smooth gear transitions.',
    sku: 'MOTUL-7100-10W40-1L',
    partNumber: '104099',
    categoryId: 'cat-oils',
    brandId: 'brand-motul',
    brand: 'Motul',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 799,
    mrp: 925,
    warranty: 'Quality Seal Guarantee',
    rating: 4.9,
    weight: 0.95,
    dimensions: '22x11x7 cm',
    tags: ['engine oil', 'motul', 'synthetic', 'bike oil', '10w40', 'ester technology'],
    requiresDIFM: true,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-3-1', url: '/uploads/products/engine_oil_bottle.svg', isPrimary: true, altText: 'Motul 7100 4T 10W-40 Motor Oil Can', sortOrder: 0 },
    ],
    specs: [
      { key: 'Viscosity Grade', value: '10W-40', unit: '' },
      { key: 'Standard', value: 'API SN / JASO MA2', unit: '' },
      { key: 'Base Oil', value: '100% Synthetic with Ester', unit: '' },
      { key: 'Application', value: '4-Stroke Motorcycle Engines', unit: '' },
    ],
    compatibleVariantIds: ['var-pulsar-twin', 'var-classic-halcyon', 'var-apache-160-4v', 'var-duke200-standard', 'var-dominar-standard'],
    inventories: [
      { id: 'inv-3-1', shopId: 'shop-1', shop: initialShops[0], quantity: 35, sellingPrice: 780, isAvailable: true },
      { id: 'inv-3-2', shopId: 'shop-2', shop: initialShops[1], quantity: 50, sellingPrice: 799, isAvailable: true },
      { id: 'inv-3-3', shopId: 'shop-3', shop: initialShops[2], quantity: 40, sellingPrice: 770, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-5', userId: 'user-5', user: { id: 'user-5', firstName: 'Arun', lastName: 'Prasad', avatar: null }, rating: 5, title: 'Engine feels butter smooth', body: 'Changed the oil on my Royal Enfield Classic 350. Gear shifts are smooth and engine runs noticeably cooler in traffic.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },

  // 24. ENGINE OIL (Car)
  {
    id: 'prod-shell-helix-ultra',
    name: 'Shell Helix Ultra 5W-40 PurePlus Fully Synthetic Engine Oil (3.5L)',
    slug: 'shell-helix-ultra-5w40-synthetic-3-5l',
    description: 'Made from natural gas using Shell PurePlus Technology. Offers unsurpassed sludge and wear protection, superior fuel economy, and outstanding extreme-temperature performance for modern turbo engines.',
    sku: 'SHELL-HU-5W40-35L',
    partNumber: '550046358',
    categoryId: 'cat-oils',
    brandId: 'brand-shell',
    brand: 'Shell',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 2650,
    mrp: 3199,
    warranty: 'Quality Seal Guarantee',
    rating: 4.9,
    weight: 3.2,
    dimensions: '28x22x12 cm',
    tags: ['engine oil', 'shell', 'helix ultra', 'fully synthetic', '5w40', 'car oil'],
    requiresDIFM: true,
    installationDifficulty: 'EASY',
    baseServiceFee: 249,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-02-15'),
    images: [
      { id: 'img-sh-1', url: '/uploads/products/engine_oil_bottle.svg', isPrimary: true, altText: 'Shell Helix Ultra 5W-40 Synthetic Engine Oil', sortOrder: 0 },
    ],
    specs: [
      { key: 'Viscosity Grade', value: '5W-40', unit: '' },
      { key: 'Standards / Approvals', value: 'API SP / ACEA A3/B4', unit: '' },
      { key: 'Base Oil Technology', value: 'PurePlus Gas-To-Liquid (GTL)', unit: '' },
      { key: 'Volume', value: '3.5', unit: 'L' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-baleno-delta', 'var-creta-sx', 'var-nexon-creative', 'var-city-v', 'var-kushaq-style', 'var-taigun-gt-plus'],
    inventories: [
      { id: 'inv-sh-1', shopId: 'shop-1', shop: initialShops[0], quantity: 20, sellingPrice: 2550, isAvailable: true },
      { id: 'inv-sh-2', shopId: 'shop-2', shop: initialShops[1], quantity: 15, sellingPrice: 2650, isAvailable: true },
    ],
    reviews: [],
  },

  // 25. BRAKE FLUID
  {
    id: 'prod-bosch-brake-fluid-dot4',
    name: 'Bosch High Performance DOT 4 Brake & Clutch Fluid (500ml)',
    slug: 'bosch-high-performance-dot-4-brake-fluid-500ml',
    description: 'High boiling point synthetic brake fluid designed for modern hydraulic braking and clutch systems equipped with ABS, ESP, and traction control. Prevents vapor lock under continuous descending mountain roads.',
    sku: 'BOSCH-BF-DOT4-500',
    partNumber: '1987479106',
    categoryId: 'cat-oils',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 230,
    mrp: 290,
    warranty: 'Quality Seal Guarantee',
    rating: 4.8,
    weight: 0.58,
    dimensions: '18x7x7 cm',
    tags: ['brake fluid', 'dot 4', 'bosch', 'brakes', 'hydraulic', 'abs fluid'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 199,
    estimatedInstallTimeMinutes: 25,
    createdAt: new Date('2024-02-18'),
    images: [
      { id: 'img-bf-1', url: '/uploads/products/brake_fluid.svg', isPrimary: true, altText: 'Bosch DOT 4 Brake Fluid Bottle', sortOrder: 0 },
    ],
    specs: [
      { key: 'DOT Rating', value: 'DOT 4 Standard Compliant', unit: '' },
      { key: 'Dry Boiling Point', value: '260', unit: 'C' },
      { key: 'Wet Boiling Point', value: '165', unit: 'C' },
      { key: 'Viscosity at -40C', value: '1400', unit: 'mm2/s' },
      { key: 'Volume', value: '500', unit: 'ml' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-creta-sx', 'var-nexon-creative', 'var-city-v', 'var-pulsar-twin', 'var-classic-halcyon', 'var-activa-std'],
    inventories: [
      { id: 'inv-bf-1', shopId: 'shop-1', shop: initialShops[0], quantity: 50, sellingPrice: 215, isAvailable: true },
      { id: 'inv-bf-2', shopId: 'shop-2', shop: initialShops[1], quantity: 35, sellingPrice: 230, isAvailable: true },
    ],
    reviews: [],
  },

  // 26. HORN
  {
    id: 'prod-bosch-dual-horns',
    name: 'Bosch Symphony 12V 420Hz/500Hz Dual Electric Horn Set',
    slug: 'bosch-symphony-dual-electric-horn-set',
    description: 'European luxury acoustic acoustic tone dual-disc horn set. High 110 dB sound pressure level provides maximum warning power and road presence without harsh distortion.',
    sku: 'BOSCH-HN-SYMPH-12V',
    partNumber: '0986AH0503',
    categoryId: 'cat-electrical',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 850,
    mrp: 1150,
    warranty: '1 Year Warranty',
    rating: 4.8,
    weight: 0.72,
    dimensions: '14x12x10 cm',
    tags: ['horn', 'bosch', 'symphony', 'dual tone', '12v', 'electric horn'],
    requiresDIFM: true,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-02-20'),
    images: [
      { id: 'img-hn-1', url: '/uploads/products/dual_horns.svg', isPrimary: true, altText: 'Bosch Symphony Dual Horn Set', sortOrder: 0 },
    ],
    specs: [
      { key: 'Acoustic Sound Pressure', value: '110', unit: 'dB(A)' },
      { key: 'Frequencies', value: '420 Hz (Low) / 500 Hz (High)', unit: '' },
      { key: 'Current Consumption', value: '3.5 x 2', unit: 'A' },
      { key: 'Operating Voltage', value: '12', unit: 'V' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-creta-sx', 'var-nexon-creative', 'var-brezza-vxi', 'var-city-v', 'var-seltos-htx', 'var-innova-crysta-gx'],
    inventories: [
      { id: 'inv-hn-1', shopId: 'shop-1', shop: initialShops[0], quantity: 28, sellingPrice: 799, isAvailable: true },
      { id: 'inv-hn-2', shopId: 'shop-2', shop: initialShops[1], quantity: 20, sellingPrice: 850, isAvailable: true },
    ],
    reviews: [],
  },

  // 27. IGNITION COILS
  {
    id: 'prod-delphi-ignition-coil',
    name: 'Delphi High-Energy Direct Ignition Coil Pencil Pack',
    slug: 'delphi-high-energy-direct-ignition-coil',
    description: 'Direct-mount pencil ignition coil engineered to OEM standards. High silicone steel lamination core generates 35,000+ volts spark output to prevent engine misfires and sluggish acceleration.',
    sku: 'DELPHI-IC-GN10314',
    partNumber: 'GN10314-12B1',
    categoryId: 'cat-engine',
    brandId: 'brand-delphi',
    brand: 'Delphi',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1450,
    mrp: 1850,
    warranty: '1 Year Warranty',
    rating: 4.8,
    weight: 0.32,
    dimensions: '18x5x5 cm',
    tags: ['ignition coil', 'delphi', 'coil pack', 'spark coil', 'misfire fix'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 249,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-02-22'),
    images: [
      { id: 'img-ic-1', url: '/uploads/products/ignition_coil.svg', isPrimary: true, altText: 'Delphi Direct Ignition Coil Pack', sortOrder: 0 },
    ],
    specs: [
      { key: 'Secondary Spark Voltage', value: '35,000', unit: 'V' },
      { key: 'Connector Terminal', value: '3-Pin Sealed Blade Connector', unit: '' },
      { key: 'Spark Plug Boot Material', value: 'High Dielectric Silicone Rubber', unit: '' },
      { key: 'Internal Resistor', value: 'Integrated Radio Suppression', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-dzire-vxi', 'var-ertiga-vxi'],
    inventories: [
      { id: 'inv-ic-1', shopId: 'shop-1', shop: initialShops[0], quantity: 20, sellingPrice: 1399, isAvailable: true },
      { id: 'inv-ic-2', shopId: 'shop-2', shop: initialShops[1], quantity: 15, sellingPrice: 1450, isAvailable: true },
    ],
    reviews: [],
  },

  // 28. CHAIN / SPROCKET
  {
    id: 'prod-rolon-chain-sprocket-kit',
    name: 'Rolon Heavy-Duty Brass Finish Drive Chain & Sprocket Combo Kit',
    slug: 'rolon-heavy-duty-chain-sprocket-kit-re350',
    description: 'High tensile induction hardened carbon steel front and rear sprocket combo with solid bush brass coated drive chain. Engineered for minimal chain stretch and smooth power delivery on touring rides.',
    sku: 'ROLON-CSK-RE350',
    partNumber: 'ROL-CSK-530-110',
    categoryId: 'cat-transmission',
    brandId: 'brand-rolon',
    brand: 'Rolon',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 2150,
    mrp: 2650,
    warranty: '1 Year / 15,000 km Warranty',
    rating: 4.9,
    weight: 2.8,
    dimensions: '24x24x6 cm',
    tags: ['chain sprocket', 'rolon', 'brass chain', 'royal enfield', 'classic 350', 'drivetrain'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 399,
    estimatedInstallTimeMinutes: 45,
    createdAt: new Date('2024-02-25'),
    images: [
      { id: 'img-csk-1', url: '/uploads/products/chain_sprocket.svg', isPrimary: true, altText: 'Rolon Chain & Sprocket Combo Kit', sortOrder: 0 },
    ],
    specs: [
      { key: 'Chain Pitch & Length', value: '530 Pitch - 110 Links', unit: '' },
      { key: 'Front Sprocket Teeth', value: '16T Hardened Alloy', unit: '' },
      { key: 'Rear Sprocket Teeth', value: '42T Carbon Steel', unit: '' },
      { key: 'Plate Coating', value: 'Corrosion Resistant Golden Brass', unit: '' },
    ],
    compatibleVariantIds: ['var-classic-halcyon', 'var-classic-dark', 'var-hunter-dapper', 'var-meteor-fireball'],
    inventories: [
      { id: 'inv-csk-1', shopId: 'shop-1', shop: initialShops[0], quantity: 18, sellingPrice: 2099, isAvailable: true },
      { id: 'inv-csk-2', shopId: 'shop-2', shop: initialShops[1], quantity: 12, sellingPrice: 2150, isAvailable: true },
    ],
    reviews: [],
  },

  // 29. BIKE BRAKE SHOES
  {
    id: 'prod-kbx-bike-brake-shoes',
    name: 'KBX High Friction Rear Drum Brake Shoe Set with Return Springs',
    slug: 'kbx-high-friction-rear-drum-brake-shoes',
    description: 'High-friction semi-metallic curved motorcycle drum brake shoes with dual tension return springs. Provides consistent progressive braking bite without drum scoring.',
    sku: 'KBX-BS-HERO-110',
    partNumber: 'KBX-BS-110MM',
    categoryId: 'cat-braking',
    brandId: 'brand-kbx',
    brand: 'KBX',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 290,
    mrp: 375,
    warranty: '6 Months Warranty',
    rating: 4.7,
    weight: 0.35,
    dimensions: '14x14x4 cm',
    tags: ['brake shoes', 'kbx', 'drum brake', 'splendor', 'activa', 'motorcycle brakes'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-02-26'),
    images: [
      { id: 'img-bs-1', url: '/uploads/products/bike_brake_shoes.svg', isPrimary: true, altText: 'KBX Rear Drum Brake Shoes Set', sortOrder: 0 },
    ],
    specs: [
      { key: 'Drum Internal Diameter', value: '110 or 130', unit: 'mm' },
      { key: 'Shoe Width', value: '25', unit: 'mm' },
      { key: 'Friction Material', value: 'Semi-Metallic Non-Asbestos', unit: '' },
      { key: 'Hardware Included', value: '2 Zinc-Plated Return Tension Springs', unit: '' },
    ],
    compatibleVariantIds: ['var-splendor-drum', 'var-activa-std', 'var-activa-deluxe', 'var-jupiter-zx', 'var-shine-standard'],
    inventories: [
      { id: 'inv-bs-1', shopId: 'shop-1', shop: initialShops[0], quantity: 45, sellingPrice: 275, isAvailable: true },
      { id: 'inv-bs-2', shopId: 'shop-2', shop: initialShops[1], quantity: 30, sellingPrice: 290, isAvailable: true },
    ],
    reviews: [],
  },

  // 30. SCOOTER AIR FILTERS
  {
    id: 'prod-purolator-scooter-air-filter',
    name: 'Purolator Dry Type High Performance Scooter Air Filter Element',
    slug: 'purolator-dry-type-scooter-air-filter-activa-6g',
    description: 'Dry type pleated cellulose paper air filter cartridge designed for commuter scooters. Traps micro dust and road silt to protect the carburetor and throttle body from carbon buildup.',
    sku: 'PURO-SAF-ACTIVA6G',
    partNumber: 'SAF-ACT-6G-01',
    categoryId: 'cat-filters',
    brandId: 'brand-purolator',
    brand: 'Purolator',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 195,
    mrp: 260,
    warranty: '6 Months Warranty',
    rating: 4.7,
    weight: 0.16,
    dimensions: '16x11x4 cm',
    tags: ['air filter', 'scooter filter', 'activa', 'purolator', 'intake filter'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 99,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-02-28'),
    images: [
      { id: 'img-saf-1', url: '/uploads/products/scooter_air_filter.svg', isPrimary: true, altText: 'Purolator Scooter Air Filter Element', sortOrder: 0 },
    ],
    specs: [
      { key: 'Filter Type', value: 'Dry Micropore Paper Element', unit: '' },
      { key: 'Outer Frame', value: 'High Density Polyurethane Elastomer', unit: '' },
      { key: 'Maintenance Cycle', value: 'Replace every 6,000 km', unit: '' },
    ],
    compatibleVariantIds: ['var-activa-std', 'var-activa-deluxe', 'var-dio-125-std', 'var-jupiter-zx'],
    inventories: [
      { id: 'inv-saf-1', shopId: 'shop-1', shop: initialShops[0], quantity: 50, sellingPrice: 185, isAvailable: true },
      { id: 'inv-saf-2', shopId: 'shop-2', shop: initialShops[1], quantity: 35, sellingPrice: 195, isAvailable: true },
    ],
    reviews: [],
  },

  // 31. USED VERIFIED FUEL PUMP (Preserved)
  {
    id: 'prod-used-fuelpump',
    name: 'Hyundai Genuine Used Verified Fuel Pump Assembly',
    slug: 'hyundai-used-verified-fuel-pump-assembly',
    description: 'Inspected and certified pre-owned fuel pump assembly salvaged from low-mileage Hyundai Creta. Bench tested for flow rate and pressure compliance.',
    sku: 'HYUN-FP-USED-311',
    partNumber: '31110-C9000',
    categoryId: 'cat-engine',
    brandId: 'brand-hyundai-mobis',
    brand: 'Hyundai Mobis',
    condition: 'USED_VERIFIED',
    status: 'ACTIVE',
    basePrice: 1950,
    mrp: 6800,
    warranty: '3 Months Inspection Warranty',
    rating: 4.3,
    weight: 1.1,
    dimensions: '20x15x15 cm',
    tags: ['fuel pump', 'used verified', 'hyundai', 'fuel system'],
    requiresDIFM: true,
    installationDifficulty: 'COMPLEX',
    baseServiceFee: 499,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-8-1', url: '/uploads/products/fuel_filter.svg', isPrimary: true, altText: 'Used Verified Fuel Pump Assembly', sortOrder: 0 },
    ],
    specs: [
      { key: 'Condition Grade', value: 'Grade A - Inspected', unit: '' },
      { key: 'Flow Rate', value: '110', unit: 'L/h' },
      { key: 'Working Pressure', value: '3.8', unit: 'Bar' },
    ],
    compatibleVariantIds: ['var-creta-sx', 'var-i20-magna', 'var-venue-s'],
    inventories: [
      { id: 'inv-8-1', shopId: 'shop-1', shop: initialShops[0], quantity: 2, sellingPrice: 1950, isAvailable: true },
    ],
    reviews: [],
  },
];

// ============================================================================
// 4. SUBSCRIPTION PLANS & ENTITLEMENTS INITIAL DATA
// ============================================================================
export const initialSubscriptionPlans = [
  {
    id: 'plan-basic-care',
    name: 'Basic Care',
    slug: 'basic-care',
    description: 'Essential emergency roadside assistance, battery jumpstart support, and baseline discounts for commuter vehicles.',
    price: 299,
    monthlyPrice: 299,
    yearlyPrice: 2499,
    durationDays: 30,
    features: [
      '24/7 Nationwide Emergency Roadside Assistance',
      '2 Free Breakdown Tows per period (up to 25 km)',
      'Free Doorstep Battery Jumpstart & Flat Tyre Assistance',
      '5% Flat Discount on Genuine Spare Parts',
      '10% Labor Discount at Partnered Workshops',
      'Digital Vehicle Health Passbook & Service History',
    ],
    includedServices: [
      { name: 'Roadside Breakdown Assistance', description: '24/7 emergency dispatch across 500+ cities with live technician GPS tracking.' },
      { name: 'Emergency Breakdown Towing', description: 'Flatbed or wheel-lift towing to nearest authorized service center (up to 25 km free).' },
      { name: 'Doorstep Battery Jumpstart', description: 'Mobile technician dispatched with high-amperage booster pack within 30-45 minutes.' },
      { name: 'Flat Tyre Repair / Spare Swapping', description: 'Tubeless puncture repair or spare wheel fitment on the spot.' },
      { name: 'Digital Vehicle Passbook', description: 'Real-time maintenance logging with tamper-proof service records.' }
    ],
    discountBenefits: [
      { category: 'Spare Parts', discountPercent: 5, description: '5% off on all OEM and certified OES spare parts.' },
      { category: 'Workshop Labor', discountPercent: 10, description: '10% discount on labor fees at verified mechanical hubs.' },
    ],
    serviceLimits: [
      { feature: 'Emergency Towing', limit: '2 per term (up to 25 km each)' },
      { feature: 'Battery Jumpstart', limit: '2 per term' },
      { feature: 'Flat Tyre Assist', limit: '2 per term' },
    ],
    eligibility: 'All 2-Wheelers & 4-Wheelers (Cars, Bikes, Scooters) under 15 years old.',
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan-standard-care',
    name: 'Standard Care',
    slug: 'standard-care',
    description: 'Comprehensive maintenance & preventive care membership with free scheduled general servicing and diagnostic scans.',
    price: 699,
    monthlyPrice: 699,
    yearlyPrice: 5999,
    durationDays: 30,
    features: [
      'All Basic Care features included',
      '1 Free Periodic General Service (oil & filter change labor covered)',
      '1 Free 40-Point Computerized Diagnostic Health Scan',
      '5 Free Breakdown Tows per period (up to 50 km)',
      '10% Flat Discount on Genuine Spare Parts',
      '20% Labor Discount at Partnered Workshops',
      'Free Doorstep Delivery on all Spare Part Orders',
      'Priority Workshop Bay Booking',
    ],
    includedServices: [
      { name: 'All Basic Care Features Included', description: 'Unlimited access to all emergency RSA and roadside assistance benefits.' },
      { name: 'Periodic General Service', description: 'Comprehensive multipoint inspection, engine oil drain & fill, filter replacement, spark plug check, brake tuning, and wash.' },
      { name: '40-Point Computer Diagnostic Scan', description: 'OBD-II scanner health report covering engine, transmission, ABS, airbag sensors, and battery health.' },
      { name: 'Long-Distance Towing', description: '5 free tows up to 50 km radius to your preferred garage or home.' },
      { name: 'Doorstep Delivery Waiver', description: '100% free delivery on all spare parts and DIFM orders.' }
    ],
    discountBenefits: [
      { category: 'Spare Parts', discountPercent: 10, description: '10% off on all OEM/OES components.' },
      { category: 'Workshop Labor', discountPercent: 20, description: '20% off all labor operations at partner garages.' },
      { category: 'DIFM Delivery', discountPercent: 100, description: 'Free delivery on all orders.' },
    ],
    serviceLimits: [
      { feature: 'Emergency Towing', limit: '5 per term (up to 50 km each)' },
      { feature: 'Periodic General Service', limit: '1 per term' },
      { feature: 'Computer Diagnostic Scan', limit: '2 per term' },
      { feature: 'Battery Health Check', limit: 'Unlimited' },
    ],
    eligibility: 'All Cars and Motorcycles above 150cc.',
    isPopular: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan-premium-care',
    name: 'Premium Care',
    slug: 'premium-care',
    description: 'VIP automotive coverage with 2 comprehensive periodic services, unlimited towing, zero DIFM fees, and dedicated master mechanic.',
    price: 1299,
    monthlyPrice: 1299,
    yearlyPrice: 11999,
    durationDays: 30,
    features: [
      'Unlimited 24/7 Pan-India Breakdown Towing & RSA',
      '2 Free Comprehensive Periodic General Services (all consumables & labor covered)',
      'Unlimited Computerized Diagnostic Scans',
      '20% VIP Discount on All Genuine Spare Parts',
      '30% Labor Discount on Major Mechanical Repairs & Bodywork',
      '100% Doorstep DIFM Installation Fee Waiver (Free Mechanic Visit)',
      'Free Vehicle Pickup & Drop Valet Service',
      'Dedicated Personal Master Technician',
    ],
    includedServices: [
      { name: 'Unlimited 24/7 Breakdown Towing', description: 'Zero-distance restriction nationwide flatbed towing to any verified hub.' },
      { name: '2 Comprehensive Annual Services', description: 'Synthetic oil, air filter, oil filter, cabin AC filter, coolant top-up, brake bleeding, and full detailing included.' },
      { name: 'Unlimited OBD Diagnostics', description: 'On-demand doorstep computerized vehicle scans and sensor resets.' },
      { name: 'Free Doorstep DIFM Fitment', description: 'Zero labor and home visit fee on all parts installed at home.' },
      { name: 'Valet Concierge', description: 'Free insured driver pickup and drop for all garage servicing visits.' },
      { name: 'Dedicated Master Technician', description: 'Direct WhatsApp/phone access to a certified senior automotive specialist.' }
    ],
    discountBenefits: [
      { category: 'Spare Parts', discountPercent: 20, description: '20% maximum discount on all genuine parts.' },
      { category: 'Workshop Labor', discountPercent: 30, description: '30% off all major mechanical, engine, and transmission repairs.' },
      { category: 'DIFM Installation Fee', discountPercent: 100, description: '100% free doorstep DIFM mechanic labor.' },
    ],
    serviceLimits: [
      { feature: 'Emergency Towing', limit: 'Unlimited nationwide' },
      { feature: 'Periodic General Service', limit: '2 per term' },
      { feature: 'Computer Diagnostic Scan', limit: 'Unlimited' },
      { feature: 'Doorstep DIFM Home Visits', limit: 'Unlimited free visits' },
      { feature: 'Pickup & Drop Valet', limit: '4 per term' },
    ],
    eligibility: 'All Passenger Cars, SUVs, Luxury Vehicles, and Fleet Vehicles.',
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const initialSubscriptionEntitlements = [
  // Basic Care
  { id: 'ent-basic-1', planId: 'plan-basic-care', featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 2, isUnlimited: false },
  { id: 'ent-basic-2', planId: 'plan-basic-care', featureCode: 'BATTERY_JUMPSTART', featureName: 'Battery Jump Start', limitValue: 2, isUnlimited: false },
  { id: 'ent-basic-3', planId: 'plan-basic-care', featureCode: 'FLAT_TYRE_ASSIST', featureName: 'Flat Tyre Assist', limitValue: 2, isUnlimited: false },
  { id: 'ent-basic-4', planId: 'plan-basic-care', featureCode: 'PARTS_DISCOUNT_PCT', featureName: 'Parts Discount Percent', limitValue: 5, isUnlimited: false },
  { id: 'ent-basic-5', planId: 'plan-basic-care', featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount Percent', limitValue: 10, isUnlimited: false },

  // Standard Care
  { id: 'ent-std-1', planId: 'plan-standard-care', featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 5, isUnlimited: false },
  { id: 'ent-std-2', planId: 'plan-standard-care', featureCode: 'GENERAL_SERVICE', featureName: 'Periodic General Service', limitValue: 1, isUnlimited: false },
  { id: 'ent-std-3', planId: 'plan-standard-care', featureCode: 'DIAGNOSTIC_SCAN', featureName: 'Computer Diagnostic Scan', limitValue: 2, isUnlimited: false },
  { id: 'ent-std-4', planId: 'plan-standard-care', featureCode: 'BATTERY_JUMPSTART', featureName: 'Battery Jump Start', limitValue: 5, isUnlimited: false },
  { id: 'ent-std-5', planId: 'plan-standard-care', featureCode: 'PARTS_DISCOUNT_PCT', featureName: 'Parts Discount Percent', limitValue: 10, isUnlimited: false },
  { id: 'ent-std-6', planId: 'plan-standard-care', featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount Percent', limitValue: 20, isUnlimited: false },

  // Premium Care
  { id: 'ent-prem-1', planId: 'plan-premium-care', featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: null, isUnlimited: true },
  { id: 'ent-prem-2', planId: 'plan-premium-care', featureCode: 'GENERAL_SERVICE', featureName: 'Comprehensive General Service', limitValue: 2, isUnlimited: false },
  { id: 'ent-prem-3', planId: 'plan-premium-care', featureCode: 'DIAGNOSTIC_SCAN', featureName: 'Computer Diagnostic Scan', limitValue: null, isUnlimited: true },
  { id: 'ent-prem-4', planId: 'plan-premium-care', featureCode: 'PARTS_DISCOUNT_PCT', featureName: 'Parts Discount Percent', limitValue: 20, isUnlimited: false },
  { id: 'ent-prem-5', planId: 'plan-premium-care', featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount Percent', limitValue: 30, isUnlimited: false },
  { id: 'ent-prem-6', planId: 'plan-premium-care', featureCode: 'VALET_PICKUP_DROP', featureName: 'Valet Pickup & Drop', limitValue: 4, isUnlimited: false },
];

// ============================================================================
// 4B. USED PART LISTINGS INITIAL DATA
// ============================================================================
export const initialUsedPartListings = [
  {
    id: 'used_demo_1',
    sellerId: 'demo-user-1',
    title: 'OEM LED Headlight Assembly (Right)',
    partNumber: '92102-M6000',
    vehicleModel: 'Hyundai Creta 2018 - 2020 1.6L',
    category: 'LIGHTING',
    condition: 'EXCELLENT',
    conditionGrade: 'A+',
    description: 'Original OEM genuine headlight removed before upgrading to aftermarket matrix LEDs. Lenses clear, brackets intact, bulb connectors perfect.',
    purchaseAge: '1-2 Years',
    expectedPrice: 3800,
    estimatedValuation: 3400,
    finalValuation: 3400,
    payoutStatus: 'PAID',
    payoutAmount: 3400,
    payoutMethod: 'UPI',
    payoutTransactionRef: 'UPI_REF_892374921',
    images: [
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Indiranagar, Bengaluru, Karnataka - 560038',
    status: 'LISTED',
    verificationStatus: 'APPROVED',
    verificationNotes: 'Lenses verified free of micro-cracks. Electrical testing passed. High/low beam diodes 100% operational.',
    isSold: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_2',
    sellerId: 'demo-user-1',
    title: 'Front Brake Caliper Pair with Ceramic Pads',
    partNumber: 'RE-BRK-350-BS6',
    vehicleModel: 'Royal Enfield Classic 350 (BS6)',
    category: 'BRAKES',
    condition: 'GOOD',
    conditionGrade: 'A',
    description: 'ByBre OEM twin-piston calipers. Serviced at 6,000 km, ceramic pads with ~75% life remaining.',
    purchaseAge: '6-12 Months',
    expectedPrice: 2100,
    estimatedValuation: 1800,
    finalValuation: 1800,
    payoutStatus: 'PAID',
    payoutAmount: 1800,
    payoutMethod: 'BANK_TRANSFER',
    payoutTransactionRef: 'NEFT_HDFC_91283921',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Kothrud, Pune, Maharashtra - 411038',
    status: 'PAID',
    verificationStatus: 'APPROVED',
    verificationNotes: 'Caliper pistons polished, no hydraulic fluid weeping. Seals intact.',
    isSold: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_3',
    sellerId: 'demo-user-1',
    title: 'Alternator 12V 90A (Bosch OE)',
    partNumber: 'F002G10814',
    vehicleModel: 'Maruti Suzuki Swift DDiS Diesel',
    category: 'ELECTRICAL',
    condition: 'GOOD',
    conditionGrade: 'B+',
    description: 'Fully working Bosch alternator with pulley. Output tested steady 14.2V under load.',
    purchaseAge: '2-3 Years',
    expectedPrice: 3200,
    estimatedValuation: 2700,
    finalValuation: 2700,
    payoutStatus: 'PENDING',
    payoutAmount: 2700,
    payoutMethod: 'UPI',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Noida Sector 62, Delhi NCR - 201301',
    status: 'VALUED',
    verificationStatus: 'APPROVED',
    verificationNotes: 'Dynamic bench test passed. Output voltage 14.1V. Ready for seller payout authorization.',
    isSold: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_4',
    sellerId: 'demo-user-1',
    title: 'Electric Power Steering Column Motor',
    partNumber: '53500-T9A-H01',
    vehicleModel: 'Honda City 4th Gen i-VTEC',
    category: 'SUSPENSION',
    condition: 'EXCELLENT',
    conditionGrade: null,
    description: 'Original EPS rack module. Smooth torque sensor response, zero play.',
    purchaseAge: '1-2 Years',
    expectedPrice: 4800,
    estimatedValuation: 4200,
    finalValuation: null,
    payoutStatus: 'PENDING',
    payoutAmount: 0,
    images: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Andheri West, Mumbai, Maharashtra - 400053',
    status: 'VERIFICATION_PENDING',
    verificationStatus: 'INSPECTING',
    verificationNotes: 'Part picked up by Delivery Partner. Currently at PartNexa Hub mechanical bay for bench testing.',
    isSold: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_5',
    sellerId: 'demo-user-1',
    title: 'Rear Combination Tail Lamp Set (LED)',
    partNumber: '35670M68P00',
    vehicleModel: 'Maruti Suzuki Baleno Alpha',
    category: 'LIGHTING',
    condition: 'LIKE_NEW',
    conditionGrade: null,
    description: 'Factory rear tail light set. Zero scratches, all clips in factory condition.',
    purchaseAge: '< 6 Months',
    expectedPrice: 2600,
    estimatedValuation: 2300,
    finalValuation: null,
    payoutStatus: 'PENDING',
    payoutAmount: 0,
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Whitefield, Bengaluru, Karnataka - 560066',
    status: 'SUBMITTED',
    verificationStatus: 'SUBMITTED',
    verificationNotes: 'Listing submitted by customer. Delivery partner pickup assignment pending.',
    isSold: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ============================================================================
// 5. IN-MEMORY STORE CLASS
// ============================================================================
class InMemoryStore {
  public users: any[] = [];
  public refreshTokens: any[] = [];
  public carts: any[] = [];
  public cartItems: any[] = [];
  public inventories: any[] = [];
  public shops: any[] = [];
  public auditLogs: any[] = [];
  public customerVehicles: any[] = [];
  public addresses: any[] = [];
  public orders: any[] = [];
  public orderItems: any[] = [];
  public difmRequests: any[] = [];
  public payments: any[] = [];
  public orderTrackings: any[] = [];
  public subscriptionPlans: any[] = [...initialSubscriptionPlans];
  public subscriptionEntitlements: any[] = [...initialSubscriptionEntitlements];
  public customerSubscriptions: any[] = [];
  public subscriptionPayments: any[] = [];
  public usedPartListings: any[] = [...initialUsedPartListings];
  public shopJobs: any[] = [];
  public serviceAppointments: any[] = [];
  public serviceBookings: any[] = [];
  public commissionLedgers: any[] = [];
  public shopDeliveries: any[] = [];
  public usedPartIntakes: any[] = [];
  public usedPartPayouts: any[] = [];
  public usedPartVerifications: any[] = [];
  public shopTickets: any[] = [];
  public deliveryPartners: any[] = [];
  public kycRecords: any[] = [];
  public kycDocuments: any[] = [];
  public deliveryAssignments: any[] = [];
  public codReconciliations: any[] = [];
  public supportTickets: any[] = [];
  public suppliers: any[] = [];
  public supplierCatalogItems: any[] = [];
  public bulkPriceTiers: any[] = [];
  public procurementCarts: any[] = [];
  public procurementCartItems: any[] = [];
  public purchaseOrders: any[] = [];
  public purchaseOrderItems: any[] = [];
  public goodsReceipts: any[] = [];
  public goodsReceiptItems: any[] = [];
  public platformConfigs: any = {
    difm: {
      homeVisitBaseSurcharge: 99,
      homeVisitPerKmRate: 20,
      freeDeliveryThreshold: 999,
      standardDeliveryFee: 49,
      defaultBaseServiceFee: 299,
      optionAEnabled: true,
      optionBEnabled: true,
      optionCEnabled: true,
    },
    commissions: {
      defaultRate: 12.0,
      minRate: 10.0,
      maxRate: 15.0,
    },
  };

  constructor() {
    this.seedDefaultUser();
    this.seedInventoriesAndShops();
    this.seedDefaultAddresses();
    this.seedShopPortalData();
    this.seedDeliveryPartnerData();
    this.seedOrdersData();
    this.seedSupportTicketsData();
    this.seedProcurementData();
  }

  private seedInventoriesAndShops() {
    this.shops = initialShops.map((s) => ({ ...s, isActive: true }));
    this.inventories = initialProducts.flatMap((p) =>
      (p.inventories || []).map((inv) => ({
        id: inv.id,
        productId: p.id,
        shopId: inv.shopId,
        quantity: inv.quantity,
        reservedQty: 0,
        sellingPrice: Number(inv.sellingPrice),
        isAvailable: inv.isAvailable,
        availabilityStatus: inv.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        updatedAt: new Date(),
      }))
    );
  }

  private seedDefaultAddresses() {
    this.addresses.push({
      id: 'addr-demo-home',
      userId: 'demo-user-1',
      label: 'Home',
      fullName: 'Aarav Sharma',
      phone: '9876500002',
      line1: 'Flat 402, Green Glen Layout, Bellandur',
      line2: 'Near Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      landmark: 'Opposite Central Mall',
      latitude: 12.9260,
      longitude: 77.6762,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.addresses.push({
      id: 'addr-demo-work',
      userId: 'demo-user-1',
      label: 'Work / Office',
      fullName: 'Aarav Sharma',
      phone: '9876500002',
      line1: 'Tower B, 6th Floor, Bagmane Tech Park, CV Raman Nagar',
      line2: 'Byrasandra',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560093',
      landmark: 'Near Indiranagar Metro',
      latitude: 12.9866,
      longitude: 77.6638,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private seedDefaultUser() {
    const passwordHash = bcrypt.hashSync('Password@123', 10);
    const demo1234Hash = bcrypt.hashSync('Demo@1234', 10);
    const shop1234Hash = bcrypt.hashSync('Shop@1234', 10);
    const rider1234Hash = bcrypt.hashSync('Rider@1234', 10);
    const admin1234Hash = bcrypt.hashSync('Admin@1234', 10);
    const admin12345Hash = bcrypt.hashSync('Admin@12345', 10);

    // 1. Customer Accounts (Official seed: demo@partsphere.in / Demo@1234)
    this.users.push({
      id: 'demo-user-1',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'demo@partsphere.in',
      password: demo1234Hash,
      phone: '+919876500002',
      avatar: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'demo-user-aarav',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav@partsphare.com',
      password: passwordHash,
      phone: '9876500001',
      avatar: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Shop Owner Accounts (Official seed: apex.shop@partsphere.in / Shop@1234)
    this.users.push({
      id: 'shop-owner-official',
      firstName: 'Ramesh',
      lastName: 'Gowda',
      email: 'apex.shop@partsphere.in',
      password: shop1234Hash,
      phone: '+919876500003',
      avatar: null,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'shop-owner-1',
      firstName: 'Rajesh',
      lastName: 'Verma',
      email: 'apex.auto@partsphare.test',
      password: passwordHash,
      phone: '+91 98450 12345',
      avatar: null,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'shop-owner-apex',
      firstName: 'Rajesh',
      lastName: 'Verma',
      email: 'apex@autocare.com',
      password: passwordHash,
      phone: '+91 98450 12346',
      avatar: null,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Delivery Partner Accounts (Official seed: rider.rajesh@partsphere.in / Rider@1234)
    this.users.push({
      id: 'rider-user-official',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rider.rajesh@partsphere.in',
      password: rider1234Hash,
      phone: '+919876500006',
      avatar: null,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'rider-user-1',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'rider.vikram@partsphare.test',
      password: passwordHash,
      phone: '+91 98451 99882',
      avatar: null,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'rider-user-vikram',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram@delivery.com',
      password: passwordHash,
      phone: '+91 98451 99883',
      avatar: null,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Admin Accounts (Official seed: admin@partsphere.in / Admin@1234)
    this.users.push({
      id: 'admin-user-official',
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@partsphere.in',
      password: admin1234Hash,
      phone: '+919876500001',
      avatar: null,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'admin-user-1',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@partsphare.test',
      password: passwordHash,
      phone: '+91 99999 00000',
      avatar: null,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'admin-user-main',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@partsphare.com',
      password: admin12345Hash,
      phone: '+91 99999 00001',
      avatar: null,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private seedShopPortalData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Seed initial Jobs for shop-1 (Apex Auto Care)
    this.shopJobs = [
      {
        id: 'job-101',
        shopId: 'shop-1',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        difmRequestId: 'difm-seed-101',
        jobType: 'DIFM_SHOP_VISIT',
        status: 'SCHEDULED',
        customerName: 'Rohit Sharma',
        customerPhone: '+91 98765 43210',
        customerEmail: 'rohit.sharma@example.com',
        vehicleInfo: 'Maruti Suzuki Swift 1.2 DualJet (2021)',
        vehicleCategory: 'CAR',
        vehicleNumber: 'KA-05-MN-9812',
        serviceName: 'Bosch Super 4 Spark Plug Installation',
        serviceFee: 350,
        homeVisitSurcharge: 0,
        totalServiceAmount: 350,
        locationType: 'SHOP',
        serviceAddress: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru',
        scheduledDate: new Date(`${todayStr}T14:00:00`),
        scheduledSlot: '02:00 PM - 03:30 PM',
        notes: 'Customer reported minor engine misfire on cold start.',
        mechanicAssigned: 'Vikram Singh (Senior Mechanic)',
        startedAt: null,
        completedAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 'job-102',
        shopId: 'shop-1',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        difmRequestId: 'difm-seed-102',
        jobType: 'DIFM_HOME_INSTALLATION',
        status: 'IN_PROGRESS',
        customerName: 'Priya Nair',
        customerPhone: '+91 98451 22334',
        customerEmail: 'priya.nair@example.com',
        vehicleInfo: 'Hyundai Creta 1.5 SX (2022)',
        vehicleCategory: 'CAR',
        vehicleNumber: 'KA-03-HA-4411',
        serviceName: 'Amaron Battery Doorstep Fitment & Alternator Check',
        serviceFee: 500,
        homeVisitSurcharge: 150,
        totalServiceAmount: 650,
        locationType: 'DOORSTEP',
        serviceAddress: 'Flat 301, Palm Meadows, Whitefield, Bengaluru',
        scheduledDate: new Date(`${todayStr}T11:00:00`),
        scheduledSlot: '11:00 AM - 12:30 PM',
        notes: 'Vehicle parked in basement B2 slot 44. Gate security notified.',
        mechanicAssigned: 'Kiran Gowda (Doorstep Specialist)',
        startedAt: new Date(Date.now() - 3600000 * 1),
        completedAt: null,
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'job-103',
        shopId: 'shop-1',
        orderId: 'ord-seed-103',
        orderNumber: 'PN-2026-90350',
        difmRequestId: 'difm-seed-103',
        jobType: 'DIFM_SHOP_VISIT',
        status: 'COMPLETED',
        customerName: 'Anand Kulkarni',
        customerPhone: '+91 98112 33445',
        customerEmail: 'anand.k@example.com',
        vehicleInfo: 'Honda City i-VTEC (2020)',
        vehicleCategory: 'CAR',
        vehicleNumber: 'KA-01-EF-7722',
        serviceName: 'Front Brake Pad Replacement & Disc Inspection',
        serviceFee: 750,
        homeVisitSurcharge: 0,
        totalServiceAmount: 750,
        locationType: 'SHOP',
        serviceAddress: '12th Main Road, Indiranagar',
        scheduledDate: new Date(Date.now() - 86400000),
        scheduledSlot: '10:00 AM - 11:30 AM',
        notes: 'Brake pads replaced and bedded in. Road test confirmed smooth stopping.',
        mechanicAssigned: 'Vikram Singh',
        startedAt: new Date(Date.now() - 86400000 + 3600000),
        completedAt: new Date(Date.now() - 86400000 + 7200000),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'job-104',
        shopId: 'shop-1',
        orderId: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        difmRequestId: 'difm-seed-104',
        jobType: 'CUSTOMER_VEHICLE_VISIT',
        status: 'COMPLETED',
        customerName: 'Sunil Mehta',
        customerPhone: '+91 99001 88221',
        customerEmail: 'sunil.mehta@example.com',
        vehicleInfo: 'Royal Enfield Classic 350 (2023)',
        vehicleCategory: 'BIKE',
        vehicleNumber: 'KA-51-AB-1290',
        serviceName: 'Motul 7100 Engine Oil Flush & Chain Lubrication',
        serviceFee: 400,
        homeVisitSurcharge: 0,
        totalServiceAmount: 400,
        locationType: 'SHOP',
        serviceAddress: '12th Main Road, Indiranagar',
        scheduledDate: new Date(Date.now() - 86400000 * 2),
        scheduledSlot: '04:00 PM - 05:00 PM',
        notes: 'Chain cleaned and tension set to 25mm slack. Oil filter replaced.',
        mechanicAssigned: 'Santosh Rao',
        startedAt: new Date(Date.now() - 86400000 * 2 + 1800000),
        completedAt: new Date(Date.now() - 86400000 * 2 + 4500000),
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
    ];

    // Seed Commission Ledger for shop-1 (Apex Auto Care)
    // STRICT RULE DEMONSTRATED IN SEED DATA:
    // Job 101: Scheduled, Paid via Razorpay -> LOCKED_PENDING_COMPLETION
    // Job 102: In progress, Paid via Razorpay -> LOCKED_PENDING_COMPLETION
    // Job 103: Completed, Paid via Razorpay -> RELEASED (both conditions met!)
    // Job 104: Completed, COD pending payment -> LOCKED_PENDING_PAYMENT (payment not yet cleared!)
    this.commissionLedgers = [
      {
        id: 'comm-101',
        shopId: 'shop-1',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        jobId: 'job-101',
        serviceName: 'Bosch Super 4 Spark Plug Installation',
        grossAmount: 350,
        commissionRate: 12,
        commissionAmount: 42,
        shopPayout: 308,
        serviceStatus: 'SCHEDULED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 'comm-102',
        shopId: 'shop-1',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        jobId: 'job-102',
        serviceName: 'Amaron Battery Doorstep Fitment',
        grossAmount: 650,
        commissionRate: 12,
        commissionAmount: 78,
        shopPayout: 572,
        serviceStatus: 'IN_PROGRESS',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'comm-103',
        shopId: 'shop-1',
        orderId: 'ord-seed-103',
        orderNumber: 'PN-2026-90350',
        jobId: 'job-103',
        serviceName: 'Front Brake Pad Replacement',
        grossAmount: 750,
        commissionRate: 12,
        commissionAmount: 90,
        shopPayout: 660,
        serviceStatus: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        releaseStatus: 'RELEASED',
        payoutStatus: 'RELEASED',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'comm-104',
        shopId: 'shop-1',
        orderId: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        jobId: 'job-104',
        serviceName: 'Motul 7100 Engine Oil Flush',
        grossAmount: 400,
        commissionRate: 12,
        commissionAmount: 48,
        shopPayout: 352,
        serviceStatus: 'COMPLETED',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        releaseStatus: 'LOCKED_PENDING_PAYMENT',
        payoutStatus: 'PENDING',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
    ];

    // Seed Incoming Deliveries for shop-1
    this.shopDeliveries = [
      {
        id: 'del-101',
        shopId: 'shop-1',
        trackingNumber: 'PND-782109',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        relatedJobId: 'job-101',
        carrier: 'PartsNexa Logistics Express',
        status: 'DELIVERED',
        items: [
          { productName: 'Bosch Super 4 Spark Plug FR78X (Set of 4)', sku: 'BOSCH-SP-FR78X', quantity: 1, condition: 'NEW' },
        ],
        eta: 'Delivered',
        receivedAt: new Date(Date.now() - 3600000 * 3),
        receivedBy: 'Ramesh (Inventory Desk)',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'del-102',
        shopId: 'shop-1',
        trackingNumber: 'PND-782194',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        relatedJobId: 'job-102',
        carrier: 'Blue Dart Surface Hub',
        status: 'IN_TRANSIT',
        items: [
          { productName: 'Amaron Pro DIN55 Automotive Battery', sku: 'AMR-PRO-55', quantity: 1, condition: 'NEW' },
        ],
        eta: 'Today, 03:30 PM',
        receivedAt: null,
        receivedBy: null,
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        id: 'del-103',
        shopId: 'shop-1',
        trackingNumber: 'PND-782250',
        orderId: 'ord-seed-105',
        orderNumber: 'PN-2026-90510',
        relatedJobId: null,
        carrier: 'PartsNexa Hub Direct',
        status: 'EXPECTED_TODAY',
        items: [
          { productName: 'Motul 7100 4T 10W-50 Synthetic 1L', sku: 'MOT-7100-10W50', quantity: 5, condition: 'NEW' },
        ],
        eta: 'Today, 05:00 PM',
        receivedAt: null,
        receivedBy: null,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ];

    // Seed Used-Part Intakes for shop-1
    this.usedPartIntakes = [
      {
        id: 'intake-101',
        shopId: 'shop-1',
        listingId: 'used-part-1',
        partTitle: 'OEM Maruti Suzuki Swift Alternator (Denso 12V 70A)',
        sellerName: 'Vikram Singh',
        vehicleModel: 'Maruti Swift Diesel 2018',
        intakeDate: new Date(Date.now() - 86400000),
        physicalCondition: 'GOOD',
        technicalTestStatus: 'PASSED',
        technicianNotes: 'Tested on test rig under 40A load. Steady 14.2V output confirmed.',
        status: 'VERIFIED_ACCEPTED',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'intake-102',
        shopId: 'shop-1',
        listingId: 'used-part-2',
        partTitle: 'Hyundai Creta Projector Headlamp Assembly (Right)',
        sellerName: 'Deepak Patel',
        vehicleModel: 'Hyundai Creta 2020',
        intakeDate: new Date(),
        physicalCondition: 'FAIR',
        technicalTestStatus: 'NEEDS_TESTING',
        technicianNotes: 'Lens intact, slight tab scuff. Need wiring harness test for leveling motor.',
        status: 'IN_STORAGE',
        createdAt: new Date(),
      },
    ];

    // Seed Shop Support Tickets for shop-1
    this.shopTickets = [
      {
        id: 'tkt-shop-101',
        ticketNumber: 'TKT-SHP-101',
        shopId: 'shop-1',
        category: 'COMMISSION_PAYOUT',
        subject: 'Payout settlement query for August batch',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        messages: [
          {
            id: 'msg-1',
            senderName: 'Rajesh Verma',
            senderRole: 'SHOP_OWNER',
            message: 'Hi team, checking when the NEFT batch for August released commissions will be processed.',
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
          {
            id: 'msg-2',
            senderName: 'PartsNexa Finance Admin',
            senderRole: 'ADMIN',
            message: 'Processed via UTR PNX99201482 into your registered HDFC bank account.',
            createdAt: new Date(Date.now() - 86400000),
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'tkt-shop-102',
        ticketNumber: 'TKT-SHP-102',
        shopId: 'shop-1',
        category: 'PARTS_DELIVERY',
        subject: 'Tracking update for shock absorber package',
        priority: 'HIGH',
        status: 'OPEN',
        messages: [
          {
            id: 'msg-3',
            senderName: 'Rajesh Verma',
            senderRole: 'SHOP_OWNER',
            message: 'Delivery PND-782194 ETA is 3:30 PM today. Customer appointment is at 4:00 PM. Kindly expedite driver dispatch.',
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private seedDeliveryPartnerData() {
    this.deliveryPartners = [
      {
        id: 'partner-1',
        userId: 'rider-user-1',
        vehicleType: 'Scooter (TVS Ntorq 125)',
        vehicleNum: 'KA-01-EQ-9124',
        licenseNumber: 'DL-KA01-2021004921',
        isOnline: true,
        currentLat: 12.9716,
        currentLng: 77.5946,
        rating: 4.9,
        totalDeliveries: 142,
        isActivated: true,
        verificationStatus: 'APPROVED',
        cashInHand: 1850,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.kycRecords = [
      {
        id: 'kyc-partner-1',
        userId: 'rider-user-1',
        status: 'APPROVED',
        panNumber: 'ABCDE1234F',
        aadharNumber: 'XXXX-XXXX-9012',
        rejectionReason: null,
        reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        reviewedBy: 'admin-1',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ];

    this.kycDocuments = [
      {
        id: 'doc-1',
        kycId: 'kyc-partner-1',
        documentType: 'PAN_CARD',
        objectKey: 'kyc/rider-user-1/pan_card.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'doc-2',
        kycId: 'kyc-partner-1',
        documentType: 'AADHAAR_CARD',
        objectKey: 'kyc/rider-user-1/aadhaar_card.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'doc-3',
        kycId: 'kyc-partner-1',
        documentType: 'DRIVING_LICENSE',
        objectKey: 'kyc/rider-user-1/driving_license.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'doc-4',
        kycId: 'kyc-partner-1',
        documentType: 'VEHICLE_RC',
        objectKey: 'kyc/rider-user-1/vehicle_rc.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ];

    this.deliveryAssignments = [
      {
        id: 'assign-101',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        usedPartListingId: null,
        deliveryPartnerId: 'partner-1',
        type: 'CUSTOMER_DELIVERY',
        status: 'IN_TRANSIT',
        pickupLocation: {
          name: 'PartNexa Central Hub - Indiranagar',
          address: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Suresh (Hub Manager)',
          phone: '+91 98450 11223',
        },
        dropLocation: {
          name: 'Aarav Sharma',
          address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
          lat: 12.9260,
          lng: 77.6762,
          contactPerson: 'Aarav Sharma',
          phone: '+91 98765 00002',
        },
        items: [
          { title: 'Bosch Super 4 Spark Plug FR78X', quantity: 1, sku: 'BOSCH-SP-FR78X', price: 950 },
        ],
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        codAmountToCollect: 0,
        codAmountCollected: 0,
        codStatus: 'NOT_APPLICABLE',
        deliveryFee: 120,
        distanceKm: 6.4,
        navigationInfo: {
          currentDistance: '2.1 km away',
          etaMinutes: 8,
          routeSummary: 'Via Marathahalli - Sarjapur Outer Ring Rd',
        },
        notes: 'Express order. Customer requested gate call on arrival.',
        assignedAt: new Date(Date.now() - 3600000 * 2),
        acceptedAt: new Date(Date.now() - 3600000 * 1.8),
        pickedUpAt: new Date(Date.now() - 3600000 * 0.8),
        deliveredAt: null,
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 0.8),
      },
      {
        id: 'assign-102',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        usedPartListingId: null,
        deliveryPartnerId: null, // Broadcast unassigned job available for any partner
        type: 'CUSTOMER_DELIVERY',
        status: 'ASSIGNED',
        pickupLocation: {
          name: 'Apex Auto Care (Partner Shop)',
          address: '88, 100 Feet Road, Indiranagar, Bengaluru - 560038',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Rajesh Verma',
          phone: '+91 98450 12345',
        },
        dropLocation: {
          name: 'Priya Nair',
          address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru - 560066',
          lat: 12.9698,
          lng: 77.7499,
          contactPerson: 'Priya Nair',
          phone: '+91 98765 12345',
        },
        items: [
          { title: 'Amaron Pro DIN55 Automotive Battery', quantity: 1, sku: 'AMARON-PRO-DIN55', price: 4200 },
        ],
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        codAmountToCollect: 4850,
        codAmountCollected: 0,
        codStatus: 'PENDING',
        deliveryFee: 180,
        distanceKm: 12.2,
        navigationInfo: {
          currentDistance: '12.2 km away',
          etaMinutes: 28,
          routeSummary: 'Via HAL Old Airport Rd to Whitefield Main Rd',
        },
        notes: 'Fragile battery package, keep upright. Collect COD cash ₹4,850.',
        assignedAt: new Date(Date.now() - 1800000),
        acceptedAt: null,
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date(Date.now() - 1800000),
      },
      {
        id: 'assign-103',
        orderId: null,
        orderNumber: 'PN-UP-70192',
        usedPartListingId: 'used_demo_5',
        deliveryPartnerId: 'partner-1',
        type: 'USED_PART_PICKUP',
        status: 'ASSIGNED',
        pickupLocation: {
          name: 'Seller: Deepak Patel',
          address: 'Whitefield, Bengaluru, Karnataka - 560066',
          lat: 12.9698,
          lng: 77.7499,
          contactPerson: 'Deepak Patel',
          phone: '+91 99112 33445',
        },
        dropLocation: {
          name: 'Apex Auto Care (Hub Intake)',
          address: '88, 100 Feet Road, Indiranagar, Bengaluru - 560038',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Rajesh Verma',
          phone: '+91 98450 12345',
        },
        items: [
          {
            title: 'Rear Combination Tail Lamp Set (LED)',
            quantity: 1,
            expectedPrice: 2600,
            estimatedValuation: 2300,
            condition: 'LIKE_NEW',
          },
        ],
        paymentMethod: null,
        paymentStatus: null,
        codAmountToCollect: 0,
        codAmountCollected: 0,
        codStatus: 'NOT_APPLICABLE',
        deliveryFee: 150,
        distanceKm: 11.5,
        navigationInfo: {
          currentDistance: '8.4 km away',
          etaMinutes: 22,
          routeSummary: 'Via Varthur Main Rd',
        },
        notes: 'Doorstep Used-Part Inspection required. Verify physical condition, mounting tabs, and LED circuit.',
        assignedAt: new Date(Date.now() - 3600000 * 3),
        acceptedAt: new Date(Date.now() - 3600000 * 2.5),
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 2.5),
      },
      {
        id: 'assign-104',
        orderId: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        usedPartListingId: null,
        deliveryPartnerId: 'partner-1',
        type: 'CUSTOMER_DELIVERY',
        status: 'DELIVERED',
        pickupLocation: {
          name: 'Apex Auto Care',
          address: '88, 100 Feet Road, Indiranagar',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Rajesh Verma',
          phone: '+91 98450 12345',
        },
        dropLocation: {
          name: 'Sunil Mehta',
          address: '12th Main Road, Indiranagar, Bengaluru',
          lat: 12.9720,
          lng: 77.6420,
          contactPerson: 'Sunil Mehta',
          phone: '+91 99001 88221',
        },
        items: [
          { title: 'Motul 7100 4T 10W-50 Fully Synthetic Engine Oil', quantity: 1, sku: 'MOTUL-7100-10W50', price: 1850 },
        ],
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PAID',
        codAmountToCollect: 1850,
        codAmountCollected: 1850,
        codStatus: 'COLLECTED', // Cash collected by partner, pending hub reconciliation
        deliveryFee: 90,
        distanceKm: 1.8,
        navigationInfo: {
          currentDistance: 'Delivered',
          etaMinutes: 0,
          routeSummary: 'Completed trip',
        },
        notes: 'Delivered successfully and collected cash ₹1,850.',
        assignedAt: new Date(Date.now() - 86400000),
        acceptedAt: new Date(Date.now() - 86400000 + 600000),
        pickedUpAt: new Date(Date.now() - 86400000 + 1800000),
        deliveredAt: new Date(Date.now() - 86400000 + 3600000),
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000 + 3600000),
      },
    ];

    this.codReconciliations = [
      {
        id: 'recon-1',
        reconciliationNumber: 'COD-REC-892101',
        deliveryPartnerId: 'partner-1',
        totalAmount: 3400,
        orderCount: 2,
        status: 'RECONCILED',
        depositMethod: 'CASH_AT_HUB',
        depositReference: 'HUB-DEP-44912',
        hubLocation: 'Indiranagar Central Logistics Hub',
        receivedBy: 'Gopal Krishna (Finance Desk)',
        notes: 'Previous cycle batch reconciliation cleared and receipt generated.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  private seedOrdersData() {
    this.orders = [
      {
        id: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        userId: 'demo-user-1',
        addressId: 'addr-demo-home',
        status: 'IN_TRANSIT',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        subtotal: 950,
        deliveryFee: 120,
        discount: 0,
        installationFee: 350,
        homeVisitSurcharge: 0,
        total: 1420,
        couponCode: null,
        notes: 'Express order. Customer requested gate call on arrival.',
        difmType: 'SHOP_VISIT',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 0.8),
      },
      {
        id: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        userId: 'demo-user-1',
        addressId: 'addr-demo-work',
        status: 'PROCESSING',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        subtotal: 4200,
        deliveryFee: 180,
        discount: 0,
        installationFee: 500,
        homeVisitSurcharge: 150,
        total: 5030,
        couponCode: null,
        notes: 'Fragile battery package, keep upright. Collect COD cash ₹5,030.',
        difmType: 'HOME_INSTALLATION',
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'ord-seed-103',
        orderNumber: 'PN-2026-90350',
        userId: 'demo-user-1',
        addressId: 'addr-demo-home',
        status: 'DELIVERED',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        subtotal: 1850,
        deliveryFee: 0,
        discount: 0,
        installationFee: 750,
        homeVisitSurcharge: 0,
        total: 2600,
        couponCode: null,
        notes: 'DIFM Brake pad replacement completed.',
        difmType: 'SHOP_VISIT',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        userId: 'demo-user-1',
        addressId: 'addr-demo-work',
        status: 'DELIVERED',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PAID',
        subtotal: 1850,
        deliveryFee: 90,
        discount: 0,
        installationFee: 0,
        homeVisitSurcharge: 0,
        total: 1940,
        couponCode: null,
        notes: 'Delivered successfully.',
        difmType: 'NO_INSTALLATION',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000 + 3600000),
      },
    ];

    // Seed corresponding orderItems
    this.orderItems.push(
      {
        id: 'item-101',
        orderId: 'ord-seed-101',
        productId: 'prod-001',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 950,
        totalPrice: 950,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: 'item-102',
        orderId: 'ord-seed-102',
        productId: 'prod-002',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200,
        createdAt: new Date(Date.now() - 3600000 * 8),
      },
      {
        id: 'item-103',
        orderId: 'ord-seed-103',
        productId: 'prod-003',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 1850,
        totalPrice: 1850,
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'item-104',
        orderId: 'ord-seed-104',
        productId: 'prod-004',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 1850,
        totalPrice: 1850,
        createdAt: new Date(Date.now() - 86400000),
      }
    );

    // Seed corresponding DIFM requests
    this.difmRequests.push(
      {
        id: 'difm-seed-101',
        orderId: 'ord-seed-101',
        shopId: 'shop-1',
        type: 'SHOP_VISIT',
        status: 'SCHEDULED',
        installationFee: 350,
        homeVisitSurcharge: 0,
        preferredDate: new Date(),
        scheduledDate: new Date(),
        notes: 'Bosch spark plug installation appointment.',
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 'difm-seed-102',
        orderId: 'ord-seed-102',
        shopId: 'shop-1',
        type: 'HOME_INSTALLATION',
        status: 'IN_PROGRESS',
        installationFee: 500,
        homeVisitSurcharge: 150,
        preferredDate: new Date(),
        scheduledDate: new Date(),
        notes: 'Doorstep battery installation.',
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'difm-seed-103',
        orderId: 'ord-seed-103',
        shopId: 'shop-1',
        type: 'SHOP_VISIT',
        status: 'COMPLETED',
        installationFee: 750,
        homeVisitSurcharge: 0,
        preferredDate: new Date(Date.now() - 86400000),
        scheduledDate: new Date(Date.now() - 86400000),
        notes: 'Front brake replacement completed.',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      }
    );
  }

  private seedSupportTicketsData() {
    this.supportTickets = [
      {
        id: 'tkt-cust-101',
        ticketNumber: 'TKT-2026-1001',
        userId: 'demo-user-1',
        userName: 'Aarav Sharma',
        userEmail: 'demo@partsphere.in',
        userRole: 'CUSTOMER',
        category: 'ORDER_ISSUE',
        subject: 'Fitment inquiry for Bosch spark plugs on Swift 2022',
        priority: 'MEDIUM',
        slaHours: 24,
        slaDeadline: new Date(Date.now() + 24 * 3600000),
        assignedAdminId: 'admin-user-1',
        assignedAdminName: 'Super Admin',
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        messages: [
          {
            id: 'msg-cust-1',
            senderId: 'demo-user-1',
            senderName: 'Aarav Sharma',
            senderRole: 'CUSTOMER',
            message: 'Hello, I ordered Bosch Super 4 Spark Plugs. Can the technician bring gapping tools during home installation?',
            createdAt: new Date(Date.now() - 3600000 * 4),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 4),
        updatedAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        id: 'tkt-shop-101',
        ticketNumber: 'TKT-2026-1002',
        userId: 'shop-owner-1',
        userName: 'Rajesh Verma',
        userEmail: 'apex.auto@partsphare.test',
        userRole: 'SHOP_OWNER',
        category: 'COMMISSION_PAYOUT',
        subject: 'Weekly commission settlement reference request',
        priority: 'HIGH',
        slaHours: 6,
        slaDeadline: new Date(Date.now() + 6 * 3600000),
        assignedAdminId: 'admin-user-1',
        assignedAdminName: 'Super Admin',
        status: 'IN_PROGRESS',
        resolutionNotes: null,
        resolvedAt: null,
        messages: [
          {
            id: 'msg-shop-1',
            senderId: 'shop-owner-1',
            senderName: 'Rajesh Verma',
            senderRole: 'SHOP_OWNER',
            message: 'Our completed DIFM batch from yesterday has 3 orders. When will the direct bank deposit be processed?',
            createdAt: new Date(Date.now() - 3600000 * 3),
          },
          {
            id: 'msg-shop-2',
            senderId: 'admin-user-1',
            senderName: 'Super Admin',
            senderRole: 'ADMIN',
            message: 'Hi Rajesh, the payout batch PO-APX-500588 has been queued for automated settlement tonight.',
            createdAt: new Date(Date.now() - 3600000 * 1),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'tkt-rider-101',
        ticketNumber: 'TKT-2026-1003',
        userId: 'rider-user-1',
        userName: 'Vikram Singh',
        userEmail: 'rider.vikram@partsphare.test',
        userRole: 'DELIVERY_PARTNER',
        category: 'DELIVERY_DELAY',
        subject: 'Gated community security passcode verification',
        priority: 'URGENT',
        slaHours: 2,
        slaDeadline: new Date(Date.now() + 2 * 3600000),
        assignedAdminId: null,
        assignedAdminName: null,
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        messages: [
          {
            id: 'msg-rider-1',
            senderId: 'rider-user-1',
            senderName: 'Vikram Singh',
            senderRole: 'DELIVERY_PARTNER',
            message: 'Gate security at Palm Meadows requires approval code for battery delivery. Customer not answering intercom.',
            createdAt: new Date(Date.now() - 3600000 * 0.5),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 0.5),
        updatedAt: new Date(Date.now() - 3600000 * 0.5),
      },
      {
        id: 'tkt-cust-102',
        ticketNumber: 'TKT-2026-1004',
        userId: 'demo-user-1',
        userName: 'Priya Patel',
        userEmail: 'priya.patel@example.com',
        userRole: 'CUSTOMER',
        category: 'USED_PART_VALUATION',
        subject: 'Used Alternator pickup inspection confirmation',
        priority: 'LOW',
        slaHours: 48,
        slaDeadline: new Date(Date.now() - 3600000 * 2),
        assignedAdminId: 'admin-user-1',
        assignedAdminName: 'Super Admin',
        status: 'RESOLVED',
        resolutionNotes: 'Technician verified item condition as Grade A. Payout ₹2,080 approved.',
        resolvedAt: new Date(Date.now() - 3600000 * 12),
        messages: [
          {
            id: 'msg-cust-2',
            senderId: 'demo-user-1',
            senderName: 'Priya Patel',
            senderRole: 'CUSTOMER',
            message: 'Listing used_demo_5 was inspected this morning. When will my UPI payout reflect?',
            createdAt: new Date(Date.now() - 3600000 * 24),
          },
          {
            id: 'msg-admin-2',
            senderId: 'admin-user-1',
            senderName: 'Super Admin',
            senderRole: 'ADMIN',
            message: 'Inspection Grade A has been verified and UPI transfer of ₹2,080 initiated.',
            createdAt: new Date(Date.now() - 3600000 * 12),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 24),
        updatedAt: new Date(Date.now() - 3600000 * 12),
      },
    ];
  }

  private seedProcurementData() {
    this.suppliers = [
      {
        id: 'sup-bosch',
        name: 'Bosch Automotive Aftermarket Hub',
        slug: 'bosch-india-hub',
        contactPerson: 'Rajesh Sharma',
        email: 'procurement@bosch-demo.in',
        phone: '+91 80 6657 1111',
        address: 'Hosur Road, Adugodi',
        city: 'Bengaluru',
        state: 'Karnataka',
        gstNumber: '29AABCB1234F1Z8',
        supplierType: 'MANUFACTURER',
        logoUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=200',
        categories: ['Brake System', 'Engine Components', 'Electrical', 'Filters', 'Sensors'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-exide',
        name: 'Exide Industries National Hub',
        slug: 'exide-power-hub',
        contactPerson: 'Amitava Banerjee',
        email: 'orders@exide-demo.in',
        phone: '+91 33 2283 2121',
        address: '59E Chowringhee Road',
        city: 'Kolkata',
        state: 'West Bengal',
        gstNumber: '19AAACE4567G1Z2',
        supplierType: 'MANUFACTURER',
        logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
        categories: ['Battery', 'Electrical'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-brembo',
        name: 'Brembo Brake Systems India',
        slug: 'brembo-india-hub',
        contactPerson: 'Marco Moretti',
        email: 'b2b@brembo-demo.in',
        phone: '+91 20 6712 3456',
        address: 'Chakan Industrial Area Phase II',
        city: 'Pune',
        state: 'Maharashtra',
        gstNumber: '27AABCB9876H1Z5',
        supplierType: 'MANUFACTURER',
        logoUrl: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=200',
        categories: ['Brake System'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-unominda',
        name: 'Uno Minda Distribution Depot',
        slug: 'uno-minda-distributor',
        contactPerson: 'Sandeep Chawla',
        email: 'bulk@unominda-demo.in',
        phone: '+91 124 229 0011',
        address: 'Sector 37, Pace City I',
        city: 'Gurugram',
        state: 'Haryana',
        gstNumber: '06AAACU3344J1Z9',
        supplierType: 'OEM_SUPPLIER',
        logoUrl: null,
        categories: ['Electrical', 'Lighting', 'Sensors', 'Accessories'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-lumax',
        name: 'Lumax Industries Automotive Lighting',
        slug: 'lumax-auto-hub',
        contactPerson: 'Deepak Jain',
        email: 'supply@lumax-demo.in',
        phone: '+91 11 4985 7000',
        address: 'Okhla Industrial Area Phase III',
        city: 'New Delhi',
        state: 'Delhi',
        gstNumber: '07AAACL5566K1Z1',
        supplierType: 'MANUFACTURER',
        logoUrl: null,
        categories: ['Lighting', 'Electrical', 'Body Parts'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-amaron',
        name: 'Amaron Amara Raja Energy Hub',
        slug: 'amaron-amara-raja',
        contactPerson: 'S. Ramakrishna',
        email: 'institutional@amaron-demo.in',
        phone: '+91 40 2313 9000',
        address: 'Hitech City, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        gstNumber: '36AAACA1122L1Z3',
        supplierType: 'MANUFACTURER',
        logoUrl: null,
        categories: ['Battery', 'Electrical'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-castrol',
        name: 'Castrol India Industrial & Fleet Supply',
        slug: 'castrol-india-fleet',
        contactPerson: 'Kedar Joshi',
        email: 'bulkorder@castrol-demo.in',
        phone: '+91 22 6698 4100',
        address: 'Techniplex I, Goregaon West',
        city: 'Mumbai',
        state: 'Maharashtra',
        gstNumber: '27AAACC2233M1Z4',
        supplierType: 'MANUFACTURER',
        logoUrl: null,
        categories: ['Lubricants', 'Cooling System'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-zf',
        name: 'ZF Aftermarket & TRW India Hub',
        slug: 'zf-aftermarket-india',
        contactPerson: 'Venkatesh R',
        email: 'orders@zf-demo.in',
        phone: '+91 44 2624 8800',
        address: 'Ambattur Industrial Estate',
        city: 'Chennai',
        state: 'Tamil Nadu',
        gstNumber: '33AAACZ7788N1Z7',
        supplierType: 'DISTRIBUTOR',
        logoUrl: null,
        categories: ['Steering', 'Suspension', 'Clutch & Transmission'],
        supportedVehicles: ['4 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-valeo',
        name: 'Valeo Automotive India Central',
        slug: 'valeo-india-supply',
        contactPerson: 'Prakash Sundaram',
        email: 'sales@valeo-demo.in',
        phone: '+91 44 4710 5000',
        address: 'Vallam Vadagal SIPCOT Industrial Park',
        city: 'Chennai',
        state: 'Tamil Nadu',
        gstNumber: '33AAACV9900P1Z6',
        supplierType: 'OEM_SUPPLIER',
        logoUrl: null,
        categories: ['Clutch & Transmission', 'Cooling System', 'Lighting', 'Electrical'],
        supportedVehicles: ['4 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-denso',
        name: 'Denso India Components',
        slug: 'denso-india-supply',
        contactPerson: 'Rakesh Verma',
        email: 'b2b@denso-demo.in',
        phone: '+91 120 256 7000',
        address: 'Surajpur Industrial Area',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        gstNumber: '09AAACD4455Q1Z8',
        supplierType: 'MANUFACTURER',
        logoUrl: null,
        categories: ['Sensors', 'Engine Components', 'Electrical', 'Cooling System'],
        supportedVehicles: ['4 Wheeler', '2 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-tatamotors',
        name: 'Tata Motors Genuine Spare Parts Depot',
        slug: 'tata-motors-oem-hub',
        contactPerson: 'Milind Kulkarni',
        email: 'oemparts@tatamotors-demo.in',
        phone: '+91 20 6613 1111',
        address: 'Pimpri Logistics Hub',
        city: 'Pune',
        state: 'Maharashtra',
        gstNumber: '27AAACT0011R1Z2',
        supplierType: 'OEM',
        logoUrl: null,
        categories: ['Engine Components', 'Body Parts', 'Suspension', 'Brake System', 'Filters'],
        supportedVehicles: ['4 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'sup-marutisuzuki',
        name: 'Maruti Suzuki Genuine Spares Regional',
        slug: 'maruti-suzuki-genuine-hub',
        contactPerson: 'Harish Singhal',
        email: 'genuine@maruti-demo.in',
        phone: '+91 124 439 2000',
        address: 'IMT Manesar Central Warehouse',
        city: 'Gurugram',
        state: 'Haryana',
        gstNumber: '06AAACM8899S1Z5',
        supplierType: 'OEM',
        logoUrl: null,
        categories: ['Engine Components', 'Body Parts', 'Suspension', 'Brake System', 'Electrical'],
        supportedVehicles: ['4 Wheeler'],
        verificationStatus: 'VERIFIED',
        isDemo: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    const catalogDefs = [
      {
        id: 'cat-item-bosch-bp-nexon',
        supplierId: 'sup-bosch',
        productId: 'prod-bosch-brake-nexon',
        partName: 'Bosch Front Ceramic Brake Pad Set',
        partNumber: 'BP-TN-204',
        categoryName: 'Brake System',
        brandName: 'Bosch',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 2100.0,
        bulkPrice: 1750.0,
        moq: 10,
        stockQuantity: 500,
        leadTime: '3–5 days',
        leadTimeDays: 3,
        warranty: '12 Months / 20,000 km Warranty',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=600',
        tiers: [
          { minQuantity: 1, maxQuantity: 9, unitPrice: 2100.0, discountPercent: 0 },
          { minQuantity: 10, maxQuantity: 49, unitPrice: 1900.0, discountPercent: 9.52 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 1750.0, discountPercent: 16.67 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 1600.0, discountPercent: 23.81 },
        ],
      },
      {
        id: 'cat-item-brembo-bp-nexon',
        supplierId: 'sup-brembo',
        productId: null,
        partName: 'Brembo Premium Disc Brake Pads (Front)',
        partNumber: 'BRM-P83024N',
        categoryName: 'Brake System',
        brandName: 'Brembo',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 2650.0,
        bulkPrice: 2150.0,
        moq: 10,
        stockQuantity: 320,
        leadTime: '2–4 days',
        leadTimeDays: 2,
        warranty: '18 Months Brembo Warranty',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600',
        tiers: [
          { minQuantity: 1, maxQuantity: 9, unitPrice: 2650.0, discountPercent: 0 },
          { minQuantity: 10, maxQuantity: 49, unitPrice: 2350.0, discountPercent: 11.32 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 2150.0, discountPercent: 18.87 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 1950.0, discountPercent: 26.42 },
        ],
      },
      {
        id: 'cat-item-tata-caliper-nexon',
        supplierId: 'sup-tatamotors',
        productId: null,
        partName: 'Tata Motors Genuine Front Brake Caliper Assembly',
        partNumber: 'TM-NEX-BC-09',
        categoryName: 'Brake System',
        brandName: 'Tata Motors Genuine',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 4200.0,
        bulkPrice: 3500.0,
        moq: 5,
        stockQuantity: 150,
        leadTime: '4–6 days',
        leadTimeDays: 4,
        warranty: '24 Months OEM Factory Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 4, unitPrice: 4200.0, discountPercent: 0 },
          { minQuantity: 5, maxQuantity: 19, unitPrice: 3800.0, discountPercent: 9.52 },
          { minQuantity: 20, maxQuantity: null, unitPrice: 3500.0, discountPercent: 16.67 },
        ],
      },
      {
        id: 'cat-item-bosch-shoe-swift',
        supplierId: 'sup-bosch',
        productId: null,
        partName: 'Bosch High-Performance Brake Shoe Set (Rear)',
        partNumber: 'BS-MS-SW01',
        categoryName: 'Brake System',
        brandName: 'Bosch',
        vehicleMakeId: 'make-maruti',
        vehicleMakeName: 'Maruti Suzuki',
        vehicleModelId: 'model-swift',
        vehicleModelName: 'Swift',
        variantName: 'VXi 1.2L',
        year: 2022,
        condition: 'GENUINE_NEW',
        unitPrice: 1250.0,
        bulkPrice: 980.0,
        moq: 15,
        stockQuantity: 400,
        leadTime: '3–5 days',
        leadTimeDays: 3,
        warranty: '12 Months Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 14, unitPrice: 1250.0, discountPercent: 0 },
          { minQuantity: 15, maxQuantity: 49, unitPrice: 1100.0, discountPercent: 12.0 },
          { minQuantity: 50, maxQuantity: null, unitPrice: 980.0, discountPercent: 21.6 },
        ],
      },
      {
        id: 'cat-item-exide-battery-nexon',
        supplierId: 'sup-exide',
        productId: null,
        partName: 'Exide Epiq 12V 45Ah Maintenance-Free Car Battery',
        partNumber: 'EX-EP-45L',
        categoryName: 'Battery',
        brandName: 'Exide',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 5600.0,
        bulkPrice: 4750.0,
        moq: 5,
        stockQuantity: 250,
        leadTime: '2–3 days',
        leadTimeDays: 2,
        warranty: '66 Months (36F + 30P) Pro-Rata',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        tiers: [
          { minQuantity: 1, maxQuantity: 4, unitPrice: 5600.0, discountPercent: 0 },
          { minQuantity: 5, maxQuantity: 19, unitPrice: 5100.0, discountPercent: 8.93 },
          { minQuantity: 20, maxQuantity: null, unitPrice: 4750.0, discountPercent: 15.18 },
        ],
      },
      {
        id: 'cat-item-amaron-battery-swift',
        supplierId: 'sup-amaron',
        productId: null,
        partName: 'Amaron FLO 42B20L High Cranking Automotive Battery',
        partNumber: 'AM-FLO-42B',
        categoryName: 'Battery',
        brandName: 'Amaron',
        vehicleMakeId: 'make-maruti',
        vehicleMakeName: 'Maruti Suzuki',
        vehicleModelId: 'model-swift',
        vehicleModelName: 'Swift',
        variantName: 'VXi 1.2L',
        year: 2022,
        condition: 'GENUINE_NEW',
        unitPrice: 4900.0,
        bulkPrice: 4200.0,
        moq: 5,
        stockQuantity: 280,
        leadTime: '2–4 days',
        leadTimeDays: 2,
        warranty: '55 Months Replacement Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 4, unitPrice: 4900.0, discountPercent: 0 },
          { minQuantity: 5, maxQuantity: 19, unitPrice: 4500.0, discountPercent: 8.16 },
          { minQuantity: 20, maxQuantity: null, unitPrice: 4200.0, discountPercent: 14.29 },
        ],
      },
      {
        id: 'cat-item-lumax-headlamp-nexon',
        supplierId: 'sup-lumax',
        productId: null,
        partName: 'Lumax Bi-Function Projector Headlamp Assembly (Right)',
        partNumber: 'LX-HL-NEX-R',
        categoryName: 'Lighting',
        brandName: 'Lumax',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 6800.0,
        bulkPrice: 5600.0,
        moq: 4,
        stockQuantity: 120,
        leadTime: '3–6 days',
        leadTimeDays: 4,
        warranty: '12 Months Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 3, unitPrice: 6800.0, discountPercent: 0 },
          { minQuantity: 4, maxQuantity: 9, unitPrice: 6100.0, discountPercent: 10.29 },
          { minQuantity: 10, maxQuantity: null, unitPrice: 5600.0, discountPercent: 17.65 },
        ],
      },
      {
        id: 'cat-item-unominda-alternator-nexon',
        supplierId: 'sup-unominda',
        productId: null,
        partName: 'Uno Minda Heavy-Duty Alternator Assembly 12V 90A',
        partNumber: 'UM-ALT-NEX-90',
        categoryName: 'Electrical',
        brandName: 'Uno Minda',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 7900.0,
        bulkPrice: 6500.0,
        moq: 3,
        stockQuantity: 90,
        leadTime: '4–7 days',
        leadTimeDays: 5,
        warranty: '24 Months Replacement Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 2, unitPrice: 7900.0, discountPercent: 0 },
          { minQuantity: 3, maxQuantity: 9, unitPrice: 7100.0, discountPercent: 10.13 },
          { minQuantity: 10, maxQuantity: null, unitPrice: 6500.0, discountPercent: 17.72 },
        ],
      },
      {
        id: 'cat-item-castrol-oil',
        supplierId: 'sup-castrol',
        productId: null,
        partName: 'Castrol Magnatec 5W-30 Full Synthetic Engine Oil (3.5L)',
        partNumber: 'CAS-MAG-5W30',
        categoryName: 'Lubricants',
        brandName: 'Castrol',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 1850.0,
        bulkPrice: 1450.0,
        moq: 12,
        stockQuantity: 600,
        leadTime: '2–3 days',
        leadTimeDays: 2,
        warranty: 'Tamper-Proof Hologram Seal',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 11, unitPrice: 1850.0, discountPercent: 0 },
          { minQuantity: 12, maxQuantity: 47, unitPrice: 1600.0, discountPercent: 13.51 },
          { minQuantity: 48, maxQuantity: null, unitPrice: 1450.0, discountPercent: 21.62 },
        ],
      },
      {
        id: 'cat-item-valeo-clutch-nexon',
        supplierId: 'sup-valeo',
        productId: null,
        partName: 'Valeo Dual-Friction Clutch Kit with Release Bearing',
        partNumber: 'VAL-CLK-NEX-01',
        categoryName: 'Clutch & Transmission',
        brandName: 'Valeo',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 5400.0,
        bulkPrice: 4400.0,
        moq: 5,
        stockQuantity: 110,
        leadTime: '3–5 days',
        leadTimeDays: 3,
        warranty: '12 Months Factory Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 4, unitPrice: 5400.0, discountPercent: 0 },
          { minQuantity: 5, maxQuantity: 19, unitPrice: 4800.0, discountPercent: 11.11 },
          { minQuantity: 20, maxQuantity: null, unitPrice: 4400.0, discountPercent: 18.52 },
        ],
      },
      {
        id: 'cat-item-denso-sensor-nexon',
        supplierId: 'sup-denso',
        productId: null,
        partName: 'Denso Direct-Fit Heated Oxygen Sensor (Upstream)',
        partNumber: 'DEN-O2-NEX-01',
        categoryName: 'Sensors',
        brandName: 'Denso',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 3100.0,
        bulkPrice: 2500.0,
        moq: 8,
        stockQuantity: 190,
        leadTime: '3–5 days',
        leadTimeDays: 3,
        warranty: '12 Months Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 7, unitPrice: 3100.0, discountPercent: 0 },
          { minQuantity: 8, maxQuantity: 24, unitPrice: 2750.0, discountPercent: 11.29 },
          { minQuantity: 25, maxQuantity: null, unitPrice: 2500.0, discountPercent: 19.35 },
        ],
      },
      {
        id: 'cat-item-zf-suspension-nexon',
        supplierId: 'sup-zf',
        productId: null,
        partName: 'ZF TRW Heavy-Duty Lower Control Arm Assembly (Left)',
        partNumber: 'ZF-TRW-LCA-01',
        categoryName: 'Suspension',
        brandName: 'ZF',
        vehicleMakeId: 'make-tata',
        vehicleMakeName: 'Tata',
        vehicleModelId: 'model-nexon',
        vehicleModelName: 'Nexon',
        variantName: 'XZ 1.2 Petrol',
        year: 2023,
        condition: 'GENUINE_NEW',
        unitPrice: 3800.0,
        bulkPrice: 3100.0,
        moq: 6,
        stockQuantity: 140,
        leadTime: '4–6 days',
        leadTimeDays: 4,
        warranty: '18 Months Warranty',
        isAvailable: true,
        imageUrl: null,
        tiers: [
          { minQuantity: 1, maxQuantity: 5, unitPrice: 3800.0, discountPercent: 0 },
          { minQuantity: 6, maxQuantity: 19, unitPrice: 3450.0, discountPercent: 9.21 },
          { minQuantity: 20, maxQuantity: null, unitPrice: 3100.0, discountPercent: 18.42 },
        ],
      },
    ];

    for (const c of catalogDefs) {
      const { tiers, ...itemData } = c;
      this.supplierCatalogItems.push({
        ...itemData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      for (const t of tiers) {
        this.bulkPriceTiers.push({
          id: 'tier-' + Math.random().toString(36).substring(2, 9),
          catalogItemId: itemData.id,
          minQuantity: t.minQuantity,
          maxQuantity: t.maxQuantity,
          unitPrice: t.unitPrice,
          discountPercent: t.discountPercent,
          createdAt: new Date('2024-01-01'),
        });
      }
    }
  }


  // --- USER ---
  public user = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.users.filter((u) => {
        if (where?.role && u.role !== where.role) return false;
        if (where?.status && u.status !== where.status) return false;
        return true;
      });
      return list;
    },
    findUnique: async ({ where, select }: { where: { email?: string; id?: string; phone?: string }; select?: any }) => {
      const u = this.users.find(
        (usr) => (where.email && usr.email.toLowerCase() === where.email.toLowerCase()) || 
                 (where.id && usr.id === where.id) ||
                 (where.phone && usr.phone === where.phone)
      );
      if (!u) return null;
      const countVehicles = this.customerVehicles.filter((v) => v.userId === u.id).length;
      const linkedShop = this.shops.find((s) => s.ownerId === u.id) || (u.role === 'SHOP_OWNER' ? this.shops[0] : null);
      const deliveryPartner = this.deliveryPartners.find((dp) => dp.userId === u.id) || (u.role === 'DELIVERY_PARTNER' ? this.deliveryPartners[0] : null);
      const kyc = this.kycRecords.find((k) => k.userId === u.id) || null;
      return {
        ...u,
        shop: linkedShop,
        deliveryPartner,
        kyc,
        _count: { orders: 0, customerVehicles: countVehicles },
      };
    },
    findFirst: async ({ where, select }: { where?: any; select?: any } = {}) => {
      const u = this.users.find((usr) => {
        if (where?.id && usr.id !== where.id) return false;
        if (where?.email && usr.email.toLowerCase() !== where.email.toLowerCase()) return false;
        if (where?.phone && usr.phone !== where.phone) return false;
        if (where?.role && usr.role !== where.role) return false;
        if (where?.status && usr.status !== where.status) return false;
        return true;
      });
      if (!u) return null;
      return u;
    },
    create: async ({ data }: { data: any }) => {
      const newUser = {
        id: crypto.randomUUID(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        avatar: null,
        role: data.role || 'CUSTOMER',
        status: data.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(newUser);
      return newUser;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.users.findIndex((u) => u.id === where.id);
      if (idx === -1) return null;
      this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
      return this.users[idx];
    },
  };

  // --- CART ---
  private populateCart(cart: any) {
    const items = this.cartItems
      .filter((it) => it.cartId === cart.id)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .map((item) => {
        const p = initialProducts.find((prod) => prod.id === item.productId);
        const product = p ? this.populateProduct(p) : null;
        const s = this.shops.find((shp) => shp.id === item.shopId) || initialShops[0];
        const inv = this.inventories.find(
          (i) => i.productId === item.productId && i.shopId === item.shopId
        ) || this.inventories.find((i) => i.productId === item.productId);

        const fallbackPrice = inv?.sellingPrice ? Number(inv.sellingPrice) : (p?.basePrice ? Number(p.basePrice) : (p?.mrp ? Number(p.mrp) : 0));
        const resolvedPrice = (item.priceSnapshot !== undefined && item.priceSnapshot !== null && !isNaN(Number(item.priceSnapshot)) && Number(item.priceSnapshot) > 0)
          ? Number(item.priceSnapshot)
          : fallbackPrice;

        return {
          ...item,
          priceSnapshot: resolvedPrice,
          maxStock: inv ? inv.quantity : 0,
          isAvailable: inv ? inv.isAvailable && inv.quantity > 0 : false,
          product,
          shop: s
            ? { id: s.id, name: s.name, city: s.city, isVerified: s.isVerified, rating: s.rating }
            : null,
        };
      });

    return {
      ...cart,
      items,
    };
  }

  public cart = {
    findUnique: async ({
      where,
      include,
    }: {
      where: { userId?: string; id?: string };
      include?: any;
    }) => {
      const c = this.carts.find(
        (ct) => (where.userId && ct.userId === where.userId) || (where.id && ct.id === where.id)
      );
      if (!c) return null;
      return this.populateCart(c);
    },
    findFirst: async ({
      where,
      include,
    }: {
      where: { userId?: string; id?: string };
      include?: any;
    }) => {
      const c = this.carts.find(
        (ct) => (where.userId && ct.userId === where.userId) || (where.id && ct.id === where.id)
      );
      if (!c) return null;
      return this.populateCart(c);
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const newCart = {
        id: crypto.randomUUID(),
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.push(newCart);
      return this.populateCart(newCart);
    },
    update: async ({ where, data }: { where: { id?: string; userId?: string }; data: any }) => {
      const idx = this.carts.findIndex(
        (ct) => (where.userId && ct.userId === where.userId) || (where.id && ct.id === where.id)
      );
      if (idx === -1) return null;
      this.carts[idx] = { ...this.carts[idx], ...data, updatedAt: new Date() };
      return this.populateCart(this.carts[idx]);
    },
  };

  // --- CART ITEM ---
  public cartItem = {
    findUnique: async ({
      where,
      include,
    }: {
      where: {
        id?: string;
        cartId_productId_shopId?: { cartId: string; productId: string; shopId: string };
      };
      include?: any;
    }) => {
      const item = this.cartItems.find(
        (it) =>
          (where.id && it.id === where.id) ||
          (where.cartId_productId_shopId &&
            it.cartId === where.cartId_productId_shopId.cartId &&
            it.productId === where.cartId_productId_shopId.productId &&
            it.shopId === where.cartId_productId_shopId.shopId)
      );
      return item ? { ...item, priceSnapshot: Number(item.priceSnapshot) } : null;
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const item = this.cartItems.find(
        (it) =>
          (!where.id || it.id === where.id) &&
          (!where.cartId || it.cartId === where.cartId) &&
          (!where.productId || it.productId === where.productId) &&
          (!where.shopId || it.shopId === where.shopId)
      );
      return item ? { ...item, priceSnapshot: Number(item.priceSnapshot) } : null;
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.cartItems.filter(
        (it) =>
          (!where?.cartId || it.cartId === where.cartId) &&
          (!where?.productId || it.productId === where.productId)
      );
      return list.map((it) => ({ ...it, priceSnapshot: Number(it.priceSnapshot) }));
    },
    create: async ({ data }: { data: any }) => {
      const inv = this.inventories.find(
        (i) => i.productId === data.productId && i.shopId === data.shopId
      ) || this.inventories.find((i) => i.productId === data.productId);
      const p = initialProducts.find((prod) => prod.id === data.productId);
      const fallbackPrice = inv?.sellingPrice ? Number(inv.sellingPrice) : (p?.basePrice ? Number(p.basePrice) : 0);
      const resolvedPrice = (data.priceSnapshot !== undefined && data.priceSnapshot !== null && !isNaN(Number(data.priceSnapshot)) && Number(data.priceSnapshot) > 0)
        ? Number(data.priceSnapshot)
        : fallbackPrice;

      const newItem = {
        id: crypto.randomUUID(),
        cartId: data.cartId,
        productId: data.productId,
        shopId: data.shopId,
        quantity: Math.max(1, Number(data.quantity) || 1),
        priceSnapshot: resolvedPrice,
        addedAt: new Date(),
      };
      this.cartItems.push(newItem);
      return { ...newItem };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.cartItems.findIndex((it) => it.id === where.id);
      if (idx === -1) return null;
      this.cartItems[idx] = {
        ...this.cartItems[idx],
        ...data,
        ...(data.priceSnapshot !== undefined ? { priceSnapshot: Number(data.priceSnapshot) } : {}),
      };
      return { ...this.cartItems[idx] };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.cartItems.findIndex((it) => it.id === where.id);
      if (idx !== -1) {
        const deleted = this.cartItems.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    deleteMany: async ({ where }: { where: { cartId?: string; id?: string } }) => {
      const beforeLen = this.cartItems.length;
      this.cartItems = this.cartItems.filter((it) => {
        const matchesCartId = !where.cartId || it.cartId === where.cartId;
        const matchesId = !where.id || it.id === where.id;
        return !(matchesCartId && matchesId);
      });
      return { count: beforeLen - this.cartItems.length };
    },
  };

  // --- INVENTORY ---
  public inventory = {
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.inventories.filter((inv) => {
        if (where?.productId && inv.productId !== where.productId) return false;
        if (where?.shopId && inv.shopId !== where.shopId) return false;
        if (where?.isAvailable !== undefined && inv.isAvailable !== where.isAvailable) return false;
        if (where?.quantity?.gte !== undefined && inv.quantity < where.quantity.gte) return false;
        if (where?.quantity?.gt !== undefined && inv.quantity <= where.quantity.gt) return false;
        return true;
      });

      if (orderBy?.sellingPrice) {
        list.sort((a, b) =>
          orderBy.sellingPrice === 'asc'
            ? a.sellingPrice - b.sellingPrice
            : b.sellingPrice - a.sellingPrice
        );
      }
      return list[0] || null;
    },
    findUnique: async ({
      where,
    }: {
      where: { id?: string; productId_shopId?: { productId: string; shopId: string } };
    }) => {
      return (
        this.inventories.find(
          (inv) =>
            (where.id && inv.id === where.id) ||
            (where.productId_shopId &&
              inv.productId === where.productId_shopId.productId &&
              inv.shopId === where.productId_shopId.shopId)
        ) || null
      );
    },
    findMany: async ({ where }: { where?: any } = {}) => {
      let list = this.inventories.filter((inv) => {
        if (where?.productId && inv.productId !== where.productId) return false;
        if (where?.shopId && inv.shopId !== where.shopId) return false;
        if (where?.isAvailable !== undefined && inv.isAvailable !== where.isAvailable) return false;
        return true;
      });
      return list.map((inv) => {
        const prod = initialProducts.find((p) => p.id === inv.productId);
        const shop = this.shops.find((s) => s.id === inv.shopId);
        const populatedProd = prod ? this.populateProduct(prod) : null;
        if (populatedProd) {
          const catItems = this.supplierCatalogItems
            .filter((c) => c.productId === prod!.id)
            .map((c) => ({
              ...c,
              supplier: this.suppliers.find((s) => s.id === c.supplierId) || null,
            }));
          populatedProd.supplierCatalogItems = catItems;
        }
        return {
          ...inv,
          product: populatedProd,
          shop: shop ? { id: shop.id, name: shop.name, city: shop.city } : null,
        };
      });
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || 'inv-' + Math.random().toString(36).substring(2, 9);
      const qty = Math.max(0, Number(data.quantity ?? 0));
      const newInv = {
        id,
        productId: data.productId,
        shopId: data.shopId || 'shop-1',
        quantity: qty,
        reservedQty: 0,
        sellingPrice: Number(data.sellingPrice || 999),
        isAvailable: qty > 0,
        availabilityStatus:
          qty > 0 ? (qty <= (data.lowStockThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
        lowStockThreshold: data.lowStockThreshold || 5,
        updatedAt: new Date(),
      };
      this.inventories.unshift(newInv);
      return newInv;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id?: string; productId_shopId?: { productId: string; shopId: string } };
      data: any;
    }) => {
      const idx = this.inventories.findIndex(
        (inv) =>
          (where.id && inv.id === where.id) ||
          (where.productId_shopId &&
            inv.productId === where.productId_shopId.productId &&
            inv.shopId === where.productId_shopId.shopId)
      );
      if (idx === -1) return null;
      let qty = this.inventories[idx].quantity;
      if (data.quantity !== undefined) {
        qty = Math.max(0, Number(data.quantity));
      } else if (data.decrement !== undefined) {
        qty = Math.max(0, qty - Number(data.decrement));
      } else if (data.increment !== undefined) {
        qty = qty + Number(data.increment);
      }
      this.inventories[idx] = {
        ...this.inventories[idx],
        ...data,
        quantity: qty,
        availabilityStatus:
          qty > 0 ? (qty <= (this.inventories[idx].lowStockThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
        isAvailable: qty > 0,
        updatedAt: new Date(),
      };
      return this.inventories[idx];
    },
  };

  // --- SHOP ---
  public shop = {
    findFirst: async ({ where }: { where?: any } = {}) => {
      return (
        this.shops.find((s) => {
          if (where?.id && s.id !== where.id) return false;
          if (where?.ownerId && s.ownerId !== where.ownerId) return false;
          if (where?.slug && s.slug !== where.slug) return false;
          if (where?.email && s.email?.toLowerCase() !== where.email?.toLowerCase()) return false;
          if (where?.isActive !== undefined && s.isActive !== where.isActive) return false;
          return true;
        }) || null
      );
    },
    findUnique: async ({ where }: { where: { id?: string; slug?: string; ownerId?: string } }) => {
      return (
        this.shops.find(
          (s) =>
            (where.id && s.id === where.id) ||
            (where.slug && s.slug === where.slug) ||
            (where.ownerId && s.ownerId === where.ownerId)
        ) || null
      );
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.shops.filter((s) => {
        if (where?.isActive !== undefined && s.isActive !== where.isActive) return false;
        if (where?.isVerified !== undefined && s.isVerified !== where.isVerified) return false;
        if (where?.city) {
          const c = typeof where.city === 'object' && where.city.equals ? where.city.equals : where.city;
          if (s.city.toLowerCase() !== c.toLowerCase()) return false;
        }
        return true;
      });
      if (orderBy?.rating === 'desc') {
        list.sort((a, b) => b.rating - a.rating);
      }
      return list;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'shop-' + (this.shops.length + 1);
      const newShop = {
        id,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        ownerId: data.ownerId,
        ownerName: data.ownerName || '',
        email: data.email || null,
        phone: data.phone,
        address: data.address || data.addressLine1,
        addressLine1: data.addressLine1 || data.address,
        city: data.city,
        state: data.state || 'Karnataka',
        pincode: data.pincode,
        latitude: Number(data.latitude || 12.9716),
        longitude: Number(data.longitude || 77.5946),
        rating: 5.0,
        totalRatings: 1,
        isVerified: data.isVerified !== undefined ? data.isVerified : true,
        verificationStatus: data.verificationStatus || 'VERIFIED',
        commissionRate: Number(data.commissionRate || 12),
        vehicleCategories: Array.isArray(data.vehicleCategories) ? data.vehicleCategories : ['CAR', 'BIKE', 'SCOOTER'],
        servicesOffered: Array.isArray(data.servicesOffered) ? data.servicesOffered : ['General Service', 'Brake Fitment'],
        supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
        operatingHours: data.operatingHours || '09:00 AM - 08:00 PM',
        serviceAvailable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shops.push(newShop);
      return newShop;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shops.findIndex((s) => s.id === where.id);
      if (idx === -1) return null;
      this.shops[idx] = { ...this.shops[idx], ...data, updatedAt: new Date() };
      return this.shops[idx];
    },
  };

  // --- SHOP JOB ---
  public shopJob = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.shopJobs.filter((j) => {
        if (where?.shopId && j.shopId !== where.shopId) return false;
        if (where?.status && j.status !== where.status) return false;
        if (where?.jobType && j.jobType !== where.jobType) return false;
        return true;
      });
      if (orderBy?.scheduledDate === 'desc') {
        list.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
      } else {
        list.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shopJobs.find((j) => j.id === where.id) || null;
    },
    findFirst: async ({ where }: { where: any }) => {
      return (
        this.shopJobs.find((j) => {
          if (where?.id && j.id !== where.id) return false;
          if (where?.shopId && j.shopId !== where.shopId) return false;
          if (where?.orderId && j.orderId !== where.orderId) return false;
          return true;
        }) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const id = 'job-' + (this.shopJobs.length + 101);
      const newJob = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shopJobs.unshift(newJob);
      return newJob;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shopJobs.findIndex((j) => j.id === where.id);
      if (idx === -1) return null;
      const updated = { ...this.shopJobs[idx], ...data, updatedAt: new Date() };
      this.shopJobs[idx] = updated;

      // When job status changes, sync with commission ledger and DIFM request
      if (data.status) {
        if (updated.difmRequestId || updated.orderId) {
          const difmIdx = this.difmRequests.findIndex(
            (d) =>
              (updated.difmRequestId && d.id === updated.difmRequestId) ||
              (updated.orderId && d.orderId === updated.orderId)
          );
          if (difmIdx !== -1) {
            this.difmRequests[difmIdx].status =
              data.status === 'COMPLETED'
                ? 'COMPLETED'
                : data.status === 'CANCELLED'
                ? 'CANCELLED'
                : 'ACCEPTED';
            this.difmRequests[difmIdx].updatedAt = new Date();
          }
        }

        if (updated.orderId && data.status === 'COMPLETED') {
          this.orderTrackings.push({
            id: crypto.randomUUID(),
            orderId: updated.orderId,
            status: 'DIFM_COMPLETED',
            message: 'DIFM installation completed by certified workshop technician.',
            createdAt: new Date(),
          });
        }

        const commIdx = this.commissionLedgers.findIndex(
          (c) => c.jobId === updated.id || (updated.orderId && c.orderId === updated.orderId)
        );
        if (commIdx !== -1) {
          const comm = this.commissionLedgers[commIdx];
          comm.serviceStatus = data.status;
          // STRICT RULE: Commission released ONLY when BOTH service is COMPLETED AND payment is PAID
          if (data.status === 'COMPLETED' && comm.paymentStatus === 'PAID') {
            comm.releaseStatus = 'RELEASED';
            comm.payoutStatus = 'RELEASED';
          } else if (data.status === 'COMPLETED' && comm.paymentStatus !== 'PAID') {
            comm.releaseStatus = 'LOCKED_PENDING_PAYMENT';
          } else if (data.status !== 'COMPLETED' && comm.paymentStatus === 'PAID') {
            comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
          }
          comm.updatedAt = new Date();
        }
      }
      return updated;
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.shopJobs.filter((j) => {
        if (where?.shopId && j.shopId !== where.shopId) return false;
        if (where?.status && j.status !== where.status) return false;
        return true;
      }).length;
    },
  };

  public mechanicJob = this.shopJob;

  // --- SERVICE APPOINTMENT ---
  public serviceAppointment = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = this.serviceAppointments.filter((a) => {
        if (where?.customerId && a.customerId !== where.customerId) return false;
        if (where?.shopId && a.shopId !== where.shopId) return false;
        if (where?.status && a.status !== where.status) return false;
        if (where?.mode && a.mode !== where.mode) return false;
        return true;
      });
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list.map((a) => {
        const item = { ...a };
        if (include?.customer) {
          item.customer = this.users.find((u) => u.id === a.customerId) || null;
        }
        if (include?.shop) {
          item.shop = this.shops.find((s) => s.id === a.shopId) || null;
        }
        if (include?.customerVehicle) {
          item.customerVehicle = this.customerVehicles.find((v) => v.id === a.customerVehicleId) || null;
        }
        if (include?.address) {
          item.address = this.addresses.find((addr) => addr.id === a.addressId) || null;
        }
        return item;
      });
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const a = this.serviceAppointments.find((x) => x.id === where.id);
      if (!a) return null;
      const item = { ...a };
      if (include?.customer) {
        item.customer = this.users.find((u) => u.id === a.customerId) || null;
      }
      if (include?.shop) {
        item.shop = this.shops.find((s) => s.id === a.shopId) || null;
      }
      return item;
    },
    findFirst: async ({ where }: { where: any }) => {
      return this.serviceAppointments.find((a) => {
        if (where?.id && a.id !== where.id) return false;
        if (where?.customerId && a.customerId !== where.customerId) return false;
        return true;
      }) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'appt-' + crypto.randomUUID();
      const newAppt = {
        id,
        ...data,
        status: data.status || 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.serviceAppointments.unshift(newAppt);
      return newAppt;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.serviceAppointments.findIndex((a) => a.id === where.id);
      if (idx === -1) throw new Error('ServiceAppointment not found');
      const updated = { ...this.serviceAppointments[idx], ...data, updatedAt: new Date() };
      this.serviceAppointments[idx] = updated;
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.serviceAppointments.findIndex((a) => a.id === where.id);
      if (idx !== -1) {
        return this.serviceAppointments.splice(idx, 1)[0];
      }
      return null;
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.serviceAppointments.filter((a) => {
        if (where?.customerId && a.customerId !== where.customerId) return false;
        if (where?.status && a.status !== where.status) return false;
        return true;
      }).length;
    },
  };

  // --- SERVICE BOOKING (STEP 11 INSTALLATION COMPLETION CONFIRMATION) ---
  public serviceBooking = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = this.serviceBookings.filter((b) => {
        if (where?.id && b.id !== where.id) return false;
        if (where?.difmRequestId && b.difmRequestId !== where.difmRequestId) return false;
        if (where?.shopId && b.shopId !== where.shopId) return false;
        if (where?.isCompleted !== undefined && b.isCompleted !== where.isCompleted) return false;
        return true;
      });
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list.map((b) => {
        const item = { ...b };
        if (include?.shop) {
          item.shop = this.shops.find((s) => s.id === b.shopId) || null;
        }
        if (include?.difmRequest) {
          item.difmRequest = this.difmRequests.find((d) => d.id === b.difmRequestId) || null;
        }
        return item;
      });
    },
    findUnique: async ({ where, include }: { where: { id?: string; difmRequestId?: string }; include?: any }) => {
      const b = this.serviceBookings.find(
        (x) => (where.id && x.id === where.id) || (where.difmRequestId && x.difmRequestId === where.difmRequestId)
      );
      if (!b) return null;
      const item = { ...b };
      if (include?.shop) {
        item.shop = this.shops.find((s) => s.id === b.shopId) || null;
      }
      if (include?.difmRequest) {
        item.difmRequest = this.difmRequests.find((d) => d.id === b.difmRequestId) || null;
      }
      return item;
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const b = this.serviceBookings.find((x) => {
        if (where?.id && x.id !== where.id) return false;
        if (where?.difmRequestId && x.difmRequestId !== where.difmRequestId) return false;
        if (where?.shopId && x.shopId !== where.shopId) return false;
        if (where?.isCompleted !== undefined && x.isCompleted !== where.isCompleted) return false;
        return true;
      });
      if (!b) return null;
      const item = { ...b };
      if (include?.shop) {
        item.shop = this.shops.find((s) => s.id === b.shopId) || null;
      }
      if (include?.difmRequest) {
        item.difmRequest = this.difmRequests.find((d) => d.id === b.difmRequestId) || null;
      }
      return item;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = 'sb-' + crypto.randomUUID();
      const newBooking = {
        id,
        scheduledSlot: '10:00 AM - 12:00 PM',
        isCompleted: false,
        completionCodeAttempts: 0,
        completionCodeLocked: false,
        completedAt: null,
        completedByRole: null,
        completedById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.serviceBookings.unshift(newBooking);
      const item = { ...newBooking };
      if (include?.shop) {
        item.shop = this.shops.find((s) => s.id === item.shopId) || null;
      }
      if (include?.difmRequest) {
        item.difmRequest = this.difmRequests.find((d) => d.id === item.difmRequestId) || null;
      }
      return item;
    },
    update: async ({ where, data, include }: { where: { id?: string; difmRequestId?: string }; data: any; include?: any }) => {
      const idx = this.serviceBookings.findIndex(
        (x) => (where.id && x.id === where.id) || (where.difmRequestId && x.difmRequestId === where.difmRequestId)
      );
      if (idx === -1) throw new Error('ServiceBooking not found to update.');
      this.serviceBookings[idx] = {
        ...this.serviceBookings[idx],
        ...data,
        updatedAt: new Date(),
      };
      const item = { ...this.serviceBookings[idx] };
      if (include?.shop) {
        item.shop = this.shops.find((s) => s.id === item.shopId) || null;
      }
      if (include?.difmRequest) {
        item.difmRequest = this.difmRequests.find((d) => d.id === item.difmRequestId) || null;
      }
      return item;
    },
    upsert: async ({ where, create, update, include }: { where: { id?: string; difmRequestId?: string }; create: any; update: any; include?: any }) => {
      const idx = this.serviceBookings.findIndex(
        (x) => (where.id && x.id === where.id) || (where.difmRequestId && x.difmRequestId === where.difmRequestId)
      );
      if (idx !== -1) {
        this.serviceBookings[idx] = {
          ...this.serviceBookings[idx],
          ...update,
          updatedAt: new Date(),
        };
        const item = { ...this.serviceBookings[idx] };
        if (include?.shop) item.shop = this.shops.find((s) => s.id === item.shopId) || null;
        if (include?.difmRequest) item.difmRequest = this.difmRequests.find((d) => d.id === item.difmRequestId) || null;
        return item;
      } else {
        const id = 'sb-' + crypto.randomUUID();
        const newBooking = {
          id,
          scheduledSlot: '10:00 AM - 12:00 PM',
          isCompleted: false,
          completionCodeAttempts: 0,
          completionCodeLocked: false,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...create,
        };
        this.serviceBookings.unshift(newBooking);
        const item = { ...newBooking };
        if (include?.shop) item.shop = this.shops.find((s) => s.id === item.shopId) || null;
        if (include?.difmRequest) item.difmRequest = this.difmRequests.find((d) => d.id === item.difmRequestId) || null;
        return item;
      }
    },
    delete: async ({ where }: { where: { id?: string; difmRequestId?: string } }) => {
      const idx = this.serviceBookings.findIndex(
        (x) => (where.id && x.id === where.id) || (where.difmRequestId && x.difmRequestId === where.difmRequestId)
      );
      if (idx !== -1) {
        const deleted = this.serviceBookings[idx];
        this.serviceBookings.splice(idx, 1);
        return deleted;
      }
      return null;
    },
  };

  // --- COMMISSION LEDGER ---
  public commissionLedger = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.commissionLedgers.filter((c) => {
        if (where?.shopId && c.shopId !== where.shopId) return false;
        if (where?.payoutStatus && c.payoutStatus !== where.payoutStatus) return false;
        if (where?.releaseStatus && c.releaseStatus !== where.releaseStatus) return false;
        return true;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.commissionLedgers.find((c) => c.id === where.id) || null;
    },
    findFirst: async ({ where }: { where: any }) => {
      return (
        this.commissionLedgers.find((c) => {
          if (where?.id && c.id !== where.id) return false;
          if (where?.shopId && c.shopId !== where.shopId) return false;
          if (where?.orderId && c.orderId !== where.orderId) return false;
          return true;
        }) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const id = 'comm-' + (this.commissionLedgers.length + 101);
      const gross = Number(data.grossAmount || 0);
      const rate = Number(data.commissionRate || 12);
      const commissionAmount = Number(data.commissionAmount || Math.round(gross * (rate / 100)));
      const shopPayout = Number(data.shopPayout || (gross - commissionAmount));
      
      const serviceStatus = data.serviceStatus || 'SCHEDULED';
      const paymentStatus = data.paymentStatus || 'PENDING';
      let releaseStatus = 'LOCKED_PENDING_COMPLETION';
      if (serviceStatus === 'COMPLETED' && paymentStatus === 'PAID') {
        releaseStatus = 'RELEASED';
      } else if (serviceStatus === 'COMPLETED' && paymentStatus !== 'PAID') {
        releaseStatus = 'LOCKED_PENDING_PAYMENT';
      } else if (serviceStatus !== 'COMPLETED' && paymentStatus === 'PAID') {
        releaseStatus = 'LOCKED_PENDING_COMPLETION';
      }

      const item = {
        id,
        shopId: data.shopId,
        orderId: data.orderId || null,
        orderNumber: data.orderNumber || null,
        jobId: data.jobId || null,
        serviceName: data.serviceName || 'DIFM Service',
        grossAmount: gross,
        commissionRate: rate,
        commissionAmount,
        shopPayout,
        serviceStatus,
        paymentStatus,
        paymentMethod: data.paymentMethod || 'RAZORPAY',
        releaseStatus: data.releaseStatus || releaseStatus,
        payoutStatus: (data.releaseStatus || releaseStatus) === 'RELEASED' ? 'RELEASED' : (data.payoutStatus || 'PENDING'),
        payoutRef: data.payoutRef || null,
        paidAt: data.paidAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.commissionLedgers.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.commissionLedgers.findIndex((c) => c.id === where.id);
      if (idx === -1) return null;
      this.commissionLedgers[idx] = { ...this.commissionLedgers[idx], ...data, updatedAt: new Date() };
      return this.commissionLedgers[idx];
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.commissionLedgers.filter((c) => {
        if (where?.shopId && c.shopId !== where.shopId) return false;
        return true;
      }).length;
    },
  };

  // --- SHOP DELIVERY ---
  public shopDelivery = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.shopDeliveries
        .filter((d) => !where?.shopId || d.shopId === where.shopId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shopDeliveries.find((d) => d.id === where.id) || null;
    },
    findFirst: async ({ where }: { where?: any } = {}) => {
      return (
        this.shopDeliveries.find(
          (d) =>
            (!where?.id || d.id === where.id) &&
            (!where?.shopId || d.shopId === where.shopId) &&
            (!where?.orderId || d.orderId === where.orderId)
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const id = 'del-' + (this.shopDeliveries.length + 101);
      const item = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.shopDeliveries.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shopDeliveries.findIndex((d) => d.id === where.id);
      if (idx === -1) return null;
      this.shopDeliveries[idx] = { ...this.shopDeliveries[idx], ...data, updatedAt: new Date() };
      return this.shopDeliveries[idx];
    },
  };

  // --- USED PART INTAKE ---
  public usedPartIntake = {
    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      let list = this.usedPartIntakes
        .filter((i) => !where?.shopId || i.shopId === where.shopId)
        .filter((i) => !where?.listingId || i.listingId === where.listingId);
      if (where?.status) {
        if (typeof where.status === 'string') list = list.filter((i) => i.status === where.status);
        else if (where.status.in && Array.isArray(where.status.in)) list = list.filter((i) => where.status.in.includes(i.status));
      }
      return list
        .sort((a, b) => new Date(b.createdAt || b.intakeDate || 0).getTime() - new Date(a.createdAt || a.intakeDate || 0).getTime())
        .map((i) => {
          const shop = include?.shop ? this.shops.find((s) => s.id === i.shopId) : null;
          const listing = include?.listing ? this.usedPartListings.find((l) => l.id === i.listingId) : null;
          return {
            ...i,
            shop: shop || null,
            listing: listing ? { ...listing, seller: this.users.find((u) => u.id === listing.sellerId) || null } : null,
          };
        });
    },
    findUnique: async ({ where, include }: { where: { id?: string; listingId?: string }; include?: any }) => {
      const item = this.usedPartIntakes.find((i) => (where.id && i.id === where.id) || (where.listingId && i.listingId === where.listingId)) || null;
      if (!item) return null;
      const shop = include?.shop ? this.shops.find((s) => s.id === item.shopId) : null;
      const listing = include?.listing ? this.usedPartListings.find((l) => l.id === item.listingId) : null;
      return {
        ...item,
        shop: shop || null,
        listing: listing ? { ...listing, seller: this.users.find((u) => u.id === listing.sellerId) || null } : null,
      };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const item = this.usedPartIntakes.find((i) => {
        if (where.id && i.id !== where.id) return false;
        if (where.shopId && i.shopId !== where.shopId) return false;
        if (where.listingId && i.listingId !== where.listingId) return false;
        if (where.status && i.status !== where.status) return false;
        return true;
      }) || null;
      if (!item) return null;
      const shop = include?.shop ? this.shops.find((s) => s.id === item.shopId) : null;
      const listing = include?.listing ? this.usedPartListings.find((l) => l.id === item.listingId) : null;
      return {
        ...item,
        shop: shop || null,
        listing: listing ? { ...listing, seller: this.users.find((u) => u.id === listing.sellerId) || null } : null,
      };
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = data.id || 'intake-' + (this.usedPartIntakes.length + 101);
      const item = { id, ...data, intakeDate: data.intakeDate || new Date(), createdAt: new Date(), updatedAt: new Date() };
      this.usedPartIntakes.unshift(item);
      const shop = include?.shop ? this.shops.find((s) => s.id === item.shopId) : null;
      const listing = include?.listing ? this.usedPartListings.find((l) => l.id === item.listingId) : null;
      return {
        ...item,
        shop: shop || null,
        listing: listing ? { ...listing, seller: this.users.find((u) => u.id === listing.sellerId) || null } : null,
      };
    },
    update: async ({ where, data, include }: { where: { id?: string; listingId?: string }; data: any; include?: any }) => {
      const idx = this.usedPartIntakes.findIndex((i) => (where.id && i.id === where.id) || (where.listingId && i.listingId === where.listingId));
      if (idx === -1) return null;
      this.usedPartIntakes[idx] = { ...this.usedPartIntakes[idx], ...data, updatedAt: new Date() };
      const item = this.usedPartIntakes[idx];
      const shop = include?.shop ? this.shops.find((s) => s.id === item.shopId) : null;
      const listing = include?.listing ? this.usedPartListings.find((l) => l.id === item.listingId) : null;
      return {
        ...item,
        shop: shop || null,
        listing: listing ? { ...listing, seller: this.users.find((u) => u.id === listing.sellerId) || null } : null,
      };
    },
    upsert: async ({ where, update, create }: any) => {
      const existing = this.usedPartIntakes.find((i) => (where.id && i.id === where.id) || (where.listingId && i.listingId === where.listingId));
      if (existing) {
        const idx = this.usedPartIntakes.indexOf(existing);
        this.usedPartIntakes[idx] = { ...this.usedPartIntakes[idx], ...update, updatedAt: new Date() };
        return this.usedPartIntakes[idx];
      }
      const id = create.id || 'intake-' + (this.usedPartIntakes.length + 101);
      const item = { id, ...create, createdAt: new Date(), updatedAt: new Date() };
      this.usedPartIntakes.unshift(item);
      return item;
    },
  };

  // --- USED PART PAYOUT ---
  public usedPartPayout = {
    findMany: async ({ where }: { where?: any } = {}) => {
      let list = [...this.usedPartPayouts];
      if (where?.sellerId) list = list.filter((p) => p.sellerId === where.sellerId);
      if (where?.listingId) list = list.filter((p) => p.listingId === where.listingId);
      if (where?.status) list = list.filter((p) => p.status === where.status);
      return list;
    },
    findFirst: async ({ where }: { where?: any } = {}) => {
      return (
        this.usedPartPayouts.find((p) => {
          if (where?.id && p.id !== where.id) return false;
          if (where?.listingId && p.listingId !== where.listingId) return false;
          if (where?.sellerId && p.sellerId !== where.sellerId) return false;
          return true;
        }) || null
      );
    },
    findUnique: async ({ where }: { where: { id?: string; listingId?: string } }) => {
      return (
        this.usedPartPayouts.find((p) => (where.id && p.id === where.id) || (where.listingId && p.listingId === where.listingId)) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || 'payout_' + Math.random().toString(36).substring(2, 11);
      const item = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.usedPartPayouts.unshift(item);
      return item;
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = this.usedPartPayouts.find((p) => (where.id && p.id === where.id) || (where.listingId && p.listingId === where.listingId));
      if (existing) {
        const idx = this.usedPartPayouts.indexOf(existing);
        this.usedPartPayouts[idx] = { ...this.usedPartPayouts[idx], ...update, updatedAt: new Date() };
        return this.usedPartPayouts[idx];
      }
      const id = create.id || 'payout_' + Math.random().toString(36).substring(2, 11);
      const item = { id, ...create, createdAt: new Date(), updatedAt: new Date() };
      this.usedPartPayouts.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id?: string; listingId?: string }; data: any }) => {
      const idx = this.usedPartPayouts.findIndex((p) => (where.id && p.id === where.id) || (where.listingId && p.listingId === where.listingId));
      if (idx === -1) return null;
      this.usedPartPayouts[idx] = { ...this.usedPartPayouts[idx], ...data, updatedAt: new Date() };
      return this.usedPartPayouts[idx];
    },
  };

  // --- USED PART VERIFICATION ---
  public usedPartVerification = {
    findMany: async ({ where }: { where?: any } = {}) => {
      let list = [...this.usedPartVerifications];
      if (where?.listingId) list = list.filter((v) => v.listingId === where.listingId);
      return list;
    },
    findFirst: async ({ where }: { where?: any } = {}) => {
      return this.usedPartVerifications.find((v) => !where?.listingId || v.listingId === where.listingId) || null;
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = this.usedPartVerifications.find((v) => (where.id && v.id === where.id) || (where.listingId && v.listingId === where.listingId));
      if (existing) {
        const idx = this.usedPartVerifications.indexOf(existing);
        this.usedPartVerifications[idx] = { ...this.usedPartVerifications[idx], ...update, updatedAt: new Date() };
        return this.usedPartVerifications[idx];
      }
      const id = create.id || 'verif_' + Math.random().toString(36).substring(2, 11);
      const item = { id, ...create, createdAt: new Date(), updatedAt: new Date() };
      this.usedPartVerifications.unshift(item);
      return item;
    },
  };

  // --- SHOP TICKET ---
  public shopTicket = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.shopTickets
        .filter((t) => !where?.shopId || t.shopId === where.shopId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shopTickets.find((t) => t.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const num = 100 + this.shopTickets.length + 1;
      const item = {
        id: 'tkt-shop-' + num,
        ticketNumber: `TKT-SHP-${num}`,
        status: 'OPEN',
        messages: [],
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shopTickets.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shopTickets.findIndex((t) => t.id === where.id);
      if (idx === -1) return null;
      this.shopTickets[idx] = { ...this.shopTickets[idx], ...data, updatedAt: new Date() };
      return this.shopTickets[idx];
    },
  };

  // --- DELIVERY PARTNERS ---
  public deliveryPartner = {
    findUnique: async ({ where, include }: { where: { id?: string; userId?: string }; include?: any }) => {
      const p = this.deliveryPartners.find(
        (dp) => (where.id && dp.id === where.id) || (where.userId && dp.userId === where.userId)
      );
      if (!p) return null;
      const user = include?.user ? this.users.find((u) => u.id === p.userId) : null;
      const userAddresses = user ? this.addresses.filter((a) => a.userId === user.id) : [];
      const rawKyc = this.kycRecords.find((k) => k.userId === p.userId) || null;
      const kyc = rawKyc ? { ...rawKyc, documents: this.kycDocuments.filter((d) => d.kycId === rawKyc.id) } : null;
      return {
        ...p,
        user: user ? { ...user, addresses: userAddresses, kyc } : null,
        kyc,
      };
    },
    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      const p = this.deliveryPartners.find((dp) => {
        if (where?.id && dp.id !== where.id) return false;
        if (where?.userId && dp.userId !== where.userId) return false;
        if (where?.isOnline !== undefined && dp.isOnline !== where.isOnline) return false;
        if (where?.vehicleNum) {
          const vQuery = typeof where.vehicleNum === 'string' ? where.vehicleNum.toLowerCase() : (where.vehicleNum?.equals ? where.vehicleNum.equals.toLowerCase() : '');
          if (dp.vehicleNum?.toLowerCase() !== vQuery) return false;
        }
        if (where?.OR && Array.isArray(where.OR)) {
          const match = where.OR.some((cond: any) => {
            if (cond.id && dp.id === cond.id) return true;
            if (cond.userId && dp.userId === cond.userId) return true;
            if (cond.vehicleNum && dp.vehicleNum?.toLowerCase() === (typeof cond.vehicleNum === 'string' ? cond.vehicleNum.toLowerCase() : '')) return true;
            return false;
          });
          if (!match) return false;
        }
        return true;
      });
      if (!p) return null;
      const user = include?.user ? this.users.find((u) => u.id === p.userId) : null;
      const userAddresses = user ? this.addresses.filter((a) => a.userId === user.id) : [];
      const rawKyc = this.kycRecords.find((k) => k.userId === p.userId) || null;
      const kyc = rawKyc ? { ...rawKyc, documents: this.kycDocuments.filter((d) => d.kycId === rawKyc.id) } : null;
      return {
        ...p,
        user: user ? { ...user, addresses: userAddresses, kyc } : null,
        kyc,
      };
    },
    findMany: async ({ where, include }: { where?: any; include?: any } = {}) => {
      return this.deliveryPartners
        .filter((dp) => {
          if (where?.isOnline !== undefined && dp.isOnline !== where.isOnline) return false;
          if (where?.verificationStatus !== undefined && dp.verificationStatus !== where.verificationStatus) return false;
          if (where?.vehicleType !== undefined && dp.vehicleType !== where.vehicleType) return false;
          if (where?.vehicleNum && dp.vehicleNum?.toLowerCase() !== (typeof where.vehicleNum === 'string' ? where.vehicleNum.toLowerCase() : '')) return false;
          return true;
        })
        .map((dp) => {
          const user = include?.user ? this.users.find((u) => u.id === dp.userId) : null;
          const userAddresses = user ? this.addresses.filter((a) => a.userId === user.id) : [];
          const rawKyc = this.kycRecords.find((k) => k.userId === dp.userId) || null;
          const kyc = rawKyc ? { ...rawKyc, documents: this.kycDocuments.filter((d) => d.kycId === rawKyc.id) } : null;
          return {
            ...dp,
            user: user ? { ...user, addresses: userAddresses, kyc } : null,
            kyc,
            assignments: [],
          };
        });
    },
    create: async ({ data }: { data: any }) => {
      const id = 'partner-' + (this.deliveryPartners.length + 1);
      const newPartner = {
        id,
        userId: data.userId,
        vehicleType: data.vehicleType || 'Bike',
        vehicleNum: data.vehicleNum || null,
        licenseNumber: data.licenseNumber || null,
        isOnline: data.isOnline !== undefined ? data.isOnline : false,
        isActivated: data.isActivated !== undefined ? data.isActivated : false,
        verificationStatus: data.verificationStatus || 'PENDING',
        currentLat: data.currentLat || 12.9716,
        currentLng: data.currentLng || 77.5946,
        rating: 5.0,
        totalDeliveries: 0,
        cashInHand: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.deliveryPartners.push(newPartner);
      return newPartner;
    },
    update: async ({ where, data }: { where: { id?: string; userId?: string }; data: any }) => {
      const idx = this.deliveryPartners.findIndex(
        (dp) => (where.id && dp.id === where.id) || (where.userId && dp.userId === where.userId)
      );
      if (idx === -1) return null;
      this.deliveryPartners[idx] = { ...this.deliveryPartners[idx], ...data, updatedAt: new Date() };
      return this.deliveryPartners[idx];
    },
    updateMany: async ({ where, data }: { where?: any; data: any }) => {
      let count = 0;
      this.deliveryPartners = this.deliveryPartners.map((dp) => {
        if (!where?.userId || dp.userId === where.userId) {
          count++;
          return { ...dp, ...data, updatedAt: new Date() };
        }
        return dp;
      });
      return { count };
    },
    count: async () => this.deliveryPartners.length,
  };

  // --- KYC & DOCUMENTS ---
  public kYC = {
    findUnique: async ({ where, include }: { where: { userId?: string; id?: string }; include?: any }) => {
      const k = this.kycRecords.find(
        (rec) => (where.userId && rec.userId === where.userId) || (where.id && rec.id === where.id)
      );
      if (!k) return null;
      const documents = this.kycDocuments.filter((d) => d.kycId === k.id);
      return { ...k, documents };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const k = this.kycRecords.find(
        (rec) => (!where.userId || rec.userId === where.userId) && (!where.id || rec.id === where.id)
      );
      if (!k) return null;
      const documents = this.kycDocuments.filter((d) => d.kycId === k.id);
      return { ...k, documents };
    },
    upsert: async ({ where, create, update }: { where: { userId: string }; create: any; update: any }) => {
      let k = this.kycRecords.find((rec) => rec.userId === where.userId);
      if (k) {
        Object.assign(k, update, { updatedAt: new Date() });
        return { ...k, documents: this.kycDocuments.filter((d) => d.kycId === k.id) };
      }
      const id = 'kyc-' + Math.random().toString(36).substring(2, 9);
      const newRec = {
        id,
        userId: where.userId,
        status: create.status || 'NOT_SUBMITTED',
        panNumber: create.panNumber || null,
        aadharNumber: create.aadharNumber || null,
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kycRecords.push(newRec);
      return { ...newRec, documents: [] };
    },
    create: async ({ data }: { data: any }) => {
      const id = 'kyc-' + Math.random().toString(36).substring(2, 9);
      const newRec = {
        id,
        userId: data.userId,
        status: data.status || 'NOT_SUBMITTED',
        panNumber: data.panNumber || null,
        aadharNumber: data.aadharNumber || null,
        rejectionReason: data.rejectionReason || null,
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kycRecords.push(newRec);
      return { ...newRec, documents: [] };
    },
    update: async ({ where, data }: { where: { userId?: string; id?: string }; data: any }) => {
      const idx = this.kycRecords.findIndex(
        (rec) => (where.userId && rec.userId === where.userId) || (where.id && rec.id === where.id)
      );
      if (idx === -1) return null;
      this.kycRecords[idx] = { ...this.kycRecords[idx], ...data, updatedAt: new Date() };
      return {
        ...this.kycRecords[idx],
        documents: this.kycDocuments.filter((d) => d.kycId === this.kycRecords[idx].id),
      };
    },
  };
  public kyc = this.kYC;

  public kYCDocument = {
    findMany: async ({ where }: { where?: { kycId?: string } } = {}) => {
      return this.kycDocuments.filter((d) => !where?.kycId || d.kycId === where.kycId);
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.kycDocuments.find((d) => d.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const doc = {
        id: 'kdoc-' + Math.random().toString(36).substring(2, 9),
        kycId: data.kycId,
        documentType: data.documentType,
        objectKey: data.objectKey || `kyc/${data.kycId}/${data.documentType.toLowerCase()}.pdf`,
        fileUrl: data.fileUrl || `https://storage.partsphare.test/kyc/${data.documentType.toLowerCase()}`,
        mimeType: data.mimeType || 'application/pdf',
        verificationStatus: data.verificationStatus || 'PENDING',
        rejectionReason: data.rejectionReason || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kycDocuments.push(doc);
      return doc;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.kycDocuments.findIndex((d) => d.id === where.id);
      if (idx === -1) return null;
      this.kycDocuments[idx] = { ...this.kycDocuments[idx], ...data, updatedAt: new Date() };
      return this.kycDocuments[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.kycDocuments.findIndex((d) => d.id === where.id);
      if (idx === -1) return null;
      return this.kycDocuments.splice(idx, 1)[0];
    },
    updateMany: async ({ where, data }: { where?: any; data: any }) => {
      let count = 0;
      this.kycDocuments = this.kycDocuments.map((doc) => {
        if (!where?.kycId || doc.kycId === where.kycId) {
          count++;
          return { ...doc, ...data, updatedAt: new Date() };
        }
        return doc;
      });
      return { count };
    },
    deleteMany: async ({ where }: { where?: any } = {}) => {
      const initial = this.kycDocuments.length;
      this.kycDocuments = this.kycDocuments.filter((doc) => {
        if (where?.kycId && doc.kycId === where.kycId) return false;
        if (where?.id && doc.id === where.id) return false;
        if (where?.documentType && doc.documentType === where.documentType) return false;
        return true;
      });
      return { count: initial - this.kycDocuments.length };
    },
  };

  // --- DELIVERY ASSIGNMENTS ---
  public deliveryAssignment = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = this.deliveryAssignments.filter((a) => {
        if (where?.deliveryPartnerId !== undefined) {
          if (where.deliveryPartnerId === null) {
            if (a.deliveryPartnerId !== null) return false;
          } else {
            if (a.deliveryPartnerId !== where.deliveryPartnerId) return false;
          }
        }
        if (where?.status) {
          if (typeof where.status === 'string') {
            if (a.status !== where.status) return false;
          } else if (where.status.in && Array.isArray(where.status.in)) {
            if (!where.status.in.includes(a.status)) return false;
          }
        }
        if (where?.orderId && a.orderId !== where.orderId) return false;
        return true;
      });

      if (orderBy?.assignedAt === 'desc' || orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.assignedAt || b.createdAt).getTime() - new Date(a.assignedAt || a.createdAt).getTime());
      }

      return list.map((a) => {
        const order = include?.order && a.orderId ? this.orders.find((o) => o.id === a.orderId) : null;
        const partner = include?.deliveryPartner && a.deliveryPartnerId ? this.deliveryPartners.find((p) => p.id === a.deliveryPartnerId) : null;
        return {
          ...a,
          order: order ? this.populateOrder(order) : a.order || null,
          deliveryPartner: partner || null,
        };
      });
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const a = this.deliveryAssignments.find((item) => item.id === where.id);
      if (!a) return null;
      const order = include?.order && a.orderId ? this.orders.find((o) => o.id === a.orderId) : null;
      const partner = include?.deliveryPartner && a.deliveryPartnerId ? this.deliveryPartners.find((p) => p.id === a.deliveryPartnerId) : null;
      return {
        ...a,
        order: order ? this.populateOrder(order) : a.order || null,
        deliveryPartner: partner || null,
      };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const a = this.deliveryAssignments.find((item) => {
        if (where?.id && item.id !== where.id) return false;
        if (where?.orderId && item.orderId !== where.orderId) return false;
        if (where?.deliveryPartnerId && item.deliveryPartnerId !== where.deliveryPartnerId) return false;
        if (where?.status && item.status !== where.status) return false;
        return true;
      });
      if (!a) return null;
      return a;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'assign-' + (this.deliveryAssignments.length + 101);
      const newAssign = {
        id,
        orderId: data.orderId || null,
        orderNumber: data.orderNumber || null,
        usedPartListingId: data.usedPartListingId || null,
        deliveryPartnerId: data.deliveryPartnerId || null,
        type: data.type || (data.usedPartListingId ? 'USED_PART_PICKUP' : 'CUSTOMER_DELIVERY'),
        status: data.status || 'ASSIGNED',
        pickupLocation: data.pickupLocation || { name: 'PartNexa Hub', address: 'Indiranagar, Bengaluru' },
        dropLocation: data.dropLocation || { name: 'Customer Destination', address: 'Bengaluru' },
        items: data.items || [],
        paymentMethod: data.paymentMethod || 'RAZORPAY',
        paymentStatus: data.paymentStatus || 'PAID',
        codAmountToCollect: Number(data.codAmountToCollect || 0),
        codAmountCollected: Number(data.codAmountCollected || 0),
        codStatus: data.codStatus || (data.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'NOT_APPLICABLE'),
        deliveryFee: Number(data.deliveryFee || 100),
        distanceKm: Number(data.distanceKm || 5.0),
        navigationInfo: data.navigationInfo || { currentDistance: '5.0 km', etaMinutes: 15, routeSummary: 'Fastest route' },
        notes: data.notes || '',
        assignedAt: new Date(),
        acceptedAt: data.acceptedAt || null,
        pickedUpAt: data.pickedUpAt || null,
        deliveredAt: data.deliveredAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.deliveryAssignments.unshift(newAssign);
      return newAssign;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.deliveryAssignments.findIndex((a) => a.id === where.id);
      if (idx === -1) return null;
      this.deliveryAssignments[idx] = { ...this.deliveryAssignments[idx], ...data, updatedAt: new Date() };
      const updatedAssignment = this.deliveryAssignments[idx];

      // Real-time synchronization to linked Order or ReturnRequest
      if (updatedAssignment.type === 'RETURN_PICKUP' || updatedAssignment.returnRequestId) {
        const retReqId = updatedAssignment.returnRequestId;
        const retIdx = this.returnRequests.findIndex((r) => r.id === retReqId || (updatedAssignment.orderId && r.orderId === updatedAssignment.orderId));
        if (retIdx !== -1) {
          if (data.status === 'PICKED_UP') {
            this.returnRequests[retIdx].status = 'PICKED_UP';
            this.returnRequests[retIdx].pickupAt = new Date();
            this.returnRequests[retIdx].updatedAt = new Date();
          } else if (data.status === 'DELIVERED') {
            this.returnRequests[retIdx].status = 'RECEIVED';
            this.returnRequests[retIdx].receivedAt = new Date();
            this.returnRequests[retIdx].updatedAt = new Date();
          }
        }
      } else if (updatedAssignment.orderId && data.status) {
        const orderIdx = this.orders.findIndex((o) => o.id === updatedAssignment.orderId);
        if (orderIdx !== -1) {
          if (data.status === 'PICKED_UP' || data.status === 'IN_TRANSIT') {
            this.orders[orderIdx].status = 'SHIPPED';
            this.orders[orderIdx].updatedAt = new Date();
            this.orderTrackings.push({
              id: crypto.randomUUID(),
              orderId: updatedAssignment.orderId,
              status: 'OUT_FOR_DELIVERY',
              message: 'Package picked up by delivery partner and is out for doorstep delivery.',
              createdAt: new Date(),
            });
          } else if (data.status === 'DELIVERED') {
            this.orders[orderIdx].status = 'DELIVERED';
            this.orders[orderIdx].deliveredAt = new Date();
            if (this.orders[orderIdx].paymentMethod === 'CASH_ON_DELIVERY') {
              this.orders[orderIdx].paymentStatus = 'PAID';
            }
            this.orders[orderIdx].updatedAt = new Date();
            this.orderTrackings.push({
              id: crypto.randomUUID(),
              orderId: updatedAssignment.orderId,
              status: 'DELIVERED',
              message: 'Package successfully delivered to customer doorstep by delivery partner.',
              createdAt: new Date(),
            });
          }
        }
      }

      return updatedAssignment;
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.deliveryAssignments.filter((a) => {
        if (where?.deliveryPartnerId && a.deliveryPartnerId !== where.deliveryPartnerId) return false;
        if (where?.status && a.status !== where.status) return false;
        return true;
      }).length;
    },
  };

  // --- COD RECONCILIATIONS ---
  public cODReconciliation = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.codReconciliations.filter((r) => {
        if (where?.deliveryPartnerId && r.deliveryPartnerId !== where.deliveryPartnerId) return false;
        if (where?.status && r.status !== where.status) return false;
        return true;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.codReconciliations.find((r) => r.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'recon-' + (this.codReconciliations.length + 101);
      const newRecon = {
        id,
        reconciliationNumber: `COD-REC-${Date.now().toString().slice(-6)}`,
        deliveryPartnerId: data.deliveryPartnerId,
        totalAmount: Number(data.totalAmount || 0),
        orderCount: Number(data.orderCount || 1),
        status: data.status || 'RECONCILED',
        depositMethod: data.depositMethod || 'CASH_AT_HUB',
        depositReference: data.depositReference || `HUB-DEP-${Date.now().toString().slice(-5)}`,
        hubLocation: data.hubLocation || 'Indiranagar Central Logistics Hub',
        receivedBy: data.receivedBy || 'Finance Desk Officer',
        notes: data.notes || 'Full cash reconciliation verified.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.codReconciliations.unshift(newRecon);
      return newRecon;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.codReconciliations.findIndex((r) => r.id === where.id);
      if (idx === -1) return null;
      this.codReconciliations[idx] = { ...this.codReconciliations[idx], ...data, updatedAt: new Date() };
      return this.codReconciliations[idx];
    },
  };

  // --- REFRESH TOKEN ---
  public refreshToken = {
    create: async ({ data }: { data: any }) => {
      const tokenRecord = {
        id: crypto.randomUUID(),
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
        isRevoked: false,
        createdAt: new Date(),
      };
      this.refreshTokens.push(tokenRecord);
      return tokenRecord;
    },
    findUnique: async ({ where, include }: { where: { token?: string; id?: string }; include?: any }) => {
      const t = this.refreshTokens.find(
        (tok) => (where.token && tok.token === where.token) || (where.id && tok.id === where.id)
      );
      if (!t) return null;
      if (include?.user) {
        const u = this.users.find((usr) => usr.id === t.userId);
        return { ...t, user: u || null };
      }
      return t;
    },
    update: async ({ where, data }: { where: { id?: string; token?: string }; data: any }) => {
      const idx = this.refreshTokens.findIndex(
        (t) => (where.id && t.id === where.id) || (where.token && t.token === where.token)
      );
      if (idx === -1) return null;
      this.refreshTokens[idx] = { ...this.refreshTokens[idx], ...data };
      return this.refreshTokens[idx];
    },
    updateMany: async ({ where, data }: { where: { userId?: string; token?: string }; data: any }) => {
      let count = 0;
      this.refreshTokens.forEach((t) => {
        if ((where.userId && t.userId === where.userId) || (where.token && t.token === where.token)) {
          Object.assign(t, data);
          count++;
        }
      });
      return { count };
    },
    delete: async ({ where }: { where: { token?: string; id?: string } }) => {
      const idx = this.refreshTokens.findIndex(
        (t) => (where.token && t.token === where.token) || (where.id && t.id === where.id)
      );
      if (idx !== -1) {
        const deleted = this.refreshTokens.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    deleteMany: async ({ where }: { where: { userId?: string; token?: string } }) => {
      const initialLen = this.refreshTokens.length;
      this.refreshTokens = this.refreshTokens.filter(
        (t) => (!where.userId || t.userId !== where.userId) && (!where.token || t.token !== where.token)
      );
      return { count: initialLen - this.refreshTokens.length };
    },
  };

  // --- AUDIT LOG ---
  public auditLog = {
    create: async ({ data }: { data: any }) => {
      const log = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.auditLogs.push(log);
      return log;
    },
  };

  // --- ADDRESS ---
  public address = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.addresses.filter((a) => !where?.userId || a.userId === where.userId);
      list.sort((a, b) => {
        if (a.isDefault !== b.isDefault) return b.isDefault ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return list;
    },
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.addresses.filter(
        (a) =>
          (!where?.id || a.id === where.id) &&
          (!where?.userId || a.userId === where.userId) &&
          (where?.isDefault === undefined || a.isDefault === where.isDefault)
      );
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list[0] || null;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.addresses.find((a) => a.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const newAddr = {
        id: crypto.randomUUID(),
        userId: data.userId,
        label: data.label || 'Home',
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark || null,
        latitude: data.latitude || (data.pincode === '560038' ? 12.9716 : 12.9260),
        longitude: data.longitude || (data.pincode === '560038' ? 77.5946 : 77.6762),
        isDefault: Boolean(data.isDefault),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.addresses.push(newAddr);
      return newAddr;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.addresses.findIndex((a) => a.id === where.id);
      if (idx === -1) return null;
      this.addresses[idx] = { ...this.addresses[idx], ...data, updatedAt: new Date() };
      return this.addresses[idx];
    },
    updateMany: async ({ where, data }: { where: { userId?: string }; data: any }) => {
      let count = 0;
      this.addresses.forEach((a) => {
        if (!where?.userId || a.userId === where.userId) {
          Object.assign(a, data);
          count++;
        }
      });
      return { count };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.addresses.findIndex((a) => a.id === where.id);
      if (idx !== -1) {
        const deleted = this.addresses.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    count: async ({ where }: { where?: { userId: string } } = {}) => {
      return this.addresses.filter((a) => !where?.userId || a.userId === where.userId).length;
    },
  };

  // --- ORDERS & TRACKING ---
  private populateOrder(order: any) {
    const items = this.orderItems
      .filter((oi) => oi.orderId === order.id)
      .map((oi) => {
        const p = initialProducts.find((prod) => prod.id === oi.productId);
        const product = p ? this.populateProduct(p) : null;
        const s = this.shops.find((shp) => shp.id === oi.shopId) || initialShops[0];
        return {
          ...oi,
          unitPrice: Number(oi.unitPrice),
          totalPrice: Number(oi.totalPrice),
          product,
          shop: s
            ? {
                id: s.id,
                name: s.name,
                city: s.city,
                address: s.address,
                phone: s.phone,
                rating: s.rating,
              }
            : null,
        };
      });

    const address = this.addresses.find((a) => a.id === order.addressId) || null;
    const payment = this.payments.find((pm) => pm.orderId === order.id) || null;
    const difmReq = this.difmRequests.find((d) => d.orderId === order.id);
    const difmBooking = difmReq ? this.serviceBookings.find((b) => b.difmRequestId === difmReq.id) || null : null;
    const difmRequest = difmReq
      ? {
          ...difmReq,
          installationFee: Number(difmReq.installationFee || 0),
          homeVisitSurcharge: Number(difmReq.homeVisitSurcharge || 0),
          shop: this.shops.find((s) => s.id === difmReq.shopId) || null,
          serviceBooking: difmBooking
            ? {
                ...difmBooking,
                shop: this.shops.find((s) => s.id === difmBooking.shopId) || null,
              }
            : null,
        }
      : null;
    const tracking = this.orderTrackings
      .filter((t) => t.orderId === order.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee || 0),
      discount: Number(order.discount || 0),
      installationFee: Number(order.installationFee || 0),
      homeVisitSurcharge: Number(order.homeVisitSurcharge || 0),
      total: Number(order.total),
      items,
      address,
      payment,
      difmRequest,
      tracking,
      statusHistory: [],
      returnRequests: this.returnRequests.filter((r) => r.orderId === order.id),
      deliveredAt: order.deliveredAt || (order.status === 'DELIVERED' ? (order.updatedAt || new Date()) : null),
    };
  }

  public order = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = this.orders.filter((o) => {
        if (where?.userId && o.userId !== where.userId) return false;
        if (where?.status && o.status !== where.status) return false;
        if (where?.paymentStatus && o.paymentStatus !== where.paymentStatus) return false;
        if (where?.difmType && o.difmType !== where.difmType) return false;
        return true;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list.map((o) => {
        const base = this.populateOrder(o);
        const user = this.users.find((u) => u.id === o.userId) || null;
        const difm = this.difmRequests.find((d) => d.orderId === o.id) || null;
        const job = this.shopJobs.find((j) => j.orderId === o.id) || null;
        const delivery = this.deliveryAssignments.find((a) => a.orderId === o.id) || null;

        return {
          ...base,
          user: include?.user ? (user ? { ...user, fullName: `${user.firstName} ${user.lastName}`.trim() } : null) : undefined,
          difmRequest: base.difmRequest,
          mechanicJob: job ? { ...job, shop: this.shops.find((s) => s.id === job.shopId) || null } : null,
          deliveryAssignment: delivery
            ? {
                ...delivery,
                deliveryPartner: this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)
                  ? {
                      ...this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId),
                      user: this.users.find((u) => u.id === this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)?.userId),
                    }
                  : null,
              }
            : null,
        };
      });
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const order = this.orders.find((o) => {
        if (where.userId && o.userId !== where.userId) return false;
        if (where.id && o.id !== where.id) return false;
        if (where.orderNumber && o.orderNumber !== where.orderNumber) return false;
        if (where.OR && Array.isArray(where.OR)) {
          const matchOr = where.OR.some(
            (cond: any) =>
              (cond.id && o.id === cond.id) || (cond.orderNumber && o.orderNumber === cond.orderNumber)
          );
          if (!matchOr) return false;
        }
        return true;
      });
      if (!order) return null;
      const base = this.populateOrder(order);
      const user = this.users.find((u) => u.id === order.userId) || null;
      const difm = this.difmRequests.find((d) => d.orderId === order.id) || null;
      const job = this.shopJobs.find((j) => j.orderId === order.id) || null;
      const delivery = this.deliveryAssignments.find((a) => a.orderId === order.id) || null;

      return {
        ...base,
        user: include?.user ? (user ? { ...user, fullName: `${user.firstName} ${user.lastName}`.trim() } : null) : undefined,
        difmRequest: base.difmRequest,
        mechanicJob: job ? { ...job, shop: this.shops.find((s) => s.id === job.shopId) || null } : null,
        deliveryAssignment: delivery
          ? {
              ...delivery,
              deliveryPartner: this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)
                ? {
                    ...this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId),
                    user: this.users.find((u) => u.id === this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)?.userId),
                  }
                : null,
            }
          : null,
      };
    },
    findUnique: async ({ where, include }: { where: any; include?: any }) => {
      const order = this.orders.find((o) => {
        if (where.id && o.id !== where.id) return false;
        if (where.orderNumber && o.orderNumber !== where.orderNumber) return false;
        if (where.OR && Array.isArray(where.OR)) {
          const matchOr = where.OR.some(
            (cond: any) =>
              (cond.id && o.id === cond.id) || (cond.orderNumber && o.orderNumber === cond.orderNumber)
          );
          if (!matchOr) return false;
        }
        return true;
      });
      if (!order) return null;
      const base = this.populateOrder(order);
      const user = this.users.find((u) => u.id === order.userId) || null;
      const difm = this.difmRequests.find((d) => d.orderId === order.id) || null;
      const job = this.shopJobs.find((j) => j.orderId === order.id) || null;
      const delivery = this.deliveryAssignments.find((a) => a.orderId === order.id) || null;

      return {
        ...base,
        user: include?.user ? (user ? { ...user, fullName: `${user.firstName} ${user.lastName}`.trim() } : null) : undefined,
        difmRequest: base.difmRequest,
        mechanicJob: job ? { ...job, shop: this.shops.find((s) => s.id === job.shopId) || null } : null,
        deliveryAssignment: delivery
          ? {
              ...delivery,
              deliveryPartner: this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)
                ? {
                    ...this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId),
                    user: this.users.find((u) => u.id === this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)?.userId),
                  }
                : null,
            }
          : null,
      };
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const orderId = crypto.randomUUID();
      const newOrder = {
        id: orderId,
        orderNumber: data.orderNumber,
        userId: data.userId,
        addressId: data.addressId,
        status: data.status || 'CONFIRMED',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'PENDING',
        subtotal: Number(data.subtotal),
        deliveryFee: Number(data.deliveryFee || 0),
        discount: Number(data.discount || 0),
        installationFee: Number(data.installationFee || 0),
        homeVisitSurcharge: Number(data.homeVisitSurcharge || 0),
        total: Number(data.total),
        couponCode: data.couponCode || null,
        notes: data.notes || null,
        difmType: data.difmType || 'NO_INSTALLATION',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.orders.push(newOrder);

      // Unpack nested items
      if (data.items?.create && Array.isArray(data.items.create)) {
        for (const it of data.items.create) {
          this.orderItems.push({
            id: crypto.randomUUID(),
            orderId,
            productId: it.productId,
            shopId: it.shopId,
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice),
            totalPrice: Number(it.totalPrice),
          });
        }
      }

      // Unpack nested payment
      if (data.payment?.create) {
        this.payments.push({
          id: crypto.randomUUID(),
          orderId,
          method: data.payment.create.method,
          amount: Number(data.payment.create.amount),
          status: data.payment.create.status || 'PENDING',
          razorpayOrderId: data.payment.create.razorpayOrderId || null,
          createdAt: new Date(),
        });
      }

      // Unpack nested tracking
      if (data.tracking?.create) {
        const trData = Array.isArray(data.tracking.create) ? data.tracking.create : [data.tracking.create];
        for (const tr of trData) {
          this.orderTrackings.push({
            id: crypto.randomUUID(),
            orderId,
            status: tr.status || newOrder.status,
            message: tr.message || 'Order placed successfully and confirmed.',
            createdAt: new Date(),
          });
        }
      }

      // Unpack nested difmRequest
      if (data.difmRequest?.create) {
        const difmRecord = {
          id: crypto.randomUUID(),
          orderId,
          shopId: data.difmRequest.create.shopId || null,
          type: data.difmRequest.create.type,
          status: data.difmRequest.create.status || 'PENDING',
          installationFee: Number(data.difmRequest.create.installationFee || 0),
          homeVisitSurcharge: Number(data.difmRequest.create.homeVisitSurcharge || 0),
          preferredDate: data.difmRequest.create.preferredDate || null,
          scheduledDate: data.difmRequest.create.scheduledDate || null,
          notes: data.difmRequest.create.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.difmRequests.push(difmRecord);

        // Auto-create connected Shop Job and Commission Ledger
        const assignedShop = this.shops.find((s) => s.id === (difmRecord.shopId || 'shop-1')) || this.shops[0];
        const cust = this.users.find((u) => u.id === newOrder.userId);
        const addr = this.addresses.find((a) => a.id === newOrder.addressId);
        const fee = difmRecord.installationFee + difmRecord.homeVisitSurcharge;
        const rate = assignedShop?.commissionRate || 12;
        const commCut = Math.round(fee * (rate / 100));
        const shopNet = fee - commCut;

        const jobId = 'job-' + Math.random().toString(36).substring(2, 9);
        const newJob = {
          id: jobId,
          shopId: assignedShop.id,
          orderId,
          orderNumber: newOrder.orderNumber,
          difmRequestId: difmRecord.id,
          jobType: difmRecord.type === 'HOME_INSTALLATION' ? 'DIFM_HOME_INSTALLATION' : 'DIFM_SHOP_VISIT',
          status: 'SCHEDULED',
          customerName: cust ? `${cust.firstName} ${cust.lastName}` : (addr?.fullName || 'Customer'),
          customerPhone: cust?.phone || addr?.phone || '+91 98765 00002',
          customerEmail: cust?.email || 'customer@partsphere.in',
          vehicleInfo: 'Customer Vehicle',
          vehicleCategory: 'CAR',
          vehicleNumber: 'KA-01-XX-0000',
          serviceName: 'DIFM Professional Part Installation',
          serviceFee: difmRecord.installationFee,
          homeVisitSurcharge: difmRecord.homeVisitSurcharge,
          totalServiceAmount: fee,
          locationType: difmRecord.type === 'HOME_INSTALLATION' ? 'DOORSTEP' : 'SHOP',
          serviceAddress: difmRecord.type === 'HOME_INSTALLATION' && addr ? `${addr.line1}, ${addr.city} - ${addr.pincode}` : assignedShop.address,
          scheduledDate: difmRecord.scheduledDate || difmRecord.preferredDate || new Date(Date.now() + 86400000),
          scheduledSlot: '11:00 AM - 01:00 PM',
          notes: difmRecord.notes || 'Order placed via PartNexa checkout.',
          mechanicAssigned: 'Assigned Shop Technician',
          startedAt: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.shopJobs.unshift(newJob);

        const isPaid = newOrder.paymentStatus === 'PAID' || newOrder.paymentStatus === 'CAPTURED';
        this.commissionLedgers.unshift({
          id: 'comm-' + Math.random().toString(36).substring(2, 9),
          shopId: assignedShop.id,
          orderId,
          orderNumber: newOrder.orderNumber,
          jobId: newJob.id,
          serviceName: newJob.serviceName,
          grossAmount: fee,
          commissionRate: rate,
          commissionAmount: commCut,
          shopPayout: shopNet,
          serviceStatus: 'SCHEDULED',
          paymentStatus: isPaid ? 'PAID' : 'PENDING',
          paymentMethod: newOrder.paymentMethod || 'RAZORPAY',
          releaseStatus: 'LOCKED_PENDING_COMPLETION',
          payoutStatus: 'PENDING',
          payoutRef: null,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Auto-broadcast unassigned delivery assignment for fleet
      const isCod = newOrder.paymentMethod === 'CASH_ON_DELIVERY';
      const addr = this.addresses.find((a) => a.id === newOrder.addressId);
      const assignedShop = this.shops.find((s) => s.id === 'shop-1') || this.shops[0];
      const assignId = 'assign-' + Math.random().toString(36).substring(2, 9);
      this.deliveryAssignments.unshift({
        id: assignId,
        orderId,
        orderNumber: newOrder.orderNumber,
        usedPartListingId: null,
        deliveryPartnerId: null, // Broadcast unassigned job for any active delivery partner
        type: 'CUSTOMER_DELIVERY',
        status: 'ASSIGNED',
        pickupLocation: {
          name: assignedShop.name,
          address: assignedShop.address,
          lat: assignedShop.latitude,
          lng: assignedShop.longitude,
          contactPerson: assignedShop.ownerName || 'Dispatch Desk',
          phone: assignedShop.phone,
        },
        dropLocation: {
          name: addr?.fullName || 'Customer',
          address: addr ? `${addr.line1}, ${addr.city} - ${addr.pincode}` : 'Customer Address',
          lat: addr?.latitude || 12.9260,
          lng: addr?.longitude || 77.6762,
          contactPerson: addr?.fullName || 'Customer',
          phone: addr?.phone || '+91 98765 00002',
        },
        items: (data.items?.create || []).map((it: any) => ({
          title: 'Automotive Component',
          quantity: it.quantity || 1,
          sku: 'PN-SKU',
          price: it.unitPrice,
        })),
        paymentMethod: newOrder.paymentMethod || 'RAZORPAY',
        paymentStatus: newOrder.paymentStatus || 'PENDING',
        codAmountToCollect: isCod ? Number(newOrder.total) : 0,
        codAmountCollected: 0,
        codStatus: isCod ? 'PENDING' : 'NOT_APPLICABLE',
        deliveryFee: Number(newOrder.deliveryFee || 99),
        distanceKm: 6.2,
        navigationInfo: {
          currentDistance: '6.2 km away',
          etaMinutes: 18,
          routeSummary: 'Via arterial corridor to drop pin',
        },
        notes: 'Handle package with care.',
        assignedAt: new Date(),
        acceptedAt: null,
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return this.populateOrder(newOrder);
    },
    update: async ({ where, data }: { where: { id?: string; orderNumber?: string }; data: any }) => {
      const idx = this.orders.findIndex(
        (o) => (where.id && o.id === where.id) || (where.orderNumber && o.orderNumber === where.orderNumber)
      );
      if (idx === -1) return null;
      this.orders[idx] = { ...this.orders[idx], ...data, updatedAt: new Date() };

      // Sync commission ledger if payment cleared
      if (data.paymentStatus === 'PAID' || data.paymentStatus === 'CAPTURED') {
        const orderId = this.orders[idx].id;
        for (const comm of this.commissionLedgers) {
          if (comm.orderId === orderId) {
            comm.paymentStatus = 'PAID';
            if (comm.serviceStatus === 'COMPLETED') {
              comm.releaseStatus = 'RELEASED';
              comm.payoutStatus = 'RELEASED';
            } else {
              comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
            }
            comm.updatedAt = new Date();
          }
        }
      }

      return this.populateOrder(this.orders[idx]);
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.orders.filter((o) => !where?.userId || o.userId === where.userId).length;
    },
  };

  public orderItem = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.orderItems.filter((it) => !where?.orderId || it.orderId === where.orderId);
    },
    create: async ({ data }: { data: any }) => {
      const it = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.orderItems.push(it);
      return it;
    },
    createMany: async ({ data }: { data: any[] }) => {
      let count = 0;
      for (const d of data) {
        this.orderItems.push({ id: crypto.randomUUID(), ...d, createdAt: new Date() });
        count++;
      }
      return { count };
    },
  };

  public difmRequest = {
    findMany: async (args: any = {}) => {
      const { where, include } = args || {};
      let results = [...this.difmRequests];
      if (where) {
        if (where.shopId) results = results.filter((d) => d.shopId === where.shopId);
        if (where.orderId) results = results.filter((d) => d.orderId === where.orderId);
        if (where.status) results = results.filter((d) => d.status === where.status);
      }
      return results.map((d) => {
        let order = null;
        if (include?.order) {
          order = this.orders.find((o) => o.id === d.orderId) || null;
          if (order && include.order.include) {
            const user = this.users.find((u) => u.id === order.userId) || null;
            const address = this.addresses.find((a) => a.id === (order.shippingAddressId || order.addressId)) || null;
            const items = this.orderItems
              .filter((it) => it.orderId === order.id)
              .map((it) => ({
                ...it,
                product: initialProducts.find((p) => p.id === it.productId) || null,
              }));
            order = { ...order, user, address, items };
          }
        }
        return {
          ...d,
          shop: this.shops.find((s) => s.id === d.shopId) || null,
          ...(order ? { order } : {}),
        };
      });
    },
    findUnique: async ({ where }: { where: { id?: string; orderId?: string } }) => {
      const d = this.difmRequests.find(
        (req) => (where.id && req.id === where.id) || (where.orderId && req.orderId === where.orderId)
      );
      if (!d) return null;
      return {
        ...d,
        shop: this.shops.find((s) => s.id === d.shopId) || null,
      };
    },
    findFirst: async ({ where }: { where: any }) => {
      const d = this.difmRequests.find(
        (req) => (!where.orderId || req.orderId === where.orderId) && (!where.shopId || req.shopId === where.shopId)
      );
      if (!d) return null;
      return {
        ...d,
        shop: this.shops.find((s) => s.id === d.shopId) || null,
      };
    },
    create: async ({ data }: { data: any }) => {
      const newDIFM = {
        id: crypto.randomUUID(),
        orderId: data.orderId,
        shopId: data.shopId || null,
        type: data.type,
        status: data.status || 'PENDING',
        installationFee: Number(data.installationFee || 0),
        homeVisitSurcharge: Number(data.homeVisitSurcharge || 0),
        preferredDate: data.preferredDate || null,
        scheduledDate: data.scheduledDate || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.difmRequests.push(newDIFM);
      return {
        ...newDIFM,
        shop: this.shops.find((s) => s.id === newDIFM.shopId) || null,
      };
    },
    update: async ({ where, data }: { where: { id?: string; orderId?: string }; data: any }) => {
      const idx = this.difmRequests.findIndex(
        (d) => (where.id && d.id === where.id) || (where.orderId && d.orderId === where.orderId)
      );
      if (idx === -1) return null;
      this.difmRequests[idx] = { ...this.difmRequests[idx], ...data, updatedAt: new Date() };
      return {
        ...this.difmRequests[idx],
        shop: this.shops.find((s) => s.id === this.difmRequests[idx].shopId) || null,
      };
    },
  };

  public payment = {
    findUnique: async ({ where }: { where: { id?: string; orderId?: string; razorpayOrderId?: string } }) => {
      return (
        this.payments.find(
          (p) =>
            (where.id && p.id === where.id) ||
            (where.orderId && p.orderId === where.orderId) ||
            (where.razorpayOrderId && p.razorpayOrderId === where.razorpayOrderId)
        ) || null
      );
    },
    findFirst: async ({ where }: { where: any }) => {
      return (
        this.payments.find(
          (p) =>
            (!where.id || p.id === where.id) &&
            (!where.orderId || p.orderId === where.orderId) &&
            (!where.razorpayOrderId || p.razorpayOrderId === where.razorpayOrderId) &&
            (!where.status || p.status === where.status)
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const p = {
        id: crypto.randomUUID(),
        currency: 'INR',
        status: data.status || 'PENDING',
        ...data,
        amount: Number(data.amount),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.payments.push(p);
      return p;
    },
    update: async ({ where, data }: { where: { id?: string; orderId?: string; razorpayOrderId?: string }; data: any }) => {
      const idx = this.payments.findIndex(
        (p) =>
          (where.id && p.id === where.id) ||
          (where.orderId && p.orderId === where.orderId) ||
          (where.razorpayOrderId && p.razorpayOrderId === where.razorpayOrderId)
      );
      if (idx === -1) return null;
      this.payments[idx] = {
        ...this.payments[idx],
        ...data,
        ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
        updatedAt: new Date(),
      };

      if (data.status === 'CAPTURED' || data.status === 'PAID') {
        const orderId = this.payments[idx].orderId;
        for (const comm of this.commissionLedgers) {
          if (comm.orderId === orderId) {
            comm.paymentStatus = 'PAID';
            if (comm.serviceStatus === 'COMPLETED') {
              comm.releaseStatus = 'RELEASED';
              comm.payoutStatus = 'RELEASED';
            } else {
              comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
            }
            comm.updatedAt = new Date();
          }
        }
      }

      return this.payments[idx];
    },
  };

  public orderTracking = {
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let list = this.orderTrackings.filter((t) => !where?.orderId || t.orderId === where.orderId);
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      if (take) list = list.slice(0, take);
      return list;
    },
    create: async ({ data }: { data: any }) => {
      const t = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.orderTrackings.push(t);
      return t;
    },
  };

  // --- VEHICLE CATALOG ---
  public vehicleMake = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let results = [...initialMakes];
      if (where?.type) {
        if (where.type.in) {
          results = results.filter((m) => where.type.in.includes(m.type));
        } else {
          results = results.filter((m) => m.type === where.type);
        }
      }
      if (orderBy?.name === 'asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
      return results.map((m) => ({
        ...m,
        _count: { models: initialModels.filter((model) => model.makeId === m.id).length },
      }));
    },
    findUnique: async ({ where }: { where: { id?: string; name?: string } }) => {
      return initialMakes.find((m) => (where.id && m.id === where.id) || (where.name && m.name === where.name)) || null;
    },
  };

  public vehicleModel = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let results = [...initialModels];
      if (where?.makeId) {
        results = results.filter((m) => m.makeId === where.makeId);
      }
      if (where?.type) {
        results = results.filter((m) => m.type === where.type);
      }
      if (orderBy?.name === 'asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
      return results.map((m) => ({
        ...m,
        _count: { variants: initialVariants.filter((v) => v.modelId === m.id).length },
      }));
    },
    findUnique: async ({ where }: { where: { id?: string } }) => {
      return initialModels.find((m) => m.id === where.id) || null;
    },
  };

  public vehicleVariant = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let results = [...initialVariants];
      if (where?.modelId) {
        results = results.filter((v) => v.modelId === where.modelId);
      }
      if (Array.isArray(orderBy)) {
        results.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
      }
      return results;
    },
    findUnique: async ({ where }: { where: { id?: string } }) => {
      return initialVariants.find((v) => v.id === where.id) || null;
    },
  };

  private populateVehicle(veh: any) {
    const variant = initialVariants.find((v) => v.id === veh.variantId);
    if (!variant) return { ...veh, variant: null };
    const model = initialModels.find((m) => m.id === variant.modelId);
    const make = model ? initialMakes.find((mk) => mk.id === model.makeId) : null;
    return {
      ...veh,
      variant: {
        ...variant,
        model: model ? { ...model, make: make || null } : null,
      },
    };
  }

  public customerVehicle = {
    findMany: async ({ where, orderBy }: { where?: { userId: string }; orderBy?: any }) => {
      let results = this.customerVehicles.filter((v) => !where?.userId || v.userId === where.userId);
      results = results.map((v) => this.populateVehicle(v));
      results.sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return b.isPrimary ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return results;
    },
    findFirst: async ({ where }: { where: { id?: string; userId?: string } }) => {
      const v = this.customerVehicles.find(
        (veh) => (!where.id || veh.id === where.id) && (!where.userId || veh.userId === where.userId)
      );
      return v ? this.populateVehicle(v) : null;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      const v = this.customerVehicles.find((veh) => veh.id === where.id);
      return v ? this.populateVehicle(v) : null;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const newVehicle = {
        id: crypto.randomUUID(),
        userId: data.userId,
        variantId: data.variantId,
        nickname: data.nickname || null,
        regNumber: data.regNumber || null,
        isPrimary: Boolean(data.isPrimary),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.customerVehicles.push(newVehicle);
      return this.populateVehicle(newVehicle);
    },
    update: async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
      const idx = this.customerVehicles.findIndex((v) => v.id === where.id);
      if (idx === -1) return null;
      this.customerVehicles[idx] = {
        ...this.customerVehicles[idx],
        ...data,
        updatedAt: new Date(),
      };
      return this.populateVehicle(this.customerVehicles[idx]);
    },
    updateMany: async ({ where, data }: { where: { userId?: string }; data: any }) => {
      let count = 0;
      this.customerVehicles.forEach((v) => {
        if (!where.userId || v.userId === where.userId) {
          Object.assign(v, data);
          count++;
        }
      });
      return { count };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.customerVehicles.findIndex((v) => v.id === where.id);
      if (idx !== -1) {
        const deleted = this.customerVehicles.splice(idx, 1)[0];
        return this.populateVehicle(deleted);
      }
      return null;
    },
    count: async ({ where }: { where?: { userId: string } }) => {
      return this.customerVehicles.filter((v) => !where?.userId || v.userId === where.userId).length;
    },
  };

  // --- CATEGORIES ---
  public category = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let cats = [...initialCategories];
      if (where?.parentId !== undefined) {
        cats = cats.filter((c) => c.parentId === where.parentId);
      }
      if (where?.isActive !== undefined) {
        cats = cats.filter((c) => c.isActive === where.isActive);
      }
      if (orderBy?.sortOrder === 'asc') {
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return cats.map((c) => ({
        ...c,
        children: [],
        _count: { products: initialProducts.filter((p) => p.categoryId === c.id).length },
      }));
    },
    findUnique: async ({ where, include }: { where: { id?: string; slug?: string }; include?: any }) => {
      const c = initialCategories.find(
        (cat) => (where.id && cat.id === where.id) || (where.slug && cat.slug === where.slug)
      );
      if (!c) return null;
      return {
        ...c,
        children: [],
        parent: null,
        _count: { products: initialProducts.filter((p) => p.categoryId === c.id).length },
      };
    },
    create: async ({ data }: { data: any }) => {
      const newCat = {
        id: data.id || 'cat-' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        slug: data.slug || String(data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        parentId: data.parentId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder || initialCategories.length + 1,
      };
      initialCategories.push(newCat as any);
      return newCat;
    },
  };

  // --- BRANDS ---
  public brand = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      const brands = [...initialBrands];
      if (orderBy?.name === 'asc') {
        brands.sort((a, b) => a.name.localeCompare(b.name));
      }
      return brands.map((b) => ({
        ...b,
        _count: { products: initialProducts.filter((p) => p.brandId === b.id).length },
      }));
    },
    findUnique: async ({ where }: { where: { id?: string; slug?: string } }) => {
      return initialBrands.find((b) => (where.id && b.id === where.id) || (where.slug && b.slug === where.slug)) || null;
    },
    create: async ({ data }: { data: any }) => {
      const newBrand = {
        id: data.id || 'brand-' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        slug: data.slug || String(data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logoUrl: data.logoUrl || null,
        originCountry: data.originCountry || 'India',
        isOem: Boolean(data.isOem),
      };
      initialBrands.push(newBrand as any);
      return newBrand;
    },
  };

  // --- PRODUCT CATALOG ---
  private populateProduct(p: any) {
    const category = initialCategories.find((c) => c.id === p.categoryId) || null;
    const brandRel = initialBrands.find((b) => b.id === p.brandId) || null;
    const compatibilities = (p.compatibleVariantIds || []).map((vId: string) => {
      const variant = initialVariants.find((v) => v.id === vId);
      const model = variant ? initialModels.find((m) => m.id === variant.modelId) : null;
      const make = model ? initialMakes.find((mk) => mk.id === model.makeId) : null;
      return {
        id: `compat-${p.id}-${vId}`,
        productId: p.id,
        variantId: vId,
        variant: variant
          ? {
              ...variant,
              model: model ? { ...model, make: make || null } : null,
            }
          : null,
      };
    });

    const productInventories = this.inventories
      .filter((inv) => inv.productId === p.id)
      .map((inv) => {
        const shop = this.shops.find((s) => s.id === inv.shopId) || initialShops[0];
        return {
          ...inv,
          shop,
        };
      });

    return {
      ...p,
      category,
      brandRel,
      compatibilities,
      inventories: productInventories,
      _count: {
        reviews: p.reviews?.length || 0,
        compatibilities: compatibilities.length,
      },
    };
  }

  public product = {
    findMany: async ({
      where,
      skip = 0,
      take = 12,
      orderBy,
      include,
    }: {
      where?: any;
      skip?: number;
      take?: number;
      orderBy?: any;
      include?: any;
    } = {}) => {
      let list = initialProducts.map((p) => this.populateProduct(p));

      // Filter by active status
      if (where?.status) {
        list = list.filter((p) => p.status === where.status);
      }

      // Keyword Search
      if (where?.OR && Array.isArray(where.OR)) {
        const searchTerms = where.OR.flatMap((cond: any) =>
          Object.values(cond).map((val: any) => (val?.contains ? String(val.contains).toLowerCase() : ''))
        ).filter(Boolean);

        if (searchTerms.length > 0) {
          const query = searchTerms[0];
          list = list.filter((p) => {
            const matchesName = p.name.toLowerCase().includes(query);
            const matchesDesc = p.description.toLowerCase().includes(query);
            const matchesBrand = p.brand.toLowerCase().includes(query);
            const matchesPart = p.partNumber?.toLowerCase().includes(query);
            const matchesTags = p.tags?.some((t: string) => t.toLowerCase().includes(query));
            return matchesName || matchesDesc || matchesBrand || matchesPart || matchesTags;
          });
        }
      }

      // Filter by category
      if (where?.categoryId) {
        list = list.filter((p) => p.categoryId === where.categoryId);
      }

      // Filter by condition
      if (where?.condition) {
        list = list.filter((p) => p.condition === where.condition);
      }

      // Filter by brand
      if (where?.brandId) {
        list = list.filter((p) => p.brandId === where.brandId);
      }

      // Filter by compatibility
      if (where?.compatibilities?.some?.variantId) {
        const targetVariantId = where.compatibilities.some.variantId;
        list = list.filter((p) => p.compatibleVariantIds?.includes(targetVariantId));
      }

      // Filter by price range
      if (where?.inventories?.some) {
        const invCond = where.inventories.some;
        list = list.filter((p) => {
          const lowest = p.inventories?.[0]?.sellingPrice || p.basePrice;
          if (invCond.sellingPrice?.gte && lowest < invCond.sellingPrice.gte) return false;
          if (invCond.sellingPrice?.lte && lowest > invCond.sellingPrice.lte) return false;
          return true;
        });
      }

      // Sorting
      if (orderBy) {
        if (orderBy.name) {
          list.sort((a, b) =>
            orderBy.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
          );
        } else if (orderBy.basePrice) {
          list.sort((a, b) =>
            orderBy.basePrice === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
          );
        } else if (orderBy.rating) {
          list.sort((a, b) =>
            orderBy.rating === 'asc' ? a.rating - b.rating : b.rating - a.rating
          );
        } else if (orderBy.createdAt) {
          list.sort((a, b) =>
            orderBy.createdAt === 'asc'
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      }

      return list.slice(skip, skip + take);
    },

    findFirst: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      const results = await this.product.findMany({ where, skip: 0, take: 1, orderBy, include });
      return results[0] || null;
    },

    findUnique: async ({
      where,
      include,
    }: {
      where: { id?: string; slug?: string };
      include?: any;
    }) => {
      const p = initialProducts.find(
        (prod) => (where.id && prod.id === where.id) || (where.slug && prod.slug === where.slug)
      );
      if (!p) return null;
      return this.populateProduct(p);
    },

    count: async ({ where }: { where?: any } = {}) => {
      const items = await this.product.findMany({ where, skip: 0, take: 9999 });
      return items.length;
    },

    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = data.id || 'prod-' + Math.random().toString(36).substring(2, 9);
      const slug = data.slug || String(data.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newProd = {
        id,
        name: data.name,
        slug,
        description: data.description || '',
        sku: data.sku || ('SKU-' + Date.now()),
        partNumber: data.partNumber || null,
        categoryId: data.categoryId || 'cat-engine',
        brandId: data.brandId || 'brand-bosch',
        brand: data.brand || 'PartNexa Genuine',
        condition: data.condition || 'GENUINE_NEW',
        status: data.status || 'ACTIVE',
        basePrice: Number(data.basePrice || 999),
        mrp: Number(data.mrp || (Number(data.basePrice || 999) * 1.2)),
        warranty: data.warranty || '1 Year Manufacturer Warranty',
        rating: 5.0,
        weight: Number(data.weight || 1),
        dimensions: data.dimensions || '10x10x10 cm',
        tags: Array.isArray(data.tags) ? data.tags : ['genuine', 'oem'],
        requiresDIFM: Boolean(data.requiresDIFM),
        installationDifficulty: data.installationDifficulty || 'MODERATE',
        baseServiceFee: Number(data.baseServiceFee || 299),
        estimatedInstallTimeMinutes: Number(data.estimatedInstallTimeMinutes || 30),
        images: Array.isArray(data.images) ? data.images : [
          { id: 'img-' + Date.now(), url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600', isPrimary: true }
        ],
        compatibleVariantIds: Array.isArray(data.compatibleVariantIds) ? data.compatibleVariantIds : [],
        specs: [],
        inventories: [],
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      initialProducts.unshift(newProd as any);

      // Create connected inventory record for this product
      this.inventories.unshift({
        id: 'inv-' + Date.now(),
        productId: newProd.id,
        shopId: 'shop-1',
        quantity: Number(data.stockQuantity || 25),
        reservedQty: 0,
        sellingPrice: newProd.basePrice,
        isAvailable: true,
        availabilityStatus: 'IN_STOCK',
        lowStockThreshold: 5,
        updatedAt: new Date(),
      });

      return this.populateProduct(newProd);
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = initialProducts.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      initialProducts[idx] = { ...initialProducts[idx], ...data, updatedAt: new Date() };
      return this.populateProduct(initialProducts[idx]);
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const idx = initialProducts.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      const [removed] = initialProducts.splice(idx, 1);
      return removed;
    },
  };

  public productCompatibility = {
    findFirst: async ({ where }: { where: { productId: string; variantId?: string } }) => {
      const p = initialProducts.find((prod) => prod.id === where.productId);
      if (!p) return null;
      if (where.variantId) {
        if (!p.compatibleVariantIds?.includes(where.variantId)) return null;
        return {
          id: `compat-${p.id}-${where.variantId}`,
          productId: p.id,
          variantId: where.variantId,
        };
      }
      return null;
    },
    findMany: async ({ where }: { where: { productId: string } }) => {
      const p = initialProducts.find((prod) => prod.id === where.productId);
      if (!p) return [];
      return (p.compatibleVariantIds || []).map((vId) => {
        const variant = initialVariants.find((v) => v.id === vId);
        const model = variant ? initialModels.find((m) => m.id === variant.modelId) : null;
        const make = model ? initialMakes.find((mk) => mk.id === model.makeId) : null;
        return {
          id: `compat-${p.id}-${vId}`,
          productId: p.id,
          variantId: vId,
          variant: variant ? { ...variant, model: model ? { ...model, make: make || null } : null } : null,
        };
      });
    },
  };

  // --- SUBSCRIPTIONS & ENTITLEMENTS ---
  public populateSubscription(sub: any) {
    if (!sub) return null;
    const rawPlan = this.subscriptionPlans.find((p) => p.id === sub.planId) || null;
    const plan = rawPlan
      ? {
          ...rawPlan,
          entitlements: this.subscriptionEntitlements.filter((e) => e.planId === sub.planId),
        }
      : null;
    const rawEntitlements = this.subscriptionEntitlements.filter((e) => e.planId === sub.planId);
    const usages = sub.entitlementUsages || {};

    const entitlements = rawEntitlements.map((e) => {
      const usedCount =
        typeof usages === 'object' && !Array.isArray(usages)
          ? (usages[e.featureCode] || 0)
          : Array.isArray(usages)
          ? usages.filter((u: any) => u.featureCode === e.featureCode).length
          : 0;
      const isUnlimited = Boolean(e.isUnlimited || e.limitValue === null || e.quotaLimit === null);
      const limit = e.limitValue !== undefined ? e.limitValue : e.quotaLimit;
      const remainingCount = isUnlimited ? null : Math.max(0, (limit || 0) - usedCount);
      return {
        ...e,
        name: e.featureName || e.name,
        quotaLimit: limit,
        limitValue: limit,
        usedCount,
        remainingCount,
        isUnlimited,
      };
    });

    let vehicle = null;
    if (sub.vehicleId) {
      const rawVeh = this.customerVehicles.find((v) => v.id === sub.vehicleId);
      if (rawVeh) {
        vehicle = this.populateVehicle(rawVeh);
      }
    }

    const payments = this.subscriptionPayments.filter((p) => p.subscriptionId === sub.id);

    return {
      ...sub,
      plan,
      entitlements,
      vehicle,
      payments,
    };
  }

  public subscriptionPlan = {
    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      let list = [...this.subscriptionPlans];
      if (where?.isActive !== undefined) {
        list = list.filter((p) => p.isActive === where.isActive);
      }
      if (orderBy?.price === 'asc') {
        list.sort((a, b) => Number(a.price || a.monthlyPrice) - Number(b.price || b.monthlyPrice));
      }
      return list.map((p) => ({
        ...p,
        entitlements: this.subscriptionEntitlements.filter((e) => e.planId === p.id),
      }));
    },

    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      let found = this.subscriptionPlans.find((p) => {
        if (where.id && p.id === where.id) return true;
        if (where.slug && p.slug === where.slug) return true;
        if (where.OR && Array.isArray(where.OR)) {
          return where.OR.some((cond: any) => (cond.id && p.id === cond.id) || (cond.slug && p.slug === cond.slug));
        }
        return false;
      });

      if (!found) return null;
      return {
        ...found,
        entitlements: this.subscriptionEntitlements.filter((e) => e.planId === found.id),
      };
    },

    findUnique: async ({ where, include }: { where: { id?: string; slug?: string }; include?: any }) => {
      const found = this.subscriptionPlans.find(
        (p) => (where.id && p.id === where.id) || (where.slug && p.slug === where.slug)
      );
      if (!found) return null;
      return {
        ...found,
        entitlements: this.subscriptionEntitlements.filter((e) => e.planId === found.id),
      };
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.subscriptionPlans.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...data, updatedAt: new Date() };
      return this.subscriptionPlans[idx];
    },
  };

  public subscriptionEntitlement = {
    findMany: async ({ where }: { where?: { planId?: string } } = {}) => {
      let list = [...this.subscriptionEntitlements];
      if (where?.planId) {
        list = list.filter((e) => e.planId === where.planId);
      }
      return list;
    },
  };

  public customerSubscription = {
    findFirst: async ({ where, include, orderBy }: { where: any; include?: any; orderBy?: any }) => {
      let list = [...this.customerSubscriptions];

      if (where.id) list = list.filter((s) => s.id === where.id);
      if (where.userId) list = list.filter((s) => s.userId === where.userId);
      if (where.status) {
        if (typeof where.status === 'string') {
          list = list.filter((s) => s.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((s) => where.status.in.includes(s.status));
        }
      }

      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const match = list[0];
      return match ? this.populateSubscription(match) : null;
    },

    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const match = this.customerSubscriptions.find((s) => s.id === where.id);
      return match ? this.populateSubscription(match) : null;
    },

    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      let list = [...this.customerSubscriptions];

      if (where?.userId) list = list.filter((s) => s.userId === where.userId);
      if (where?.status) {
        if (typeof where.status === 'string') {
          list = list.filter((s) => s.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((s) => where.status.in.includes(s.status));
        }
      }

      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return list.map((s) => this.populateSubscription(s));
    },

    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.customerSubscriptions];
      if (where?.userId) list = list.filter((s) => s.userId === where.userId);
      if (where?.status) {
        if (typeof where.status === 'string') {
          list = list.filter((s) => s.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((s) => where.status.in.includes(s.status));
        }
      }
      return list.length;
    },

    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = 'sub_' + Math.random().toString(36).substring(2, 11);
      const newSub = {
        id,
        userId: data.userId,
        planId: data.planId,
        billingCycle: data.billingCycle || 'MONTHLY',
        status: data.status || 'ACTIVE',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
        pricePaid: Number(data.pricePaid || 0),
        vehicleId: data.vehicleId || null,
        vehicleReg: data.vehicleReg || null,
        paymentMethod: data.paymentMethod || 'RAZORPAY',
        razorpayOrderId: data.razorpayOrderId || null,
        razorpayPaymentId: data.razorpayPaymentId || null,
        razorpaySignature: data.razorpaySignature || null,
        cancellationReason: data.cancellationReason || null,
        cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : null,
        entitlementUsages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.customerSubscriptions.push(newSub);
      return this.populateSubscription(newSub);
    },

    update: async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
      const idx = this.customerSubscriptions.findIndex((s) => s.id === where.id);
      if (idx === -1) return null;

      const current = this.customerSubscriptions[idx];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date(),
      };

      this.customerSubscriptions[idx] = updated;
      return this.populateSubscription(updated);
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.customerSubscriptions.findIndex((s) => s.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.customerSubscriptions.splice(idx, 1);
      return removed;
    },
  };

  public subscriptionPayment = {
    create: async ({ data }: { data: any }) => {
      const id = 'sub_pay_' + Math.random().toString(36).substring(2, 11);
      const newPayment = {
        id,
        subscriptionId: data.subscriptionId,
        userId: data.userId,
        amount: Number(data.amount || 0),
        method: data.method || data.paymentMethod || 'RAZORPAY',
        paymentMethod: data.paymentMethod || data.method || 'RAZORPAY',
        status: data.status || data.paymentStatus || 'PAID',
        paymentStatus: data.paymentStatus || data.status || 'PAID',
        gatewayPaymentId: data.gatewayPaymentId || null,
        gatewayOrderId: data.gatewayOrderId || null,
        createdAt: new Date(),
      };
      this.subscriptionPayments.push(newPayment);
      return newPayment;
    },

    findMany: async ({ where }: { where?: { subscriptionId?: string; userId?: string } } = {}) => {
      let list = [...this.subscriptionPayments];
      if (where?.subscriptionId) list = list.filter((p) => p.subscriptionId === where.subscriptionId);
      if (where?.userId) list = list.filter((p) => p.userId === where.userId);
      return list;
    },

    findFirst: async ({ where }: { where: any }) => {
      return this.subscriptionPayments.find((p) => {
        if (where.subscriptionId && p.subscriptionId !== where.subscriptionId) return false;
        if (where.gatewayOrderId && p.gatewayOrderId !== where.gatewayOrderId) return false;
        return true;
      }) || null;
    },

    update: async ({ where, data }: { where: { id?: string; gatewayOrderId?: string }; data: any }) => {
      const idx = this.subscriptionPayments.findIndex((p) =>
        (where.id && p.id === where.id) || (where.gatewayOrderId && p.gatewayOrderId === where.gatewayOrderId)
      );
      if (idx === -1) return null;
      this.subscriptionPayments[idx] = { ...this.subscriptionPayments[idx], ...data };
      return this.subscriptionPayments[idx];
    },
  };

  // --- USED PART MARKETPLACE ---
  public usedPartListing = {
    findMany: async ({ where, include, orderBy, skip, take }: { where?: any; include?: any; orderBy?: any; skip?: number; take?: number } = {}) => {
      let list = [...this.usedPartListings];

      if (where?.sellerId) list = list.filter((item) => item.sellerId === where.sellerId);
      if (where?.status) {
        if (typeof where.status === 'string') {
          list = list.filter((item) => item.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((item) => where.status.in.includes(item.status));
        }
      }
      if (where?.isSold !== undefined) list = list.filter((item) => item.isSold === where.isSold);
      if (where?.category) list = list.filter((item) => item.category === where.category);

      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (orderBy?.expectedPrice === 'asc' || orderBy?.askingPrice === 'asc') {
        list.sort((a, b) => Number(a.expectedPrice || a.askingPrice) - Number(b.expectedPrice || b.askingPrice));
      }

      const offset = skip || 0;
      const limit = take !== undefined ? take : list.length;
      list = list.slice(offset, offset + limit);

      return list.map((item) => {
        const seller = include?.seller ? this.users.find((u) => u.id === item.sellerId) : null;
        const intake = include?.intake ? this.usedPartIntakes.find((i) => i.listingId === item.id) : null;
        const assignedShop = include?.assignedShop ? this.shops.find((s) => s.id === item.assignedShopId) : null;
        const payouts = include?.payouts ? this.usedPartPayouts.filter((p) => p.listingId === item.id) : [];
        const verifications = include?.verifications ? this.usedPartVerifications.filter((v) => v.listingId === item.id) : [];
        return {
          ...item,
          askingPrice: item.expectedPrice || item.askingPrice,
          seller: seller ? { firstName: seller.firstName, lastName: seller.lastName, email: seller.email, phone: seller.phone } : item.seller || null,
          intake: intake || item.intake || null,
          assignedShop: assignedShop || item.assignedShop || null,
          payouts,
          verifications,
        };
      });
    },

    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const match = this.usedPartListings.find((item) => {
        if (where.id && item.id !== where.id) return false;
        if (where.sellerId && item.sellerId !== where.sellerId) return false;
        if (where.status && item.status !== where.status) return false;
        return true;
      });
      if (!match) return null;
      const seller = include?.seller ? this.users.find((u) => u.id === match.sellerId) : null;
      const intake = include?.intake ? this.usedPartIntakes.find((i) => i.listingId === match.id) : null;
      const assignedShop = include?.assignedShop ? this.shops.find((s) => s.id === match.assignedShopId) : null;
      const payouts = include?.payouts ? this.usedPartPayouts.filter((p) => p.listingId === match.id) : [];
      const verifications = include?.verifications ? this.usedPartVerifications.filter((v) => v.listingId === match.id) : [];
      return {
        ...match,
        askingPrice: match.expectedPrice || match.askingPrice,
        seller: seller ? { firstName: seller.firstName, lastName: seller.lastName, email: seller.email, phone: seller.phone } : match.seller || null,
        intake: intake || match.intake || null,
        assignedShop: assignedShop || match.assignedShop || null,
        payouts,
        verifications,
      };
    },

    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const match = this.usedPartListings.find((item) => item.id === where.id);
      if (!match) return null;
      const seller = include?.seller ? this.users.find((u) => u.id === match.sellerId) : null;
      const intake = include?.intake ? this.usedPartIntakes.find((i) => i.listingId === match.id) : null;
      const assignedShop = include?.assignedShop ? this.shops.find((s) => s.id === match.assignedShopId) : null;
      const payouts = include?.payouts ? this.usedPartPayouts.filter((p) => p.listingId === match.id) : [];
      const verifications = include?.verifications ? this.usedPartVerifications.filter((v) => v.listingId === match.id) : [];
      return {
        ...match,
        askingPrice: match.expectedPrice || match.askingPrice,
        seller: seller ? { firstName: seller.firstName, lastName: seller.lastName, email: seller.email, phone: seller.phone } : match.seller || null,
        intake: intake || match.intake || null,
        assignedShop: assignedShop || match.assignedShop || null,
        payouts,
        verifications,
      };
    },

    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = 'used_' + Math.random().toString(36).substring(2, 11);
      const expectedPrice = Number(data.expectedPrice || data.askingPrice || 0);
      const condition = data.condition || 'GOOD';
      
      // Calculate automated initial estimated valuation range (70-85% based on condition)
      let valuationMultiplier = 0.75;
      if (condition === 'LIKE_NEW' || condition === 'EXCELLENT') valuationMultiplier = 0.85;
      else if (condition === 'GOOD' || condition === 'VERY_GOOD') valuationMultiplier = 0.78;
      else valuationMultiplier = 0.65;

      const estimatedValuation = data.estimatedValuation ? Number(data.estimatedValuation) : Math.round(expectedPrice * valuationMultiplier);

      const newListing = {
        id,
        sellerId: data.sellerId,
        title: data.title,
        partNumber: data.partNumber || null,
        vehicleModel: data.vehicleModel || 'Universal Fit',
        vehicleId: data.vehicleId || null,
        category: data.category || 'PARTS',
        condition,
        conditionGrade: data.conditionGrade || null,
        description: data.description || '',
        purchaseAge: data.purchaseAge || null,
        expectedPrice,
        askingPrice: expectedPrice,
        estimatedValuation,
        finalValuation: data.finalValuation ? Number(data.finalValuation) : null,
        payoutStatus: data.payoutStatus || 'PENDING',
        payoutAmount: data.payoutAmount ? Number(data.payoutAmount) : 0,
        payoutMethod: data.payoutMethod || 'UPI',
        payoutTransactionRef: data.payoutTransactionRef || null,
        images: Array.isArray(data.images) ? data.images : [],
        location: data.location || 'Pan-India',
        pickupAddress: data.pickupAddress || null,
        status: data.status || 'SUBMITTED',
        verificationStatus: data.verificationStatus || 'SUBMITTED',
        verificationNotes: data.verificationNotes || 'Listing submitted for PartNexa technician pickup and verification.',
        rejectionReason: data.rejectionReason || null,
        isSold: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.usedPartListings.unshift(newListing);
      return newListing;
    },

    update: async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
      const idx = this.usedPartListings.findIndex((item) => item.id === where.id);
      if (idx === -1) return null;

      const current = this.usedPartListings[idx];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date(),
      };

      this.usedPartListings[idx] = updated;
      return updated;
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.usedPartListings.findIndex((item) => item.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.usedPartListings.splice(idx, 1);
      return removed;
    },

    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.usedPartListings];
      if (where?.sellerId) list = list.filter((item) => item.sellerId === where.sellerId);
      if (where?.status) list = list.filter((item) => item.status === where.status);
      return list.length;
    },
  };

  public supportTicket = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = [...this.supportTickets];
      if (where?.userId) list = list.filter((t) => t.userId === where.userId);
      if (where?.userRole) list = list.filter((t) => t.userRole === where.userRole);
      if (where?.status) list = list.filter((t) => t.status === where.status);
      if (where?.priority) list = list.filter((t) => t.priority === where.priority);
      if (where?.assignedAdminId) list = list.filter((t) => t.assignedAdminId === where.assignedAdminId);
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return list;
    },

    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.supportTickets.find((t) => t.id === where.id) || null;
    },

    findFirst: async ({ where }: { where: any }) => {
      return (
        this.supportTickets.find((t) => {
          if (where.id && t.id !== where.id) return false;
          if (where.ticketNumber && t.ticketNumber !== where.ticketNumber) return false;
          return true;
        }) || null
      );
    },

    create: async ({ data }: { data: any }) => {
      const id = 'tkt-' + Math.random().toString(36).substring(2, 9);
      const ticketNumber = 'TKT-2026-' + Math.floor(1000 + Math.random() * 9000);
      const priority = data.priority || 'MEDIUM';
      const slaMap: Record<string, number> = { URGENT: 2, HIGH: 6, MEDIUM: 24, LOW: 48 };
      const slaHours = slaMap[priority] || 24;
      const slaDeadline = new Date(Date.now() + slaHours * 3600000);

      const initialMessage = data.messages?.create?.body || data.message || data.subject;
      const messages = initialMessage
        ? [
            {
              id: 'msg-' + Date.now(),
              senderId: data.userId,
              senderName: data.userName || 'User',
              senderRole: data.userRole || 'CUSTOMER',
              message: initialMessage,
              createdAt: new Date(),
            },
          ]
        : [];

      const newTicket = {
        id,
        ticketNumber,
        userId: data.userId,
        userName: data.userName || 'User',
        userEmail: data.userEmail || '',
        userRole: data.userRole || 'CUSTOMER',
        category: data.category || 'GENERAL',
        subject: data.subject,
        priority,
        slaHours,
        slaDeadline,
        assignedAdminId: data.assignedAdminId || null,
        assignedAdminName: data.assignedAdminName || null,
        status: data.status || 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.supportTickets.unshift(newTicket);
      return newTicket;
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.supportTickets.findIndex((t) => t.id === where.id);
      if (idx === -1) return null;
      const current = this.supportTickets[idx];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date(),
      };
      if (data.status === 'RESOLVED' && !current.resolvedAt) {
        updated.resolvedAt = new Date();
      }
      this.supportTickets[idx] = updated;
      return updated;
    },

    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.supportTickets];
      if (where?.status) list = list.filter((t) => t.status === where.status);
      return list.length;
    },
  };

  public ticketMessage = {
    create: async ({ data }: { data: any }) => {
      const ticket = this.supportTickets.find((t) => t.id === data.ticketId);
      const newMsg = {
        id: 'msg-' + Date.now(),
        ticketId: data.ticketId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole || 'ADMIN',
        message: data.message,
        createdAt: new Date(),
      };
      if (ticket) {
        ticket.messages = ticket.messages || [];
        ticket.messages.push(newMsg);
        ticket.updatedAt = new Date();
      }
      return newMsg;
    },
  };

  public commissionConfig = {
    findFirst: async ({ orderBy }: { orderBy?: any } = {}) => {
      return {
        id: 'comm-cfg-default',
        defaultRate: this.platformConfigs.commissions?.defaultRate || 12.0,
        minRate: 10.0,
        maxRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    create: async ({ data }: { data: any }) => {
      this.platformConfigs.commissions.defaultRate = Number(data.defaultRate);
      return {
        id: 'comm-cfg-' + Date.now(),
        defaultRate: Number(data.defaultRate),
        minRate: 10.0,
        maxRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  public notifications: any[] = [];

  public notification = {
    create: async ({ data }: { data: any }) => {
      const newNotif = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: data.userId,
        channel: data.channel || 'IN_APP',
        status: data.status || 'DELIVERED',
        title: data.title,
        body: data.body,
        data: data.data || null,
        isRead: Boolean(data.isRead),
        readAt: data.readAt || null,
        createdAt: new Date(),
      };
      this.notifications.push(newNotif);
      return newNotif;
    },
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let list = [...this.notifications];
      if (where?.userId) list = list.filter((n) => n.userId === where.userId);
      if (where?.isRead !== undefined) list = list.filter((n) => n.isRead === where.isRead);
      if (take) list = list.slice(0, take);
      return list;
    },
    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.notifications];
      if (where?.userId) list = list.filter((n) => n.userId === where.userId);
      if (where?.isRead !== undefined) list = list.filter((n) => n.isRead === where.isRead);
      return list.length;
    },
    findFirst: async ({ where }: { where?: any } = {}) => {
      let list = [...this.notifications];
      if (where?.id) list = list.filter((n) => n.id === where.id);
      if (where?.userId) list = list.filter((n) => n.userId === where.userId);
      if (where?.isRead !== undefined) list = list.filter((n) => n.isRead === where.isRead);
      return list[0] || null;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.notifications.findIndex((n) => n.id === where.id);
      if (idx !== -1) {
        this.notifications[idx] = { ...this.notifications[idx], ...data, updatedAt: new Date() };
        return this.notifications[idx];
      }
      return null;
    },
    updateMany: async ({ where, data }: { where?: any; data: any }) => {
      let count = 0;
      this.notifications = this.notifications.map((n) => {
        if ((!where?.userId || n.userId === where.userId) && (where?.isRead === undefined || n.isRead === where.isRead)) {
          count++;
          return { ...n, ...data, updatedAt: new Date() };
        }
        return n;
      });
      return { count };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.notifications.findIndex((n) => n.id === where.id);
      if (idx !== -1) {
        const deleted = this.notifications.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    deleteMany: async ({ where }: { where?: any } = {}) => {
      if (where?.userId) {
        this.notifications = this.notifications.filter((n) => n.userId !== where.userId);
      }
      return { count: 1 };
    },
  };
  public stockMovements: any[] = [];

  public stockMovement = {
    create: async ({ data }: { data: any }) => {
      const record = {
        id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        inventoryId: data.inventoryId,
        type: data.type || 'RETURN',
        quantity: Number(data.quantity || 1),
        previousQty: Number(data.previousQty || 0),
        newQty: Number(data.newQty || 0),
        reason: data.reason || null,
        referenceType: data.referenceType || 'RETURN',
        referenceId: data.referenceId || null,
        createdAt: new Date(),
      };
      this.stockMovements.push(record);
      return record;
    },
    findMany: async ({ where }: { where?: any } = {}) => {
      let list = [...this.stockMovements];
      if (where?.inventoryId) list = list.filter((m) => m.inventoryId === where.inventoryId);
      if (where?.type) list = list.filter((m) => m.type === where.type);
      if (where?.referenceId) list = list.filter((m) => m.referenceId === where.referenceId);
      return list;
    },
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = [...this.stockMovements];
      if (where?.inventoryId) list = list.filter((m) => m.inventoryId === where.inventoryId);
      if (where?.type) list = list.filter((m) => m.type === where.type);
      if (where?.referenceId) list = list.filter((m) => m.referenceId === where.referenceId);
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list[0] || null;
    },
  };

  public returnRequests: any[] = [];

  public returnRequest = {
    create: async ({ data }: { data: any }) => {
      const id = data.id || 'ret-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const newRet = {
        id,
        orderId: data.orderId,
        orderItemId: data.orderItemId,
        userId: data.userId,
        quantity: Math.max(1, Number(data.quantity || 1)),
        reason: data.reason,
        details: data.details || null,
        photos: Array.isArray(data.photos) ? data.photos : [],
        status: data.status || 'REQUESTED',
        refundAmount: Number(data.refundAmount || 0),
        requestedAt: data.requestedAt || new Date(),
        approvedAt: data.approvedAt || null,
        pickupAt: data.pickupAt || null,
        receivedAt: data.receivedAt || null,
        inspectedAt: data.inspectedAt || null,
        refundedAt: data.refundedAt || null,
        rejectionReason: data.rejectionReason || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.returnRequests.unshift(newRet);
      return newRet;
    },
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = [...this.returnRequests];
      if (where?.userId) list = list.filter((r) => r.userId === where.userId);
      if (where?.orderId) list = list.filter((r) => r.orderId === where.orderId);
      if (where?.orderItemId) list = list.filter((r) => r.orderItemId === where.orderItemId);
      if (where?.status) {
        if (typeof where.status === 'string') list = list.filter((r) => r.status === where.status);
        else if (where.status.in && Array.isArray(where.status.in)) list = list.filter((r) => where.status.in.includes(r.status));
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list.map((r) => {
        const order = this.orders.find((o) => o.id === r.orderId);
        const orderItem = this.orderItems.find((oi) => oi.id === r.orderItemId);
        const user = this.users.find((u) => u.id === r.userId);
        const product = orderItem ? initialProducts.find((p) => p.id === orderItem.productId) : null;
        return {
          ...r,
          order: order ? this.populateOrder(order) : null,
          orderItem: orderItem ? { ...orderItem, product: product ? this.populateProduct(product) : null } : null,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null,
        };
      });
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const r = this.returnRequests.find((item) => item.id === where.id);
      if (!r) return null;
      const order = this.orders.find((o) => o.id === r.orderId);
      const orderItem = this.orderItems.find((oi) => oi.id === r.orderItemId);
      const user = this.users.find((u) => u.id === r.userId);
      const product = orderItem ? initialProducts.find((p) => p.id === orderItem.productId) : null;
      return {
        ...r,
        order: order ? this.populateOrder(order) : null,
        orderItem: orderItem ? { ...orderItem, product: product ? this.populateProduct(product) : null } : null,
        user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null,
      };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const r = this.returnRequests.find((item) => {
        if (where?.id && item.id !== where.id) return false;
        if (where?.orderId && item.orderId !== where.orderId) return false;
        if (where?.orderItemId && item.orderItemId !== where.orderItemId) return false;
        if (where?.userId && item.userId !== where.userId) return false;
        if (where?.status) {
          if (typeof where.status === 'string' && item.status !== where.status) return false;
          if (where.status.in && Array.isArray(where.status.in) && !where.status.in.includes(item.status)) return false;
        }
        return true;
      });
      if (!r) return null;
      const order = this.orders.find((o) => o.id === r.orderId);
      const orderItem = this.orderItems.find((oi) => oi.id === r.orderItemId);
      const user = this.users.find((u) => u.id === r.userId);
      const product = orderItem ? initialProducts.find((p) => p.id === orderItem.productId) : null;
      return {
        ...r,
        order: order ? this.populateOrder(order) : null,
        orderItem: orderItem ? { ...orderItem, product: product ? this.populateProduct(product) : null } : null,
        user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null,
      };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.returnRequests.findIndex((r) => r.id === where.id);
      if (idx === -1) return null;
      this.returnRequests[idx] = { ...this.returnRequests[idx], ...data, updatedAt: new Date() };
      return this.returnRequests[idx];
    },
    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.returnRequests];
      if (where?.orderId) list = list.filter((r) => r.orderId === where.orderId);
      if (where?.orderItemId) list = list.filter((r) => r.orderItemId === where.orderItemId);
      if (where?.userId) list = list.filter((r) => r.userId === where.userId);
      if (where?.status) list = list.filter((r) => r.status === where.status);
      return list.length;
    },
  };

  // --- PROCUREMENT: SUPPLIERS ---
  public supplier = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = [...this.suppliers];
      if (where?.isActive !== undefined) list = list.filter((s) => s.isActive === where.isActive);
      if (where?.supplierType && where.supplierType !== 'ALL') list = list.filter((s) => s.supplierType === where.supplierType);
      if (where?.status && where.status !== 'ALL') list = list.filter((s) => s.verificationStatus === where.status);
      if (where?.search) {
        const q = String(where.search).toLowerCase();
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.contactPerson?.toLowerCase().includes(q) ||
            s.city?.toLowerCase().includes(q)
        );
      }
      if (where?.category) {
        list = list.filter((s) => (s.categories || []).some((c: string) => c.toLowerCase().includes(String(where.category).toLowerCase())));
      }
      return list.map((s) => ({
        ...s,
        catalogItems: include?.catalogItems ? this.supplierCatalogItems.filter((c) => c.supplierId === s.id) : undefined,
        purchaseOrders: include?.purchaseOrders ? this.purchaseOrders.filter((po) => po.supplierId === s.id) : undefined,
      }));
    },
    findUnique: async ({ where, include }: { where: { id?: string; slug?: string }; include?: any }) => {
      const s = this.suppliers.find((item) => (where.id && item.id === where.id) || (where.slug && item.slug === where.slug));
      if (!s) return null;
      return {
        ...s,
        catalogItems: include?.catalogItems ? this.supplierCatalogItems.filter((c) => c.supplierId === s.id) : undefined,
        purchaseOrders: include?.purchaseOrders ? this.purchaseOrders.filter((po) => po.supplierId === s.id) : undefined,
      };
    },
    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      const s = this.suppliers.find((item) => {
        if (where?.id && item.id !== where.id) return false;
        if (where?.slug && item.slug !== where.slug) return false;
        if (where?.isActive !== undefined && item.isActive !== where.isActive) return false;
        return true;
      });
      if (!s) return null;
      return {
        ...s,
        catalogItems: include?.catalogItems ? this.supplierCatalogItems.filter((c) => c.supplierId === s.id) : undefined,
      };
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || 'sup-' + Math.random().toString(36).substring(2, 9);
      const newSup = {
        id,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        contactPerson: data.contactPerson || 'Procurement Desk',
        email: data.email || 'orders@supplier.in',
        phone: data.phone || '+91 98000 00000',
        address: data.address || null,
        city: data.city || 'Bengaluru',
        state: data.state || 'Karnataka',
        gstNumber: data.gstNumber || '29AABCS1234F1Z1',
        logoUrl: data.logoUrl || null,
        supplierType: data.supplierType || 'DISTRIBUTOR',
        categories: data.categories || ['Brake System', 'Engine Components'],
        supportedVehicles: data.supportedVehicles || ['4 Wheeler'],
        verificationStatus: data.verificationStatus || 'VERIFIED',
        isDemo: data.isDemo !== undefined ? data.isDemo : true,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.suppliers.push(newSup);
      return newSup;
    },
    update: async ({ where, data }: { where: { id?: string; slug?: string }; data: any }) => {
      const idx = this.suppliers.findIndex((s) => (where.id && s.id === where.id) || (where.slug && s.slug === where.slug));
      if (idx === -1) return null;
      this.suppliers[idx] = { ...this.suppliers[idx], ...data, updatedAt: new Date() };
      return this.suppliers[idx];
    },
    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.suppliers];
      if (where?.isActive !== undefined) list = list.filter((s) => s.isActive === where.isActive);
      return list.length;
    },
  };

  // --- PROCUREMENT: CATALOG ITEMS ---
  public supplierCatalogItem = {
    findMany: async ({ where, orderBy, include, take }: { where?: any; orderBy?: any; include?: any; take?: number } = {}) => {
      let list = [...this.supplierCatalogItems];
      if (where?.supplierId) list = list.filter((c) => c.supplierId === where.supplierId);
      if (where?.brandName && where.brandName !== 'ALL') list = list.filter((c) => c.brandName === where.brandName);
      if (where?.categoryName && where.categoryName !== 'ALL') list = list.filter((c) => c.categoryName === where.categoryName);
      if (where?.vehicleMakeName && where.vehicleMakeName !== 'ALL') list = list.filter((c) => c.vehicleMakeName === where.vehicleMakeName);
      if (where?.vehicleModelName && where.vehicleModelName !== 'ALL') list = list.filter((c) => c.vehicleModelName === where.vehicleModelName);
      if (where?.search) {
        const q = String(where.search).toLowerCase();
        list = list.filter(
          (c) =>
            c.partName.toLowerCase().includes(q) ||
            c.partNumber.toLowerCase().includes(q) ||
            c.brandName.toLowerCase().includes(q) ||
            c.vehicleMakeName.toLowerCase().includes(q) ||
            c.vehicleModelName.toLowerCase().includes(q)
        );
      }
      if (where?.OR && Array.isArray(where.OR)) {
        list = list.filter((c) =>
          where.OR.some((cond: any) => {
            const check = (val: string | null | undefined, match: any) => {
              if (!val) return false;
              if (typeof match === 'string') return val.toLowerCase() === match.toLowerCase();
              if (match?.contains) return val.toLowerCase().includes(String(match.contains).toLowerCase());
              return false;
            };
            if (cond.partNumber && check(c.partNumber, cond.partNumber)) return true;
            if (cond.partName && check(c.partName, cond.partName)) return true;
            if (cond.brandName && check(c.brandName, cond.brandName)) return true;
            if (cond.vehicleMakeName && check(c.vehicleMakeName, cond.vehicleMakeName)) return true;
            if (cond.vehicleModelName && check(c.vehicleModelName, cond.vehicleModelName)) return true;
            if (cond.supplier?.name && check(this.suppliers.find((s) => s.id === c.supplierId)?.name, cond.supplier.name)) return true;
            return false;
          })
        );
      }
      if (take && typeof take === 'number') {
        list = list.slice(0, take);
      }
      return list.map((item) => {
        const sup = this.suppliers.find((s) => s.id === item.supplierId);
        const tiers = this.bulkPriceTiers.filter((t) => t.catalogItemId === item.id).sort((a, b) => a.minQuantity - b.minQuantity);
        const prod = initialProducts.find((p) => p.id === item.productId);
        return {
          ...item,
          unitPrice: Number(item.unitPrice),
          bulkPrice: Number(item.bulkPrice),
          supplier: sup || null,
          bulkPriceTiers: tiers,
          product: prod ? this.populateProduct(prod) : null,
        };
      });
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const item = this.supplierCatalogItems.find((c) => c.id === where.id);
      if (!item) return null;
      const sup = this.suppliers.find((s) => s.id === item.supplierId);
      const tiers = this.bulkPriceTiers.filter((t) => t.catalogItemId === item.id).sort((a, b) => a.minQuantity - b.minQuantity);
      const prod = initialProducts.find((p) => p.id === item.productId);
      return {
        ...item,
        unitPrice: Number(item.unitPrice),
        bulkPrice: Number(item.bulkPrice),
        supplier: sup || null,
        bulkPriceTiers: tiers,
        product: prod ? this.populateProduct(prod) : null,
      };
    },
    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      const items = await this.supplierCatalogItem.findMany({ where, include });
      return items[0] || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || 'cat-' + Math.random().toString(36).substring(2, 9);
      const newItem = {
        id,
        supplierId: data.supplierId,
        productId: data.productId || null,
        partName: data.partName,
        partNumber: data.partNumber,
        categoryName: data.categoryName || 'General Consumables',
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        brandName: data.brandName || 'Aftermarket',
        vehicleMakeId: data.vehicleMakeId || null,
        vehicleMakeName: data.vehicleMakeName || 'Universal',
        vehicleModelId: data.vehicleModelId || null,
        vehicleModelName: data.vehicleModelName || 'Universal',
        vehicleVariantId: data.vehicleVariantId || null,
        variantName: data.variantName || null,
        year: data.year || 2023,
        condition: data.condition || 'GENUINE_NEW',
        unitPrice: Number(data.unitPrice),
        bulkPrice: Number(data.bulkPrice || data.unitPrice),
        moq: Number(data.moq || 10),
        stockQuantity: Number(data.stockQuantity || 500),
        warranty: data.warranty || '12 Months Warranty',
        leadTime: data.leadTime || '3–5 days',
        leadTimeDays: Number(data.leadTimeDays || 3),
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        imageUrl: data.imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.supplierCatalogItems.push(newItem);

      if (data.bulkPriceTiers?.create && Array.isArray(data.bulkPriceTiers.create)) {
        for (const t of data.bulkPriceTiers.create) {
          this.bulkPriceTiers.push({
            id: 'tier-' + Math.random().toString(36).substring(2, 9),
            catalogItemId: id,
            minQuantity: Number(t.minQuantity),
            maxQuantity: t.maxQuantity !== undefined && t.maxQuantity !== null ? Number(t.maxQuantity) : null,
            unitPrice: Number(t.unitPrice),
            discountPercent: Number(t.discountPercent || 0),
            createdAt: new Date(),
          });
        }
      }

      return newItem;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.supplierCatalogItems.findIndex((c) => c.id === where.id);
      if (idx === -1) return null;
      this.supplierCatalogItems[idx] = { ...this.supplierCatalogItems[idx], ...data, updatedAt: new Date() };
      return this.supplierCatalogItems[idx];
    },
    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.supplierCatalogItems];
      if (where?.supplierId) list = list.filter((c) => c.supplierId === where.supplierId);
      return list.length;
    },
  };

  // --- PROCUREMENT: BULK PRICE TIERS ---
  public bulkPriceTier = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.bulkPriceTiers.filter((t) => !where?.catalogItemId || t.catalogItemId === where.catalogItemId);
      if (orderBy?.minQuantity === 'asc') list.sort((a, b) => a.minQuantity - b.minQuantity);
      return list;
    },
    create: async ({ data }: { data: any }) => {
      const tier = {
        id: data.id || 'tier-' + Math.random().toString(36).substring(2, 9),
        catalogItemId: data.catalogItemId,
        minQuantity: Number(data.minQuantity),
        maxQuantity: data.maxQuantity !== null && data.maxQuantity !== undefined ? Number(data.maxQuantity) : null,
        unitPrice: Number(data.unitPrice),
        discountPercent: Number(data.discountPercent || 0),
        createdAt: new Date(),
      };
      this.bulkPriceTiers.push(tier);
      return tier;
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const t of data) {
        this.bulkPriceTiers.push({
          id: t.id || 'tier-' + Math.random().toString(36).substring(2, 9),
          catalogItemId: t.catalogItemId,
          minQuantity: Number(t.minQuantity),
          maxQuantity: t.maxQuantity !== null && t.maxQuantity !== undefined ? Number(t.maxQuantity) : null,
          unitPrice: Number(t.unitPrice),
          discountPercent: Number(t.discountPercent || 0),
          createdAt: new Date(),
        });
      }
      return { count: data.length };
    },
    deleteMany: async ({ where }: { where?: any } = {}) => {
      const initLen = this.bulkPriceTiers.length;
      this.bulkPriceTiers = this.bulkPriceTiers.filter((t) => !where?.catalogItemId || t.catalogItemId !== where.catalogItemId);
      return { count: initLen - this.bulkPriceTiers.length };
    },
  };

  // --- PROCUREMENT: CART ---
  public procurementCart = {
    findUnique: async ({ where, include }: { where: { adminId?: string; id?: string }; include?: any }) => {
      let cart = this.procurementCarts.find(
        (c) => (where.adminId && c.adminId === where.adminId) || (where.id && c.id === where.id)
      );
      if (!cart) return null;
      const items = this.procurementCartItems
        .filter((it) => it.cartId === cart.id)
        .map((it) => {
          const catItem = this.supplierCatalogItems.find((c) => c.id === it.catalogItemId);
          const sup = catItem ? this.suppliers.find((s) => s.id === catItem.supplierId) : null;
          const tiers = catItem ? this.bulkPriceTiers.filter((t) => t.catalogItemId === catItem.id) : [];
          return {
            ...it,
            unitPrice: Number(it.unitPrice),
            bulkDiscount: Number(it.bulkDiscount),
            subtotal: Number(it.subtotal),
            catalogItem: catItem ? { ...catItem, supplier: sup, bulkPriceTiers: tiers } : null,
          };
        });
      return { ...cart, items };
    },
    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      return this.procurementCart.findUnique({ where, include });
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const newCart = {
        id: data.id || 'pcart-' + Math.random().toString(36).substring(2, 9),
        adminId: data.adminId,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.procurementCarts.push(newCart);
      return { ...newCart, items: [] };
    },
    update: async ({ where, data }: { where: { id?: string; adminId?: string }; data: any }) => {
      const idx = this.procurementCarts.findIndex(
        (c) => (where.id && c.id === where.id) || (where.adminId && c.adminId === where.adminId)
      );
      if (idx === -1) return null;
      this.procurementCarts[idx] = { ...this.procurementCarts[idx], ...data, updatedAt: new Date() };
      return this.procurementCart.findUnique({ where: { id: this.procurementCarts[idx].id } });
    },
    delete: async ({ where }: { where: { id?: string; adminId?: string } }) => {
      const idx = this.procurementCarts.findIndex(
        (c) => (where.id && c.id === where.id) || (where.adminId && c.adminId === where.adminId)
      );
      if (idx === -1) return null;
      const [deleted] = this.procurementCarts.splice(idx, 1);
      this.procurementCartItems = this.procurementCartItems.filter((it) => it.cartId !== deleted.id);
      return deleted;
    },
  };

  public procurementCartItem = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.procurementCartItems.filter((it) => !where?.cartId || it.cartId === where.cartId);
    },
    findUnique: async ({
      where,
    }: {
      where: { id?: string; cartId_catalogItemId?: { cartId: string; catalogItemId: string } };
    }) => {
      return (
        this.procurementCartItems.find(
          (it) =>
            (where.id && it.id === where.id) ||
            (where.cartId_catalogItemId &&
              it.cartId === where.cartId_catalogItemId.cartId &&
              it.catalogItemId === where.cartId_catalogItemId.catalogItemId)
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const item = {
        id: data.id || 'pcitem-' + Math.random().toString(36).substring(2, 9),
        cartId: data.cartId,
        catalogItemId: data.catalogItemId,
        quantity: Number(data.quantity || 10),
        unitPrice: Number(data.unitPrice),
        bulkDiscount: Number(data.bulkDiscount || 0),
        subtotal: Number(data.subtotal),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.procurementCartItems.push(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.procurementCartItems.findIndex((it) => it.id === where.id);
      if (idx === -1) return null;
      this.procurementCartItems[idx] = { ...this.procurementCartItems[idx], ...data, updatedAt: new Date() };
      return this.procurementCartItems[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.procurementCartItems.findIndex((it) => it.id === where.id);
      if (idx === -1) return null;
      return this.procurementCartItems.splice(idx, 1)[0];
    },
    deleteMany: async ({ where }: { where?: any } = {}) => {
      const initLen = this.procurementCartItems.length;
      this.procurementCartItems = this.procurementCartItems.filter((it) => !where?.cartId || it.cartId !== where.cartId);
      return { count: initLen - this.procurementCartItems.length };
    },
  };

  // --- PROCUREMENT: PURCHASE ORDERS ---
  public purchaseOrder = {
    findMany: async ({
      where,
      orderBy,
      include,
      select,
      take,
    }: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      take?: number;
    } = {}) => {
      let list = [...this.purchaseOrders];
      if (where?.status) {
        if (typeof where.status === 'string') list = list.filter((po) => po.status === where.status);
        else if (where.status.in && Array.isArray(where.status.in)) list = list.filter((po) => where.status.in.includes(po.status));
      }
      if (where?.supplierId) list = list.filter((po) => po.supplierId === where.supplierId);
      if (where?.search) {
        const q = String(where.search).toLowerCase();
        list = list.filter((po) => po.poNumber.toLowerCase().includes(q) || po.supplier?.name?.toLowerCase().includes(q));
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (take && typeof take === 'number') list = list.slice(0, take);

      return list.map((po) => {
        const sup = this.suppliers.find((s) => s.id === po.supplierId);
        const items = this.purchaseOrderItems.filter((it) => it.purchaseOrderId === po.id);
        const grs = this.goodsReceipts
          .filter((gr) => gr.purchaseOrderId === po.id)
          .map((gr) => ({
            ...gr,
            items: this.goodsReceiptItems.filter((gri) => gri.receiptId === gr.id),
          }));
        return {
          ...po,
          subtotal: Number(po.subtotal),
          bulkDiscount: Number(po.bulkDiscount),
          tax: Number(po.tax),
          shipping: Number(po.shipping),
          handling: Number(po.handling),
          totalCost: Number(po.totalCost),
          supplier: sup || null,
          items,
          goodsReceipts: grs,
          payments: [],
        };
      });
    },
    findUnique: async ({ where, include }: { where: { id?: string; poNumber?: string }; include?: any }) => {
      const po = this.purchaseOrders.find(
        (item) => (where.id && item.id === where.id) || (where.poNumber && item.poNumber === where.poNumber)
      );
      if (!po) return null;
      const sup = this.suppliers.find((s) => s.id === po.supplierId);
      const items = this.purchaseOrderItems
        .filter((it) => it.purchaseOrderId === po.id)
        .map((it) => {
          const catItem = this.supplierCatalogItems.find((c) => c.id === it.catalogItemId);
          const prod = initialProducts.find((p) => p.id === it.productId);
          return {
            ...it,
            catalogItem: catItem || null,
            product: prod ? this.populateProduct(prod) : null,
          };
        });
      const grs = this.goodsReceipts
        .filter((gr) => gr.purchaseOrderId === po.id)
        .map((gr) => ({
          ...gr,
          items: this.goodsReceiptItems.filter((gri) => gri.receiptId === gr.id),
        }));
      return {
        ...po,
        subtotal: Number(po.subtotal),
        bulkDiscount: Number(po.bulkDiscount),
        tax: Number(po.tax),
        shipping: Number(po.shipping),
        handling: Number(po.handling),
        totalCost: Number(po.totalCost),
        supplier: sup || null,
        items,
        goodsReceipts: grs,
        payments: [],
      };
    },
    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      const list = await this.purchaseOrder.findMany({ where, include });
      return list[0] || null;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = data.id || 'po-' + Math.random().toString(36).substring(2, 9);
      const newPo = {
        id,
        poNumber: data.poNumber,
        supplierId: data.supplierId,
        adminId: data.adminId || null,
        status: data.status || 'SUBMITTED',
        subtotal: Number(data.subtotal),
        bulkDiscount: Number(data.bulkDiscount || 0),
        tax: Number(data.tax || 0),
        shipping: Number(data.shipping || 0),
        handling: Number(data.handling || 0),
        totalCost: Number(data.totalCost),
        paymentMethod: data.paymentMethod || 'DEMO_PAYMENT',
        paymentStatus: data.paymentStatus || 'PENDING',
        notes: data.notes || null,
        expectedDelivery: data.expectedDelivery || new Date(Date.now() + 4 * 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.purchaseOrders.push(newPo);

      if (data.items?.create && Array.isArray(data.items.create)) {
        for (const it of data.items.create) {
          this.purchaseOrderItems.push({
            id: 'poitem-' + Math.random().toString(36).substring(2, 9),
            purchaseOrderId: id,
            catalogItemId: it.catalogItemId || null,
            productId: it.productId || null,
            partName: it.partName,
            partNumber: it.partNumber,
            brandName: it.brandName,
            vehicleCompatibility: it.vehicleCompatibility || '',
            orderedQuantity: Number(it.orderedQuantity),
            receivedQuantity: Number(it.receivedQuantity || 0),
            unitPrice: Number(it.unitPrice),
            bulkDiscount: Number(it.bulkDiscount || 0),
            totalCost: Number(it.totalCost),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return this.purchaseOrder.findUnique({ where: { id } });
    },
    update: async ({ where, data }: { where: { id?: string; poNumber?: string }; data: any }) => {
      const idx = this.purchaseOrders.findIndex(
        (po) => (where.id && po.id === where.id) || (where.poNumber && po.poNumber === where.poNumber)
      );
      if (idx === -1) return null;
      this.purchaseOrders[idx] = { ...this.purchaseOrders[idx], ...data, updatedAt: new Date() };
      return this.purchaseOrder.findUnique({ where: { id: this.purchaseOrders[idx].id } });
    },
    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.purchaseOrders];
      if (where?.status) {
        if (typeof where.status === 'string') list = list.filter((po) => po.status === where.status);
        else if (where.status.in && Array.isArray(where.status.in)) list = list.filter((po) => where.status.in.includes(po.status));
      }
      return list.length;
    },
  };

  public purchaseOrderItem = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.purchaseOrderItems.filter((it) => !where?.purchaseOrderId || it.purchaseOrderId === where.purchaseOrderId);
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.purchaseOrderItems.find((it) => it.id === where.id) || null;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.purchaseOrderItems.findIndex((it) => it.id === where.id);
      if (idx === -1) return null;
      this.purchaseOrderItems[idx] = { ...this.purchaseOrderItems[idx], ...data, updatedAt: new Date() };
      return this.purchaseOrderItems[idx];
    },
  };

  // --- PROCUREMENT: GOODS RECEIPT ---
  public goodsReceipt = {
    findMany: async ({
      where,
      orderBy,
      include,
      take,
    }: {
      where?: any;
      orderBy?: any;
      include?: any;
      take?: number;
    } = {}) => {
      let list = [...this.goodsReceipts];
      if (where?.purchaseOrderId) list = list.filter((gr) => gr.purchaseOrderId === where.purchaseOrderId);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (take && typeof take === 'number') list = list.slice(0, take);
      return list.map((gr) => {
        const po = this.purchaseOrders.find((p) => p.id === gr.purchaseOrderId);
        const sup = po ? this.suppliers.find((s) => s.id === po.supplierId) : null;
        const items = this.goodsReceiptItems.filter((gri) => gri.receiptId === gr.id);
        return {
          ...gr,
          purchaseOrder: po ? { ...po, supplier: sup } : null,
          items,
        };
      });
    },
    create: async ({ data }: { data: any }) => {
      const newGr = {
        id: data.id || 'gr-' + Math.random().toString(36).substring(2, 9),
        receiptNumber: data.receiptNumber,
        purchaseOrderId: data.purchaseOrderId,
        receivedByAdminId: data.receivedByAdminId || null,
        carrier: data.carrier || 'Logistics Carrier',
        trackingNumber: data.trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
        notes: data.notes || null,
        createdAt: new Date(),
      };
      this.goodsReceipts.push(newGr);
      return newGr;
    },
    count: async () => this.goodsReceipts.length,
  };

  public goodsReceiptItem = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.goodsReceiptItems.filter((gri) => !where?.receiptId || gri.receiptId === where.receiptId);
    },
    create: async ({ data }: { data: any }) => {
      const gri = {
        id: data.id || 'gri-' + Math.random().toString(36).substring(2, 9),
        receiptId: data.receiptId,
        poItemId: data.poItemId,
        productId: data.productId || null,
        quantityReceived: Number(data.quantityReceived),
        createdAt: new Date(),
      };
      this.goodsReceiptItems.push(gri);
      return gri;
    },
  };

  public async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return fn(this);
  }

  public async $connect() {
    return Promise.resolve();
  }

  public async $disconnect() {
    return Promise.resolve();
  }
}

export const inMemoryDb = new InMemoryStore();
export default inMemoryDb;
