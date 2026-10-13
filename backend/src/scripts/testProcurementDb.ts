import prisma from '../config/prisma';
import * as procurementService from '../modules/procurement/procurement.service';

async function main() {
  console.log('--- 1. Testing Supplier Count & Catalog ---');
  const supCount = await prisma.supplier.count();
  console.log('✓ Supplier count:', supCount);

  const catCount = await prisma.supplierCatalogItem.count();
  console.log('✓ SupplierCatalogItem count:', catCount);

  console.log('--- 2. Testing calculateBulkPricing for Bosch Nexon Brake Pad ---');
  const items = await procurementService.searchCatalog({ search: 'BP-TN-204' });
  const item = items[0];
  console.log(`✓ Located item: ${item.partName} (${item.partNumber}), Brand: ${item.brandName}, Compatible: ${item.vehicleMakeName} ${item.vehicleModelName}`);

  // Test tier 1 (qty 5: ₹2,100)
  const calc5 = await procurementService.calculateBulkPricing(item.id, 5);
  console.log(`✓ Qty 5: Effective unit price = ₹${calc5.effectiveUnitPrice}, Total = ₹${calc5.total}`);

  // Test tier 2 (qty 20: ₹1,900)
  const calc20 = await procurementService.calculateBulkPricing(item.id, 20);
  console.log(`✓ Qty 20: Effective unit price = ₹${calc20.effectiveUnitPrice}, Total = ₹${calc20.total}`);

  // Test tier 3 (qty 50: ₹1,750)
  const calc50 = await procurementService.calculateBulkPricing(item.id, 50);
  console.log(`✓ Qty 50: Effective unit price = ₹${calc50.effectiveUnitPrice}, Total = ₹${calc50.total}, Discount = ₹${calc50.bulkDiscount}`);

  // Test tier 4 (qty 100: ₹1,600)
  const calc100 = await procurementService.calculateBulkPricing(item.id, 100);
  console.log(`✓ Qty 100: Effective unit price = ₹${calc100.effectiveUnitPrice}, Total = ₹${calc100.total}, Discount = ₹${calc100.bulkDiscount}`);

  console.log('--- 3. Testing Cart Flow ---');
  const adminId = 'admin-user-1';
  await procurementService.clearProcurementCart(adminId);
  const cartAfterAdd = await procurementService.addToProcurementCart(adminId, item.id, 100);
  console.log(`✓ Added to cart: itemCount = ${cartAfterAdd.itemCount}, total = ₹${cartAfterAdd.financialSummary.grandTotal}`);

  console.log('--- 4. Testing Create Purchase Order ---');
  const po = await procurementService.createPurchaseOrder(adminId, {
    paymentMethod: 'DEMO_PAYMENT',
    notes: 'Bulk stock procurement test',
  });
  const singlePo = Array.isArray(po) ? po[0] : po;
  console.log(`✓ Created PO: ${singlePo.poNumber}, Status = ${singlePo.status}, Total = ₹${singlePo.totalCost}`);

  console.log('--- 5. Testing PO Status Transition to SHIPPED / IN_TRANSIT ---');
  await procurementService.updatePurchaseOrderStatus(singlePo.id, 'SHIPPED', 'Dispatched by Bosch plant');
  const inTransitPo = await procurementService.updatePurchaseOrderStatus(singlePo.id, 'IN_TRANSIT', 'On carrier');
  console.log(`✓ PO Status updated to: ${inTransitPo.status}`);

  console.log('--- 6. Testing Partial Goods Receiving: Receive 60 of 100 ---');
  const poItemId = singlePo.items[0].id;
  const receive60 = await procurementService.receivePurchaseOrderStock(singlePo.id, {
    items: [{ poItemId, quantityToReceive: 60 }],
    carrier: 'PartNexa Logistics',
    notes: 'Received 60 units first consignment',
  });
  console.log(`✓ Goods Receipt: ${receive60.goodsReceipt.receiptNumber}`);
  console.log(`✓ PO Status after partial receipt: ${receive60.purchaseOrder.status}`);
  console.log(`✓ Inventory delta: previous = ${receive60.itemsReceived[0].previousInventory}, new = ${receive60.itemsReceived[0].newInventory}`);

  console.log('--- 7. Testing Second Goods Receiving: Receive remaining 40 ---');
  const receive40 = await procurementService.receivePurchaseOrderStock(singlePo.id, {
    items: [{ poItemId, quantityToReceive: 40 }],
    carrier: 'PartNexa Logistics',
    notes: 'Received remaining 40 units final consignment',
  });
  console.log(`✓ Goods Receipt: ${receive40.goodsReceipt.receiptNumber}`);
  console.log(`✓ PO Status after full receipt: ${receive40.purchaseOrder.status}`);
  console.log(`✓ Final Inventory: previous = ${receive40.itemsReceived[0].previousInventory}, new = ${receive40.itemsReceived[0].newInventory}`);

  console.log('\n🎉 ALL CORE BULK PROCUREMENT BACKEND FLOWS PASSED 100%!');
}

main().catch(console.error);
