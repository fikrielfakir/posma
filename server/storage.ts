import { eq, desc, and, sql, ilike, or } from "drizzle-orm";
import { db } from "./db";
import {
  tenants, insertTenantSchema, type Tenant, type InsertTenant,
  roles, type Role, type InsertRole,
  users, type User, type InsertUser,
  warehouses, type Warehouse, type InsertWarehouse,
  productFamilies, type ProductFamily, type InsertProductFamily,
  productCategories, type ProductCategory, type InsertProductCategory,
  productSubcategories, type ProductSubcategory, type InsertProductSubcategory,
  products, type Product, type InsertProduct,
  suppliers, type Supplier, type InsertSupplier,
  customers, type Customer, type InsertCustomer,
  stock, type Stock, type InsertStock,
  stockMovements, type StockMovement, type InsertStockMovement,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  purchaseOrderItems, type PurchaseOrderItem, type InsertPurchaseOrderItem,
  sales, type Sale, type InsertSale,
  saleItems, type SaleItem, type InsertSaleItem,
  inventorySessions, type InventorySession, type InsertInventorySession,
  inventoryCounts, type InventoryCount, type InsertInventoryCount,
  stockAlerts, type StockAlert, type InsertStockAlert,
  currencyRates, type CurrencyRate, type InsertCurrencyRate,
} from "@shared/schema";

export interface IStorage {
  // Tenants
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;

  // Users
  getUsers(tenantId?: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Roles
  getRoles(tenantId?: string): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;

  // Warehouses
  getWarehouses(tenantId?: string): Promise<Warehouse[]>;
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: string): Promise<boolean>;

  // Product Families
  getProductFamilies(tenantId?: string): Promise<ProductFamily[]>;
  getProductFamily(id: string): Promise<ProductFamily | undefined>;
  createProductFamily(family: InsertProductFamily): Promise<ProductFamily>;
  updateProductFamily(id: string, family: Partial<InsertProductFamily>): Promise<ProductFamily | undefined>;
  deleteProductFamily(id: string): Promise<boolean>;

