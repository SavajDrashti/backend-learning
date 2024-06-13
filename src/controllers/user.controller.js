
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponce.js";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAceessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
        

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh ans access token")
    }
    }


const registerUser = asyncHandler( async (req, res) => {

    // get uswer details from frontend
    const {fullname, email, username, password} = req.body
    console.log("email: ", email);

    // validation - not empty
    if(
        [fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already wxists: usename, email
    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existUser){
        throw new ApiError(409, "User with email or password already exists")
    }

    console.log(req.files);

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files&& Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }


    // upload them on cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }


    // create user onbject - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url,
        email,
        password,
        username: username
    })


    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Somethingg went wrong while registering the user")
    }

    
    // return response
    return res.status(201).json(
        new apiResponse(200, createdUser,"User registerd successfully")
    )
});

//login user
const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    const{email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }


    // username or email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // find the user
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }


    // access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken" )

    // send cookie
    const options = {
        httpOnly: true,
        secure: true
    } 

    return res.status(200)
              .cookie("accesToken", accessToken, options)
              .cookie("refreshToken", refreshToken, options)
              .json(
                new apiResponse(
                    200,
                    {
                        user: loggedinUser, refreshToken, accessToken
                    },
                    "User logged in successfully"
                )
              )


})


//logout user
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true     //retrun ma je response malshe ema new updated value malshe
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    } 
    
    return res.status(200)
              .clearCookie("accessToken", options)
              .clearCookie("refreshToken", options)
              .json(new apiResponse(200, {}, "User logged out"))
})



export {registerUser, loginUser, logoutUser};