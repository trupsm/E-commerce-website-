# 🛒 Vyoma E-Commerce Platform — System Architecture & Implementation Blueprint

An enterprise-grade, high-performance **MERN Stack (MongoDB, Express, React, Node.js)** e-commerce web application featuring role-based access control, server-side pricing validation, hybrid cart synchronization, dynamic product catalogs, and **full ACID transaction guarantees** across every critical operation (order creation, payment, cancellation, and stock management).

---

## 📁 Project Map (Folder Structure)

```
ecommerce-platform/
│
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection (writeConcern: majority) — 💾 Durability
│   │   └── env.js                    # Environment variable loader & validator
│   ├── models/
│   │   ├── User.js                   # User model with addresses sub-document
│   │   ├── Product.js                # Product catalog with pre-save stock ≥ 0 hook — ✅ Consistency
│   │   ├── Category.js               # Category hierarchy model
│   │   ├── Cart.js                   # Server-side user shopping cart
│   │   └── Order.js                  # Orders with paymentResult audit trail — ✅ Consistency
│   ├── controllers/
│   │   ├── authController.js         # Register, Login (JWT cookie), GetMe, Logout, Address CRUD
│   │   ├── productController.js      # Product CRUD, pagination, multi-field filters
│   │   ├── categoryController.js     # Category CRUD
│   │   ├── cartController.js         # Cart operations & transactional guest merge — ⚛️ Atomicity
│   │   └── orderController.js        # Atomic order checkout, payment & cancellation — ⚛️🔀✅ All ACID
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth
│   │   ├── productRoutes.js          # /api/products
│   │   ├── categoryRoutes.js         # /api/categories
│   │   ├── cartRoutes.js             # /api/cart
│   │   └── orderRoutes.js            # /api/orders
│   ├── middleware/
│   │   ├── authMiddleware.js         # HTTP-only cookie + Bearer JWT verification
│   │   ├── roleMiddleware.js         # Role-based access control (Admin vs Customer)
│   │   └── errorMiddleware.js        # Central error handler (CastError, Duplicate, Transaction errors)
│   ├── utils/
│   │   ├── calculateOrderTotals.js   # Server-side subtotal, tax & shipping calculator
│   │   ├── generateToken.js          # JWT token generator
│   │   ├── hashPassword.js           # Bcrypt hash & compare utility
│   │   └── transaction.js            # Reusable withTransaction() wrapper — ⚛️🔀 Atomicity & Isolation
│   ├── .env                          # Environment variables (not committed)
│   ├── server.js                     # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg               # Site favicon
│   │   └── icons.svg                 # SVG icon sprite
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js       # Central Axios client with credentials: true
│   │   │   ├── authApi.js            # Auth & address endpoints connector
│   │   │   ├── cartApi.js            # Cart CRUD & merge API connector
│   │   │   ├── orderApi.js           # Order creation, payment & status API connector
│   │   │   └── productApi.js         # Products & categories API connector
│   │   ├── components/
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.jsx      # Single cart line-item component
│   │   │   │   └── CartSummary.jsx   # Cart totals & checkout CTA
│   │   │   ├── common/
│   │   │   │   ├── Loader.jsx        # Reusable loading spinner
│   │   │   │   ├── Navbar.jsx        # Top navigation bar with cart badge
│   │   │   │   └── Pagination.jsx    # Page navigation controls
│   │   │   └── product/
│   │   │       ├── ProductCard.jsx   # Product tile with image, price & add-to-cart
│   │   │       ├── ProductFilter.jsx # Sidebar filters (category, price, search)
│   │   │       └── ProductGrid.jsx   # Responsive product grid layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global session state & cookie restore on mount
│   │   │   └── CartContext.jsx       # Cart state, guest/user sync & API bridge
│   │   ├── hooks/
│   │   │   ├── useAuth.js            # Custom auth context hook
│   │   │   └── useCart.js            # Custom cart context hook
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Hero landing page with Start Shopping CTA
│   │   │   ├── Products.jsx          # Full storefront catalog with search & filters
│   │   │   ├── ProductDetails.jsx    # Single product view with stock selector
│   │   │   ├── Cart.jsx              # Full cart page with item management
│   │   │   ├── Checkout.jsx          # Address selection, payment method & order placement
│   │   │   ├── OrderHistory.jsx      # User's past orders list
│   │   │   ├── OrderDetails.jsx      # Single order view with pay button & status tracker
│   │   │   ├── Profile.jsx           # User profile & shipping address management
│   │   │   ├── Login.jsx             # User sign in
│   │   │   └── Register.jsx          # User registration
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx    # Logged-in user route guard
│   │   │   └── AdminRoute.jsx        # Admin-only role route guard
│   │   ├── App.jsx                   # Router & provider hierarchy
│   │   ├── App.css                   # App-level styles
│   │   ├── index.css                 # Glassmorphic dark-mode design system
│   │   └── main.jsx                  # React DOM entry
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
│ • Admin Management for Products/Cat│ • Data Integrity: ACID transactions │
│ • Shipping Address CRUD            │   across orders, stock & payments  │
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
                  │ ACID Transaction Layer    │
                  │ withTransaction() utility │
                  └─────────────┬─────────────┘
                                ▼
                       ┌─────────────────┐
                       │ MongoDB Atlas   │
                       │ (Mongoose ODM)  │
                       │ w:majority +    │
                       │ journal:true    │
                       └─────────────────┘
```

