const mongoose = require('mongoose');

const {Schema} = mongoose;

// Import jwt
const jwt = require('jsonwebtoken');

// Import .env 
require('dotenv').config()

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:25
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:25
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    password: {
        type:String,
        required:true
    },
    age:{
        type:Number,
        min:6,
        max:80
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problems'
        }]
    }
}, {timestamps:true});

// Create a method for generating jwt
userSchema.methods.getJWT = function(){
    const token = jwt.sign(
        {
            _id: this._id, 
            emailId: this.emailId, 
            role: this.role
        }, 
        process.env.JWT_SECRET_KEY, 
        {
            expiresIn:3600
        }
    );
    return token;
}

const User = mongoose.model("users",userSchema);

module.exports = User;