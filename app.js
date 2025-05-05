require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(express.json());

// API Endpoints

// 1. Get total spent by each customer
app.get('/api/customers/total-spent', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        customers.customer_id,
        customers.name,
        customers.email,
        SUM(order_items.quantity * order_items.unit_price) AS total_spent
      FROM 
        customers
      JOIN 
        orders ON customers.customer_id = orders.customer_id
      JOIN 
        order_items ON orders.order_id = order_items.order_id
      GROUP BY 
        customers.customer_id, customers.name, customers.email
      ORDER BY 
        total_spent DESC
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get monthly sales for shipped/delivered orders
app.get('/api/orders/monthly-sales', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        YEAR(orders.order_date) as year, 
        MONTH(orders.order_date) as month, 
        SUM(order_items.quantity * order_items.unit_price) as total_price 
      FROM 
        orders 
      JOIN 
        order_items ON orders.order_id=order_items.order_id
      WHERE 
        orders.status IN ('Shipped', 'Delivered') 
      GROUP BY
        year, month
      ORDER BY
        year DESC, month DESC
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get products never ordered (though your query returned empty)
app.get('/api/products/never-ordered', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        products.product_id,
        products.name,
        products.category,
        products.price
      FROM 
        products
      LEFT JOIN 
        order_items ON products.product_id = order_items.product_id
      WHERE 
        order_items.product_id IS NULL
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get average order value by country (fixed the JOIN issue)
app.get('/api/orders/avg-by-country', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        customers.country,
        AVG(order_total) AS avg_order_value
      FROM (
        SELECT 
          orders.order_id,
          SUM(order_items.quantity * order_items.unit_price) AS order_total,
          orders.customer_id
        FROM 
          orders
        JOIN 
          order_items ON orders.order_id = order_items.order_id
        GROUP BY 
          orders.order_id, orders.customer_id
      ) AS order_values
      JOIN
        customers ON order_values.customer_id = customers.customer_id
      GROUP BY 
        customers.country
      ORDER BY 
        avg_order_value DESC
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Get customers with more than one order
app.get('/api/customers/repeat', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        customers.customer_id,
        customers.name,
        customers.email,
        COUNT(orders.order_id) AS order_count
      FROM 
        customers
      JOIN 
        orders ON customers.customer_id = orders.customer_id
      GROUP BY 
        customers.customer_id, customers.name, customers.email
      HAVING 
        COUNT(orders.order_id) > 1
      ORDER BY 
        order_count DESC
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
