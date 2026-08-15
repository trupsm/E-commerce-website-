const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
    try {
        // ── Durability ────────────────────────────────────────────────────────
        // writeConcern "majority" → writes are persisted to the majority of
        //   replica set members before the driver reports success.
        // readPreference "primary" → reads always go to the primary, ensuring
        //   we never read stale data from a lagging secondary (avoids dirty reads
        //   and satisfies the Isolation requirement at the connection level).
        // ─────────────────────────────────────────────────────────────────────
        const connection = await mongoose.connect(env.mongoUri, {
            writeConcern: { w: "majority", journal: true },
            readPreference: "primary",
        });

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );
        console.log("[ACID] Write concern: majority | Read preference: primary");
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);

        process.exit(1);
    }
};

module.exports = connectDB;