const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"]
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },

    brand: {
      type: String,
      trim: true
    },

    images: [
      {
        type: String,
        trim: true
      }
    ],

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    numReviews: {
      type: Number,
      min: 0,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({
  name: "text",
  description: "text",
  brand: "text"
});

productSchema.index({
  category: 1
});

productSchema.index({
  price: 1
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
