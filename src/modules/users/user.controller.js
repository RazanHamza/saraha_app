import { Router } from "express";
import * as US from "./user.service.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { validation } from '../../common/middleware/validation.js';
import { signUpShema ,signInShema,refreshTokenShema,shareProfileShema,updateProfileShema,updatePasswordShema,confirmEmailSchema} from "./user.validation.js";
import { multerLocal } from '../../common/middleware/multer.js';
const userRouter=Router();


userRouter.post("/signup",
    multerLocal({customPath:"admin",customType:"image/jpeg"}).fields([
        {name:"attachment",max:1},
        {name:"attachments",max:4}
    ]),
    validation(signUpShema),
    US.signUp)
userRouter.post("/signup/gmail",US.signUpWithGmail)
userRouter.post("/signin",validation(signInShema),US.signIn)
userRouter.post("/refresh-token",validation(refreshTokenShema),US.refreshToken)
userRouter.get("/profile",authentication,US.getProfile)
userRouter.get("/share-profile/:id",validation(shareProfileShema),US.shareProfile)
userRouter.patch("/update-profile",validation(updateProfileShema),authentication,US.updateProfile)
userRouter.patch("/update-password",validation(updatePasswordShema),authentication,US.updatePassword)
userRouter.patch("/forget-password",authentication,US.forgetPassword)
userRouter.patch("/confirmemail",validation(confirmEmailSchema),US.confirmEmail)
userRouter.patch("/logout",authentication,US.logout)
userRouter.patch("/resend-otp",US.reSendOtp)

export default userRouter;