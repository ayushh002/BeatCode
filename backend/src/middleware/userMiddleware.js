// Import jwt for verifying tokens
const jwt = require('jsonwebtoken');

// Import redisClient
const redisClient = require('../Config/redis');

const userMiddleware = async (req, res, next) => {
    try{
        const {token} = req.cookies;

        if(!token)
            throw new Error("Token doesn't exist.");
        
        // Check token expiry
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if the token is invalidated
        const isInValid = await redisClient.exists(`token:${token}`);
        
        if(isInValid)
            throw new Error("Invalid Token.");

        // Attach payload to request for later use
        req.payload = payload;

        next(); // pass the control to next handler

    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}

module.exports = userMiddleware;