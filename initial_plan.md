# E-Commerce Project Requirements (MERN Stack)

Building an e-commerce platform is an excellent way to showcase your MERN stack skills because it touches on almost every aspect of full-stack development. Below is a structured breakdown of the features you should implement, categorized into **Required (MVP)** and **Good to Have**, along with technical implementation details.

## 🚀 Required Features (Minimum Viable Product)

These are the core features your e-commerce application needs to function at a basic level.

### 1. User Authentication & Authorization
*   **Registration & Login:** Secure email/password authentication.
*   **Authorization:** Role-based access control (Admin vs. Customer).
*   **Security:** Password hashing and JWT (JSON Web Tokens) for session management.

### 2. Product Management (Admin Side)
*   **CRUD Operations:** Admin ability to Create, Read, Update, and Delete products.
*   **Product Details:** Name, description, price, stock quantity, category, and a primary image.

### 3. Product Browsing (Customer Side)
*   **Product Catalog:** A home page displaying featured or all products.
*   **Single Product Page:** Detailed view of a specific product.
*   **Search & Filtering:** Basic search bar and filtering by category.
*   **Pagination:** To handle large numbers of products without performance hits.

### 4. Shopping Cart
*   **Cart Operations:** Add items, remove items, and adjust quantities.
*   **Persistence:** Save the cart state (either in local storage for guests or the database for logged-in users).
*   **Calculations:** Automatically calculate subtotal, taxes, shipping, and total price.

### 5. Checkout & Order Management
*   **Shipping Info:** Form to collect the user's shipping address.
*   **Payment Integration:** Secure payment processing (e.g., Stripe or PayPal in test mode).
*   **Order Creation:** Generate an order record in the database upon successful payment.
*   **Order History:** Users can view their past orders.
*   **Admin Order Management:** Admins can view all orders and update their status (e.g., Processing, Shipped, Delivered).

---

## ✨ Good to Have Features (Advanced)

Once the MVP is working perfectly, these features will make your project stand out in a portfolio and feel like a production-ready application.

### 1. Enhanced Product Experience
*   **Reviews & Ratings:** Allow verified buyers to rate and review products.
*   **Multiple Images:** Support for product image carousels.
*   **Wishlist:** Allow users to save products for later.
*   **Related Products:** Suggest similar items based on category on the product page.

### 2. Advanced Search & Filtering
*   **Dynamic Filtering:** Filter by price range, brand, ratings, and sort by price (low to high, etc.).
*   **Live Search Suggestions:** Auto-complete search bar as the user types.

### 3. User Profile & Settings
*   **Profile Management:** Update name, email, and password.
*   **Address Book:** Save multiple shipping/billing addresses for quicker checkout.

### 4. Admin Analytics Dashboard
*   **Visual Data:** Charts showing sales over time (using libraries like Recharts or Chart.js).
*   **Inventory Alerts:** Warnings when product stock drops below a certain threshold.
*   **User Management:** Admin ability to suspend or delete abusive user accounts.

### 5. Marketing & Notifications
*   **Automated Emails:** Order confirmation and shipping update emails (using Nodemailer or SendGrid).
*   **Discount Codes/Coupons:** System to apply percentage or fixed-amount discounts at checkout.

---

## 🛠️ Recommended MERN Stack Architecture

Here is how you can map these features to the MERN stack technologies:

### Frontend (Client)
*   **Framework:** React.js (or Next.js for better SEO and Server-Side Rendering).
*   **State Management:** Redux Toolkit (great for complex cart and user state) or React Context API.
*   **Styling:** Tailwind CSS or Material UI for a responsive, modern design.
*   **Routing:** React Router DOM.
*   **Data Fetching:** Axios or RTK Query.

### Backend (Server)
*   **Environment:** Node.js.
*   **Framework:** Express.js.
*   **Authentication:** `jsonwebtoken` (JWT) and `bcryptjs`.
*   **Payment Gateway:** Stripe Node.js SDK.
*   **Image Uploads:** Multer (for handling multipart/form-data) integrated with Cloudinary or AWS S3 to store images off-server.

