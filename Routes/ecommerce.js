// routes/ecommerce.js - E-commerce Logic
const express = require('express');
const jwt = require('jsonwebtoken');
const { products, orders, getNextOrderId } = require('../data'); // Import mock DB
const router = express.Router();

const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; // MUST match the secret in auth.js

// --- 1. Middleware for JWT Authentication ---
const authenticateToken = (req, res, next) => {
    // Get token from header (Format: Bearer TOKEN)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log("Authorization Failed: Token Missing");
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Authorization Failed: Invalid Token");
            return res.sendStatus(403); // Forbidden (Invalid token)
        }
        req.user = user; // Add decoded user payload to request
        next();
    });
};


// --- 2. Endpoints ---

// Endpoint: GET /api/products
// Retrieves list of products from mock DB
router.get('/products', (req, res) => {
    // Verification Log
    console.log('\n--- API CALL: GET /api/products ---');
    console.log(`Sending ${products.length} products to frontend.`);
    console.log('-----------------------------------\n');
    
    res.json(products); 
});


// Endpoint: POST /api/orders
// Handles placing a new order (requires authentication)
router.post('/orders', authenticateToken, (req, res) => {
    const { items, delivery_name, delivery_address, payment_method, total_amount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart cannot be empty." });
    }

    // 1. Validate Inventory (MOCK: Reduce Stock in-memory)
    for (const cartItem of items) {
        const product = products.find(p => p.id === cartItem.id);
        if (!product || product.stock < cartItem.quantity) {
            return res.status(400).json({ message: `Insufficient stock for ${cartItem.name}` });
        }
        // Mock: Reduce Stock
        product.stock -= cartItem.quantity;
    }

    // 2. Create Order Record
    const newOrder = {
        id: getNextOrderId(),
        user_id: req.user.userId, // From JWT token
        delivery_name,
        delivery_address,
        payment_method,
        total_amount,
        items, // Saves the items array as part of the order record
        status: "Processing",
        order_date: new Date().toISOString()
    };

    orders.push(newOrder); // Mock: Save order

    // --- VERIFICATION LOGGING: START ---
    console.log('\n--- DB STATUS AFTER NEW ORDER ---');
    console.log(`Order Placed by User ID: ${req.user.userId}`);
    console.log(`Order ID: ${newOrder.id}`);
    console.log(`Items: ${newOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}`);
    console.log(`Total Orders in DB: ${orders.length}`);
    console.log(`Stock Status (Wheelchair 103): ${products.find(p => p.id === 103)?.stock}`);
    console.log('-----------------------------------\n');
    // --- VERIFICATION LOGGING: END ---

    // 3. Return Confirmation
    res.status(201).json({
        message: "Order placed successfully and stock updated.",
        orderId: newOrder.id,
        status: newOrder.status
    });
});


// Endpoint: GET /api/orders
// Retrieves user's order history (requires authentication)
router.get('/orders', authenticateToken, (req, res) => {
    const userOrders = orders.filter(o => o.user_id === req.user.userId);
    
    // Verification Log
    console.log('\n--- API CALL: GET /api/orders ---');
    console.log(`User ID ${req.user.userId} requested order history.`);
    console.log(`Found ${userOrders.length} orders for this user.`);
    console.log('-----------------------------------\n');
    
    res.json(userOrders);
});

module.exports = router;