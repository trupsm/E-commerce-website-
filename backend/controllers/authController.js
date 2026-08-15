const User = require("../models/User");
const {
    hashPassword,
    comparePassword
} = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");

// Cookie Configuration
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 24 * 60 * 60 * 1000
};

// Register
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        const token = generateToken(user._id);

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                addresses: user.addresses || []
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await comparePassword(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                addresses: user.addresses || []
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get Current User
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                addresses: user.addresses || []
            }
        });
    } catch (error) {
        next(error);
    }
};

// Logout
const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", cookieOptions);
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        next(error);
    }
};

// =====================================
// Shipping Address Controller Functions
// =====================================

// Get User's Addresses
const getAddresses = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            addresses: user.addresses || []
        });
    } catch (error) {
        next(error);
    }
};

// Add New Shipping Address
const addAddress = async (req, res, next) => {
    try {
        const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

        if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required address fields (fullName, phone, addressLine1, city, state, postalCode)"
            });
        }

        const user = await User.findById(req.user._id);

        const shouldBeDefault = isDefault || user.addresses.length === 0;

        if (shouldBeDefault && user.addresses.length > 0) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        const newAddress = {
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            city,
            state,
            postalCode,
            country: country || "India",
            isDefault: shouldBeDefault
        };

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Shipping address added successfully",
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

// Update Shipping Address
const updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

        const user = await User.findById(req.user._id);
        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        if (fullName) address.fullName = fullName;
        if (phone) address.phone = phone;
        if (addressLine1) address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
        if (city) address.city = city;
        if (state) address.state = state;
        if (postalCode) address.postalCode = postalCode;
        if (country) address.country = country;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

// Delete Shipping Address
const deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const wasDefault = address.isDefault;
        user.addresses.pull(addressId);

        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

// Set Address as Default
const setDefaultAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);

        let targetFound = false;
        user.addresses.forEach((addr) => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                targetFound = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (!targetFound) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Default address set successfully",
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};