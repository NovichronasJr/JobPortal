const mongoose = require('mongoose');
require('dotenv').config();

const connection = ()=>{
    mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@jobportal.yuvlpux.mongodb.net/?appName=JobPortal`).then(()=>{
    console.log("mongoose connected.....");
})
}

module.exports=connection;