---

### 3. Key Engineering Trade-Offs 

| Architectural Decision | Choice Made | Why? (The Engineering Rationale) |
|---|---|---|
| **JWT Storage** | **HTTP-Only Cookies** | Storing JWTs in `localStorage` exposes tokens to Cross-Site Scripting (XSS). HTTP-only cookies prevent JavaScript from accessing tokens. |
| **Pricing Strategy** | **Server-Side Recomputation** | Never trust client-side prices. The backend looks up prices from MongoDB at the moment of order creation. |
| **Catalog Performance** | **`Promise.all` Parallelism** | Product fetching and total count queries run concurrently, cutting API latency in half. |
| **Database Indexing** | **Compound & Text Indexes** | Compound indexes on `category` and `price`, plus text index on `name`, enable fast sub-millisecond filtering. |
| **ACID Data Integrity** | **MongoDB Multi-Document Transactions** | Order creation, stock updates, cart clearing, payment marking, and cancellation stock-restore are all wrapped in `withTransaction()` sessions with `readConcern: snapshot` and `writeConcern: majority`. Prevents overselling, partial writes, and data loss on crash. |

---

## 🧩 Layer 2 — Modules (Functional Breakdown)

| Module | Backend Components | Frontend Components | Primary Dependency |
|---|---|---|---|
| **Authentication** | User model, `authController`, JWT utils, `authMiddleware` | `Login.jsx`, `Register.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx` | Foundational |
| **Product Catalog** | Product model, Category model, `productController`, `categoryController` | `Products.jsx`, `ProductCard`, `ProductFilter`, `ProductGrid`, `Pagination` | Auth (for admin mutations) |
| **Shopping Cart** | Cart model, `cartController`, `transaction.js` | `CartContext.jsx`, `Cart.jsx`, `CartItem.jsx`, `CartSummary.jsx` | Auth & Product |
| **Checkout & Orders** | Order model, `orderController`, `transaction.js`, `calculateOrderTotals.js` | `Checkout.jsx`, `OrderHistory.jsx`, `OrderDetails.jsx` | Cart, Auth, Product |
| **User Profile** | Address sub-document on User, `authController` (address CRUD) | `Profile.jsx` | Auth |
| **Admin Panel** | `roleMiddleware("admin")`, CRUD handlers | `AdminRoute.jsx` | Auth (role=admin) |

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue HTTP-only JWT cookie | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Private (Logged-in User) |
| `POST` | `/api/auth/logout` | Clear authentication cookie | Public |

### 📍 Shipping Addresses (`/api/auth/addresses`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/auth/addresses` | Get all saved shipping addresses | Private (Logged-in User) |
| `POST` | `/api/auth/addresses` | Add a new shipping address | Private (Logged-in User) |
| `PUT` | `/api/auth/addresses/:addressId` | Update an existing address | Private (Logged-in User) |
| `DELETE` | `/api/auth/addresses/:addressId` | Delete a shipping address | Private (Logged-in User) |
| `PUT` | `/api/auth/addresses/:addressId/default` | Set an address as the default | Private (Logged-in User) |

