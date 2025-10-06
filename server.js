// server.js - Main Application File
const express = require('express');
const authRoutes = require('./routes/auth');
const ecommerceRoutes = require('./routes/ecommerce');
const cors = require('cors'); // <--- 1. IMPORT THE CORS PACKAGE

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors()); // <--- 2. ENABLE CORS for all origins
app.use(express.json()); // Allows parsing of JSON request bodies


// --- Routes ---
// 1. Authentication routes (Registration, Login, OTP)
app.use('/api/auth', authRoutes);

// 2. E-commerce routes (Products, Orders)
app.use('/api', ecommerceRoutes);

// Optional: Health check / Root endpoint
app.get('/', (req, res) => {
    res.send('Disability Support Hub Backend is running!');
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('\n--- API Endpoints ---');
    console.log('Register: POST http://localhost:3000/api/auth/register');
    console.log('Login: POST http://localhost:3000/api/auth/login');
    console.log('Get Products: GET http://localhost:3000/api/products');
    console.log('Place Order (Auth Required): POST http://localhost:3000/api/orders');
});