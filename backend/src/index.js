const express = require('express');
const app = express();

const main = require('./Config/db');
const redisClient = require('./Config/redis');
const cookieParser = require('cookie-parser');

const User = require('./Models/user');
const bcrypt = require('bcrypt');

const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemSetup');
const submitRouter = require('./routes/submit');

const cors = require('cors');

app.use(cors({
    origin:["http://localhost:5173"],
    credentials:true
}))
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());

// Mount user authetication routes such as register, login, logout, getProfile, etc.
app.use('/user', authRouter);
// Mount api endpoints of problem 
app.use('/problem', problemRouter);
// Mount api endpoints of submittion 
app.use('/submission', submitRouter);


// Function to create main admin if none exists
const createMainAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            
            await User.create({
                firstName: process.env.ADMIN_NAME,
                emailId: process.env.ADMIN_EMAILID,
                password: hashedPassword,
                role: "admin",
            });
            
        }
    }
    catch(err){
        console.log("Error: "+err.message);
    }
};

const InitializeConnection = async () => {
    try{
        await Promise.all([redisClient.connect(), main()]);

         // Ensure main admin exists
        await createMainAdmin();

        app.listen(process.env.PORT,()=>{
            console.log(`Server is listening at port number ${process.env.PORT}`)
        })
    }
    catch(err){
        console.log("Error: "+err.message);
    }


}
InitializeConnection();