### Database
*   **Database:** MongoDB (MongoDB Atlas for cloud hosting).
*   **ODM:** Mongoose to define models and schemas (e.g., `User`, `Product`, `Order`).

---

## 🔒 ACID Properties — Data Integrity Guarantees

This project enforces all four **ACID** database properties to ensure no order, payment, or stock update can ever leave the database in a broken or inconsistent state.

### ⚛️ A — Atomicity
> **"All or nothing."** Every multi-step operation either fully completes or fully rolls back. No partial writes ever persist.

* **The problem it solves:** When a customer places an order, three things must happen together — the order is saved, the product stock is decremented, and the cart is cleared. If the server crashes between any of these steps, data would be corrupted (e.g., an order exists but stock was never deducted).
* **How it's implemented:**
  * `orderController.js` — `createOrder()` wraps all three writes (order save + stock decrement + cart clear) in a single **MongoDB transaction session**. If any step throws an error, the session calls `abortTransaction()` and every write is rolled back automatically.
  * `cartController.js` — `mergeGuestCart()` wraps the entire guest-cart merge loop in a transaction. Either all guest items are merged or none are.
  * `utils/transaction.js` — A reusable `withTransaction(callback)` helper manages the session lifecycle: start → commit on success → abort on failure → always close.

```
POST /api/orders → withTransaction()
   ├─ Product stock --   (session write)
   ├─ Order.create()     (session write)
   └─ Cart.clear()       (session write)
         ↓ all succeed → commitTransaction()
         ↓ any fails   → abortTransaction() → zero changes in DB
```

### ✅ C — Consistency
> **"Data always moves from one valid state to another."** Rules and constraints are enforced at every layer, making it impossible to store invalid data.

* **The problem it solves:** Without consistency checks, a race condition could oversell a product (two users both buy the last item), a user could pay for someone else's order, or stock could go negative.
* **How it's implemented:**

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

### 🔀 I — Isolation
> **"Concurrent operations don't interfere with each other."** Two users buying at the same time cannot see each other's partial writes.

* **The problem it solves:** Two customers simultaneously checking out the last item in stock could both see `stock = 1`, both pass the stock check, and both place an order — resulting in `stock = -1`.
* **How it's implemented:**
  * **MongoDB Sessions** — All writes inside `withTransaction()` are scoped to a session with `readConcern: "snapshot"`. This gives each transaction a consistent view of the data frozen at the moment the transaction started, preventing dirty reads.
  * **Atomic conditional update** — The stock decrement uses `$inc` with a filter `{ stock: { $gte: qty } }`. This is a single atomic MongoDB operation. Under concurrent load, only one transaction wins the filter — the other sees `null` and aborts cleanly.
  * **`addToCart`** — Re-reads the product stock immediately before updating the cart to get the latest committed value, closing the stale-read window.

### 💾 D — Durability
> **"Committed data survives crashes."** Once a transaction is confirmed, it is permanently written to disk even if the server restarts immediately after.

* **The problem it solves:** Without durability guarantees, an order could be confirmed to the user but lost if MongoDB crashes before flushing the write to disk.
* **How it's implemented:**
  * `config/db.js` — The MongoDB connection is opened with `writeConcern: { w: "majority", journal: true }`. This means MongoDB will not report a write as successful until:
    * The write is acknowledged by the **majority** of replica set members (survives any single node failure), and
    * The write is flushed to the on-disk **journal** (survives a process crash on the primary).
  * `readPreference: "primary"` — All reads go to the primary node, ensuring no stale data is ever served from a lagging secondary.
  * **Transaction-level write concern** — Each `withTransaction()` call also sets `writeConcern: { w: "majority" }` at the transaction level as an additional guarantee.

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

> [!TIP]
> **Start Small!** Focus entirely on the **Required Features** first. Get a user logging in, browsing a product, adding it to a cart, and checking out. Once that critical flow is bug-free, branch out into the advanced features.
