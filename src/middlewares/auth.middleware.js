import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; 

export const verifyJWT = asyncHandler(async(req, _, next) => 
    {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        
        console.log(token);

        if(!token){
            throw new ApiError(401, "Unauthorized request2")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        console.log("Decoded Token:", decodedToken); // Logging the decoded toke

        //database req find by id ni
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        console.log("User:", user); // Logging the user

        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        // Attach user object to request
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access to token")
    }
})