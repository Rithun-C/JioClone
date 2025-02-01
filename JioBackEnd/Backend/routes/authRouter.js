const express = require("express");
const authRouter = express.Router();
const {loginHandler,logoutHandler,signUpHandler,profilehandler,protectRouteMiddleware, forgotPasswordHandler, resetPasswordHandler} = require("../controller/authController");


authRouter.post("/signup",signUpHandler)
          .post("/login",loginHandler)
          .get("/logout", logoutHandler)
          .get("/profile", protectRouteMiddleware, profilehandler)
          .patch("/forgotPassword",forgotPasswordHandler)
          .patch("/resetPassword/:userId",resetPasswordHandler)


module.exports = authRouter;