const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
// This middleware will be used to protect routes (only logged in users can access)
// It will also extract user info from JWT and attach it to request object
const authMiddleware = async (req, res, next) => {
    try {
        //extract token from cookies
        /*Reads the token stored in the HTTP-only cookie sent by the browser.
        If there is no token (e.g., the user hasn't logged in or cleared their cookies), it immediately stops the request and returns a 401 Unauthorized error*/



        //verify the token 
        /*
        Uses jwt.verify() and your private JWT_SECRET to check:
           1)Has the token expired?
           2)Was the token tampered with?
        If valid, it unpacks the payload you saved earlier (which contains { userId: "..." }).
         */
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            token,
            env.jwtSecret
        );


        //fetch user from DB

        /*
        1. Looks up the user in MongoDB using the decoded.userId.
        2. .select("-password"): Excludes the hashed password from the result for extra security.
        3. If the user was deleted from the database after the token was issued, it rejects the request.
        */
        const user = await User.findById(decoded.userId)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        /* 
        Attaching the User to the Request & Passing Control
        
        req.user = user;: Attaches the authenticated user's document directly to the req (request) object. Any subsequent route handler or controller can now access req.user (e.g., req.user._id or req.user.role).
        */
        req.user = user;


        //next():Passes control to the next middleware or the actual controller function.
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
};

module.exports = authMiddleware;