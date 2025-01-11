import express from 'express';
import userRoutes from './routes/user.route.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/api/v1/user', userRoutes);

app.use('/', (req,res)=>{
    res.send('Api is working');
})

export default app;