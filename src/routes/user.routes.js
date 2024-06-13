import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccesToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1   //ketli files accept karsho
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser)


//secured routes  jya pan middlewarw inject karvu hoi to method ne run thva pela inect karavi devanu
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccesToken)

export default router    