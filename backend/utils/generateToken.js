const jwt = require("jsonwebtoken");
const env = require("../config/env");
/*
when user logins in- the token is then sent to the client (in a cookie or response body) and used to authorize future requests.
*/
const generateToken = (userId) => {
    return jwt.sign(
        {
            userId
        },
        env.jwtSecret,
        {
            expiresIn: env.jwtExpiresIn
        }
    );
};

module.exports = generateToken;