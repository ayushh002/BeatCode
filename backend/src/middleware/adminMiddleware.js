// Import jwt for verifying tokens
const jwt = require('jsonwebtoken');

// Import redisClient
const redisClient = require('../Config/redis');

const User = require('../Models/user');

const adminMiddleware = async (req, res, next) => {
    try{
        const {token} = req.cookies;

        if(!token)
            throw new Error("Token doesn't exist.");
        
        // Check token expiry
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if the token is invalidated
        const isInvalid = await redisClient.exists(`token:${token}`);
        
        if(isInvalid)
            throw new Error("Invalid Token.");

        // Fetch user from DB and confirm role
        const user = await User.findById(payload._id);
        if (!user || user.role !== "admin") {
            throw new Error("Not authorized. Admin access required.");
        }

        // Attach admin user to req for later use
        req.admin = user;

        next(); // pass the control to next handler

    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}

module.exports = adminMiddleware;