const express = require("express");
const userRouter = express.Router();
const { protectRouteMiddleware } = require("../controller/authController");
const { addToWishlist, getUserWishlist, getCurrentUser } = require("../controller/userController");

userRouter.use(protectRouteMiddleware);
userRouter.get("/wishlist", getUserWishlist);
userRouter.get("/",getCurrentUser);
userRouter.post("/wishlist", addToWishlist);


module.exports= userRouter;