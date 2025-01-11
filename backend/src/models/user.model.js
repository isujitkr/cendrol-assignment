import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    mobile: { 
        type: String,
        unique: true,
        required: true 
    },

    profilePicture: { 
        type: String 
    }, 

    password: { 
        type: String, 
        required: [true, 'Password is required']
    },

},{timestamps: true});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function(){
    return jwt.sign({
        _id: this._id
    },
    process.env.JWT_SECRET_KEY, 
    {expiresIn: process.env.TOKEN_EXPIRY})
};

const User = mongoose.model('User', userSchema);

export default User;