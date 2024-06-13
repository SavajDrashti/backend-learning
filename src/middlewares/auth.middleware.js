import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; 

export const verifyJWT = asyncHandler(async(req, res, next) => 
    {
    try {
        const token = req.cookies?.accessToken || 
                      req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        //database req find by id ni
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        //naya object add kar dete hai
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access to token")
    }
})