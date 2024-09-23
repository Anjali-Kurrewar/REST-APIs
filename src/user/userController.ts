import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";  
import bcrypt from "bcrypt";            
import { config } from "../config/config";
import {sign} from "jsonwebtoken";
import {User} from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const{name, email, password} = req.body;
    console.log("reqdata", req.body);
    //Validation
    if(!name||!email||!password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }
   

    try {
        const user = await userModel.findOne({email})
        if(user) {
            const error = createHttpError(400, "User already exist with this email.")
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, "Error while getting user"));
    }
    
    //Password Hashing
    // by using salt which is basically a string which is used to insert in the hased password field so that the patterns where undetectable by any hacker.
    let newUser:  User;
    try {
        const hashedPassword = await bcrypt.hash(password,10);

     newUser = await userModel.create({//To store the data in the database
        name,
        email,
        password: hashedPassword,
    })
    } catch (error) {
        return next(createHttpError(500,"Error while creating user."));
    }

    //Token gernerations (jsonwebtoken)
   try {
    const token = sign({sub: newUser._id},config.jwtSecret as string,{
        expiresIn: "7d",
        algorithm: "HS256"});
    res.json({accessToken: token});
   } catch (error) {
    return next(createHttpError(500,"Error while signing the jwt token."))
   }
}

export {createUser};