### 📦 Products (`/api/products`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Get products (search, category, price filter, sort, pagination) | Public |
| `GET` | `/api/products/:id` | Get single product details by ID | Public |
| `POST` | `/api/products` | Create a new product | Private (Admin only) |
| `PUT` | `/api/products/:id` | Update product details | Private (Admin only) |
| `DELETE` | `/api/products/:id` | Delete product by ID | Private (Admin only) |

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | Get all active categories | Public |
| `GET` | `/api/categories/:id` | Get single category details | Public |
| `POST` | `/api/categories` | Create new product category | Private (Admin only) |
| `PUT` | `/api/categories/:id` | Update category name/description | Private (Admin only) |
| `DELETE` | `/api/categories/:id` | Delete category by ID | Private (Admin only) |

### 🛒 Cart (`/api/cart`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/cart` | Get current user's database cart | Private (Logged-in User) |
| `POST` | `/api/cart` | Add item to cart | Private (Logged-in User) |
| `PUT` | `/api/cart/:productId` | Update cart item quantity | Private (Logged-in User) |
| `DELETE` | `/api/cart/:productId` | Remove an item from cart | Private (Logged-in User) |
| `DELETE` | `/api/cart` | Clear entire cart | Private (Logged-in User) |
| `POST` | `/api/cart/merge` | Merge guest localStorage cart into database cart (⚛️ ACID transactional) | Private (Logged-in User) |

### 💳 Orders & Checkout (`/api/orders`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Verify stock, decrement inventory, create order & clear cart (⚛️ ACID transactional) | Private (Logged-in User) |
| `GET` | `/api/orders/myorders` | Fetch logged-in user's order history | Private (Logged-in User) |
| `GET` | `/api/orders/:id` | Get single order details | Private (Logged-in User / Admin) |
| `PUT` | `/api/orders/:id/pay` | Mark order as paid & store gateway confirmation (⚛️ ACID transactional) | Private (Logged-in User / Admin) |
| `GET` | `/api/orders` | Fetch all orders in system | Private (Admin only) |
| `PUT` | `/api/orders/:id/status` | Update order status; restores stock on cancel (⚛️ ACID transactional) | Private (Admin only) |

---

## 🔒 ACID Properties — Data Integrity Guarantees

This project enforces all four **ACID** database properties to ensure no order, payment, or stock update can ever leave the database in a broken or inconsistent state.

---

### ⚛️ A — Atomicity
> **"All or nothing."** Every multi-step operation either fully completes or fully rolls back. No partial writes ever persist.

**The problem it solves:** When a customer places an order, three things must happen together — the order is saved, the product stock is decremented, and the cart is cleared. If the server crashes between any of these steps, data would be corrupted (e.g., an order exists but stock was never deducted).

**How it's implemented:**
- **`orderController.js`** — `createOrder()` wraps all three writes (order save + stock decrement + cart clear) in a single **MongoDB transaction session**. If any step throws an error, the session calls `abortTransaction()` and every write is rolled back automatically.
- **`cartController.js`** — `mergeGuestCart()` wraps the entire guest-cart merge loop in a transaction. Either all guest items are merged or none are.
- **`utils/transaction.js`** — A reusable `withTransaction(callback)` helper manages the session lifecycle: start → commit on success → abort on failure → always close.

```
POST /api/orders → withTransaction()
   ├─ Product stock --   (session write)
   ├─ Order.create()     (session write)
   └─ Cart.clear()       (session write)
         ↓ all succeed → commitTransaction()
         ↓ any fails   → abortTransaction() → zero changes in DB
```

---

### ✅ C — Consistency
> **"Data always moves from one valid state to another."** Rules and constraints are enforced at every layer, making it impossible to store invalid data.

**The problem it solves:** Without consistency checks, a race condition could oversell a product (two users both buy the last item), a user could pay for someone else's order, or stock could go negative.

**How it's implemented:**

