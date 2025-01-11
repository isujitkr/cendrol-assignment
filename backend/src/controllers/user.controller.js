import User from "../models/user.model.js";
import uploadOnClodinary from "../utils/cloudinary.js";
import { errorHandler } from "../utils/error.js";
import dotenv from 'dotenv';

dotenv.config();

export const createUser = async (req, res, next) =>{
    const {name, email, password, mobile} = req.body;

    if (!email || !password || !name || !mobile || name === '' || password === '' || email === '' || mobile === "") {
        next(errorHandler(400, 'All fields are required'));
        return;
    };

    const existedUser = await User.findOne({
        $or: [{email}, {mobile}]
    });

    if(existedUser){
        next(errorHandler(409, 'User already exists'));
        return;
    }


    const imageLocalPath = req.file?.path;
    console.log(imageLocalPath)

    const photo = await uploadOnClodinary(imageLocalPath);

    const user = await User.create({
        name,
        email,
        password,
        mobile,
        profilePicture: photo?.url || ""
    });

    return res.status(201).json({message: "User created successfully"});

}

export const loginUser = async(req, res, next) => {

    try {
        const {email, password} = req.body;
    
        const user = await User.findOne({ email });
    
        if (!user) {
            next(errorHandler(404,'User not found' ));
            return;
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password);
    
        if(!isPasswordValid){
            next(errorHandler(401,'Invalid user credentials' ))
            return;
        }
    
        const token = await user.generateToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        }
    
        res
        .status(200)
        .cookie("accessToken", token, options)
        .json({ message: 'Login successful', token });

    } catch (error) {
        next(errorHandler(500, error.message ))
        return;
    }

}

export const logOut = async(req, res, next) => {
    try {

        const options = {
            httpOnly: true,
            secure: true
        }

        res
            .clearCookie('accessToken', options)
            .status(200)
            .json('User has been signed out');
    } catch (error) {
        next(errorHandler(500, 'Internal Server Error'));
        return;
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        const filteredUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            profilePicture: user.profilePicture
        }));

        res.status(200).json(filteredUsers);
    } catch (error) {
        next(errorHandler(500, error.message ));
        return;
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true}).select("-password");

        if (!updatedUser) {
            next(errorHandler(404, 'User not found'));
            return;
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        next(errorHandler(500, error.message ));
        return;
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const userId = req.user._id; 

        if (id !== userId.toString()) {
            next(errorHandler(403, 'You can only delete your own account'));
            return;
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            next(errorHandler(404, 'User not found'));
            return;
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        res
        .clearCookie('accessToken', options)
        .status(200)
        .json({ message: 'User deleted successfully' });
    } catch (error) {
        next(errorHandler(500, error.message ));
        return;
    }
};