# E-Commerce MERN Platform — Full Project Blueprint

Let's build this out properly. I'll give you the folder structure, then walk through the 4 layers, then a dependency map, then trace each feature end-to-end.

---

## 📁 Project Map (Folder Structure)

```
ecommerce-platform/
│
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── env.js                # env variable loader/validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── Category.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # verify JWT
│   │   ├── roleMiddleware.js      # admin vs customer
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js    # multer for images
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── hashPassword.js
│   │   └── calculateOrderTotals.js
│   ├── services/
│   │   └── paymentService.js      # Stripe/PayPal wrapper
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   ├── cartApi.js
│   │   │   └── orderApi.js
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, Loader, Pagination
│   │   │   ├── product/           # ProductCard, ProductGrid, ProductFilter
│   │   │   ├── cart/              # CartItem, CartSummary
│   │   │   └── admin/             # ProductForm, OrderTable
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   └── admin/Dashboard.jsx, ManageProducts.jsx, ManageOrders.jsx
│   │   ├── context/ (or redux/)
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useCart.js
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 🧱 Layer 1 — Architecture (System Level)

This is a classic **3-tier architecture**:

```
[Client - React SPA]  <--HTTP/JSON-->  [Server - Express API]  <--Mongoose-->  [MongoDB]
                                              |
                                              └── [Stripe/PayPal API] (external)
```

- **Frontend (React)**: renders UI, holds client-side state (cart for guests, auth token), talks to backend only via REST API calls (`axios`).
- **Backend (Express + Node)**: stateless REST API. Every request is authenticated independently via JWT (no server-side sessions). Handles business logic — pricing, stock checks, order creation.
- **Database (MongoDB)**: source of truth for users, products, carts (for logged-in users), and orders.
- **External service**: Stripe/PayPal handles the actual payment; your backend never touches raw card data — it creates a payment intent and verifies the result via webhook or client confirmation.

Key architectural decision points you'll need to make:
- **State management**: Context API is enough for this scope; Redux only if cart/auth state gets complex with many derived values.
- **Cart persistence strategy**: guest cart in `localStorage`, merged into DB cart on login (this merge step is a common thing people forget — plan for it now).
- **Auth strategy**: JWT in httpOnly cookie (safer against XSS) vs. JWT in localStorage (simpler but more exposed). I'd recommend httpOnly cookie + refresh token pattern if you want to show security awareness.

---

## 🧩 Layer 2 — Modules (Functional Breakdown)

| Module | Backend Pieces | Frontend Pieces | Depends On |
|---|---|---|---|
| **Auth** | User model, authController, JWT utils, authMiddleware | Login/Register pages, AuthContext, ProtectedRoute | — (foundational) |
| **Product Catalog** | Product model, productController, pagination/filter logic | Home, ProductDetails, ProductFilter, Pagination | Auth (for admin write ops) |
| **Cart** | Cart model, cartController | CartContext, Cart page, CartItem | Auth (optional for guest), Product |
| **Checkout/Payment** | orderController, paymentService, Order model | Checkout page, payment form | Cart, Auth, Product (stock check) |
| **Order Management** | orderController (status updates), roleMiddleware | OrderHistory (customer), ManageOrders (admin) | Auth, Checkout |
| **Admin Panel** | productController (CRUD), uploadMiddleware, roleMiddleware | Admin dashboard, ProductForm, ManageOrders | Auth (role=admin), Product |

Notice the dependency shape: **Auth is the root module** — almost everything else needs it. **Product** is the second foundational piece — Cart and Checkout both depend on it (for price/stock at the moment of truth).

---

## 🔄 Layer 3 — Data Flow

### General request lifecycle
```
User Action (UI)
   → API call (axios, with JWT in header/cookie)
   → Express route
   → Middleware chain (auth check → role check → validation)
   → Controller (business logic)
   → Mongoose model (DB query)
   → Response (JSON)
   → Frontend state update (Context/Redux)
   → Re-render
