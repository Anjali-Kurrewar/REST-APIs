import express from 'express';
 
const app = express();


//Router
app.get('/',(req, res) => {
    res.json({message: "Welcome to the elib apis"})
});

export default app;