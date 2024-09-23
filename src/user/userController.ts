import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";  
import bcrypt from "bcrypt";            
import { config } from "../config/config";
import {sign} from "jsonwebtoken";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const{name, email, password} = req.body;
    console.log("reqdata", req.body);
    //Validation
    if(!name||!email||!password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }
    const user = await userModel.findOne({email})
    if(user) {
        const error = createHttpError(400, "User already exist with this email.")
        return next(error);
    }
    //Password Hashing
    // by using salt which is basically a string which is used to insert in the hased password field so that the patterns where undetectable by any hacker.
    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = await userModel.create({//To store the data in the database
        name,
        email,
        password: hashedPassword,
    });

    //Token gernerations (jsonwebtoken)
    const token = sign({sub: newUser._id},config.jwtSecret as string,{expiresIn: "7d",});


    res.json({accessToken: token});
}

export {createUser};