const mongoose = require("mongoose");

// ============================================================
// ACID Transaction Utility
// ============================================================
// Wraps a callback in a Mongoose session + transaction to
// guarantee Atomicity and Isolation across multiple DB writes.
//
// Usage:
//   const result = await withTransaction(async (session) => {
//     await Order.create([doc], { session });
//     await Product.updateOne(filter, update, { session });
//     return result;
//   });
//
// - On success  → commits the transaction and closes the session.
// - On any error → aborts the transaction (rollback) and closes
//                  the session, then re-throws so the caller
//                  (or error middleware) handles the response.
//
// Replica-set detection: if MongoDB is running as a standalone
// instance (no replica set), sessions/transactions are not
// supported. In that case we fall through to non-transactional
// mode with a console warning so the app still works in dev.
// ============================================================

const withTransaction = async (callback) => {
  let session = null;

  try {
    session = await mongoose.startSession();
  } catch (sessionErr) {
    // Standalone mongod — sessions unavailable.
    // Fall back to non-transactional execution with a warning.
    console.warn(
      "[ACID] WARNING: MongoDB sessions unavailable (standalone instance?). " +
        "Running without a transaction — ACID guarantees are degraded. " +
        "Convert your MongoDB instance to a replica set for full ACID support."
    );
    return await callback(null);
  }

  try {
    session.startTransaction({
      // readConcern "snapshot" + writeConcern "majority" gives the
      // strongest isolation level MongoDB offers (Serializable-like).
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
    });

    const result = await callback(session);

    await session.commitTransaction();
    return result;
  } catch (err) {
    // Roll back all writes made during this session.
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      // Abort failure is non-recoverable; log and surface original error.
      console.error("[ACID] Failed to abort transaction:", abortErr.message);
    }
    throw err; // Re-throw so controllers/middleware can respond properly.
  } finally {
    session.endSession();
  }
};

module.exports = withTransaction;
