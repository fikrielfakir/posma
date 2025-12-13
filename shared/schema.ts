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
