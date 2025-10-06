// data.js - Mock Database Simulation

// Helper to generate unique IDs
let nextUserId = 1;
let nextProductId = 101; // Start Product IDs from 101
let nextOrderId = 1001;

// --- MOCK DATABASE TABLES ---

// A. Users Table (Simulating users table)
const users = [];

// B. Products/Inventory Table (Simulating products table)
const products = [
  // --- MEDICINES (6 Items, IDs 101 through 106) ---
  { id: nextProductId++, name: "Paracetamol", price: 50, category: "Medicine", stock: 500 },
  { id: nextProductId++, name: "Insulin", price: 200, category: "Medicine", stock: 500 },
  { id: nextProductId++, name: "Pain Relief Gel", price: 150, category: "Medicine", stock: 500 },
  { id: nextProductId++, name: "Cough Syrup", price: 120, category: "Medicine", stock: 500 },
  { id: nextProductId++, name: "Vitamin C Tablets", price: 90, category: "Medicine", stock: 500 },
  { id: nextProductId++, name: "Antiseptic Cream", price: 110, category: "Medicine", stock: 500 },

  // --- SURGICAL ITEMS (6 Items, IDs 107 through 112) ---
  { id: nextProductId++, name: "Regular Wheelchair", price: 5823, category: "Surgical", stock: 500 },
  { id: nextProductId++, name: "Adjustable Forearm Crutches", price: 1500, category: "Surgical", stock: 500 },
  { id: nextProductId++, name: "Standard Folding Walker", price: 1200, category: "Surgical", stock: 500 },
  { id: nextProductId++, name: "Home Bed Safety Rail", price: 2500, category: "Surgical", stock: 500 },
  { id: nextProductId++, name: "Disposable Nitrile Gloves", price: 750, category: "Surgical", stock: 500 },
  { id: nextProductId++, name: "Essential Home First Aid Kit", price: 800, category: "Surgical", stock: 500 },
];

// C. Orders Table (Simulating orders table)
const orders = [];

// D. Providers Table (Simulating providers for Doctors/Services)
const providers = [
    { id: 1, name: "Dr. Ramesh", specialty: "Orthopedic", type: "Doctor", base_price: 1000 },
    { id: 2, name: "Ambulance Service", specialty: "Emergency", type: "Transport", base_price: 1500 }
];

// E. Bookings Table (Simulating bookings table)
const bookings = [];


module.exports = {
    users,
    products,
    orders,
    providers,
    bookings,
    getNextUserId: () => nextUserId++,
    getNextOrderId: () => nextOrderId++
};