| Constraint | Where |
|---|---|
| Stock cannot go negative | `models/Product.js` — `pre("save")` hook rejects any save where `stock < 0` |
| No overselling under concurrent load | `orderController.js` — stock is decremented via `findOneAndUpdate({ stock: { $gte: qty } })`. If two requests race, only one matches the filter; the other gets `null` → transaction aborts |
| Only the order owner (or admin) can pay | `orderController.js` — `updateOrderToPaid()` checks `order.user === req.user._id` |
| COD orders cannot be paid online | `orderController.js` — `updateOrderToPaid()` rejects requests where `paymentMethod === "COD"` |
| Cannot pay for a cancelled order | `orderController.js` — rejects if `orderStatus === "cancelled"` |
| Cannot pay twice | `orderController.js` — rejects if `paymentStatus === "paid"` (idempotency guard) |
| Cannot un-cancel an order | `orderController.js` — status transitions from `cancelled` to any other status are blocked |
| Frontend price matches backend price | `Checkout.jsx` — shipping threshold (₹1000) and cost (₹100) are synced to match `calculateOrderTotals.js` exactly |
| Payment has a gateway audit trail | `models/Order.js` — `paymentResult` sub-document stores `gatewayTransactionId`, `status`, `email` so the DB never holds `paymentStatus: "paid"` with no proof |

---

### 🔀 I — Isolation
> **"Concurrent operations don't interfere with each other."** Two users buying at the same time cannot see each other's partial writes.

**The problem it solves:** Two customers simultaneously checking out the last item in stock could both see `stock = 1`, both pass the stock check, and both place an order — resulting in `stock = -1`.

**How it's implemented:**
- **MongoDB Sessions** — All writes inside `withTransaction()` are scoped to a session with `readConcern: "snapshot"`. This gives each transaction a consistent view of the data frozen at the moment the transaction started, preventing dirty reads.
- **Atomic conditional update** — The stock decrement uses `$inc` with a filter `{ stock: { $gte: qty } }`. This is a single atomic MongoDB operation. Under concurrent load, only one transaction wins the filter — the other sees `null` and aborts cleanly.
- **`addToCart`** — Re-reads the product stock immediately before updating the cart to get the latest committed value, closing the stale-read window.

---

### 💾 D — Durability
> **"Committed data survives crashes."** Once a transaction is confirmed, it is permanently written to disk even if the server restarts immediately after.

**The problem it solves:** Without durability guarantees, an order could be confirmed to the user but lost if MongoDB crashes before flushing the write to disk.

**How it's implemented:**
- **`config/db.js`** — The MongoDB connection is opened with `writeConcern: { w: "majority", journal: true }`. This means MongoDB will not report a write as successful until:
  - The write is acknowledged by the **majority** of replica set members (survives any single node failure), and
  - The write is flushed to the on-disk **journal** (survives a process crash on the primary).
- **`readPreference: "primary"`** — All reads go to the primary node, ensuring no stale data is ever served from a lagging secondary.
- **Transaction-level write concern** — Each `withTransaction()` call also sets `writeConcern: { w: "majority" }` at the transaction level as an additional guarantee.

---

### 🗂️ ACID Implementation — File Index

| File | ACID Role |
|---|---|
| [`backend/utils/transaction.js`](backend/utils/transaction.js) | Core `withTransaction()` helper — Atomicity & Isolation engine |
| [`backend/config/db.js`](backend/config/db.js) | `w: "majority"`, `journal: true` — Durability |
| [`backend/models/Product.js`](backend/models/Product.js) | `pre("save")` stock ≥ 0 hook — Consistency |
| [`backend/models/Order.js`](backend/models/Order.js) | `paymentResult` sub-schema — Consistency audit trail |
| [`backend/controllers/orderController.js`](backend/controllers/orderController.js) | Atomic order creation, cancellation, payment — all four properties |
| [`backend/controllers/cartController.js`](backend/controllers/cartController.js) | Transactional guest cart merge — Atomicity & Consistency |
| [`backend/middleware/errorMiddleware.js`](backend/middleware/errorMiddleware.js) | Transaction error codes (112, 251) → 409 Conflict response |
| [`frontend/src/pages/Checkout.jsx`](frontend/src/pages/Checkout.jsx) | Synced price constants, no duplicate cart-clear write — Consistency |
| [`frontend/src/pages/OrderDetails.jsx`](frontend/src/pages/OrderDetails.jsx) | Passes `paymentResult` fields to backend — Consistency |

---


## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas connection string
* Git

### 1. Clone & Setup Backend
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# JWT_EXPIRES_IN=7d
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to view the application!