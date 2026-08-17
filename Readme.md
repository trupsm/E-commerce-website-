# 🛒 Vyoma E-Commerce Platform — System Architecture & Implementation Blueprint

An enterprise-grade, high-performance **MERN Stack (MongoDB, Express, React, Node.js)** e-commerce web application featuring role-based access control, server-side pricing validation, hybrid cart synchronization, dynamic product catalogs, and transactional order, payment, and stock management.

---

## 📁 Project Map (Folder Structure)

```
ecommerce-platform/
│
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
│   │   ├── authMiddleware.js         # HTTP-only cookie + Bearer JWT verification
│   │   ├── roleMiddleware.js         # Role-based access control (Admin vs Customer)
│   │   └── errorMiddleware.js        # Central error handler (CastError, Duplicate, Transaction errors)
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

### 3. Key Engineering Trade-Offs 

| Architectural Decision | Choice Made | Why? (The Engineering Rationale) |
|---|---|---|
| **JWT Storage** | **HTTP-Only Cookies** | Storing JWTs in `localStorage` exposes tokens to Cross-Site Scripting (XSS). HTTP-only cookies prevent JavaScript from accessing tokens. |
| **Pricing Strategy** | **Server-Side Recomputation** | Never trust client-side prices. The backend looks up prices from MongoDB at the moment of order creation. |
| **Catalog Performance** | **`Promise.all` Parallelism** | Product fetching and total count queries run concurrently, cutting API latency in half. |
| **Database Indexing** | **Compound & Text Indexes** | Compound indexes on `category` and `price`, plus text index on `name`, enable fast sub-millisecond filtering. |
| **Data Integrity** | **MongoDB Multi-Document Transactions** | Order creation, stock updates, cart clearing, and cancellation stock-restore are wrapped in transaction sessions to prevent overselling, partial writes, and data loss. |

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
| `POST` | `/api/cart/merge` | Merge guest localStorage cart into database cart | Private (Logged-in User) |

### 💳 Orders & Checkout (`/api/orders`)
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
* Node.js (v18+)
* MongoDB Atlas connection string
* Git

### 1. Clone & Setup Backend
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
```

### 2. Setup Frontend
```bash
cd frontend
npm install
# Copy the example env file or create a .env file:
# cp .env.example .env (or copy .env.example to .env)
#
# Configure frontend/.env with your values:
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

Open `http://localhost:5173` in your browser to view the application!