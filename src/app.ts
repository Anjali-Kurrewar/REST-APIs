import express, {Request,Response, NextFunction} from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { config } from './config/config';
import globalErrorHandler from './middleware/globalErrorHandler';
 
const app = express();


//Router
app.get('/',(req, res, next) => {
    const error = createHttpError(400,"Something went wrong");
    throw error;
    res.json({message: "Welcome to the elib apis"})
});

//Global error handler

app.use(globalErrorHandler);

export default app;