  // Product Categories
  getProductCategories(tenantId?: string, familyId?: string): Promise<ProductCategory[]>;
  getProductCategory(id: string): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: string, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: string): Promise<boolean>;

  // Product Subcategories
  getProductSubcategories(tenantId?: string, categoryId?: string): Promise<ProductSubcategory[]>;
  getProductSubcategory(id: string): Promise<ProductSubcategory | undefined>;
  createProductSubcategory(subcategory: InsertProductSubcategory): Promise<ProductSubcategory>;
  updateProductSubcategory(id: string, subcategory: Partial<InsertProductSubcategory>): Promise<ProductSubcategory | undefined>;
  deleteProductSubcategory(id: string): Promise<boolean>;

  // Products
  getProducts(tenantId?: string, search?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Suppliers
  getSuppliers(tenantId?: string): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Customers
  getCustomers(tenantId?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Stock
  getStock(tenantId?: string, warehouseId?: string): Promise<Stock[]>;
  getStockByProduct(productId: string, warehouseId?: string): Promise<Stock[]>;
  upsertStock(stockData: InsertStock): Promise<Stock>;
  updateStock(id: string, stockData: Partial<InsertStock>): Promise<Stock | undefined>;

  // Stock Movements
  getStockMovements(tenantId?: string, warehouseId?: string, limit?: number): Promise<StockMovement[]>;
  getStockMovement(id: string): Promise<StockMovement | undefined>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // Purchase Orders
  getPurchaseOrders(tenantId?: string, status?: string): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: string): Promise<boolean>;

  // Purchase Order Items
  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: string, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: string): Promise<boolean>;

  // Sales
  getSales(tenantId?: string, status?: string): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: string, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: string): Promise<boolean>;

  // Sale Items
  getSaleItems(saleId: string): Promise<SaleItem[]>;
  createSaleItem(item: InsertSaleItem): Promise<SaleItem>;
  updateSaleItem(id: string, item: Partial<InsertSaleItem>): Promise<SaleItem | undefined>;
  deleteSaleItem(id: string): Promise<boolean>;

  // Inventory Sessions
  getInventorySessions(tenantId?: string, warehouseId?: string): Promise<InventorySession[]>;
  getInventorySession(id: string): Promise<InventorySession | undefined>;
  createInventorySession(session: InsertInventorySession): Promise<InventorySession>;
  updateInventorySession(id: string, session: Partial<InsertInventorySession>): Promise<InventorySession | undefined>;

  // Inventory Counts
  getInventoryCounts(sessionId: string): Promise<InventoryCount[]>;
  createInventoryCount(count: InsertInventoryCount): Promise<InventoryCount>;
  updateInventoryCount(id: string, count: Partial<InsertInventoryCount>): Promise<InventoryCount | undefined>;

  // Stock Alerts
  getStockAlerts(tenantId?: string, warehouseId?: string): Promise<StockAlert[]>;
  createStockAlert(alert: InsertStockAlert): Promise<StockAlert>;
  updateStockAlert(id: string, alert: Partial<InsertStockAlert>): Promise<StockAlert | undefined>;
  dismissStockAlert(id: string): Promise<boolean>;

  // Currency Rates
  getCurrencyRates(tenantId?: string): Promise<CurrencyRate[]>;
  getCurrencyRate(fromCurrency: string, toCurrency: string): Promise<CurrencyRate | undefined>;
  upsertCurrencyRate(rate: InsertCurrencyRate): Promise<CurrencyRate>;

  // Dashboard Stats
  getDashboardStats(tenantId?: string, warehouseId?: string): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalSuppliers: number;
    totalCustomers: number;
    pendingPurchases: number;
    pendingSales: number;
    totalStockValue: number;
    todaySales: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Tenants
  async getTenants(): Promise<Tenant[]> {
    return db.select().from(tenants).orderBy(tenants.name);
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [created] = await db.insert(tenants).values(tenant).returning();
    return created;
  }

  async updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updated] = await db.update(tenants).set(tenant).where(eq(tenants.id, id)).returning();
    return updated;
  }

  // Users
  async getUsers(tenantId?: string): Promise<User[]> {
    if (tenantId) {
      return db.select().from(users).where(eq(users.tenantId, tenantId)).orderBy(users.fullName);
    }
    return db.select().from(users).orderBy(users.fullName);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Roles
  async getRoles(tenantId?: string): Promise<Role[]> {
    if (tenantId) {
      return db.select().from(roles).where(eq(roles.tenantId, tenantId)).orderBy(roles.name);
    }
    return db.select().from(roles).orderBy(roles.name);
  }

  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [created] = await db.insert(roles).values(role).returning();
    return created;
  }

  async updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined> {
    const [updated] = await db.update(roles).set(role).where(eq(roles.id, id)).returning();
    return updated;
  }

  // Warehouses
  async getWarehouses(tenantId?: string): Promise<Warehouse[]> {
    if (tenantId) {
      return db.select().from(warehouses).where(eq(warehouses.tenantId, tenantId)).orderBy(warehouses.name);
    }
    return db.select().from(warehouses).orderBy(warehouses.name);
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse;
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [created] = await db.insert(warehouses).values(warehouse).returning();
    return created;
  }

  async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const [updated] = await db.update(warehouses).set(warehouse).where(eq(warehouses.id, id)).returning();
    return updated;
  }

  async deleteWarehouse(id: string): Promise<boolean> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
    return true;
  }

  // Product Families
  async getProductFamilies(tenantId?: string): Promise<ProductFamily[]> {
    if (tenantId) {
      return db.select().from(productFamilies).where(eq(productFamilies.tenantId, tenantId)).orderBy(productFamilies.sortOrder);
    }
    return db.select().from(productFamilies).orderBy(productFamilies.sortOrder);
  }

  async getProductFamily(id: string): Promise<ProductFamily | undefined> {
    const [family] = await db.select().from(productFamilies).where(eq(productFamilies.id, id));
    return family;
  }

  async createProductFamily(family: InsertProductFamily): Promise<ProductFamily> {
    const [created] = await db.insert(productFamilies).values(family).returning();
    return created;
  }

  async updateProductFamily(id: string, family: Partial<InsertProductFamily>): Promise<ProductFamily | undefined> {
    const [updated] = await db.update(productFamilies).set(family).where(eq(productFamilies.id, id)).returning();
    return updated;
  }

  async deleteProductFamily(id: string): Promise<boolean> {
    await db.delete(productFamilies).where(eq(productFamilies.id, id));
    return true;
  }

  // Product Categories
  async getProductCategories(tenantId?: string, familyId?: string): Promise<ProductCategory[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(productCategories.tenantId, tenantId));
    if (familyId) conditions.push(eq(productCategories.familyId, familyId));
    
    if (conditions.length > 0) {
      return db.select().from(productCategories).where(and(...conditions)).orderBy(productCategories.sortOrder);
    }
    return db.select().from(productCategories).orderBy(productCategories.sortOrder);
  }

  async getProductCategory(id: string): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return category;
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const [created] = await db.insert(productCategories).values(category).returning();
    return created;
  }

  async updateProductCategory(id: string, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> {
    const [updated] = await db.update(productCategories).set(category).where(eq(productCategories.id, id)).returning();
    return updated;
  }

  async deleteProductCategory(id: string): Promise<boolean> {
    await db.delete(productCategories).where(eq(productCategories.id, id));
    return true;
  }

  // Product Subcategories
  async getProductSubcategories(tenantId?: string, categoryId?: string): Promise<ProductSubcategory[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(productSubcategories.tenantId, tenantId));
    if (categoryId) conditions.push(eq(productSubcategories.categoryId, categoryId));
    
    if (conditions.length > 0) {
      return db.select().from(productSubcategories).where(and(...conditions)).orderBy(productSubcategories.sortOrder);
    }
    return db.select().from(productSubcategories).orderBy(productSubcategories.sortOrder);
  }

  async getProductSubcategory(id: string): Promise<ProductSubcategory | undefined> {
    const [subcategory] = await db.select().from(productSubcategories).where(eq(productSubcategories.id, id));
    return subcategory;
  }

  async createProductSubcategory(subcategory: InsertProductSubcategory): Promise<ProductSubcategory> {
    const [created] = await db.insert(productSubcategories).values(subcategory).returning();
    return created;
  }

  async updateProductSubcategory(id: string, subcategory: Partial<InsertProductSubcategory>): Promise<ProductSubcategory | undefined> {
    const [updated] = await db.update(productSubcategories).set(subcategory).where(eq(productSubcategories.id, id)).returning();
    return updated;
  }

  async deleteProductSubcategory(id: string): Promise<boolean> {
    await db.delete(productSubcategories).where(eq(productSubcategories.id, id));
    return true;
  }

  // Products
  async getProducts(tenantId?: string, search?: string): Promise<Product[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(products.tenantId, tenantId));
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.barcode, `%${search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return db.select().from(products).where(and(...conditions)).orderBy(products.name);
    }
    return db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Suppliers
  async getSuppliers(tenantId?: string): Promise<Supplier[]> {
    if (tenantId) {
      return db.select().from(suppliers).where(eq(suppliers.tenantId, tenantId)).orderBy(suppliers.name);
    }
    return db.select().from(suppliers).orderBy(suppliers.name);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  }

  // Customers
  async getCustomers(tenantId?: string): Promise<Customer[]> {
    if (tenantId) {
      return db.select().from(customers).where(eq(customers.tenantId, tenantId)).orderBy(customers.name);
    }
    return db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  }

  // Stock
  async getStock(tenantId?: string, warehouseId?: string): Promise<Stock[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(stock.tenantId, tenantId));
    if (warehouseId) conditions.push(eq(stock.warehouseId, warehouseId));
    
    if (conditions.length > 0) {
      return db.select().from(stock).where(and(...conditions));
    }
    return db.select().from(stock);
  }

  async getStockByProduct(productId: string, warehouseId?: string): Promise<Stock[]> {
    const conditions = [eq(stock.productId, productId)];
    if (warehouseId) conditions.push(eq(stock.warehouseId, warehouseId));
    return db.select().from(stock).where(and(...conditions));
  }

  async upsertStock(stockData: InsertStock): Promise<Stock> {
    const existing = await db.select().from(stock).where(
      and(
        eq(stock.warehouseId, stockData.warehouseId!),
        eq(stock.productId, stockData.productId!)
      )
    );
    
    if (existing.length > 0) {
      const [updated] = await db.update(stock)
        .set(stockData)
        .where(eq(stock.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(stock).values(stockData).returning();
    return created;
  }

  async updateStock(id: string, stockData: Partial<InsertStock>): Promise<Stock | undefined> {
    const [updated] = await db.update(stock).set(stockData).where(eq(stock.id, id)).returning();
    return updated;
  }

  // Stock Movements
  async getStockMovements(tenantId?: string, warehouseId?: string, limit: number = 100): Promise<StockMovement[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(stockMovements.tenantId, tenantId));
    if (warehouseId) conditions.push(eq(stockMovements.warehouseId, warehouseId));
    
    if (conditions.length > 0) {
      return db.select().from(stockMovements).where(and(...conditions)).orderBy(desc(stockMovements.createdAt)).limit(limit);
    }
    return db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt)).limit(limit);
  }

  async getStockMovement(id: string): Promise<StockMovement | undefined> {
    const [movement] = await db.select().from(stockMovements).where(eq(stockMovements.id, id));
    return movement;
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [created] = await db.insert(stockMovements).values(movement).returning();
    return created;
  }

  // Purchase Orders
  async getPurchaseOrders(tenantId?: string, status?: string): Promise<PurchaseOrder[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(purchaseOrders.tenantId, tenantId));
    if (status) conditions.push(eq(purchaseOrders.status, status));
    
    if (conditions.length > 0) {
      return db.select().from(purchaseOrders).where(and(...conditions)).orderBy(desc(purchaseOrders.createdAt));
    }
    return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [created] = await db.insert(purchaseOrders).values(order).returning();
    return created;
  }

  async updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updated] = await db.update(purchaseOrders).set(order).where(eq(purchaseOrders.id, id)).returning();
    return updated;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    return true;
  }

  // Purchase Order Items
  async getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    return db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [created] = await db.insert(purchaseOrderItems).values(item).returning();
    return created;
  }

  async updatePurchaseOrderItem(id: string, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const [updated] = await db.update(purchaseOrderItems).set(item).where(eq(purchaseOrderItems.id, id)).returning();
    return updated;
  }

  async deletePurchaseOrderItem(id: string): Promise<boolean> {
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return true;
  }

  // Sales
  async getSales(tenantId?: string, status?: string): Promise<Sale[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(sales.tenantId, tenantId));
    if (status) conditions.push(eq(sales.status, status));
    
    if (conditions.length > 0) {
      return db.select().from(sales).where(and(...conditions)).orderBy(desc(sales.createdAt));
    }
    return db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale).returning();
    return created;
  }

  async updateSale(id: string, sale: Partial<InsertSale>): Promise<Sale | undefined> {
    const [updated] = await db.update(sales).set(sale).where(eq(sales.id, id)).returning();
    return updated;
  }

  async deleteSale(id: string): Promise<boolean> {
    await db.delete(sales).where(eq(sales.id, id));
    return true;
  }

  // Sale Items
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }

  async createSaleItem(item: InsertSaleItem): Promise<SaleItem> {
    const [created] = await db.insert(saleItems).values(item).returning();
    return created;
  }

  async updateSaleItem(id: string, item: Partial<InsertSaleItem>): Promise<SaleItem | undefined> {
    const [updated] = await db.update(saleItems).set(item).where(eq(saleItems.id, id)).returning();
    return updated;
  }

  async deleteSaleItem(id: string): Promise<boolean> {
    await db.delete(saleItems).where(eq(saleItems.id, id));
    return true;
  }

  // Inventory Sessions
  async getInventorySessions(tenantId?: string, warehouseId?: string): Promise<InventorySession[]> {
    const conditions = [];
    if (tenantId) conditions.push(eq(inventorySessions.tenantId, tenantId));
    if (warehouseId) conditions.push(eq(inventorySessions.warehouseId, warehouseId));
    
    if (conditions.length > 0) {
      return db.select().from(inventorySessions).where(and(...conditions)).orderBy(desc(inventorySessions.createdAt));
    }
    return db.select().from(inventorySessions).orderBy(desc(inventorySessions.createdAt));
  }

  async getInventorySession(id: string): Promise<InventorySession | undefined> {
    const [session] = await db.select().from(inventorySessions).where(eq(inventorySessions.id, id));
    return session;
  }

  async createInventorySession(session: InsertInventorySession): Promise<InventorySession> {
    const [created] = await db.insert(inventorySessions).values(session).returning();
    return created;
  }

  async updateInventorySession(id: string, session: Partial<InsertInventorySession>): Promise<InventorySession | undefined> {
    const [updated] = await db.update(inventorySessions).set(session).where(eq(inventorySessions.id, id)).returning();
    return updated;
  }

  // Inventory Counts
  async getInventoryCounts(sessionId: string): Promise<InventoryCount[]> {
    return db.select().from(inventoryCounts).where(eq(inventoryCounts.sessionId, sessionId));
  }

  async createInventoryCount(count: InsertInventoryCount): Promise<InventoryCount> {
    const [created] = await db.insert(inventoryCounts).values(count).returning();
    return created;
  }

  async updateInventoryCount(id: string, count: Partial<InsertInventoryCount>): Promise<InventoryCount | undefined> {
    const [updated] = await db.update(inventoryCounts).set(count).where(eq(inventoryCounts.id, id)).returning();
    return updated;
  }

  // Stock Alerts
  async getStockAlerts(tenantId?: string, warehouseId?: string): Promise<StockAlert[]> {
    const conditions = [eq(stockAlerts.isDismissed, false)];
    if (tenantId) conditions.push(eq(stockAlerts.tenantId, tenantId));
    if (warehouseId) conditions.push(eq(stockAlerts.warehouseId, warehouseId));
    
    return db.select().from(stockAlerts).where(and(...conditions)).orderBy(desc(stockAlerts.createdAt));
  }

  async createStockAlert(alert: InsertStockAlert): Promise<StockAlert> {
    const [created] = await db.insert(stockAlerts).values(alert).returning();
    return created;
  }

  async updateStockAlert(id: string, alert: Partial<InsertStockAlert>): Promise<StockAlert | undefined> {
    const [updated] = await db.update(stockAlerts).set(alert).where(eq(stockAlerts.id, id)).returning();
    return updated;
  }

  async dismissStockAlert(id: string): Promise<boolean> {
    await db.update(stockAlerts).set({ isDismissed: true }).where(eq(stockAlerts.id, id));
    return true;
  }

  // Currency Rates
  async getCurrencyRates(tenantId?: string): Promise<CurrencyRate[]> {
    if (tenantId) {
      return db.select().from(currencyRates).where(eq(currencyRates.tenantId, tenantId)).orderBy(desc(currencyRates.effectiveDate));
    }
    return db.select().from(currencyRates).orderBy(desc(currencyRates.effectiveDate));
  }

  async getCurrencyRate(fromCurrency: string, toCurrency: string): Promise<CurrencyRate | undefined> {
    const [rate] = await db.select().from(currencyRates)
      .where(and(
        eq(currencyRates.fromCurrency, fromCurrency),
        eq(currencyRates.toCurrency, toCurrency)
      ))
      .orderBy(desc(currencyRates.effectiveDate))
      .limit(1);
    return rate;
  }

  async upsertCurrencyRate(rate: InsertCurrencyRate): Promise<CurrencyRate> {
    const [created] = await db.insert(currencyRates).values(rate).returning();
    return created;
  }

  // Dashboard Stats
  async getDashboardStats(tenantId?: string, warehouseId?: string): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalSuppliers: number;
    totalCustomers: number;
    pendingPurchases: number;
    pendingSales: number;
    totalStockValue: number;
    todaySales: number;
  }> {
    const productConditions = tenantId ? [eq(products.tenantId, tenantId)] : [];
    const supplierConditions = tenantId ? [eq(suppliers.tenantId, tenantId)] : [];
    const customerConditions = tenantId ? [eq(customers.tenantId, tenantId)] : [];
    
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(productConditions.length > 0 ? and(...productConditions) : undefined);
    const [supplierCount] = await db.select({ count: sql<number>`count(*)` }).from(suppliers).where(supplierConditions.length > 0 ? and(...supplierConditions) : undefined);
    const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers).where(customerConditions.length > 0 ? and(...customerConditions) : undefined);
    
    const purchaseConditions = tenantId ? [eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.status, 'pending_approval')] : [eq(purchaseOrders.status, 'pending_approval')];
    const [pendingPurchaseCount] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrders).where(and(...purchaseConditions));
    
    const saleConditions = tenantId ? [eq(sales.tenantId, tenantId), eq(sales.status, 'draft')] : [eq(sales.status, 'draft')];
    const [pendingSaleCount] = await db.select({ count: sql<number>`count(*)` }).from(sales).where(and(...saleConditions));
    
    // Low stock count - products below reorder point
    const lowStockQuery = await db.select({ count: sql<number>`count(*)` }).from(stock)
      .innerJoin(products, eq(stock.productId, products.id))
      .where(sql`CAST(${stock.quantity} AS numeric) < ${products.reorderPoint}`);
    
    // Total stock value
    const stockValueQuery = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(${stock.quantity} AS numeric) * CAST(${stock.averageCost} AS numeric)), 0)` 
    }).from(stock);
    
    // Today's sales total
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesQuery = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(${sales.total} AS numeric)), 0)` 
    }).from(sales).where(sql`${sales.saleDate} >= ${today}`);

    return {
      totalProducts: Number(productCount?.count || 0),
      lowStockCount: Number(lowStockQuery[0]?.count || 0),
      totalSuppliers: Number(supplierCount?.count || 0),
      totalCustomers: Number(customerCount?.count || 0),
      pendingPurchases: Number(pendingPurchaseCount?.count || 0),
      pendingSales: Number(pendingSaleCount?.count || 0),
      totalStockValue: Number(stockValueQuery[0]?.total || 0),
      todaySales: Number(todaySalesQuery[0]?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();
