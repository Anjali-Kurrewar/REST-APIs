import express from 'express';
import createHttpError from 'http-errors';
import globalErrorHandler from './middleware/globalErrorHandler';
import bookRouter from './book/bookRouter';
import userRouter from './user/userRouter';
 
const app = express();

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