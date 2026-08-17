# 🛒 Vyoma — Enterprise MERN E-Commerce Platform

An enterprise-grade, high-performance **MERN Stack (MongoDB, Express, React, Node.js)** e-commerce web application featuring role-based access control, server-side pricing validation, hybrid cart synchronization, dynamic product catalogs, and transactional order, payment, and stock management.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [Core Features & Modules](#-core-features--modules)
- [ACID Properties & Data Integrity](#-acid-properties--data-integrity)
- [REST API Reference](#-rest-api-reference)
- [Frontend Pages & Routing](#-frontend-pages--routing)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Security & Engineering Best Practices](#-security--engineering-best-practices)

---

## ⚡ Key Highlights

* **🔒 Enterprise-Grade Security**: Secure JWT authentication stored in `HTTP-Only SameSite` cookies, preventing XSS and CSRF token theft.
* **🛡️ Strict ACID Compliance**: Multi-document MongoDB transactions for order placement, stock decrementing, and cart clearing.
* **⚡ Concurrency & Race-Condition Safe**: Atomic conditional stock updates (`$gte: qty`) to eliminate overselling under heavy load.
* **💳 Complete Stripe Payment Lifecycle**: Integrated Stripe Elements on client, Payment Intent lifecycle, and raw-body Webhook verification.
* **🔄 Hybrid Cart Synchronization**: Smooth cart experience for guest users with automatic synchronization and merging into the database upon login.
* **🔍 Optimized Product Discovery**: Full-text search, multi-criteria filtering (category, price range), sorting, and server-side pagination with compound indexes.
* **🎨 Modern Glassmorphic UI**: Built with React 19, Vite, and custom CSS design system tailored for sleek dark-mode aesthetics and fluid micro-interactions.

---

## 🏛️ System Architecture

```
                                  ┌──────────────────────────┐
                                  │   Client (React 19 SPA)  │
                                  │  Vite + React Router v7  │
                                  │  Stripe React Elements   │
                                  └────────────┬─────────────┘
                                               │ HTTPS (JSON / REST API)
                                               │ (Credentials: include)
                                               ▼
                                  ┌──────────────────────────┐
                                  │  Express API (Node.js)   │
                                  │  • Cookie Parser & CORS  │
                                  │  • JWT Auth Middleware   │
                                  │  • RBAC Access Control   │
                                  │  • Central Error Handler │
                                  └─────┬──────────────┬─────┘
                                        │              │
                    ┌───────────────────┴──┐        ┌──┴──────────────────┐
                    ▼                      ▼        ▼                     ▼
             ┌─────────────┐        ┌─────────────┐ ┌──────────┐   ┌──────────────┐
             │ Auth & User │        │ Product/Cat │ │  Order   │   │    Stripe    │
             │ Controller  │        │ Controller  │ │Controller│   │Payment Engine│
             └──────┬──────┘        └──────┬──────┘ └────┬─────┘   └──────┬───────┘
                    │                      │             │                │
                    └──────────────────────┼─────────────┘                │
                                           ▼                              ▼
                                 ┌──────────────────┐             ┌───────────────┐
                                 │  MongoDB Atlas   │             │ Stripe Webhook│
                                 │  (Mongoose ODM)  │◄────────────┤  Verification │
                                 │ Snapshot Session │             └───────────────┘
                                 └──────────────────┘
```

---

## 📁 Folder Structure

```
e-commerce/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection setup
│   │   └── env.js                    # Environment variable loader & validator
│   ├── models/
│   │   ├── User.js                   # User model with addresses sub-document
│   │   ├── Product.js                # Product catalog model
│   │   ├── Category.js               # Category hierarchy model
│   │   ├── Cart.js                   # Server-side user shopping cart
│   │   └── Order.js                  # Orders model with paymentResult audit trail
│   ├── controllers/
│   │   ├── authController.js         # Register, Login (JWT cookie), GetMe, Logout, Address CRUD
│   │   ├── productController.js      # Product CRUD, pagination, multi-field filters
│   │   ├── categoryController.js     # Category CRUD
│   │   ├── cartController.js         # Cart operations & guest cart merge
│   │   └── orderController.js        # Order checkout, payment & cancellation
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth
│   │   ├── productRoutes.js          # /api/products
│   │   ├── categoryRoutes.js         # /api/categories
│   │   ├── cartRoutes.js             # /api/cart
│   │   └── orderRoutes.js            # /api/orders
│   ├── middleware/
│   │   ├── authMiddleware.js     # Cookie / Bearer token extraction & verification
│   │   ├── errorMiddleware.js    # Centralized error handler (CastError, Duplicate, 409 Conflict)
│   │   ├── roleMiddleware.js     # Role-based access control (Admin / Customer)
│   │   └── uploadMiddleware.js   # Multipart form / Image upload handling
│   ├── models/
│   │   ├── Cart.js               # User cart schema with embedded items
│   │   ├── Category.js           # Category taxonomy schema
│   │   ├── Order.js              # Orders with item snapshot pricing & payment audit trail
│   │   ├── Product.js            # Products with text indexing & stock invariant hooks
│   │   └── User.js               # Users with bcrypt password hashing & RBAC roles
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── cartRoutes.js         # /api/cart
│   │   ├── categoryRoutes.js     # /api/categories
│   │   ├── orderRoutes.js        # /api/orders
│   │   ├── paymentRoutes.js      # /api/payments (Stripe webhooks & intents)
│   │   └── productRoutes.js      # /api/products
│   ├── services/
│   │   └── paymentService.js     # Stripe API integration service
│   ├── utils/
│   │   ├── calculateOrderTotals.js   # Server-side subtotal, tax & shipping calculator
│   │   ├── generateToken.js          # JWT token generator
│   │   ├── hashPassword.js           # Bcrypt hash & compare utility
│   │   └── transaction.js            # Reusable withTransaction() wrapper
│   ├── .env                          # Environment variables (local / not committed)
│   ├── .env.example                  # Environment variables template
│   ├── server.js                     # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js  # Configured Axios instance with credentials
│   │   │   ├── authApi.js        # Authentication API connector
│   │   │   ├── cartApi.js        # Shopping cart API connector
│   │   │   ├── orderApi.js       # Orders & payment endpoints
│   │   │   └── productApi.js     # Catalog search & categories connector
│   │   ├── components/
│   │   │   ├── cart/             # Cart item rows, quantity selectors, summaries
│   │   │   ├── common/           # Loaders, Modals, Navbar, Footer, Pagination
│   │   │   ├── payment/          # Stripe Card Elements, Payment buttons
│   │   │   └── product/          # ProductCard, ProductGrid, ProductFilters
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user session & cookie verification
│   │   │   └── CartContext.jsx   # Global cart state & local/server sync engine
│   │   ├── hooks/
│   │   │   ├── useAuth.js        # Custom authentication hook
│   │   │   └── useCart.js        # Custom shopping cart hook
│   │   ├── pages/
│   │   │   ├── Cart.jsx          # Shopping cart overview & quantity editor
│   │   │   ├── Checkout.jsx      # Multi-step checkout with Stripe Elements
│   │   │   ├── Home.jsx          # Hero storefront landing page
│   │   │   ├── Login.jsx         # User authentication form
│   │   │   ├── OrderDetails.jsx  # Order tracking, payment status & receipts
│   │   │   ├── OrderHistory.jsx  # Historical purchases list
│   │   │   ├── ProductDetails.jsx# Single product deep-dive with stock indicators
│   │   │   ├── Products.jsx      # Filterable & searchable product catalog
│   │   │   ├── Profile.jsx       # User account details & settings
│   │   │   └── Register.jsx      # User registration form
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx    # Logged-in user route guard
│   │   │   └── AdminRoute.jsx        # Admin-only role route guard
│   │   ├── App.jsx                   # Router & provider hierarchy
│   │   ├── App.css                   # App-level styles
│   │   ├── index.css                 # Glassmorphic dark-mode design system
│   │   └── main.jsx                  # React DOM entry
│   ├── .env                          # Frontend environment variables (local / not committed)
│   ├── .env.example                  # Frontend environment variables template
│   ├── index.html                    # Vite HTML entry
│   ├── vite.config.js                # Vite configuration
│   ├── eslint.config.js              # ESLint configuration
│   └── package.json
│
├── Readme.md
└── .gitignore
```


---

## 🧱 Layer 1 — Architecture (System Level & High-Level Design / HLD)
---

### 1. System Requirements & Design Goals

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REQUIREMENTS BREAKDOWN                           │
├────────────────────────────────────┬────────────────────────────────────┤
│ 🎯 Functional Requirements         │ ⚡ Non-Functional Requirements     │
├────────────────────────────────────┼────────────────────────────────────┤
│ • Secure Auth (Customer & Admin)   │ • Security: XSS & CSRF mitigation  │
│ • Catalog Search, Filter & Sort    │   via HTTP-only SameSite cookies   │
│ • Dynamic Pagination & Category Hub│ • Scalability: Stateless REST APIs │
│ • Hybrid Cart (Guest & User Merge) │ • Reliability: Server-side pricing │
│ • Order Checkout & Payment Gateway │   re-computation & inventory check │
│ • Admin Management for Products/Cat│ • Data Integrity: Database         │
│ • Shipping Address CRUD            │   transactions for orders & stock  │
│ • Order Status Tracking & History  │ • Speed: Parallel DB queries       │
└────────────────────────────────────┴────────────────────────────────────┘
```

---

### 2. High-Level Architecture Diagram
```
                       ┌─────────────────────────┐
                       │   Client (React SPA)    │
                       │ Vite + React Router DOM │
                       └────────────┬────────────┘
                                    │ HTTPS (JSON / REST API)
                                    ▼
                       ┌─────────────────────────┐
                       │  Express API (Node.js)  │
                       │  • Cookie Parser & CORS │
                       │  • JWT Auth Middleware  │
                       │  • RBAC (Role) Check    │
                       │  • Central Error Filter │
                       └─────┬──────────────┬────┘
                             │              │
                ┌────────────┴──┐        ┌──┴─────────────┐
                ▼               ▼        ▼                ▼
         ┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐
         │ User / Auth │ │ Product/Cart│ │  Orders  │ │ Payment  │
         │ Controller  │ │ Controller  │ │Controller│ │ Gateway  │
         └──────┬──────┘ └──────┬──────┘ └────┬─────┘ └──────────┘
                │               │             │
                └───────────────┼─────────────┘
                                ▼
                  ┌───────────────────────────┐
                  │ Transaction Layer         │
                  │ withTransaction() utility │
                  └─────────────┬─────────────┘
                                ▼
                       ┌─────────────────┐
                       │ MongoDB Atlas   │
                       │ (Mongoose ODM)  │
                       └─────────────────┘
```

---

## 🔒 ACID Properties & Data Integrity

The backend is architected with strict adherence to the four **ACID** database properties:

| Property | Problem Solved | Implementation Details |
|---|---|---|
| **JWT Storage** | **HTTP-Only Cookies** | Storing JWTs in `localStorage` exposes tokens to Cross-Site Scripting (XSS). HTTP-only cookies prevent JavaScript from accessing tokens. |
| **Pricing Strategy** | **Server-Side Recomputation** | Never trust client-side prices. The backend looks up prices from MongoDB at the moment of order creation. |
| **Catalog Performance** | **`Promise.all` Parallelism** | Product fetching and total count queries run concurrently, cutting API latency in half. |
| **Database Indexing** | **Compound & Text Indexes** | Compound indexes on `category` and `price`, plus text index on `name`, enable fast sub-millisecond filtering. |
| **Data Integrity** | **MongoDB Multi-Document Transactions** | Order creation, stock updates, cart clearing, and cancellation stock-restore are wrapped in transaction sessions to prevent overselling, partial writes, and data loss. |

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate & set HTTP-only JWT cookie | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | Private (User) |
| `POST` | `/api/auth/logout` | Clear session cookie | Public |

### 📦 Products (`/api/products`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Get products with search, filter, sort & pagination | Public |
| `GET` | `/api/products/:id` | Get single product details | Public |
| `POST` | `/api/products` | Create a new product | Private (Admin) |
| `PUT` | `/api/products/:id` | Update product details | Private (Admin) |
| `DELETE` | `/api/products/:id` | Delete product by ID | Private (Admin) |

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | Get all active categories | Public |
| `GET` | `/api/categories/:id` | Get category details | Public |
| `POST` | `/api/categories` | Create new category | Private (Admin) |
| `PUT` | `/api/categories/:id` | Update category | Private (Admin) |
| `DELETE` | `/api/categories/:id` | Delete category | Private (Admin) |

### 🛒 Cart (`/api/cart`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/cart` | Get current user's database cart | Private (Logged-in User) |
| `POST` | `/api/cart` | Add item to cart | Private (Logged-in User) |
| `PUT` | `/api/cart/:productId` | Update cart item quantity | Private (Logged-in User) |
| `DELETE` | `/api/cart/:productId` | Remove an item from cart | Private (Logged-in User) |
| `DELETE` | `/api/cart` | Clear entire cart | Private (Logged-in User) |
| `POST` | `/api/cart/merge` | Merge guest localStorage cart into database cart | Private (Logged-in User) |

### 💳 Orders & Payments (`/api/orders` & `/api/payments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Verify stock, decrement inventory, create order & clear cart | Private (Logged-in User) |
| `GET` | `/api/orders/myorders` | Fetch logged-in user's order history | Private (Logged-in User) |
| `GET` | `/api/orders/:id` | Get single order details | Private (Logged-in User / Admin) |
| `PUT` | `/api/orders/:id/pay` | Mark order as paid & store gateway confirmation | Private (Logged-in User / Admin) |
| `GET` | `/api/orders` | Fetch all orders in system | Private (Admin only) |
| `PUT` | `/api/orders/:id/status` | Update order status; restores stock on cancel | Private (Admin only) |

---


## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **MongoDB Atlas** database cluster (or local replica set for transaction support)
* **Stripe Developer Account** (for test API keys)

### 1. Clone the Repository
```bash
git clone https://github.com/trupthi/e-commerce.git
cd e-commerce
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy the example env file or create a .env file:
# cp .env.example .env (or copy .env.example to .env)
#
# Configure backend/.env with your values:
# PORT=5000
# NODE_ENV=development
# MONGO_URI=your_mongodb_connection_string
# FRONTEND_URL=http://localhost:5173
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRES_IN=90d
# STRIPE_SECRET_KEY=your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

npm run dev
# Backend starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
# Copy the example env file or create a .env file:
# cp .env.example .env (or copy .env.example to .env)
#
# Configure frontend/.env with your values:
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# VITE_API_URL=http://localhost:5000/api

npm run dev
# Frontend starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---
