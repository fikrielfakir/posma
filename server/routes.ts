import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTenantSchema,
  insertUserSchema,
  insertRoleSchema,
  insertWarehouseSchema,
  insertProductFamilySchema,
  insertProductCategorySchema,
  insertProductSubcategorySchema,
  insertProductSchema,
  insertSupplierSchema,
  insertCustomerSchema,
  insertStockSchema,
  insertStockMovementSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertInventorySessionSchema,
  insertInventoryCountSchema,
  insertStockAlertSchema,
  insertCurrencyRateSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============== TENANTS ==============
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const tenant = await storage.getTenant(req.params.id);
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  app.post("/api/tenants", async (req, res) => {
    try {
      const data = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(data);
      res.status(201).json(tenant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create tenant" });
    }
  });

  app.patch("/api/tenants/:id", async (req, res) => {
    try {
      const data = insertTenantSchema.partial().parse(req.body);
      const tenant = await storage.updateTenant(req.params.id, data);
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });
      res.json(tenant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update tenant" });
    }
  });

  // ============== USERS ==============
  app.get("/api/users", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const users = await storage.getUsers(tenantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const data = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, data);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ============== ROLES ==============
  app.get("/api/roles", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const roles = await storage.getRoles(tenantId);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const data = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(data);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.patch("/api/roles/:id", async (req, res) => {
    try {
      const data = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(req.params.id, data);
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // ============== WAREHOUSES ==============
  app.get("/api/warehouses", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const warehouses = await storage.getWarehouses(tenantId);
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warehouses" });
    }
  });

  app.get("/api/warehouses/:id", async (req, res) => {
    try {
      const warehouse = await storage.getWarehouse(req.params.id);
      if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warehouse" });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const data = insertWarehouseSchema.parse(req.body);
      const warehouse = await storage.createWarehouse(data);
      res.status(201).json(warehouse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create warehouse" });
    }
  });

  app.patch("/api/warehouses/:id", async (req, res) => {
    try {
      const data = insertWarehouseSchema.partial().parse(req.body);
      const warehouse = await storage.updateWarehouse(req.params.id, data);
      if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
      res.json(warehouse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update warehouse" });
    }
  });

  app.delete("/api/warehouses/:id", async (req, res) => {
    try {
      await storage.deleteWarehouse(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete warehouse" });
    }
  });

  // ============== PRODUCT FAMILIES ==============
  app.get("/api/product-families", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const families = await storage.getProductFamilies(tenantId);
      res.json(families);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product families" });
    }
  });

  app.get("/api/product-families/:id", async (req, res) => {
    try {
      const family = await storage.getProductFamily(req.params.id);
      if (!family) return res.status(404).json({ error: "Product family not found" });
      res.json(family);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product family" });
    }
  });

  app.post("/api/product-families", async (req, res) => {
    try {
      const data = insertProductFamilySchema.parse(req.body);
      const family = await storage.createProductFamily(data);
      res.status(201).json(family);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product family" });
    }
  });

  app.patch("/api/product-families/:id", async (req, res) => {
    try {
      const data = insertProductFamilySchema.partial().parse(req.body);
      const family = await storage.updateProductFamily(req.params.id, data);
      if (!family) return res.status(404).json({ error: "Product family not found" });
      res.json(family);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product family" });
    }
  });

  app.delete("/api/product-families/:id", async (req, res) => {
    try {
      await storage.deleteProductFamily(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product family" });
    }
  });

  // ============== PRODUCT CATEGORIES ==============
  app.get("/api/product-categories", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const familyId = req.query.familyId as string | undefined;
      const categories = await storage.getProductCategories(tenantId, familyId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product categories" });
    }
  });

  app.get("/api/product-categories/:id", async (req, res) => {
    try {
      const category = await storage.getProductCategory(req.params.id);
      if (!category) return res.status(404).json({ error: "Product category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product category" });
    }
  });

  app.post("/api/product-categories", async (req, res) => {
    try {
      const data = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product category" });
    }
  });

  app.patch("/api/product-categories/:id", async (req, res) => {
    try {
      const data = insertProductCategorySchema.partial().parse(req.body);
      const category = await storage.updateProductCategory(req.params.id, data);
      if (!category) return res.status(404).json({ error: "Product category not found" });
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product category" });
    }
  });

  app.delete("/api/product-categories/:id", async (req, res) => {
    try {
      await storage.deleteProductCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product category" });
    }
  });

  // ============== PRODUCT SUBCATEGORIES ==============
  app.get("/api/product-subcategories", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const subcategories = await storage.getProductSubcategories(tenantId, categoryId);
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product subcategories" });
    }
  });

  app.get("/api/product-subcategories/:id", async (req, res) => {
    try {
      const subcategory = await storage.getProductSubcategory(req.params.id);
      if (!subcategory) return res.status(404).json({ error: "Product subcategory not found" });
      res.json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product subcategory" });
    }
  });

  app.post("/api/product-subcategories", async (req, res) => {
    try {
      const data = insertProductSubcategorySchema.parse(req.body);
      const subcategory = await storage.createProductSubcategory(data);
      res.status(201).json(subcategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product subcategory" });
    }
  });

  app.patch("/api/product-subcategories/:id", async (req, res) => {
    try {
      const data = insertProductSubcategorySchema.partial().parse(req.body);
      const subcategory = await storage.updateProductSubcategory(req.params.id, data);
      if (!subcategory) return res.status(404).json({ error: "Product subcategory not found" });
      res.json(subcategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product subcategory" });
    }
  });

  app.delete("/api/product-subcategories/:id", async (req, res) => {
    try {
      await storage.deleteProductSubcategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product subcategory" });
    }
  });

  // ============== PRODUCTS ==============
  app.get("/api/products", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const search = req.query.search as string | undefined;
      const products = await storage.getProducts(tenantId, search);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ============== SUPPLIERS ==============
  app.get("/api/suppliers", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const suppliers = await storage.getSuppliers(tenantId);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) return res.status(404).json({ error: "Supplier not found" });
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const data = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(data);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const data = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, data);
      if (!supplier) return res.status(404).json({ error: "Supplier not found" });
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  });

  // ============== CUSTOMERS ==============
  app.get("/api/customers", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const customers = await storage.getCustomers(tenantId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const data = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, data);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // ============== STOCK ==============
  app.get("/api/stock", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const stockItems = await storage.getStock(tenantId, warehouseId);
      res.json(stockItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  app.get("/api/stock/product/:productId", async (req, res) => {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const stockItems = await storage.getStockByProduct(req.params.productId, warehouseId);
      res.json(stockItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock by product" });
    }
  });

  app.post("/api/stock", async (req, res) => {
    try {
      const data = insertStockSchema.parse(req.body);
      const stockItem = await storage.upsertStock(data);
      res.status(201).json(stockItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create/update stock" });
    }
  });

  app.patch("/api/stock/:id", async (req, res) => {
    try {
      const data = insertStockSchema.partial().parse(req.body);
      const stockItem = await storage.updateStock(req.params.id, data);
      if (!stockItem) return res.status(404).json({ error: "Stock not found" });
      res.json(stockItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  // ============== STOCK MOVEMENTS ==============
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const movements = await storage.getStockMovements(tenantId, warehouseId, limit);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock movements" });
    }
  });

  app.get("/api/stock-movements/:id", async (req, res) => {
    try {
      const movement = await storage.getStockMovement(req.params.id);
      if (!movement) return res.status(404).json({ error: "Stock movement not found" });
      res.json(movement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock movement" });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const data = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovementWithStockUpdate(data);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create stock movement" });
    }
  });

  // ============== PURCHASE ORDERS ==============
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const status = req.query.status as string | undefined;
      const orders = await storage.getPurchaseOrders(tenantId, status);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "Purchase order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase order" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const data = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  app.patch("/api/purchase-orders/:id", async (req, res) => {
    try {
      const data = insertPurchaseOrderSchema.partial().parse(req.body);
      const order = await storage.updatePurchaseOrder(req.params.id, data);
      if (!order) return res.status(404).json({ error: "Purchase order not found" });
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update purchase order" });
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      await storage.deletePurchaseOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase order" });
    }
  });

  // ============== PURCHASE ORDER ITEMS ==============
  app.get("/api/purchase-orders/:orderId/items", async (req, res) => {
    try {
      const items = await storage.getPurchaseOrderItems(req.params.orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase order items" });
    }
  });

  app.post("/api/purchase-orders/:orderId/items", async (req, res) => {
    try {
      const data = insertPurchaseOrderItemSchema.parse({
        ...req.body,
        purchaseOrderId: req.params.orderId,
      });
      const item = await storage.createPurchaseOrderItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create purchase order item" });
    }
  });

  app.patch("/api/purchase-order-items/:id", async (req, res) => {
    try {
      const data = insertPurchaseOrderItemSchema.partial().parse(req.body);
      const item = await storage.updatePurchaseOrderItem(req.params.id, data);
      if (!item) return res.status(404).json({ error: "Purchase order item not found" });
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update purchase order item" });
    }
  });

  app.delete("/api/purchase-order-items/:id", async (req, res) => {
    try {
      await storage.deletePurchaseOrderItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase order item" });
    }
  });

  // ============== SALES ==============
  app.get("/api/sales", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const status = req.query.status as string | undefined;
      const sales = await storage.getSales(tenantId, status);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) return res.status(404).json({ error: "Sale not found" });
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const data = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(data);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  app.patch("/api/sales/:id", async (req, res) => {
    try {
      const data = insertSaleSchema.partial().parse(req.body);
      const sale = await storage.updateSale(req.params.id, data);
      if (!sale) return res.status(404).json({ error: "Sale not found" });
      res.json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update sale" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      await storage.deleteSale(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sale" });
    }
  });

  // ============== SALE ITEMS ==============
  app.get("/api/sales/:saleId/items", async (req, res) => {
    try {
      const items = await storage.getSaleItems(req.params.saleId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale items" });
    }
  });

  app.post("/api/sales/:saleId/items", async (req, res) => {
    try {
      const data = insertSaleItemSchema.parse({
        ...req.body,
        saleId: req.params.saleId,
      });
      const item = await storage.createSaleItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sale item" });
    }
  });

  app.patch("/api/sale-items/:id", async (req, res) => {
    try {
      const data = insertSaleItemSchema.partial().parse(req.body);
      const item = await storage.updateSaleItem(req.params.id, data);
      if (!item) return res.status(404).json({ error: "Sale item not found" });
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update sale item" });
    }
  });

  app.delete("/api/sale-items/:id", async (req, res) => {
    try {
      await storage.deleteSaleItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sale item" });
    }
  });

  // ============== INVENTORY SESSIONS ==============
  app.get("/api/inventory-sessions", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const sessions = await storage.getInventorySessions(tenantId, warehouseId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory sessions" });
    }
  });

  app.get("/api/inventory-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getInventorySession(req.params.id);
      if (!session) return res.status(404).json({ error: "Inventory session not found" });
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory session" });
    }
  });

  app.post("/api/inventory-sessions", async (req, res) => {
    try {
      const data = insertInventorySessionSchema.parse(req.body);
      const session = await storage.createInventorySession(data);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create inventory session" });
    }
  });

  app.patch("/api/inventory-sessions/:id", async (req, res) => {
    try {
      const data = insertInventorySessionSchema.partial().parse(req.body);
      const session = await storage.updateInventorySession(req.params.id, data);
      if (!session) return res.status(404).json({ error: "Inventory session not found" });
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update inventory session" });
    }
  });

  // ============== INVENTORY COUNTS ==============
  app.get("/api/inventory-sessions/:sessionId/counts", async (req, res) => {
    try {
      const counts = await storage.getInventoryCounts(req.params.sessionId);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory counts" });
    }
  });

  app.post("/api/inventory-sessions/:sessionId/counts", async (req, res) => {
    try {
      const data = insertInventoryCountSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId,
      });
      const count = await storage.createInventoryCount(data);
      res.status(201).json(count);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create inventory count" });
    }
  });

  app.patch("/api/inventory-counts/:id", async (req, res) => {
    try {
      const data = insertInventoryCountSchema.partial().parse(req.body);
      const count = await storage.updateInventoryCount(req.params.id, data);
      if (!count) return res.status(404).json({ error: "Inventory count not found" });
      res.json(count);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update inventory count" });
    }
  });

  // ============== STOCK ALERTS ==============
  app.get("/api/stock-alerts", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const alerts = await storage.getStockAlerts(tenantId, warehouseId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock alerts" });
    }
  });

  app.post("/api/stock-alerts", async (req, res) => {
    try {
      const data = insertStockAlertSchema.parse(req.body);
      const alert = await storage.createStockAlert(data);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create stock alert" });
    }
  });

  app.patch("/api/stock-alerts/:id", async (req, res) => {
    try {
      const data = insertStockAlertSchema.partial().parse(req.body);
      const alert = await storage.updateStockAlert(req.params.id, data);
      if (!alert) return res.status(404).json({ error: "Stock alert not found" });
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update stock alert" });
    }
  });

  app.post("/api/stock-alerts/:id/dismiss", async (req, res) => {
    try {
      await storage.dismissStockAlert(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss stock alert" });
    }
  });

  // ============== CURRENCY RATES ==============
  app.get("/api/currency-rates", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const rates = await storage.getCurrencyRates(tenantId);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch currency rates" });
    }
  });

  app.get("/api/currency-rates/:from/:to", async (req, res) => {
    try {
      const rate = await storage.getCurrencyRate(req.params.from, req.params.to);
      if (!rate) return res.status(404).json({ error: "Currency rate not found" });
      res.json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch currency rate" });
    }
  });

  app.post("/api/currency-rates", async (req, res) => {
    try {
      const data = insertCurrencyRateSchema.parse(req.body);
      const rate = await storage.upsertCurrencyRate(data);
      res.status(201).json(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create currency rate" });
    }
  });

  // ============== DASHBOARD ==============
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const stats = await storage.getDashboardStats(tenantId, warehouseId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
