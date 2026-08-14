//RBAC middleware 

/*
Higher-Order Function: It's a function that returns an Express middleware function. This allows you to pass custom arguments (like "admin") when configuring your routes.
...allowedRoles (Rest parameter): Bundles any number of roles passed in into an array.
If you call roleMiddleware("admin"), allowedRoles becomes ["admin"].
If you call roleMiddleware("admin", "manager"), allowedRoles becomes ["admin", "manager"].
*/
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated (must be done by authMiddleware first)
        if (!req.user) {
            return res.status(401).json({ //401-Unauthorized access - You are not logged in.
                success: false,
                message: "Authentication required"
            });
        }
        //Check if the authenticated user's role is in the allowedRoles array
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ //403-Forbidden -You're logged in, but you can't do this specific action.
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = roleMiddleware;