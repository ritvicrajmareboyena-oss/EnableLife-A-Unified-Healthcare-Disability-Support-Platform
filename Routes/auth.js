// routes/auth.js - Authentication Logic
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users, getNextUserId } = require('../data'); // Import mock DB

const router = express.Router();
// NOTE: This secret key should be stored in a .env file for production security!
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; 

// Endpoint: POST /api/auth/register
// Simulates user sign-up
router.post('/register', async (req, res) => {
    const { name, phone, password } = req.body;
    
    // 1. Check if user already exists
    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ message: "User already exists with this phone number." });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
        id: getNextUserId(),
        name,
        phone,
        password_hash: hashedPassword,
        createdAt: new Date()
    };
    users.push(newUser);
    
    // --- VERIFICATION LOGGING: START ---
    // This section prints the database status to your terminal to verify data saving.
    console.log('\n--- DB STATUS AFTER REGISTRATION ---');
    console.log(`New User Registered: ${newUser.name} (${newUser.phone})`);
    console.log(`Current Total Users: ${users.length}`);
    console.log('All Users in DB:', users.map(u => ({ 
        id: u.id, 
        name: u.name, 
        phone: u.phone, 
        hash: u.password_hash.substring(0, 10) + '...' // Print only first 10 chars of hash
    })));
    console.log('------------------------------------\n');
    // --- VERIFICATION LOGGING: END ---

    // 3. Return response
    res.status(201).json({ 
        message: "Registration successful!", 
        user: { id: newUser.id, name: newUser.name } 
    });
});


// Endpoint: POST /api/auth/login
// Simulates user sign-in
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    // 1. Find user
    const user = users.find(u => u.phone === phone);
    if (!user) {
        return res.status(404).json({ message: "Invalid credentials." });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
        { userId: user.id, phone: user.phone }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );
    
    res.json({ 
        message: "Login successful.", 
        token,
        user: { id: user.id, name: user.name }
    });
});

module.exports = router;