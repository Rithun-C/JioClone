const UserModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const util = require("util");
const emailSender = require("../utility/dynamicEmail");
const promisify = util.promisify;
const promisdiedJWTsign = promisify(jwt.sign);
const promisdiedJWTverify = promisify(jwt.verify);


const signUpHandler = async function(req,res){
    try{
        const userObject = req.body;
        // 1. user -> data get , check email , password
        if (!userObject.email || !userObject.password) {
            return res.status(400).json({
                "message": "required data missing",
                status: "failure"
            })
        }
        console.log("here");
        // 2. email se check -> if exist -> already loggedIn 
        const user = await UserModel.findOne({ email: userObject.email });
        if (user) {
            return res.status(400).json({
                "message": "user is already logged in",
                status: "failure"
            })
        }
        const newUser = await UserModel.create(userObject);
        // send a response 
        res.status(201).json({
            "message": "user signup successfully",
            user: newUser,
            status: "success"
        })

    }catch(err){
        res.status(404).json({
            message : "internal server error",
            error : err
        })
    }
}

const loginHandler = async function(req,res){
    try{
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({
                message : "invalid email or pasword",
                status : "failure"
            })
        }
        const areEqual = password == user.password;
        if(!areEqual){
            return res.status(400).json({
                message :" invalid email or password",
                status : "failure"
            })
        }
        const authToken = await promisdiedJWTsign({id:user["_id"]}, process.env.JWT_SECRET_KEY);
        res.cookie("jwt", authToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true, // it can only be accessed by the server
        })
        // // res send 
        res.status(200).json({
            message: "login successfully",
            status: "success",
            user: user
        })
    }catch(err){
        res.status(404).json({
            message : "internal server error",
            error : err
        })
    }
}

async function protectRouteMiddleware(req, res, next) {
    try {
        // cookies token get 
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "unauthorized access",
                status: "failure"
            })
        }
        //  token verify
        const decryptedToken = await promisdiedJWTverify(token, process.env.JWT_SECRET_KEY);
        // token identifier
        req.id = decryptedToken.id;
        next();


    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: "internal server error",
            status: "failure"
        })
    }

}

async function isAdminMiddleWare(req, res, next) {
    const id = req.id;
    const user = await UserModel.findById(id);
    if (user.role !== "admin") {
        return res.status(403).json({
            message: "you are not admin",
            status: "failure"
        })
    } else {
        next();
    }
}

async function profilehandler(req, res,) {
    try {
        const userId = req.id;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "user not found",
                status: "failure"
            })
        }
        res.json({
            message: "profile worked",
            status: "success",
            user: user
        })
    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }

}

async function logoutHandler(req, res) {
    try {
        res.clearCookie('jwt', { path: "/" });
        res.json({
            message: "logout successfully",
            status: "success"
        })

    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }

}

const otpGenerator = function () {
    return Math.floor(100000 + Math.random() * 900000);
}

async function forgotPasswordHandler(req, res) {
    try{
    // 1.
    const email = req.body.email;
    if (email == undefined) {
        return res.status(400).json({
            status: "failure",
            message: "required data missing"
        })
    }
    // 2.
    const user = await UserModel.findOne({email});
    if (!user) {
        return res.status(404).json({
            status: "failure",
            message: "user not found"
        })
    }
    // 3.
    const otp = otpGenerator();
    // 4.
    user.otp = otp;
    user.otpExpiry = Date.now() + 100 * 60 * 60;
    await user.save({ validateBeforeSave: false });
    // 5.
    res.status(200).json({
        message: "otp is send successfully",
        status: "success",
        otp: otp,
        resetURL: `http:localhost:3000/api/auth/resetPassword/${user["_id"]}`
    })
    const templateData = { name: user.name, otp: user.otp }
    await emailSender("./templates/otp.html", user.email, templateData);
} catch (err) {
    console.log("err", err);
    res.status(500).json({
        message: err.message,
        status: "failure"
    })
}
}

async function resetPasswordHandler(req, res) {
    try {
    // 1.
    let resetDetails = req.body;
        // required fields are there or not 
        if (!resetDetails.password || !resetDetails.confirmPassword
            || !resetDetails.otp
            || resetDetails.password != resetDetails.confirmPassword) {
            res.status(401).json({
                status: "failure",
                message: "invalid request"
            })
        }
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({
            status: "failure",
            message: "user not found"
        })
    }
    if (user.otp == undefined) {
        return res.status(401).json({
            status: "failure",
            message: "unauthorized acces to reset Password"
        })
    }
    if (Date.now() > user.otpExpiry) {
        return res.status(401).json({
            status: "failure",
            message: "otp expired"
        })
    }
    // if otp is incorrect
    if (user.otp != resetDetails.otp) {
        return res.status(401).json({
            status: "failure",
            message: "otp is incorrect"
        })
    }
    user.password = resetDetails.password;
    user.confirmPassword = resetDetails.confirmPassword;
    // remove the otp from the user
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({
        status: "success",
        message: "password reset successfully"
    })
    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}

module.exports = {
    loginHandler,signUpHandler,logoutHandler,isAdminMiddleWare,profilehandler,protectRouteMiddleware,forgotPasswordHandler,resetPasswordHandler
}