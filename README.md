# MySQL Database API

This API provides endpoints to query the e-commerce database with the following tables:
- customers
- products
- orders
- order_items

## Endpoints

### 1. Get total spent by each customer
`GET /api/customers/total-spent`

Returns customers ordered by their total spending in descending order.

### 2. Get monthly sales for shipped/delivered orders
`GET /api/orders/monthly-sales`

Returns monthly sales totals for orders with status 'Shipped' or 'Delivered'.

### 3. Get products never ordered
`GET /api/products/never-ordered`

Returns products that have never been ordered.

### 4. Get average order value by country
`GET /api/orders/avg-by-country`

Returns the average order value grouped by customer country.

### 5. Get customers with more than one order
`GET /api/customers/repeat`

Returns customers who have placed more than one order.

## Setup

1. Install dependencies:
```bash
npm install