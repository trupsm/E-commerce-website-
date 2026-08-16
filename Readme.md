# 🛒 Vyoma — Enterprise MERN E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47a248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.style=for-the-badge)](LICENSE)

An enterprise-grade, high-performance **MERN Stack (MongoDB, Express, React, Node.js)** e-commerce web platform engineered for scalability, transactional integrity, and smooth user experience. Featuring strict **ACID-compliant transactions**, **HTTP-Only JWT authentication**, **Stripe payment integration**, **hybrid cart synchronization**, and a **glassmorphic responsive UI**.

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
│   │   ├── db.js                 # MongoDB connection with majority write concern
│   │   └── env.js                # Strict environment variable validation
│   ├── controllers/
│   │   ├── authController.js     # Register, Login (JWT cookie), GetMe, Logout
│   │   ├── cartController.js     # Cart CRUD & transactional guest cart merge
│   │   ├── categoryController.js # Category management
│   │   ├── orderController.js    # ACID Order checkout, history, cancellation
│   │   ├── paymentController.js  # Stripe PaymentIntents & webhook handlers
│   │   └── productController.js  # Product search, filter, pagination & CRUD
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
│   │   ├── calculateOrderTotals.js # Server-side pricing, tax & shipping computation
│   │   ├── generateToken.js      # Signed JWT generator
│   │   ├── hashPassword.js       # Bcrypt salt and hash utilities
│   │   └── transaction.js        # Reusable MongoDB transaction lifecycle wrapper
│   ├── server.js                 # Express application entry point
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
│   │   │   ├── AdminRoute.jsx    # Guarded route requiring Admin privilege
│   │   │   └── ProtectedRoute.jsx# Guarded route requiring active authentication
│   │   ├── App.jsx               # Application routes & provider layout
│   │   ├── index.css             # Glassmorphic dark theme CSS design system
│   │   └── main.jsx              # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── Readme.md
```

---

## 🧩 Core Features & Modules

### 1. 🔐 Authentication & Role-Based Access Control
* **JWT in HTTP-Only Cookies**: Tokens are never stored in `localStorage` or `sessionStorage`, making them immune to client-side XSS attacks.
* **Role Verification**: Clear separation between `customer` and `admin` roles, enforced by backend middleware (`roleMiddleware.js`) and frontend route guards (`AdminRoute.jsx`).
* **Session Persistence**: React context restores session on refresh through the `/api/auth/me` endpoint.

### 2. 📦 Product Catalog & Dynamic Filtering
* **Full-Text Search & Multi-Filters**: Filter products concurrently by text keyword, category, price boundaries, and sort orders (newest, price asc/desc).
* **Parallel Query Execution**: Uses `Promise.all()` to execute catalog retrieval and count queries concurrently, halving response latency.
* **Stock Accuracy**: Real-time stock status shown dynamically on product pages.

### 3. 🛒 Hybrid Shopping Cart
* **Dual Persistence**: Guests can browse and add items to a local storage cart; upon logging in, the cart automatically triggers `/api/cart/merge` to sync items with their database cart.
* **Atomic Item Updates**: Quantities, stock bounds, and item deletions synchronize immediately with server-side validation.

### 4. 💳 Checkout & Stripe Integration
* **Server-Side Pricing Engine**: Client pricing is never trusted. Subtotals, shipping fees, taxes, and total costs are computed directly from database product prices via `calculateOrderTotals.js`.
* **Stripe Elements & Payment Intents**: Seamless, PCI-compliant card processing using Stripe React Elements and backend Payment Intent creation.
* **Webhook Auditing**: Secure webhook listener with raw request body verification to handle asynchronous payment confirmations.

---

## 🔒 ACID Properties & Data Integrity

The backend is architected with strict adherence to the four **ACID** database properties:

| Property | Problem Solved | Implementation Details |
|---|---|---|
| **Atomicity** | Partial order writes causing stock loss without order confirmation | All checkout writes (order creation, stock decrements, and cart clearing) execute inside a **MongoDB Transaction Session** via `withTransaction()`. Any failure automatically rolls back all operations. |
| **Consistency** | Negative inventory or overselling when multiple customers buy the last item | Stock is decremented using an atomic query with `{ stock: { $gte: qty } }`. Mongoose `pre("save")` hooks enforce `stock >= 0`. Invalid status transitions (e.g. un-cancelling an order) are rejected. |
| **Isolation** | Dirty reads or concurrent checkout race conditions | Writes execute with `readConcern: "snapshot"` in MongoDB sessions. Each transaction operates on an isolated snapshot of database state. |
| **Durability** | Data loss if the database crashes before persisting an order | Database connections enforce `writeConcern: { w: "majority", journal: true }`, ensuring writes are written to disk journals and replicated across the majority of replica set nodes before responding. |

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
| `GET` | `/api/cart` | Get current user cart from database | Private (User) |
| `POST` | `/api/cart` | Add item to cart | Private (User) |
| `PUT` | `/api/cart/:itemId` | Update cart item quantity | Private (User) |
| `DELETE` | `/api/cart/:itemId` | Remove item from cart | Private (User) |
| `POST` | `/api/cart/merge` | Merge guest localStorage cart into database | Private (User) |

### 💳 Orders & Payments (`/api/orders` & `/api/payments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Create order with ACID transactional validation | Private (User) |
| `GET` | `/api/orders/myorders` | Get logged-in user order history | Private (User) |
| `GET` | `/api/orders/:id` | Get single order details | Private (User/Admin) |
| `PUT` | `/api/orders/:id/cancel` | Cancel order & restore inventory atomically | Private (User/Admin) |
| `PUT` | `/api/orders/:id/status` | Update shipping / delivery status | Private (Admin) |
| `POST` | `/api/payments/create-intent` | Initialize Stripe Payment Intent | Private (User) |
| `POST` | `/api/payments/webhook` | Stripe raw body event listener | Stripe Service |

