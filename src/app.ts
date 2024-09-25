import express from 'express';
import createHttpError from 'http-errors';
import globalErrorHandler from './middleware/globalErrorHandler';
import bookRouter from './book/bookRouter';
import userRouter from './user/userRouter';
import cors from 'cors';
import { config } from './config/config';
 
const app = express();

app.use(cors({
    origin: config.frontendDomain ,

}));
app.use(express.json());
//Router
app.get('/',(req, res, next) => {
    const error = createHttpError(400,"Something went wrong");
    throw error;
    res.json({message: "Welcome to the elib apis"})
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

//Global error handler

app.use(globalErrorHandler);

export default app;