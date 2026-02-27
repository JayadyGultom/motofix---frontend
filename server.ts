import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("workshop.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT,
    category_id INTEGER,
    buy_price REAL,
    sell_price REAL,
    stock INTEGER,
    min_stock INTEGER,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    address TEXT,
    last_service DATE
  );

  CREATE TABLE IF NOT EXISTS mechanics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    commission_rate REAL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT UNIQUE,
    customer_id INTEGER,
    mechanic_id INTEGER,
    total_amount REAL,
    discount REAL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(mechanic_id) REFERENCES mechanics(id)
  );

  CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    item_type TEXT, -- 'product' or 'service'
    item_id INTEGER,
    quantity INTEGER,
    price REAL,
    subtotal REAL,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run("admin", "admin123", "admin", "Administrator");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Oli");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Ban");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Sparepart");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const incomeToday = db.prepare("SELECT SUM(total_amount) as total FROM transactions WHERE date(created_at) = ?").get(today) as any;
    const expenseToday = db.prepare("SELECT SUM(amount) as total FROM expenses WHERE date(created_at) = ?").get(today) as any;
    const transToday = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE date(created_at) = ?").get(today) as any;
    
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock <= min_stock").get() as any;

    res.json({
      incomeToday: incomeToday.total || 0,
      expenseToday: expenseToday.total || 0,
      transactionsToday: transToday.count || 0,
      lowStockCount: lowStock.count || 0
    });
  });

  app.get("/api/dashboard/charts", (req, res) => {
    // Simplified monthly profit for current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const data = months.map((month, index) => {
      const monthStr = (index + 1).toString().padStart(2, '0');
      const income = db.prepare(`SELECT SUM(total_amount) as total FROM transactions WHERE strftime('%Y-%m', created_at) = ?`).get(`${currentYear}-${monthStr}`) as any;
      const expense = db.prepare(`SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', created_at) = ?`).get(`${currentYear}-${monthStr}`) as any;
      
      return {
        name: month,
        profit: (income.total || 0) - (expense.total || 0)
      };
    });

    res.json(data);
  });

  // Products CRUD
  app.get("/api/products", (req, res) => {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `).all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { code, name, category_id, buy_price, sell_price, stock, min_stock } = req.body;
    const result = db.prepare(`
      INSERT INTO products (code, name, category_id, buy_price, sell_price, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(code, name, category_id, buy_price, sell_price, stock, min_stock);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { code, name, category_id, buy_price, sell_price, stock, min_stock } = req.body;
    db.prepare(`
      UPDATE products 
      SET code = ?, name = ?, category_id = ?, buy_price = ?, sell_price = ?, stock = ?, min_stock = ?
      WHERE id = ?
    `).run(code, name, category_id, buy_price, sell_price, stock, min_stock, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    res.json(db.prepare("SELECT * FROM categories").all());
  });

  // Services
  app.get("/api/services", (req, res) => {
    res.json(db.prepare("SELECT * FROM services").all());
  });

  app.post("/api/services", (req, res) => {
    const { name, price } = req.body;
    const result = db.prepare("INSERT INTO services (name, price) VALUES (?, ?)").run(name, price);
    res.json({ id: result.lastInsertRowid });
  });

  // Mechanics
  app.get("/api/mechanics", (req, res) => {
    res.json(db.prepare("SELECT * FROM mechanics").all());
  });

  app.post("/api/mechanics", (req, res) => {
    const { name, phone, commission_rate } = req.body;
    const result = db.prepare("INSERT INTO mechanics (name, phone, commission_rate) VALUES (?, ?, ?)").run(name, phone, commission_rate);
    res.json({ id: result.lastInsertRowid });
  });

  // Customers
  app.get("/api/customers", (req, res) => {
    res.json(db.prepare("SELECT * FROM customers").all());
  });

  app.post("/api/customers", (req, res) => {
    const { name, phone, address } = req.body;
    const result = db.prepare("INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)").run(name, phone, address);
    res.json({ id: result.lastInsertRowid });
  });

  // Transactions
  app.post("/api/transactions", (req, res) => {
    const { customer_id, mechanic_id, items, total_amount, discount, payment_method } = req.body;
    const invoice_no = `INV-${Date.now()}`;

    const transaction = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO transactions (invoice_no, customer_id, mechanic_id, total_amount, discount, payment_method)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(invoice_no, customer_id, mechanic_id, total_amount, discount, payment_method);

      const transId = result.lastInsertRowid;

      for (const item of items) {
        db.prepare(`
          INSERT INTO transaction_items (transaction_id, item_type, item_id, quantity, price, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(transId, item.type, item.id, item.quantity, item.price, item.subtotal);

        if (item.type === 'product') {
          db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.id);
        }
      }

      if (customer_id) {
        db.prepare("UPDATE customers SET last_service = CURRENT_TIMESTAMP WHERE id = ?").run(customer_id);
      }

      return transId;
    });

    const id = transaction();
    res.json({ id, invoice_no });
  });

  app.get("/api/transactions", (req, res) => {
    const trans = db.prepare(`
      SELECT t.*, c.name as customer_name, m.name as mechanic_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN mechanics m ON t.mechanic_id = m.id
      ORDER BY t.created_at DESC
    `).all();
    res.json(trans);
  });

  // Expenses
  app.get("/api/expenses", (req, res) => {
    res.json(db.prepare("SELECT * FROM expenses ORDER BY created_at DESC").all());
  });

  app.post("/api/expenses", (req, res) => {
    const { description, amount, category } = req.body;
    const result = db.prepare("INSERT INTO expenses (description, amount, category) VALUES (?, ?, ?)").run(description, amount, category);
    res.json({ id: result.lastInsertRowid });
  });

  // Finance Report
  app.get("/api/reports/profit-loss", (req, res) => {
    const { start, end } = req.query;
    const income = db.prepare(`SELECT SUM(total_amount) as total FROM transactions WHERE date(created_at) BETWEEN ? AND ?`).get(start, end) as any;
    const expense = db.prepare(`SELECT SUM(amount) as total FROM expenses WHERE date(created_at) BETWEEN ? AND ?`).get(start, end) as any;
    
    res.json({
      income: income.total || 0,
      expense: expense.total || 0,
      profit: (income.total || 0) - (expense.total || 0)
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
