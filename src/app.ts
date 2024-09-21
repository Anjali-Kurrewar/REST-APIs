import express from 'express';
import createHttpError from 'http-errors';
import globalErrorHandler from './middleware/globalErrorHandler';
import { createUser } from './user/userController';
 
const app = express();


//Router
app.get('/',(req, res, next) => {
    const error = createHttpError(400,"Something went wrong");
    throw error;
    res.json({message: "Welcome to the elib apis"})
});

app.use("/api/users", createUser);

//Global error handler

app.use(globalErrorHandler);

export default app;