const mongoose = require("mongoose");

// Order Item Schema
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);

// Shipping Address Schema
const shippingAddressSchema =
    new mongoose.Schema(
        {
            fullName: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            addressLine1: {
                type: String,
                required: true,
                trim: true
            },

            addressLine2: {
                type: String,
                default: "",
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            state: {
                type: String,
                required: true,
                trim: true
            },

            postalCode: {
                type: String,
                required: true,
                trim: true
            },

            country: {
                type: String,
                default: "India",
                trim: true
            }
        },
        {
            _id: false
        }
    );

// Order Schema
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) =>
                    items.length > 0,
                message:
                    "Order must contain at least one item"
            }
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "STRIPE",
                "PAYPAL"
            ],
            default: "COD"
        },
        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending"
        },
        orderStatus: {
            type: String,
            enum: [
                "processing",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "processing"
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        tax: {
            type: Number,
            required: true,
            min: 0
        },

        shippingCost: {
            type: Number,
            required: true,
            min: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model(
    "Order",
    orderSchema
);
module.exports = Order;