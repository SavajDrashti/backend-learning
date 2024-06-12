import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponce.js";

const registerUser = asyncHandler( async (req, res) => {

    // get uswer details from frontend
    const {fullname, email, username, password} = req.body
    console.log("email: ", email);

    // validation - not empty
    if(
        [fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ){
        throw new apiError(400, "All fields are required")
    }

    // check if user already wxists: usename, email
    const existUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(existUser){
        throw new apiError(409, "User with email or password already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }


    // upload them on cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar file is required")
    }


    // create user onbject - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url,
        email,
        password,
        username: username.toLowerCase()
    })


    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Somethingg went wrong while registering the user")
    }

    
    // return response
    return res.status(201).json(
        new apiResponse(200, createdUser,"User registerd successfully")
    )
});

export {registerUser};