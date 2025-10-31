import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

// Load config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = JSON.parse(await readFile(join(__dirname, 'config.json'), 'utf8'));

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 Titanium Store API</h1>
        <p>Server is running in <strong>${process.env.NODE_ENV || 'development'}</strong> mode</p>
        <p>API Documentation: <code>/api/v1/auth</code></p>
    `);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Server configuration from config.json
const PORT = config.server.port;
const NODE_ENV = process.env.NODE_ENV || config.server.environment;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Server is running in ${NODE_ENV} mode`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`🔌 API Base URL: http://localhost:${PORT}/api/v1`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});