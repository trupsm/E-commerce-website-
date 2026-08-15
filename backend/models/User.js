const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        addressLine1: {
            type: String,
            required: [true, "Address line 1 is required"],
            trim: true
        },
        addressLine2: {
            type: String,
            default: "",
            trim: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },
        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true
        },
        country: {
            type: String,
            default: "India",
            trim: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },

        addresses: {
            type: [addressSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;