```

### Example: Adding to cart (logged-in user)
```
ProductDetails.jsx (Add to Cart click)
   → cartApi.addItem(productId, qty)
   → POST /api/cart  { Authorization: Bearer <token> }
   → authMiddleware verifies JWT → attaches req.user
   → cartController.addItem:
        - fetch Product by id → check stock
        - find or create Cart for req.user._id
        - push/update item, recalc subtotal
        - save
   → returns updated cart JSON
   → CartContext updates cart state
   → Navbar cart icon count updates
```

### Example: Checkout → Order creation
```
Checkout.jsx (submit)
   → orderApi.createOrder(shippingInfo, paymentMethodId)
   → POST /api/orders
   → authMiddleware
   → orderController.createOrder:
        - re-fetch cart from DB (never trust client-sent prices)
        - re-validate stock for each item
        - calculate totals server-side (subtotal, tax, shipping)
        - call paymentService.charge(amount, paymentMethodId)
        - on success: create Order doc, decrement Product stock, clear Cart
        - on failure: return error, no Order created
   → returns Order confirmation
   → frontend redirects to Order Success / OrderHistory
```

This "never trust client-sent prices, recompute server-side" point is important — it's the kind of detail that separates a toy project from one that shows real engineering judgment.

---

## 🔍 Layer 4 — Individual Feature Workflows

### 1. Authentication
- **Register**: form → `POST /api/auth/register` → hash password (bcrypt) → save User → generate JWT → return token/cookie.
- **Login**: form → `POST /api/auth/login` → compare hash → generate JWT → set cookie / return token.
- **Protected routes (frontend)**: `ProtectedRoute` checks `AuthContext.user`; redirects to `/login` if absent.
- **Protected routes (backend)**: `authMiddleware` verifies JWT signature + expiry → attaches `req.user`. `roleMiddleware('admin')` checks `req.user.role`.

### 2. Product Management (Admin)
- Admin submits `ProductForm` (multipart, with image) → `POST /api/products` (protected: admin only) → `uploadMiddleware` (multer) stores image → `productController.create` saves doc.
- Update/Delete follow same pattern with `PUT`/`DELETE /api/products/:id`.

### 3. Product Browsing
- `Home.jsx` on mount → `GET /api/products?page=1&limit=12&category=&search=`
- Backend: build a Mongoose query dynamically from query params, use `.skip().limit()` for pagination, return `{ products, totalPages, currentPage }`.
- `ProductFilter` component updates query params → refetch.

### 4. Cart
- Guest: cart lives entirely in `localStorage`, managed by `CartContext` reducer — no backend calls.
- Logged-in: cart lives in DB, `CartContext` syncs with backend on every mutation.
- **Merge on login**: when a guest with a local cart logs in, dispatch a "merge" action → `POST /api/cart/merge` with the local cart items → backend combines with any existing DB cart.

### 5. Checkout & Orders
- Shipping form → local state/validation.
- Payment: use Stripe Elements on frontend to tokenize card (card details never hit your server) → send `paymentMethodId` to backend.
- Backend confirms payment via Stripe SDK → creates Order → returns confirmation.
- `OrderHistory.jsx`: `GET /api/orders/myorders`.
- `ManageOrders.jsx` (admin): `GET /api/orders` (all) + `PUT /api/orders/:id/status`.

---

## 🔗 Dependency Map

```
                        ┌───────────────┐
                        │  Auth Module   │  (root dependency)
                        └───────┬───────┘
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
     ┌────────────────┐ ┌──────────────┐  ┌───────────────┐
     │ Product Module  │ │ Cart Module  │  │ Admin Access   │
     └───────┬────────┘ └──────┬───────┘  └───────┬───────┘
              │                 │                   │
              └────────┬────────┘                   │
                        ▼                            │
               ┌─────────────────┐                   │
               │ Checkout/Payment │◄──────────────────┘
               └────────┬────────┘
                        ▼
               ┌─────────────────┐
               │  Order Module    │
               └────────┬────────┘
                        ▼
          ┌─────────────────────────┐
          │ Order History (customer) │
          │ Order Management (admin) │
          └─────────────────────────┘
```