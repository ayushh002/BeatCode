// Import the user schema for CRUD operations
const User = require('../Models/user');
const Submission = require('../Models/submission');

// Import validator function
const validate = require('../utils/validator');

// Import Bcrypt for hashing the password
const bcrypt = require('bcrypt');

// Import jwt for creating and verifying token
const jwt = require('jsonwebtoken');

// Import redisClient to invalidate the tokens for logout
const redisClient = require('../Config/redis');


// Register
const register = async (req, res)=>{
    try{
        //validate the inputs
        validate(req);

        req.body.role = 'user';

        // Hash the Password
        req.body.password = await bcrypt.hash(req.body.password, 10);

        // Register the user 
        const user = await User.create(req.body);

        // Generate token
        const token = user.getJWT();

        // Send the token as a cookie - removed from brower cookies after expiry
        res.cookie("token", token, {maxAge: 60*60*1000, httpOnly: true}); // age in milliseconds

        const reply = {
            _id: user._id,
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role
        }

        res.status(201).json({
            message:"User Registered Successfully.",
            user: reply
        });
    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}


// Login
const login = async (req, res)=>{
    try{

        // Check For Empty Email and Password
        if(!req.body.emailId)
            throw new Error("Invalid Credentials");
        if(!req.body.password)
            throw new Error("Invalid Credentials");

        // Find the user exist or not
        const user = await User.findOne({emailId: req.body.emailId});

        // If the user isn't registered
        if(!user)
            throw new Error("Invalid Credentials");

        // verify password
        const isValid = await bcrypt.compare(req.body.password, user.password);

        if(!isValid)
            throw new Error("Invalid Credentials");

        // generate token for the user
        const token = user.getJWT();

        // sent token in the browser's cookies
        res.cookie("token", token, {maxAge: 60*60*1000, httpOnly: true});

        const reply = {
            _id: user._id,
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role
        }

        res.status(200).json({
            message:"User Logged In Successfully.",
            user: reply
        });
    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}


// Logout
const logout = async (req, res)=>{
    try{ 
        const {token} = req.cookies;
        // Decode the JWT for the expiry time
        const payload = jwt.decode(token);

        // Mark the token as invalid (blacklist it in Redis)
        await redisClient.set(`token:${token}`, 'Blocked');

        // Remove redis key exactly when the JWT expires
        await redisClient.expireAt(`token:${token}`,payload.exp);

        // Clear the token cookie immediately on the client
        res.cookie("token", null, {expires: new Date(Date.now())});
        res.status(200).send("User Logged Out Successfully.")
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}


// Route for admin registration - this route will only work if a logged in
// existing admin tries to register another user
const adminRegister = async (req, res) => {
    try{
        //validate the inputs
        validate(req);

        // Ccommenting this, admin can now register both user and admin by sendi
        // -ing role through request body
        // req.body.role = 'admin'; 

        // Hash the Password
        req.body.password = await bcrypt.hash(req.body.password, 10);

        // Register the user 
        const user = await User.create(req.body);

        // No need to send token here

        res.status(201).send("User Registered Successfully.");
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
}


const deleteAccount = async (req, res) => {
    try{
        if(!req?.payload?._id) 
            return res.status(401).send("Unauthorized: User not authenticated");

        const userId = req.payload._id;

        // check password is available inside the request
        if (!req.body.password) 
            return res.status(400).send("Password is required");
        
        const user = await User.findById(userId);
        if(!user) 
            return res.status(400).send("User Not Found");

        // Match the entered password with the user password from database
        const isValid = await bcrypt.compare(req.body.password, user.password);

        if(!isValid)
            return res.status(401).send("Invalid Password");

        // delete the user
        await User.findByIdAndDelete(userId);

        // Delete all the submittions done by user
        await Submission.deleteMany({userId});

        res.status(200).send("Account Deleted Successfully");
    }
    catch(err) {
        res.status(500).send("Internal Server Error");
    }
}

const check = async (req, res) => {
    try{
        const user = await User.findById(req.payload._id);
        
        if(!user)
            res.status(404).send("User not found.");

        const reply = {
            _id: user._id,
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role
        }
        res.status(200).json({
            message:"Valid User",
            user:reply
        })
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }

}

module.exports = {register, login, logout, adminRegister, deleteAccount, check};