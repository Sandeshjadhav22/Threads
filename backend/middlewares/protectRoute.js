// import { JsonWebTokenError } from "jsonwebtoken";
import jwt from "jsonwebtoken"

import User from "../models/userModel.js";

const protectRoute= async(req,res,next) => {
    try {
        const token = req.cookies.jwt;

        if(!token) return res.status(401).json({mesaage:"Unauthorised"})

        const decode = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decode.userId).select("-password");

        req.user = user;
        next()
    } catch (error) {
        res.status(500).json({ message: error.mesaage });
        console.log("Error in ProtectRoute controller", error.mesaage);
    }
}

export default protectRoute