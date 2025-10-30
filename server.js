import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';


// Load environment variables
dotenv.config();

//database config
connectDB();


// Create express app
const app = express();

//middlewares
app.use(express.json());
app.use(morgan('dev'))

// Basic route
app.get('/', (req, res) => {
    res.send('<h1>Titanium The World Store mern</h1>');
});

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.DEV_MODE || 'development';

// Start server
app.listen(PORT, () => {
    console.log(`Server is running in ${NODE_ENV} mode on PORT ${PORT}`);
});