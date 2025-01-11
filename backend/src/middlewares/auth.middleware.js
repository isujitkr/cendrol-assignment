import jwt from "jsonwebtoken"
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const verifyJWT = async(req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            next(errorHandler(401, 'Unauthorized access'));
            return;
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
        const user = await User.findById(decodedToken?._id).
        select("-password");
    
        if(!user){
            next(errorHandler(401, 'Unauthorized access'));
            return;
        }
    
        req.user = user;
        next();

    } catch (error) {
        next(errorHandler(401, 'Invalid Token'));
        return;
    }
}