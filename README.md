# 🛍️ ShopHub — Multi-Vendor E-Commerce Platform

A full-stack multi-tenant e-commerce platform where multiple vendors can list products and customers can browse, purchase, and manage orders — with automatic **order splitting by vendor**.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3.11 + FastAPI               |
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Database   | SQLite (swap to PostgreSQL via env) |
| Auth       | JWT (python-jose + passlib/bcrypt)  |
| ORM        | SQLAlchemy 2.0                      |

---
### Demo videos

frontend demo video : https://drive.google.com/file/d/1F-lYKp2CV9Nbf8Z7RkJVry0jtU12oghW/view?usp=sharing

backend demo video : https://drive.google.com/file/d/1It6HiUBsDNv9nb8RVRvEy_k-jHIlIvDl/view?usp=sharing

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, startup seed
│   │   ├── config.py          # Pydantic settings
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── user.py        # User, UserRole enum
│   │   │   ├── product.py     # Product, Category
│   │   │   ├── cart.py        # Cart, CartItem
│   │   │   └── order.py       # Order, VendorOrder, OrderItem, Review
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routers/           # Route handlers (auth, products, cart, orders, admin)
│   │   ├── services/
│   │   │   └── order_service.py  # ⭐ Order splitting logic lives here
│   │   └── core/
│   │       ├── security.py    # JWT encode/decode, bcrypt
│   │       └── dependencies.py # Auth guards (require_vendor, require_admin…)
│   ├── seed_demo.py           # Populate demo users + products
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios API helpers per domain
│   │   ├── contexts/          # AuthContext (JWT state)
│   │   ├── components/        # Navbar, ProductCard, StatusBadge, ProtectedRoute
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Login.jsx / Register.jsx
│   │       ├── ProductsPage.jsx / ProductDetail.jsx
│   │       ├── CartPage.jsx / OrdersPage.jsx
│   │       ├── vendor/        # VendorProducts, VendorOrders
│   │       └── admin/         # AdminDashboard, AdminVendors, AdminOrders, AdminProducts, AdminUsers
│   └── Dockerfile
└── docker-compose.yml
```

---

## ⚙️ Setup Instructions

### Option A — Manual (Recommended for VS Code)

#### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API auto-creates the SQLite database and seeds an admin user on first run.

#### 2. Seed Demo Data (optional but recommended)

In another terminal (with venv active):

```bash
cd backend
python seed_demo.py
```

This creates:
- Admin: `admin@example.com` / `admin123`
- Vendor 1: `vendor@example.com` / `vendor123` (TechZone Store — Electronics)
- Vendor 2: `vendor2@example.com` / `vendor123` (FashionHub — Clothing/Sports)
- Customer: `customer@example.com` / `customer123`
- 10 sample products across both vendors

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open → http://localhost:5173

---

### Option B — Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint             | Description              | Auth |
|--------|----------------------|--------------------------|------|
| POST   | `/api/auth/register` | Register new user        | —    |
| POST   | `/api/auth/login`    | Login (returns JWT)      | —    |
| GET    | `/api/auth/me`       | Get current user info    | ✅   |

### Products (Public Browse + Vendor CRUD)
| Method | Endpoint                        | Description                     | Role      |
|--------|---------------------------------|---------------------------------|-----------|
| GET    | `/api/products`                 | List products (search, filter)  | Public    |
| GET    | `/api/products/{id}`            | Product detail + reviews        | Public    |
| POST   | `/api/products`                 | Create product                  | Vendor    |
| PUT    | `/api/products/{id}`            | Update own product              | Vendor    |
| DELETE | `/api/products/{id}`            | Delete own product              | Vendor    |
| GET    | `/api/products/categories`      | List all categories             | Public    |
| POST   | `/api/products/categories`      | Create category                 | Vendor    |
| POST   | `/api/products/{id}/reviews`    | Submit review                   | Customer  |
| GET    | `/api/products/{id}/reviews`    | Get product reviews             | Public    |

### Cart
| Method | Endpoint                  | Description              | Role     |
|--------|---------------------------|--------------------------|----------|
| GET    | `/api/cart`               | View cart                | Customer |
| POST   | `/api/cart/items`         | Add item to cart         | Customer |
| PUT    | `/api/cart/items/{id}`    | Update item quantity     | Customer |
| DELETE | `/api/cart/items/{id}`    | Remove item              | Customer |
| DELETE | `/api/cart`               | Clear entire cart        | Customer |

### Orders
| Method | Endpoint                               | Description                  | Role     |
|--------|----------------------------------------|------------------------------|----------|
| POST   | `/api/orders`                          | Checkout (place order)       | Customer |
| GET    | `/api/orders/my`                       | My orders list               | Customer |
| GET    | `/api/orders/my/{id}`                  | Order detail                 | Customer |
| POST   | `/api/orders/{id}/pay`                 | Simulate payment             | Customer |
| GET    | `/api/orders/vendor/my-orders`         | Vendor sub-orders            | Vendor   |
| PUT    | `/api/orders/vendor/{id}/status`       | Update sub-order status      | Vendor   |

### Admin
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | `/api/admin/stats`                | Dashboard stats         |
| GET    | `/api/admin/users`                | All users               |
| PUT    | `/api/admin/users/{id}/toggle-active` | Enable/disable user |
| GET    | `/api/admin/vendors`              | All vendors             |
| PUT    | `/api/admin/vendors/{id}/approve` | Approve vendor          |
| PUT    | `/api/admin/vendors/{id}/reject`  | Revoke vendor           |
| GET    | `/api/admin/products`             | All products            |
| GET    | `/api/admin/orders`               | All orders              |

---

## 🗄️ Database Schema

```
users
  id, email, full_name, hashed_password, role (admin|vendor|customer),
  is_active, is_approved, created_at

