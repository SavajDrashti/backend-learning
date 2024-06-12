import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
//routes import
import userRouter from './routes/user.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGINE,
    credentials: true
}))

//json ne aapde config karie 6ie exppress sathe
app.use(express.json({limit: "16kb"}))

//url pase t hi data levana hoi to
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//koii pn file , img k evu hu store karva magu to public assests 6 k je koi pn use kari shake
app.use(express.static("public"))

app.use(cookieParser())




//router declaration
app.use("/api/v1/users", userRouter)    //ahiya thi /users thi userRouter ms jashe 

//http://localhost:8000/api/v1/users/register

export default app 