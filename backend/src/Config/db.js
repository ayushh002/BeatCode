const mongoose = require('mongoose');

async function main(){
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Connected to database");
}

module.exports = main;