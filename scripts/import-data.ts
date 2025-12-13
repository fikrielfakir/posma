import { db } from "../server/db";
import { tenants, products, customers, suppliers } from "../shared/schema";
import fs from "fs";
import path from "path";

async function parseContactsFromSQL(content: string) {
  const customersList: any[] = [];
  const suppliersList: any[] = [];
  
  const contactsInsertRegex = /INSERT INTO `contacts`[^;]+VALUES\s*([\s\S]*?)(?:;|\nINSERT|\n--)/g;
  let match;
  
  while ((match = contactsInsertRegex.exec(content)) !== null) {
    const valuesBlock = match[1];
    const rowRegex = /\((\d+),\s*\d+,\s*'([^']*)',\s*(?:'([^']*)'|NULL),\s*(?:'([^']*)'|NULL),\s*'([^']*)',\s*(?:'([^']*)'|NULL),\s*(?:'([^']*)'|NULL),\s*(?:'([^']*)'|NULL),\s*(?:'([^']*)'|NULL),\s*(?:'([^']*)'|NULL),\s*'([^']*)',\s*'([^']*)',[^)]*?(?:'([^']*)'|NULL),\s*(?:'([^']*)'|NULL)[^)]*?\)/g;
    
    let rowMatch;
    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const [, id, type, contactType, supplierBusinessName, name, prefix, firstName, middleName, lastName, email, contactId, contactStatus, city, address] = rowMatch;
      
      if (type === 'customer' && contactStatus === 'active') {
        const customerName = supplierBusinessName || name || `${firstName || ''} ${lastName || ''}`.trim() || 'Client sans nom';
        if (customerName && customerName !== 'Client sans nom') {
          customersList.push({
            code: contactId || `CLI${id}`,
            name: customerName.replace(/\\'/g, "'"),
            phone: null,
            city: city && city !== '-' ? city.replace(/\\'/g, "'") : null,
            address: address && address !== '-' ? address.replace(/\\'/g, "'") : null,
            isActive: true
          });
        }
      } else if (type === 'supplier' && contactStatus === 'active') {
        const supplierName = supplierBusinessName || name || `${firstName || ''} ${lastName || ''}`.trim() || 'Fournisseur sans nom';
        if (supplierName && supplierName !== 'Fournisseur sans nom') {
          suppliersList.push({
            code: contactId || `FOU${id}`,
            name: supplierName.replace(/\\'/g, "'"),
            phone: null,
            city: null,
            address: null,
            isActive: true
          });
        }
      }
    }
  }
  
  return { customers: customersList, suppliers: suppliersList };
}

async function parseProductsFromSQL(content: string) {
  const productsList: any[] = [];
  const variationsMap = new Map<number, { purchasePrice: number; sellingPrice: number }>();
  
  const variationsInsertRegex = /INSERT INTO `variations`[^;]+VALUES\s*([\s\S]*?)(?:;|\n--)/g;
  let varMatch;
  while ((varMatch = variationsInsertRegex.exec(content)) !== null) {
    const valuesBlock = varMatch[1];
    const rowRegex = /\(\d+,\s*'[^']*',\s*(\d+),\s*'[^']*',\s*\d+,\s*[^,]*,\s*([0-9.]+),\s*([0-9.]+)/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const productId = parseInt(rowMatch[1]);
      const purchasePrice = parseFloat(rowMatch[2]) || 0;
      const sellingPrice = parseFloat(rowMatch[3]) || 0;
      variationsMap.set(productId, { purchasePrice, sellingPrice });
    }
  }
  
  const productsInsertRegex = /INSERT INTO `products`[^;]+VALUES\s*([\s\S]*?)(?:;|\nINSERT INTO `products`|\n--)/g;
  let match;
  while ((match = productsInsertRegex.exec(content)) !== null) {
    const valuesBlock = match[1];
    const rowRegex = /\((\d+),\s*'([^']*)',\s*\d+,\s*'([^']*)',\s*\d+,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,\s*'[^']*',\s*\d+,\s*([0-9.]+),\s*'([^']*)'/g;
    
    let rowMatch;
    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const [, id, name, type, alertQty, sku] = rowMatch;
      const productId = parseInt(id);
      const prices = variationsMap.get(productId) || { purchasePrice: 0, sellingPrice: 0 };
      
      if (name && name.trim()) {
        productsList.push({
          sku: sku || `PRD${id}`,
          name: name.replace(/\\'/g, "'"),
          purchasePrice: prices.purchasePrice.toFixed(2),
          sellingPrice: prices.sellingPrice.toFixed(2),
          minStock: Math.max(0, parseFloat(alertQty) || 0),
          isActive: true,
          unit: "piece"
        });
      }
    }
  }
  
  return productsList;
}

async function importData() {
  console.log("Starting data import...");
  
  const sqlFilePath = path.join(process.cwd(), "attached_assets", "u986408860_flurry_(15)_1765644689637.sql");
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error("SQL file not found:", sqlFilePath);
    process.exit(1);
  }
  
  console.log("Reading SQL file...");
  const content = fs.readFileSync(sqlFilePath, "utf-8");
  
  let [tenant] = await db.select().from(tenants).limit(1);
  if (!tenant) {
    console.log("Creating default tenant...");
    const [newTenant] = await db.insert(tenants).values({
      name: "StockFlow",
      slug: "stockflow",
      defaultCurrency: "MAD",
      defaultLanguage: "fr",
      timezone: "Africa/Casablanca"
    }).returning();
    tenant = newTenant;
  }
  console.log("Using tenant:", tenant.name, tenant.id);
  
  console.log("Parsing contacts (customers and suppliers)...");
  const { customers: customersList, suppliers: suppliersList } = await parseContactsFromSQL(content);
  console.log(`Found ${customersList.length} customers and ${suppliersList.length} suppliers`);
  
  console.log("Parsing products...");
  const productsList = await parseProductsFromSQL(content);
  console.log(`Found ${productsList.length} products`);
  
  if (customersList.length > 0) {
    console.log("Importing customers...");
    const uniqueCustomers = customersList.filter((c, i, arr) => 
      arr.findIndex(x => x.code === c.code) === i
    );
    
    for (const customer of uniqueCustomers.slice(0, 500)) {
      try {
        await db.insert(customers).values({
          tenantId: tenant.id,
          ...customer
        }).onConflictDoNothing();
      } catch (e) {
        console.log("Skipping duplicate customer:", customer.code);
      }
    }
    console.log(`Imported ${Math.min(uniqueCustomers.length, 500)} customers`);
  }
  
  if (suppliersList.length > 0) {
    console.log("Importing suppliers...");
    const uniqueSuppliers = suppliersList.filter((s, i, arr) => 
      arr.findIndex(x => x.code === s.code) === i
    );
    
    for (const supplier of uniqueSuppliers.slice(0, 500)) {
      try {
        await db.insert(suppliers).values({
          tenantId: tenant.id,
          ...supplier
        }).onConflictDoNothing();
      } catch (e) {
        console.log("Skipping duplicate supplier:", supplier.code);
      }
    }
    console.log(`Imported ${Math.min(uniqueSuppliers.length, 500)} suppliers`);
  }
  
  if (productsList.length > 0) {
    console.log("Importing products...");
    const uniqueProducts = productsList.filter((p, i, arr) => 
      arr.findIndex(x => x.sku === p.sku) === i
    );
    
    for (const product of uniqueProducts.slice(0, 1000)) {
      try {
        await db.insert(products).values({
          tenantId: tenant.id,
          ...product
        }).onConflictDoNothing();
      } catch (e) {
        console.log("Skipping duplicate product:", product.sku);
      }
    }
    console.log(`Imported ${Math.min(uniqueProducts.length, 1000)} products`);
  }
  
  console.log("Import completed successfully!");
  process.exit(0);
}

importData().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
