import express from "express";
import { createUser } from "./userController";

const userRouter = express.Router()

userRouter.post('/register', (req, res) =>{
    res.json({message: "User Register"})
})

export default userRouter;