categories
  id, name

products
  id, vendor_id (FK→users), category_id (FK→categories),
  name, description, price, stock, is_active, created_at

carts
  id, customer_id (FK→users, unique)

cart_items
  id, cart_id (FK→carts), product_id (FK→products), quantity

orders                    ← Master order (one per checkout)
  id, customer_id, total_amount, status, payment_ref, created_at

vendor_orders             ← Sub-order per vendor (ORDER SPLITTING)
  id, order_id (FK→orders), vendor_id (FK→users), subtotal, status

order_items               ← Line items inside a vendor sub-order
  id, vendor_order_id (FK→vendor_orders), product_id,
  quantity, price_at_purchase

reviews
  id, customer_id, product_id, rating (1-5), comment, created_at
```

---

## ⭐ Order Splitting Logic

When a customer checks out, their cart may contain products from **multiple vendors**.

**Algorithm** (`backend/app/services/order_service.py`):

```
1. Load cart items with products
2. Validate stock for every item (with row-level DB lock to prevent overselling)
3. Group cart items by product.vendor_id → {vendor_id: [items]}
4. Create one master `Order` record
5. For each vendor group:
      a. Create one `VendorOrder` (sub-order)
      b. Create `OrderItem` rows for each product
      c. Decrement product.stock atomically
6. Clear the cart
7. Return the master Order with nested VendorOrders
```

**Result**: Each vendor sees only **their** `VendorOrder` via `/api/orders/vendor/my-orders`. The customer sees one unified order containing all sub-orders.

**Concurrent safety**: Stock is decremented inside a single DB transaction using `with_for_update()` row-level locks. If any product runs out of stock mid-transaction, the entire order is rolled back.

---

## 🔐 User Roles

| Role     | Can Do                                                                 |
|----------|------------------------------------------------------------------------|
| Customer | Browse, search, cart, checkout, track orders, reviews                  |
| Vendor   | Add/edit/delete own products, view own sub-orders, update shipping     |
| Admin    | Approve vendors, view all users/orders/products, platform stats        |

**Vendor approval flow**: When a user registers as a vendor, `is_approved = False`. The admin must approve them at `/admin/vendors` before they can list products.

---

## ✨ Features Implemented

- ✅ JWT authentication with role-based access control
- ✅ Vendor registration with admin approval gate
- ✅ Product CRUD with categories, search & price filters
- ✅ Cart with multi-vendor grouping preview
- ✅ **Order splitting by vendor** (core feature)
- ✅ Payment simulation (success/failure with stock rollback)
- ✅ Vendor order status workflow (paid → shipped → delivered)
- ✅ Product ratings & reviews
- ✅ Admin dashboard with live stats
- ✅ Pagination support on product listing
- ✅ Out-of-stock prevention with concurrent lock
- ✅ Docker Compose setup
- ✅ Auto-seeded admin + demo data
- ✅ Interactive Swagger docs at `/docs`

---

## 📸 Demo Credentials

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@example.com      | admin123     |
| Vendor 1 | vendor@example.com     | vendor123    |
| Vendor 2 | vendor2@example.com    | vendor123    |
| Customer | customer@example.com   | customer123  |

---

## 🧪 Testing the Full Flow

1. Login as **customer** → Browse products → Add items from **different vendors** to cart
2. Go to Cart — notice the **order splitting preview** grouped by vendor
3. Click **"Pay Now"** → order is placed, stock decremented, and split into vendor sub-orders
4. Login as **Vendor 1** → `/vendor/orders` → see only their sub-order → mark as Shipped → Delivered
5. Login as **Admin** → `/admin` → view full platform stats, approve/reject vendors
