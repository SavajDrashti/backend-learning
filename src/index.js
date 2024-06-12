// require('dotenv').config({path: './env'})
import dotenv from "dotenv"

import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO db connection failes", err);
})














/*
import express from "express";
const app = express();

//effi function ne imediately excecute karido
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("errorr",(error) => {
            console.log("ERROR:" , error);
            throw error
        })    

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on pport ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR:" ,error);
        throw error;
    }
})()
    
*/