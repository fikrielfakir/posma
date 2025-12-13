import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============== TENANTS ==============
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  ice: text("ice"), // Identifiant Commun de l'Entreprise
  if: text("if"), // Identifiant Fiscal
  tp: text("tp"), // Taxe Professionnelle
  cnss: text("cnss"), // CNSS number
  defaultCurrency: text("default_currency").default("MAD"),
  defaultLanguage: text("default_language").default("fr"),
  timezone: text("timezone").default("Africa/Casablanca"),
  isActive: boolean("is_active").default(true),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true });
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// ============== USERS & ROLES ==============
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  code: text("code").notNull(), // super_admin, director, sales_manager, store_manager, stock_manager, salesperson, cashier, warehouse_staff, accountant, auditor
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isSystem: boolean("is_system").default(false),
});

export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  roleId: varchar("role_id").references(() => roles.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  avatar: text("avatar"),
  preferredLanguage: text("preferred_language").default("fr"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, lastLogin: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============== WAREHOUSES ==============
export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  managerId: varchar("manager_id").references(() => users.id),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true });
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

// ============== PRODUCT CATEGORIES ==============
export const productFamilies = pgTable("product_families", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
});

export const insertProductFamilySchema = createInsertSchema(productFamilies).omit({ id: true });
export type InsertProductFamily = z.infer<typeof insertProductFamilySchema>;
export type ProductFamily = typeof productFamilies.$inferSelect;

export const productCategories = pgTable("product_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  familyId: varchar("family_id").references(() => productFamilies.id),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
});

export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true });
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategories.$inferSelect;

export const productSubcategories = pgTable("product_subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  categoryId: varchar("category_id").references(() => productCategories.id),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const insertProductSubcategorySchema = createInsertSchema(productSubcategories).omit({ id: true });
export type InsertProductSubcategory = z.infer<typeof insertProductSubcategorySchema>;
export type ProductSubcategory = typeof productSubcategories.$inferSelect;

// ============== PRODUCTS ==============
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  subcategoryId: varchar("subcategory_id").references(() => productSubcategories.id),
  sku: text("sku").notNull(),
  internalCode: text("internal_code"),
  barcode: text("barcode"), // EAN13
  supplierCode: text("supplier_code"),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  description: text("description"),
  unit: text("unit").default("piece"), // piece, kg, g, L, mL, carton, palette, m, m2, lot
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).default("0"),
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }).default("0"),
  tvaRate: decimal("tva_rate", { precision: 5, scale: 2 }).default("20"), // 20%, 14%, 10%, 7%, 0%
  minStock: integer("min_stock").default(0),
  maxStock: integer("max_stock").default(1000),
  reorderPoint: integer("reorder_point").default(10),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  isService: boolean("is_service").default(false),
  attributes: jsonb("attributes").$type<Record<string, string>>().default({}),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ============== SUPPLIERS ==============
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  ice: text("ice"),
  if: text("if"),
  paymentTerms: integer("payment_terms").default(30), // days
  currency: text("currency").default("MAD"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// ============== STOCK ==============
export const stock = pgTable("stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).default("0"),
  reservedQuantity: decimal("reserved_quantity", { precision: 12, scale: 3 }).default("0"),
  averageCost: decimal("average_cost", { precision: 12, scale: 2 }).default("0"),
  lastMovementDate: timestamp("last_movement_date"),
});

export const insertStockSchema = createInsertSchema(stock).omit({ id: true });
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stock.$inferSelect;