---

## 🖥️ Frontend Pages & Routing

| Path | Component | Description | Route Guard |
|---|---|---|---|
| `/` | `Home.jsx` | Landing page with banner, featured categories & CTA | Public |
| `/products` | `Products.jsx` | Storefront catalog with real-time filters & search | Public |
| `/products/:id` | `ProductDetails.jsx` | Single product view with stock selector & images | Public |
| `/cart` | `Cart.jsx` | Cart view with live quantity updates & free shipping meter | Public |
| `/login` | `Login.jsx` | Sign-in page | Public |
| `/register` | `Register.jsx` | Registration page | Public |
| `/profile` | `Profile.jsx` | User profile & account details | `ProtectedRoute` |
| `/checkout` | `Checkout.jsx` | Multi-step checkout with Stripe Card Elements | `ProtectedRoute` |
| `/orders` | `OrderHistory.jsx` | Order history list with status tracking | `ProtectedRoute` |
| `/orders/:id` | `OrderDetails.jsx` | Detailed order summary, invoice, and tracking | `ProtectedRoute` |
| `/admin` | `AdminDashboard` | Administrator management control center | `AdminRoute` |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend Configuration (`frontend/.env` - Optional)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

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

# Copy environment variables template and configure your secrets
# Ensure .env is populated with MONGO_URI, JWT_SECRET, and STRIPE keys

npm run dev
# Backend starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

npm run dev
# Frontend starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🛡️ Security & Engineering Best Practices

1. **XSS & CSRF Defense**: HTTP-only cookies prevent JavaScript access to auth tokens; CORS options restrict origin to authorized frontend domains with credential verification.
2. **Server-Side Price Validation**: Never trusting prices passed from client payloads prevents price manipulation vulnerabilities.
3. **Optimistic & Atomic Concurrency**: Database updates check for inventory availability in the same atomic operation as the mutation, eliminating race conditions.
4. **Resilient Error Handling**: Centralized error middleware formats standardized JSON errors for validation issues, duplicate keys, and MongoDB conflict error codes (112, 251).
5. **Clean Code Structure**: Clear separation of concerns between models, routes, controllers, middleware, and services.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).