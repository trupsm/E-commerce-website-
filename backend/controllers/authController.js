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
/*
1. Validation: Checks if name, email, and password are provided in req.body. If missing, returns 400 Bad Request.
2. Duplicate Check: Looks up User.findOne({ email }). If the email already exists, returns 409 Conflict.
3. Password Hashing: Hashes the plain text password via hashPassword(password) (using bcrypt).
4. Create User: Saves the new user into MongoDB with the hashed password.
5. Issue Token & Cookie: Generates a JWT via generateToken(user._id) and sets it into the browser's cookie using res.cookie("token", token, cookieOptions).
6. Response: Sends back a 201 Created status with sanitized user details (excluding the password).
*/

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
            return res.status(409).json({ //409-Conflict - The request conflicts with the current state of the resource. 
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
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};


// Login
/*
1.Validation: Ensures email and password are sent.
2.Find User: Looks up the user in MongoDB by email.
3.Verify Password: Uses comparePassword(password, user.password) to check if the entered password matches the stored bcrypt hash.
Security Tip: Notice both "user not found" and "password incorrect" return the generic message "Invalid email or password" with status 401. This prevents attackers from enumerating valid email addresses.
4.Issue Token & Cookie: Creates a new JWT and sets the cookie.
Response: Sends 200 OK with user information.

*/
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
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};


// Get Current User
/*
1.Purpose: Returns the profile of the currently logged-in user.
2.How it works: This route is protected by authMiddleware, which previously decoded the token, fetched the user from the DB, and attached it to req.user. This function simply returns that sanitized user data to the client.
*/
const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
};


// Logout
/*
Purpose: Clears the authentication cookie from the browser using res.clearCookie().
After this, future requests won't have the token cookie, effectively logging the user out.
*/
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

module.exports = {
    register,
    login,
    getMe,
    logout
};