// ============== STOCK MOVEMENTS ==============
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  productId: varchar("product_id").references(() => products.id),
  type: text("type").notNull(), // entry, exit, transfer_in, transfer_out, adjustment, return
  reason: text("reason"), // purchase, sale, return_client, return_supplier, loss, damage, sample, gift, inventory_adjustment
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 12, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }),
  referenceType: text("reference_type"), // purchase_order, sale, transfer, adjustment
  referenceId: varchar("reference_id"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({ id: true, createdAt: true });
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

// ============== PURCHASE ORDERS ==============
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  orderNumber: text("order_number").notNull(),
  status: text("status").default("draft"), // draft, pending_approval, approved, ordered, partial_received, received, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  expectedDate: timestamp("expected_date"),
  receivedDate: timestamp("received_date"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  tvaAmount: decimal("tva_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").default("MAD"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  receivedQuantity: decimal("received_quantity", { precision: 12, scale: 3 }).default("0"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  tvaRate: decimal("tva_rate", { precision: 5, scale: 2 }).default("20"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  tvaAmount: decimal("tva_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

// ============== CUSTOMERS ==============
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  ice: text("ice"),
  if: text("if"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0"),
  paymentTerms: integer("payment_terms").default(0), // days
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// ============== SALES & INVOICES ==============
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  customerId: varchar("customer_id").references(() => customers.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").default("draft"), // draft, confirmed, paid, partial_paid, cancelled
  saleDate: timestamp("sale_date").defaultNow(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  tvaAmount: decimal("tva_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").default("MAD"),
  paymentMethod: text("payment_method"), // cash, card, check, transfer, mobile_payment
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export const saleItems = pgTable("sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").references(() => sales.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  tvaRate: decimal("tva_rate", { precision: 5, scale: 2 }).default("20"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  tvaAmount: decimal("tva_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({ id: true });
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;

// ============== INVENTORY ==============
export const inventorySessions = pgTable("inventory_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  name: text("name").notNull(),
  status: text("status").default("in_progress"), // in_progress, completed, cancelled
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventorySessionSchema = createInsertSchema(inventorySessions).omit({ id: true, createdAt: true });
export type InsertInventorySession = z.infer<typeof insertInventorySessionSchema>;
export type InventorySession = typeof inventorySessions.$inferSelect;

export const inventoryCounts = pgTable("inventory_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => inventorySessions.id),
  productId: varchar("product_id").references(() => products.id),
  expectedQuantity: decimal("expected_quantity", { precision: 12, scale: 3 }).default("0"),
  countedQuantity: decimal("counted_quantity", { precision: 12, scale: 3 }),
  variance: decimal("variance", { precision: 12, scale: 3 }),
  status: text("status").default("pending"), // pending, counted, verified
  countedBy: varchar("counted_by").references(() => users.id),
  countedAt: timestamp("counted_at"),
  notes: text("notes"),
});

export const insertInventoryCountSchema = createInsertSchema(inventoryCounts).omit({ id: true });
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;
export type InventoryCount = typeof inventoryCounts.$inferSelect;

// ============== STOCK ALERTS ==============
export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  productId: varchar("product_id").references(() => products.id),
  alertType: text("alert_type").notNull(), // low_stock, overstock, expiring, slow_moving, out_of_stock
  message: text("message"),
  severity: text("severity").default("warning"), // info, warning, critical
  isRead: boolean("is_read").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({ id: true, createdAt: true });
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type StockAlert = typeof stockAlerts.$inferSelect;

// ============== CURRENCY RATES ==============
export const currencyRates = pgTable("currency_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: decimal("rate", { precision: 12, scale: 6 }).notNull(),
  effectiveDate: timestamp("effective_date").defaultNow(),
});

export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({ id: true });
export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;

// ============== PURCHASE REQUESTS ==============
export const purchaseRequests = pgTable("purchase_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  requestNumber: text("request_number").notNull(),
  requestedBy: varchar("requested_by").references(() => users.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  status: text("status").default("draft"), // draft, pending, approved, rejected, converted
  priority: text("priority").default("normal"), // low, normal, high, urgent
  requestDate: timestamp("request_date").defaultNow(),
  neededByDate: timestamp("needed_by_date"),
  justification: text("justification"),
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurchaseRequestSchema = createInsertSchema(purchaseRequests).omit({ id: true, createdAt: true });
export type InsertPurchaseRequest = z.infer<typeof insertPurchaseRequestSchema>;
export type PurchaseRequest = typeof purchaseRequests.$inferSelect;

export const purchaseRequestItems = pgTable("purchase_request_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => purchaseRequests.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  estimatedPrice: decimal("estimated_price", { precision: 12, scale: 2 }),
  notes: text("notes"),
});

export const insertPurchaseRequestItemSchema = createInsertSchema(purchaseRequestItems).omit({ id: true });
export type InsertPurchaseRequestItem = z.infer<typeof insertPurchaseRequestItemSchema>;
export type PurchaseRequestItem = typeof purchaseRequestItems.$inferSelect;

// ============== GOODS RECEIPTS ==============
export const goodsReceipts = pgTable("goods_receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  receiptNumber: text("receipt_number").notNull(),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  status: text("status").default("draft"), // draft, received, inspected, accepted, rejected, partial
  receiptDate: timestamp("receipt_date").defaultNow(),
  deliveryNote: text("delivery_note"),
  inspectedBy: varchar("inspected_by").references(() => users.id),
  inspectionNotes: text("inspection_notes"),
  notes: text("notes"),
  receivedBy: varchar("received_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoodsReceiptSchema = createInsertSchema(goodsReceipts).omit({ id: true, createdAt: true });
export type InsertGoodsReceipt = z.infer<typeof insertGoodsReceiptSchema>;
export type GoodsReceipt = typeof goodsReceipts.$inferSelect;

export const goodsReceiptItems = pgTable("goods_receipt_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptId: varchar("receipt_id").references(() => goodsReceipts.id),
  productId: varchar("product_id").references(() => products.id),
  orderedQuantity: decimal("ordered_quantity", { precision: 12, scale: 3 }),
  receivedQuantity: decimal("received_quantity", { precision: 12, scale: 3 }).notNull(),
  acceptedQuantity: decimal("accepted_quantity", { precision: 12, scale: 3 }),
  rejectedQuantity: decimal("rejected_quantity", { precision: 12, scale: 3 }).default("0"),
  rejectionReason: text("rejection_reason"),
  unitCost: decimal("unit_cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
});

export const insertGoodsReceiptItemSchema = createInsertSchema(goodsReceiptItems).omit({ id: true });
export type InsertGoodsReceiptItem = z.infer<typeof insertGoodsReceiptItemSchema>;
export type GoodsReceiptItem = typeof goodsReceiptItems.$inferSelect;

// ============== EXIT NOTES ==============
export const exitNotes = pgTable("exit_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  exitNumber: text("exit_number").notNull(),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  destinationType: text("destination_type").notNull(), // internal, transfer, consumption, sample, gift, loss
  destinationWarehouseId: varchar("destination_warehouse_id").references(() => warehouses.id),
  destinationDetails: text("destination_details"),
  status: text("status").default("draft"), // draft, pending, approved, completed, cancelled
  exitDate: timestamp("exit_date").defaultNow(),
  reason: text("reason"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExitNoteSchema = createInsertSchema(exitNotes).omit({ id: true, createdAt: true });
export type InsertExitNote = z.infer<typeof insertExitNoteSchema>;
export type ExitNote = typeof exitNotes.$inferSelect;

export const exitNoteItems = pgTable("exit_note_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exitNoteId: varchar("exit_note_id").references(() => exitNotes.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
});

export const insertExitNoteItemSchema = createInsertSchema(exitNoteItems).omit({ id: true });
export type InsertExitNoteItem = z.infer<typeof insertExitNoteItemSchema>;
export type ExitNoteItem = typeof exitNoteItems.$inferSelect;

// ============== PURCHASE RETURNS ==============
export const purchaseReturns = pgTable("purchase_returns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  returnNumber: text("return_number").notNull(),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  goodsReceiptId: varchar("goods_receipt_id").references(() => goodsReceipts.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  status: text("status").default("draft"), // draft, pending, approved, shipped, refunded, cancelled
  returnDate: timestamp("return_date").defaultNow(),
  reason: text("reason").notNull(), // defective, wrong_item, damaged, quality_issue, excess, other
  reasonDetails: text("reason_details"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  refundMethod: text("refund_method"), // credit_note, refund, replacement
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurchaseReturnSchema = createInsertSchema(purchaseReturns).omit({ id: true, createdAt: true });
export type InsertPurchaseReturn = z.infer<typeof insertPurchaseReturnSchema>;
export type PurchaseReturn = typeof purchaseReturns.$inferSelect;

export const purchaseReturnItems = pgTable("purchase_return_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  returnId: varchar("return_id").references(() => purchaseReturns.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  reason: text("reason"),
});

export const insertPurchaseReturnItemSchema = createInsertSchema(purchaseReturnItems).omit({ id: true });
export type InsertPurchaseReturnItem = z.infer<typeof insertPurchaseReturnItemSchema>;
export type PurchaseReturnItem = typeof purchaseReturnItems.$inferSelect;

// ============== AI PREDICTIONS ==============
export const aiPredictions = pgTable("ai_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  modelType: text("model_type").notNull(), // demand_forecast, sales_prediction, churn, abc_classification, price_optimization
  entityType: text("entity_type").notNull(), // product, customer, supplier, category
  entityId: varchar("entity_id"),
  predictionDate: timestamp("prediction_date").notNull(),
  horizonDays: integer("horizon_days").default(30),
  predictedValue: decimal("predicted_value", { precision: 15, scale: 4 }),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
  lowerBound: decimal("lower_bound", { precision: 15, scale: 4 }),
  upperBound: decimal("upper_bound", { precision: 15, scale: 4 }),
  features: jsonb("features").$type<Record<string, any>>(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiPredictionSchema = createInsertSchema(aiPredictions).omit({ id: true, createdAt: true });
export type InsertAiPrediction = z.infer<typeof insertAiPredictionSchema>;
export type AiPrediction = typeof aiPredictions.$inferSelect;

// ============== AI RECOMMENDATIONS ==============
export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  recommendationType: text("recommendation_type").notNull(), // cross_sell, upsell, reorder, pricing, promotion
  targetType: text("target_type").notNull(), // customer, product, order
  targetId: varchar("target_id"),
  recommendedItems: jsonb("recommended_items").$type<Array<{productId: string; score: number; reason: string}>>(),
  score: decimal("score", { precision: 5, scale: 4 }),
  reason: text("reason"),
  isActioned: boolean("is_actioned").default(false),
  actionedAt: timestamp("actioned_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({ id: true, createdAt: true });
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;

// ============== AI ANOMALIES ==============
export const aiAnomalies = pgTable("ai_anomalies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  anomalyType: text("anomaly_type").notNull(), // fraud, theft, error, unusual_pattern, price_manipulation
  severity: text("severity").default("medium"), // low, medium, high, critical
  entityType: text("entity_type").notNull(), // transaction, user, product, sale, stock_movement
  entityId: varchar("entity_id"),
  description: text("description"),
  detectedValue: decimal("detected_value", { precision: 15, scale: 4 }),
  expectedValue: decimal("expected_value", { precision: 15, scale: 4 }),
  deviationPercent: decimal("deviation_percent", { precision: 8, scale: 2 }),
  riskScore: decimal("risk_score", { precision: 5, scale: 4 }),
  evidence: jsonb("evidence").$type<Record<string, any>>(),
  status: text("status").default("new"), // new, investigating, confirmed, false_positive, resolved
  investigatedBy: varchar("investigated_by").references(() => users.id),
  investigatedAt: timestamp("investigated_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiAnomalySchema = createInsertSchema(aiAnomalies).omit({ id: true, createdAt: true });
export type InsertAiAnomaly = z.infer<typeof insertAiAnomalySchema>;
export type AiAnomaly = typeof aiAnomalies.$inferSelect;

// ============== CHATBOT CONVERSATIONS ==============
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  language: text("language").default("fr"), // fr, ar
  status: text("status").default("active"), // active, closed, escalated
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  escalatedTo: varchar("escalated_to").references(() => users.id),
  satisfaction: integer("satisfaction"), // 1-5
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({ id: true });
export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;

export const chatbotMessages = pgTable("chatbot_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => chatbotConversations.id),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  intent: text("intent"), // product_query, stock_check, order_status, promotion_info, complaint, other
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  sources: jsonb("sources").$type<Array<{type: string; id: string; excerpt: string}>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatbotMessageSchema = createInsertSchema(chatbotMessages).omit({ id: true, createdAt: true });
export type InsertChatbotMessage = z.infer<typeof insertChatbotMessageSchema>;
export type ChatbotMessage = typeof chatbotMessages.$inferSelect;

// ============== CUSTOMER FEEDBACK & SENTIMENT ==============
export const customerFeedback = pgTable("customer_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  customerId: varchar("customer_id").references(() => customers.id),
  saleId: varchar("sale_id").references(() => sales.id),
  channel: text("channel").default("app"), // app, web, sms, call, email
  content: text("content"),
  rating: integer("rating"), // 1-5
  sentiment: text("sentiment"), // positive, neutral, negative
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 4 }),
  topics: jsonb("topics").$type<string[]>(),
  isProcessed: boolean("is_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerFeedbackSchema = createInsertSchema(customerFeedback).omit({ id: true, createdAt: true });
export type InsertCustomerFeedback = z.infer<typeof insertCustomerFeedbackSchema>;
export type CustomerFeedback = typeof customerFeedback.$inferSelect;

// ============== VENDORS/SELLERS ==============
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  code: text("code").notNull(),
  fullName: text("full_name").notNull(),
  photo: text("photo"),
  cin: text("cin"),
  cnss: text("cnss"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  hireDate: timestamp("hire_date"),
  contractType: text("contract_type"), // cdi, cdd, interim, freelance
  contractDocument: text("contract_document"),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  level: text("level").default("bronze"), // bronze, silver, gold, platinum, diamond
  totalXp: integer("total_xp").default(0),
  baseCommissionRate: decimal("base_commission_rate", { precision: 5, scale: 2 }).default("2"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Vendor warehouse/store assignments
export const vendorAssignments = pgTable("vendor_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  isPrimary: boolean("is_primary").default(false),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
});

export const insertVendorAssignmentSchema = createInsertSchema(vendorAssignments).omit({ id: true });
export type InsertVendorAssignment = z.infer<typeof insertVendorAssignmentSchema>;
export type VendorAssignment = typeof vendorAssignments.$inferSelect;

// Commission rules per category
export const commissionRules = pgTable("commission_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  categoryId: varchar("category_id").references(() => productCategories.id),
  ruleType: text("rule_type").notNull(), // fixed, percentage, tiered
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }),
  percentageRate: decimal("percentage_rate", { precision: 5, scale: 2 }),
  tiers: jsonb("tiers").$type<Array<{min: number; max: number; rate: number}>>(),
  basedOn: text("based_on").default("revenue"), // revenue, margin, quantity
  isActive: boolean("is_active").default(true),
});

export const insertCommissionRuleSchema = createInsertSchema(commissionRules).omit({ id: true });
export type InsertCommissionRule = z.infer<typeof insertCommissionRuleSchema>;
export type CommissionRule = typeof commissionRules.$inferSelect;

// Commission records
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  saleId: varchar("sale_id").references(() => sales.id),
  ruleId: varchar("rule_id").references(() => commissionRules.id),
  saleAmount: decimal("sale_amount", { precision: 12, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(),
  bonusAmount: decimal("bonus_amount", { precision: 12, scale: 2 }).default("0"),
  malusAmount: decimal("malus_amount", { precision: 12, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, confirmed, paid, cancelled
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, createdAt: true });
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;

// Sales objectives
export const vendorObjectives = pgTable("vendor_objectives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  name: text("name").notNull(),
  objectiveType: text("objective_type").notNull(), // revenue, margin, quantity, transactions
  targetValue: decimal("target_value", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).default("0"),
  periodType: text("period_type").notNull(), // daily, weekly, monthly, quarterly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  categoryId: varchar("category_id").references(() => productCategories.id),
  bonusOnCompletion: decimal("bonus_on_completion", { precision: 10, scale: 2 }),
  tiers: jsonb("tiers").$type<Array<{percent: number; bonus: number}>>(),
  status: text("status").default("active"), // active, completed, failed, cancelled
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorObjectiveSchema = createInsertSchema(vendorObjectives).omit({ id: true, createdAt: true });
export type InsertVendorObjective = z.infer<typeof insertVendorObjectiveSchema>;
export type VendorObjective = typeof vendorObjectives.$inferSelect;

// Gamification badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  description: text("description"),
  icon: text("icon"),
  category: text("category"), // sales, customer, performance, special
  xpReward: integer("xp_reward").default(0),
  criteria: jsonb("criteria").$type<Record<string, any>>(),
  isActive: boolean("is_active").default(true),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// Vendor earned badges
export const vendorBadges = pgTable("vendor_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  badgeId: varchar("badge_id").references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  context: jsonb("context").$type<Record<string, any>>(),
});

export const insertVendorBadgeSchema = createInsertSchema(vendorBadges).omit({ id: true });
export type InsertVendorBadge = z.infer<typeof insertVendorBadgeSchema>;
export type VendorBadge = typeof vendorBadges.$inferSelect;

// Challenges
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  challengeType: text("challenge_type").notNull(), // individual, team
  targetType: text("target_type").notNull(), // revenue, quantity, customers
  targetValue: decimal("target_value", { precision: 15, scale: 2 }).notNull(),
  xpReward: integer("xp_reward").default(0),
  bonusReward: decimal("bonus_reward", { precision: 10, scale: 2 }),
  badgeId: varchar("badge_id").references(() => badges.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("upcoming"), // upcoming, active, completed, cancelled
  isActive: boolean("is_active").default(true),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

// Challenge participants
export const challengeParticipants = pgTable("challenge_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").references(() => challenges.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).default("0"),
  rank: integer("rank"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  rewardClaimed: boolean("reward_claimed").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({ id: true });
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;

// Vendor performance stats
export const vendorPerformance = pgTable("vendor_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  periodType: text("period_type").notNull(), // daily, weekly, monthly
  periodDate: timestamp("period_date").notNull(),
  totalSales: decimal("total_sales", { precision: 15, scale: 2 }).default("0"),
  totalTransactions: integer("total_transactions").default(0),
  totalCustomers: integer("total_customers").default(0),
  newCustomers: integer("new_customers").default(0),
  avgBasket: decimal("avg_basket", { precision: 12, scale: 2 }).default("0"),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0"),
  returnsCount: integer("returns_count").default(0),
  returnsValue: decimal("returns_value", { precision: 12, scale: 2 }).default("0"),
  totalMargin: decimal("total_margin", { precision: 15, scale: 2 }).default("0"),
  xpEarned: integer("xp_earned").default(0),
  commissionEarned: decimal("commission_earned", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorPerformanceSchema = createInsertSchema(vendorPerformance).omit({ id: true, createdAt: true });
export type InsertVendorPerformance = z.infer<typeof insertVendorPerformanceSchema>;
export type VendorPerformance = typeof vendorPerformance.$inferSelect;

// Client-vendor assignments
export const clientVendorAssignments = pgTable("client_vendor_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  matchScore: decimal("match_score", { precision: 5, scale: 2 }),
  reason: text("reason"),
  totalTransactions: integer("total_transactions").default(0),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  lastInteraction: timestamp("last_interaction"),
  isActive: boolean("is_active").default(true),
});

export const insertClientVendorAssignmentSchema = createInsertSchema(clientVendorAssignments).omit({ id: true });
export type InsertClientVendorAssignment = z.infer<typeof insertClientVendorAssignmentSchema>;
export type ClientVendorAssignment = typeof clientVendorAssignments.$inferSelect;

// Training courses
export const trainingCourses = pgTable("training_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // product, sales, customer_service, technical
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  durationMinutes: integer("duration_minutes"),
  xpReward: integer("xp_reward").default(0),
  badgeId: varchar("badge_id").references(() => badges.id),
  content: jsonb("content").$type<Array<{type: string; title: string; data: any}>>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainingCourseSchema = createInsertSchema(trainingCourses).omit({ id: true, createdAt: true });
export type InsertTrainingCourse = z.infer<typeof insertTrainingCourseSchema>;
export type TrainingCourse = typeof trainingCourses.$inferSelect;

// Vendor training progress
export const vendorTraining = pgTable("vendor_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  courseId: varchar("course_id").references(() => trainingCourses.id),
  status: text("status").default("not_started"), // not_started, in_progress, completed
  progress: integer("progress").default(0),
  score: integer("score"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
});

export const insertVendorTrainingSchema = createInsertSchema(vendorTraining).omit({ id: true });
export type InsertVendorTraining = z.infer<typeof insertVendorTrainingSchema>;
export type VendorTraining = typeof vendorTraining.$inferSelect;

// Vendor evaluations
export const vendorEvaluations = pgTable("vendor_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  evaluatorId: varchar("evaluator_id").references(() => users.id),
  evaluationType: text("evaluation_type").notNull(), // manager, peer, self, customer
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  scores: jsonb("scores").$type<Record<string, number>>(),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),
  strengths: text("strengths"),
  improvements: text("improvements"),
  actionPlan: text("action_plan"),
  status: text("status").default("draft"), // draft, submitted, reviewed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorEvaluationSchema = createInsertSchema(vendorEvaluations).omit({ id: true, createdAt: true });
export type InsertVendorEvaluation = z.infer<typeof insertVendorEvaluationSchema>;
export type VendorEvaluation = typeof vendorEvaluations.$inferSelect;

// AI coaching tips
export const vendorCoachingTips = pgTable("vendor_coaching_tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  tipType: text("tip_type").notNull(), // improvement, warning, congratulation, suggestion
  category: text("category"), // sales, customer, product, time_management
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").default("medium"), // low, medium, high
  isRead: boolean("is_read").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  actionTaken: boolean("action_taken").default(false),
  impact: jsonb("impact").$type<{metric: string; expectedChange: number}>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorCoachingTipSchema = createInsertSchema(vendorCoachingTips).omit({ id: true, createdAt: true });
export type InsertVendorCoachingTip = z.infer<typeof insertVendorCoachingTipSchema>;
export type VendorCoachingTip = typeof vendorCoachingTips.$inferSelect;

// Vendor performance predictions
export const vendorPredictions = pgTable("vendor_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  predictionType: text("prediction_type").notNull(), // monthly_revenue, churn_risk, objective_completion
  predictionDate: timestamp("prediction_date").notNull(),
  horizonDays: integer("horizon_days").default(30),
  predictedValue: decimal("predicted_value", { precision: 15, scale: 2 }),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
  features: jsonb("features").$type<Record<string, any>>(),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorPredictionSchema = createInsertSchema(vendorPredictions).omit({ id: true, createdAt: true });
export type InsertVendorPrediction = z.infer<typeof insertVendorPredictionSchema>;
export type VendorPrediction = typeof vendorPredictions.$inferSelect;

// ============== CASH SESSIONS (GESTION DE CAISSE) ==============
export const cashSessions = pgTable("cash_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  cashierId: varchar("cashier_id").references(() => users.id),
  sessionNumber: text("session_number").notNull(),
  status: text("status").default("open"), // open, closed
  openingDate: timestamp("opening_date").defaultNow(),
  closingDate: timestamp("closing_date"),
  openingCash: decimal("opening_cash", { precision: 12, scale: 2 }).default("0"),
  expectedCash: decimal("expected_cash", { precision: 12, scale: 2 }).default("0"),
  actualCash: decimal("actual_cash", { precision: 12, scale: 2 }),
  cashDifference: decimal("cash_difference", { precision: 12, scale: 2 }),
  differenceJustification: text("difference_justification"),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0"),
  totalCashPayments: decimal("total_cash_payments", { precision: 12, scale: 2 }).default("0"),
  totalCardPayments: decimal("total_card_payments", { precision: 12, scale: 2 }).default("0"),
  totalCheckPayments: decimal("total_check_payments", { precision: 12, scale: 2 }).default("0"),
  totalMobilePayments: decimal("total_mobile_payments", { precision: 12, scale: 2 }).default("0"),
  totalWithdrawals: decimal("total_withdrawals", { precision: 12, scale: 2 }).default("0"),
  totalDeposits: decimal("total_deposits", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const insertCashSessionSchema = createInsertSchema(cashSessions).omit({ id: true });
export type InsertCashSession = z.infer<typeof insertCashSessionSchema>;
export type CashSession = typeof cashSessions.$inferSelect;

// ============== CASH MOVEMENTS (ENTRÉES/SORTIES) ==============
export const cashMovements = pgTable("cash_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  sessionId: varchar("session_id").references(() => cashSessions.id),
  type: text("type").notNull(), // deposit, withdrawal, bank_deposit
  reason: text("reason"), // expense, advance, petty_cash, bank_transfer, other
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  reference: text("reference"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCashMovementSchema = createInsertSchema(cashMovements).omit({ id: true, createdAt: true });
export type InsertCashMovement = z.infer<typeof insertCashMovementSchema>;
export type CashMovement = typeof cashMovements.$inferSelect;

// ============== PAYMENTS (MULTI-PAYMENT SUPPORT) ==============
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  saleId: varchar("sale_id").references(() => sales.id),
  sessionId: varchar("session_id").references(() => cashSessions.id),
  method: text("method").notNull(), // cash, card, check, transfer, mobile_payment, cashplus, wafacash, orange_money
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  receivedAmount: decimal("received_amount", { precision: 12, scale: 2 }), // For cash payments (amount given by customer)
  changeAmount: decimal("change_amount", { precision: 12, scale: 2 }), // Change returned
  reference: text("reference"), // Check number, card transaction ID, etc.
  status: text("status").default("completed"), // pending, completed, cancelled, refunded
  paymentDate: timestamp("payment_date").defaultNow(),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ============== INVOICES (MOROCCAN COMPLIANT) ==============
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  saleId: varchar("sale_id").references(() => sales.id),
  customerId: varchar("customer_id").references(() => customers.id),
  invoiceType: text("invoice_type").default("standard"), // standard, proforma, credit_note, advance
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: timestamp("invoice_date").defaultNow(),
  dueDate: timestamp("due_date"),
  // Moroccan legal requirements
  ice: text("ice"), // Identifiant Commun de l'Entreprise
  identifiantFiscal: text("if"), // Identifiant Fiscal
  registreCommerce: text("rc"), // Registre de Commerce
  patente: text("patente"),
  cnss: text("cnss"),
  // Amounts
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  // TVA breakdown by rate
  tva20Amount: decimal("tva_20_amount", { precision: 12, scale: 2 }).default("0"),
  tva14Amount: decimal("tva_14_amount", { precision: 12, scale: 2 }).default("0"),
  tva10Amount: decimal("tva_10_amount", { precision: 12, scale: 2 }).default("0"),
  tva7Amount: decimal("tva_7_amount", { precision: 12, scale: 2 }).default("0"),
  totalTva: decimal("total_tva", { precision: 12, scale: 2 }).default("0"),
  timbreFiscal: decimal("timbre_fiscal", { precision: 12, scale: 2 }).default("0"), // Stamp duty
  retenueSource: decimal("retenue_source", { precision: 12, scale: 2 }).default("0"), // Withholding tax
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").default("MAD"),
  exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }).default("1"),
  // Status
  status: text("status").default("draft"), // draft, issued, paid, partial_paid, cancelled, credit_noted
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  // QR Code for verification
  qrCode: text("qr_code"),
  // Metadata
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ============== PROMOTIONS ==============
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // percentage, fixed_amount, buy_x_get_y, bundle
  discountValue: decimal("discount_value", { precision: 12, scale: 2 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  minimumPurchase: decimal("minimum_purchase", { precision: 12, scale: 2 }),
  maximumDiscount: decimal("maximum_discount", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  applicableProducts: jsonb("applicable_products").$type<string[]>().default([]),
  applicableCategories: jsonb("applicable_categories").$type<string[]>().default([]),
  couponCode: text("coupon_code"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true, createdAt: true });
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

// ============== RELATIONS ==============
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  warehouses: many(warehouses),
  products: many(products),
  suppliers: many(suppliers),
  customers: many(customers),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, { fields: [products.tenantId], references: [tenants.id] }),
  subcategory: one(productSubcategories, { fields: [products.subcategoryId], references: [productSubcategories.id] }),
  stock: many(stock),
}));

export const stockRelations = relations(stock, ({ one }) => ({
  warehouse: one(warehouses, { fields: [stock.warehouseId], references: [warehouses.id] }),
  product: one(products, { fields: [stock.productId], references: [products.id] }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [purchaseOrders.supplierId], references: [suppliers.id] }),
  warehouse: one(warehouses, { fields: [purchaseOrders.warehouseId], references: [warehouses.id] }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, { fields: [purchaseOrderItems.purchaseOrderId], references: [purchaseOrders.id] }),
  product: one(products, { fields: [purchaseOrderItems.productId], references: [products.id] }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  warehouse: one(warehouses, { fields: [sales.warehouseId], references: [warehouses.id] }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const cashSessionsRelations = relations(cashSessions, ({ one, many }) => ({
  warehouse: one(warehouses, { fields: [cashSessions.warehouseId], references: [warehouses.id] }),
  cashier: one(users, { fields: [cashSessions.cashierId], references: [users.id] }),
  movements: many(cashMovements),
  payments: many(payments),
}));

export const cashMovementsRelations = relations(cashMovements, ({ one }) => ({
  session: one(cashSessions, { fields: [cashMovements.sessionId], references: [cashSessions.id] }),
  createdByUser: one(users, { fields: [cashMovements.createdBy], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  sale: one(sales, { fields: [payments.saleId], references: [sales.id] }),
  session: one(cashSessions, { fields: [payments.sessionId], references: [cashSessions.id] }),
  createdByUser: one(users, { fields: [payments.createdBy], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  sale: one(sales, { fields: [invoices.saleId], references: [sales.id] }),
  customer: one(customers, { fields: [invoices.customerId], references: [customers.id] }),
  createdByUser: one(users, { fields: [invoices.createdBy], references: [users.id] }),
}));
