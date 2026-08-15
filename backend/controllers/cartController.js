const Cart = require("../models/Cart");
const Product = require("../models/Product");


// ======================================================
// Helper: Get Cart With Product Details
// ======================================================

const getPopulatedCart = async (userId) => {
    let cart = await Cart.findOne({
        user: userId
    }).populate({
        path: "items.product",
        select:
            "name price images stock brand category isActive",
        populate: {
            path: "category",
            select: "name"
        }
    });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: []
        });

        cart = await Cart.findById(cart._id)
            .populate({
                path: "items.product",
                select:
                    "name price images stock brand category isActive",
                populate: {
                    path: "category",
                    select: "name"
                }
            });
    }

    return cart;
};


// ======================================================
// Get Cart
// GET /api/cart
// Protected
// ======================================================

const getCart = async (req, res, next) => {
    try {
        const cart = await getPopulatedCart(
            req.user._id
        );

        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// Add Item To Cart
// POST /api/cart
// Protected
// ======================================================

const addToCart = async (req, res, next) => {
    try {
        const {
            productId,
            quantity = 1
        } = req.body;

        const requestedQuantity =
            Number(quantity);


        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }


        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer"
            });
        }


        const product =
            await Product.findOne({
                _id: productId,
                isActive: true
            });


        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        if (product.stock < requestedQuantity) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${product.stock} item(s) available`
            });
        }


        let cart = await Cart.findOne({
            user: req.user._id
        });


        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: []
            });
        }


        const existingItem =
            cart.items.find(
                (item) =>
                    item.product.toString() ===
                    productId.toString()
            );


        if (existingItem) {

            const newQuantity =
                existingItem.quantity +
                requestedQuantity;


            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.stock} item(s) available`
                });
            }


            existingItem.quantity =
                newQuantity;

        } else {

            cart.items.push({
                product: productId,
                quantity: requestedQuantity
            });

        }


        await cart.save();


        const populatedCart =
            await getPopulatedCart(
                req.user._id
            );


        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: populatedCart
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// Update Cart Item
// PUT /api/cart/:productId
// Protected
// ======================================================

const updateCartItem = async (
    req,
    res,
    next
) => {
    try {

        const {
            quantity
        } = req.body;


        const newQuantity =
            Number(quantity);


        if (
            !Number.isInteger(newQuantity) ||
            newQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer"
            });
        }


        const product =
            await Product.findOne({
                _id: req.params.productId,
                isActive: true
            });


        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${product.stock} item(s) available`
            });
        }


        const cart =
            await Cart.findOne({
                user: req.user._id
            });


        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        const item =
            cart.items.find(
                (cartItem) =>
                    cartItem.product.toString() ===
                    req.params.productId
            );


        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in the cart"
            });
        }


        item.quantity = newQuantity;


        await cart.save();


        const populatedCart =
            await getPopulatedCart(
                req.user._id
            );


        res.status(200).json({
            success: true,
            message:
                "Cart item updated",
            cart: populatedCart
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// Remove Item
// DELETE /api/cart/:productId
// Protected
// ======================================================

const removeFromCart = async (
    req,
    res,
    next
) => {
    try {

        const cart =
            await Cart.findOne({
                user: req.user._id
            });


        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        const originalLength =
            cart.items.length;


        cart.items =
            cart.items.filter(
                (item) =>
                    item.product.toString() !==
                    req.params.productId
            );


        if (
            cart.items.length ===
            originalLength
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in the cart"
            });
        }


        await cart.save();


        const populatedCart =
            await getPopulatedCart(
                req.user._id
            );


        res.status(200).json({
            success: true,
            message:
                "Product removed from cart",
            cart: populatedCart
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// Clear Cart
// DELETE /api/cart
// Protected
// ======================================================

const clearCart = async (
    req,
    res,
    next
) => {
    try {

        const cart =
            await Cart.findOne({
                user: req.user._id
            });


        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: {
                    items: []
                }
            });
        }


        cart.items = [];

        await cart.save();


        res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// Merge Guest Cart
// POST /api/cart/merge
// Protected
// ======================================================

const mergeGuestCart = async (
    req,
    res,
    next
) => {
    try {

        const guestItems =
            req.body.items;


        if (
            !Array.isArray(guestItems)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Guest cart items must be an array"
            });
        }


        let cart =
            await Cart.findOne({
                user: req.user._id
            });


        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: []
            });
        }


        for (const guestItem of guestItems) {

            const productId =
                guestItem.productId;

            const quantity =
                Number(guestItem.quantity);


            if (
                !productId ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                continue;
            }


            const product =
                await Product.findOne({
                    _id: productId,
                    isActive: true
                });


            if (!product || product.stock <= 0) {
                continue;
            }


            const existingItem =
                cart.items.find(
                    (item) =>
                        item.product.toString() ===
                        productId.toString()
                );


            if (existingItem) {

                existingItem.quantity =
                    Math.min(
                        existingItem.quantity +
                        quantity,
                        product.stock
                    );

            } else {

                cart.items.push({
                    product: productId,
                    quantity:
                        Math.min(
                            quantity,
                            product.stock
                        )
                });

            }
        }


        await cart.save();


        const populatedCart =
            await getPopulatedCart(
                req.user._id
            );


        res.status(200).json({
            success: true,
            message:
                "Guest cart merged successfully",
            cart: populatedCart
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCart
};