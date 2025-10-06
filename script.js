function bookNow(name) {
  alert("You booked an appointment with " + name);
}

function sendMessage(event) {
  event.preventDefault();
  alert("Thank thank you! Your message has been sent.");
}

// REMOVED: function searchMedicine() {}

// =======================================================
// === BACKEND CONFIGURATION ===
// =======================================================

const API_BASE_URL = 'http://localhost:3000/api';


// =======================================================
// === INPUT MASKING UTILITIES ===
// =======================================================

function formatCardNumber(event) {
    let input = event.target;
    // 1. Remove all non-digits (including spaces)
    let value = input.value.replace(/\D/g, ''); 
    let formattedValue = '';
    
    // 2. Insert space every 4 digits
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    // 3. Limit to 19 characters (16 digits + 3 spaces)
    input.value = formattedValue.slice(0, 19);
}

function formatExpiryDate(event) {
    let input = event.target;
    // 1. Remove non-digits and existing separators (space/slash/space)
    let value = input.value.replace(/\s\/\s/g, '').replace(/\D/g, ''); 
    let formattedValue = '';
    
    if (value.length > 0) {
        formattedValue += value.substring(0, 2); // MM
    }
    
    if (value.length >= 3) {
        formattedValue += ' / '; // Space / Space separator inserted automatically
        formattedValue += value.substring(2, 4); // YY
    }
    
    // 3. Limit to 7 characters (MM / YY)
    input.value = formattedValue.slice(0, 7);
}


// =======================================================
// === CORE CART SYSTEM LOGIC (Still Local for UX) ===
// =======================================================
let cart = JSON.parse(localStorage.getItem("cart")) || []; // Cart now stores unique items with a 'quantity'
let total = parseInt(localStorage.getItem("total")) || 0; // Total is derived from cart items

// Image mapping for cart display (All image paths use "Images/...")
const medicineImages = {
  "Paracetamol": "Images/medicine1.jpeg",
  "Insulin": "Images/medicine2.jpeg",
  "Pain Relief Gel": "Images/medicine3.jpeg",
  "Cough Syrup": "Images/medicine4.jpeg",
  "Vitamin C Tablets": "Images/medicine5.jpeg",
  "Antiseptic Cream": "Images/medicine6.jpeg"
};

// Mapping for short product descriptions
const medicineDescriptions = {
  "Paracetamol": "Fever & Pain Relief",
  "Insulin": "Diabetes Management",
  "Pain Relief Gel": "Muscle & Joint Aid",
  "Cough Syrup": "Soothes Dry Cough",
  "Vitamin C Tablets": "Immunity Booster",
  "Antiseptic Cream": "Wound & Rash Care"
};

function saveCart() {
  // Recalculate and save total
  total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("total", total);
}

function updateMedicinePageQuantities() {
  const medicineCards = document.querySelectorAll("#medicine-list .card");
  
  // Create a map for quick lookup: { name: quantity }
  const cartQuantities = {};
  cart.forEach(item => {
    cartQuantities[item.name] = item.quantity;
  });

  medicineCards.forEach(card => {
    const name = card.getAttribute("data-name");
    const quantity = cartQuantities[name] || 0;
    
    let button = card.querySelector('button');
    if (button) {
      if (quantity > 0) {
        // Update button content to show quantity and 'Add More'
        button.innerHTML = `<span class="quantity-badge">[${quantity}]</span> Add More`;
      } else {
        // Reset button text
        button.textContent = "Add to Cart";
      }
    }
  });
}

function addToCart(name, price) {
  // Ensure price is treated as a number
  price = parseInt(price);
  
  // Check if item already exists in the cart
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Add new item with quantity 1
    cart.push({ name, price, quantity: 1 });
  }

  saveCart();
  updateCart();
  // Update quantities on the medicine page
  updateMedicinePageQuantities(); 
}

function updateQuantity(name, change) {
  const itemIndex = cart.findIndex(item => item.name === name);

  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      // Remove item if quantity drops to 0 or less
      cart.splice(itemIndex, 1);
    }
    
    saveCart();
    updateCart();
    // Update quantities on the medicine page
    updateMedicinePageQuantities(); 
  }
}


function updateCart() {
  let cartList = document.getElementById("cartItems");
  let cartTotal = document.getElementById("cartTotal");
  let navCartCount = document.getElementById("cart-item-count");

  // Calculate Total Quantity (summing the 'quantity' field for all unique items)
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // UPDATE NAV BAR COUNT
  if (navCartCount) {
      navCartCount.textContent = totalQuantity > 0 ? ` (${totalQuantity})` : '';
  }


  if (cartList && cartTotal) {
    cartList.innerHTML = ""; // Clear existing items
    
    if (cart.length === 0) {
      cartList.innerHTML = "<p style='text-align:center; padding: 20px; color: #555;'>Your cart is empty.</p>";
    } else {
      cart.forEach(item => {
        let li = document.createElement("li");
        li.className = "product-item-wrapper";

        // Logic to determine image source for both medicine and surgical items
        let imgSrc = medicineImages[item.name] || (
            item.name.includes('Wheelchair') ? 'Images/wheelchair.jpeg' :
            item.name.includes('Crutches') ? 'Images/crutches.jpeg' :
            item.name.includes('Walker') ? 'Images/walker.jpeg' :
            item.name.includes('Bed') ? 'Images/bed-rail.jpeg' :
            item.name.includes('Gloves') ? 'Images/gloves.jpeg' :
            item.name.includes('Aid') ? 'Images/first-aid.jpeg' :
            'https://via.placeholder.com/80x80/6A11CB/FFFFFF?text=Product'
        );

        const productDescription = medicineDescriptions[item.name] || 'Surgical Item';
        const itemSubtotal = item.price * item.quantity;
        
        // Construct the new horizontal HTML structure with +/- buttons
        li.innerHTML = `
          <div class="product-item">
            <img src="${imgSrc}" alt="${item.name}">
            <div class="product-info">
              <h3>${item.name}</h3>
              <p>${productDescription}</p>
              
              <div class="quantity-controls">
                  <button onclick="updateQuantity('${item.name}', -1)">-</button>
                  <span class="quantity-value">${item.quantity}</span>
                  <button onclick="updateQuantity('${item.name}', 1)">+</button>
              </div>
            </div>
            
            <div class="product-price">₹${itemSubtotal}</div>
          </div>
        `;
        cartList.appendChild(li);
      });
    }

    // Update the final total derived from saveCart()
    cartTotal.textContent = total;
  }
}

function displayOrderSummary() {
  const summaryList = document.getElementById("orderSummaryList");
  const finalTotal = document.getElementById("finalTotal");
  
  if (!summaryList || !finalTotal) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = parseInt(localStorage.getItem("total")) || 0;

  summaryList.innerHTML = '';
  
  if (cart.length === 0) {
    summaryList.innerHTML = "<p style='padding: 10px; text-align: center;'>Your cart is empty. Please return to the cart page.</p>";
    finalTotal.textContent = '0';
    return;
  }

  cart.forEach(item => {
    const li = document.createElement("li");
    const itemSubtotal = item.price * item.quantity;
    
    li.className = 'summary-item';
    li.innerHTML = `
      <span class="item-name">${item.name} (x${item.quantity})</span>
      <span class="item-subtotal">₹${itemSubtotal}</span>
    `;
    summaryList.appendChild(li);
  });

  finalTotal.textContent = total;
}


function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    total = 0;
    saveCart();
    updateCart();
    // Update the medicine page too
    updateMedicinePageQuantities(); 
    alert("Cart cleared!");
  }
}


// =======================================================
// === GLOBAL SEARCH & FILTER LOGIC ===
// =======================================================

// Global Lists for Search Logic
const searchableProducts = ["paracetamol", "insulin", "pain relief gel", "cough syrup", "vitamin c", "antiseptic cream"];
const searchableSurgical = ["wheelchair", "crutches", "walker", "bed assist rails", "surgical gloves", "first aid kits"];
const searchableDoctors = ["ramesh", "orthopedic", "priya", "neurologist", "arun", "rehabilitation", "meera", "physiotherapist"];
const searchablePhysio = ["john", "paralysis", "sneha", "post-surgery", "rajesh", "sports injury", "ananya", "geriatric"];

function globalSearch() {
    const query = document.getElementById('globalSearchBar').value.trim().toLowerCase();
    if (!query) return;

    // Check Categories
    const isMedicine = searchableProducts.some(p => p.includes(query));
    const isSurgical = searchableSurgical.some(s => s.includes(query));
    const isDoctor = searchableDoctors.some(d => d.includes(query));
    const isPhysio = searchablePhysio.some(p => p.includes(query));

    // Store query for target page filtering
    localStorage.setItem('globalSearchQuery', query);

    // Redirection Logic
    if (isMedicine) {
        window.location.href = 'medicine.html';
    } else if (isSurgical) {
        window.location.href = 'surgical.html';
    } else if (isDoctor) {
        window.location.href = 'doctors.html';
    } else if (isPhysio) {
        window.location.href = 'physiotherapy.html';
    } else {
        // Default to medicine page if query is generic
        window.location.href = 'medicine.html'; 
    }
}

function applyGlobalSearchFilter() {
    const query = localStorage.getItem('globalSearchQuery');
    if (query) {
        const currentPage = window.location.pathname.split('/').pop();
        let listId;
        
        if (currentPage === 'medicine.html') {
            listId = 'medicine-list';
            
        } else if (currentPage === 'surgical.html' || currentPage === 'doctors.html' || currentPage === 'physiotherapy.html') {
            listId = 'card-list';
        }
        
        const listElement = document.getElementById(listId);
        
        if (listElement) {
             const cards = listElement.querySelectorAll('.card');
             let resultsFound = false;

             cards.forEach(card => {
                // Search in card title, description, and data-name attribute
                const cardText = card.textContent.toLowerCase() + (card.getAttribute('data-name') || '').toLowerCase();
                
                if (cardText.includes(query)) {
                    card.style.display = 'block';
                    resultsFound = true;
                } else {
                    card.style.display = 'none';
                }
             });
             
             if (!resultsFound) {
                 console.log(`No results found for "${query}" on this page.`);
             }
        }
        
        // Clear query after application
        localStorage.removeItem('globalSearchQuery');
    }
}


// =======================================================
// === PRODUCT LOADING (API INTEGRATION) ===
// =======================================================

async function loadProducts(pageType) {
    const listElement = document.getElementById('medicine-list') || document.getElementById('card-list');
    if (!listElement) return;

    listElement.innerHTML = '<p style="text-align:center;">Loading products...</p>';

    try {
        // Fetch all products
        const response = await fetch(`${API_BASE_URL}/products`);
        const allProducts = await response.json();
        
        // Filter products based on the current page context
        const filteredProducts = allProducts.filter(p => 
            pageType === 'medicine' ? p.category === 'Medicine' : p.category === 'Surgical'
        );

        listElement.innerHTML = ''; // Clear 'Loading...' message

        filteredProducts.forEach(product => {
            // Mapping Logic (Replaces hardcoded HTML content)
            const nameKey = product.name.split(' ')[0]; 
            const imgSrc = medicineImages[product.name] || ( // Check full name first
                product.name.includes('Wheelchair') ? 'Images/wheelchair.jpeg' :
                product.name.includes('Crutches') ? 'Images/crutches.jpeg' :
                product.name.includes('Walker') ? 'Images/walker.jpeg' :
                product.name.includes('Bed') ? 'Images/bed-rail.jpeg' :
                product.name.includes('Gloves') ? 'Images/gloves.jpeg' :
                product.name.includes('Aid') ? 'Images/first-aid.jpeg' :
                (medicineImages[nameKey] || 'Images/medicine.jpeg')
            );
            
            // FIX APPLIED HERE: Removed inline 'onclick' and added class + data attributes 
            const cardHtml = `
                <div class="card" data-name="${product.name}" data-id="${product.id}">
                    <img src="${imgSrc}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>₹${product.price}</p>
                    <button class="add-to-cart-btn" data-product-name="${product.name}" data-product-price="${product.price}">Add to Cart</button>
                </div>
            `;
            listElement.innerHTML += cardHtml;
        });
        
        // After loading, ensure cart quantities are displayed on the buttons
        updateMedicinePageQuantities();

    } catch (error) {
        listElement.innerHTML = '<p style="text-align:center; color:red;">Failed to load products. Check backend server on port 3000.</p>';
        console.error("Error loading products:", error);
    }
}


// =======================================================
// === EVENT DELEGATION (FIX FOR ADD TO CART) ===
// =======================================================

// NEW BLOCK ADDED: This catches clicks on the dynamically generated buttons
document.addEventListener('click', function(event) {
    // 1. Check if the clicked element has the class 'add-to-cart-btn'
    if (event.target && event.target.classList.contains('add-to-cart-btn')) {
        
        event.preventDefault(); 
        
        // 2. Get the data from the custom data attributes
        const name = event.target.getAttribute('data-product-name');
        const price = event.target.getAttribute('data-product-price');
        
        // Log for debugging
        console.log(`--- ADD TO CART CAUGHT --- Name: ${name}, Price: ${price}`);
        
        // 3. Call the original addToCart function
        if (name && price) {
            addToCart(name, parseInt(price));
        }
    }
});
// =======================================================


// =======================================================
// === PAYMENT & CHECKOUT LOGIC (API INTEGRATION) ===
// =======================================================

let currentOrderDetails = {};

// NEW FUNCTION: Closes the payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        // You might add logic here to cancel UPI/Card process if it's ongoing
    }
}

function handlePaymentConfirmation() {
    // 1. Clear the cart data
    cart = [];
    total = 0;
    saveCart();

    // 2. Display the final confirmation screen in the modal
    const modalTitle = document.getElementById('paymentModalTitle');
    const paymentContent = document.getElementById('paymentContent');
    const modalActions = document.getElementById('modalActions');
    
    const deliveryDate = currentOrderDetails.estimatedDelivery;
    const paymentMethod = currentOrderDetails.payment_method;
    const totalAmount = currentOrderDetails.total_amount;
    
    modalTitle.textContent = "Order Confirmed!";
    
    paymentContent.innerHTML = `
        <span class="confirmation-icon">✅</span>
        <p style="font-size: 1.2rem; color: #333;">Thank you for your order!</p>
        <div class="confirmation-details">
            <p><strong>Order Total:</strong> ₹${totalAmount}</p>
            <p><strong>Payment Status:</strong> Successful</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Estimated Delivery:</strong> ${deliveryDate}</p>
        </div>
    `;
    
    modalActions.innerHTML = `
        <button class="btn" onclick="window.location.href='orders.html'">Go to My Orders</button>
    `;
}

function processCardPayment(event) {
    event.preventDefault();
    const modalTitle = document.getElementById('paymentModalTitle');
    const paymentContent = document.getElementById('paymentContent');
    
    // Simulate card validation/processing
    modalTitle.textContent = "Processing Card...";
    paymentContent.innerHTML = `
        <p style="color: #6a0dad;">Validating card details...</p>
        <div class="loading-bar"><div id="paymentProgress"></div></div>
    `;

    // Simulate 3 second payment delay
    let progress = 0;
    const interval = setInterval(() => {
        progress += 33.33; // Simulate 3 steps for 3 seconds
        document.getElementById('paymentProgress').style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            handlePaymentConfirmation();
        }
    }, 1000); // 1 second interval
}

function showPaymentModal(paymentMethod, order) {
    currentOrderDetails = order; // Store order globally for confirmation step
    
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('paymentModalTitle');
    const paymentContent = document.getElementById('paymentContent');
    const modalActions = document.getElementById('modalActions');
    
    modal.style.display = 'block';
    modalActions.innerHTML = '';
    
    const totalAmount = order.total_amount;
    const estimatedDelivery = order.estimatedDelivery;

    if (paymentMethod === 'COD') {
        modalTitle.textContent = "Cash on Delivery Confirmation";
        paymentContent.innerHTML = `
            <span class="confirmation-icon">📦</span>
            <p style="font-size: 1.1rem;">Your order is ready to be placed!</p>
            <p style="margin-top: 10px;">Please have <strong>₹${totalAmount}</strong> ready at the time of delivery.</p>
            <p style="font-size: 0.85rem; color: #5cb85c; margin-top: 15px;">Estimated Delivery: ${estimatedDelivery}</p>
        `;
        modalActions.innerHTML = `
            <button class="btn" style="background-color: #5cb85c;" onclick="handlePaymentConfirmation()">Confirm COD Order</button>
        `;
        
    } else if (paymentMethod === 'UPI') {
        modalTitle.textContent = "Scan to Pay (UPI/QR Code)";
        paymentContent.innerHTML = `
            <p style="font-size: 1.1rem; color: #333;">Pay <strong>₹${totalAmount}</strong> using your UPI app.</p>
            <div class="qr-code">
                <img src="Images/qr code.jpeg" alt="QR Code for Payment" style="width: 100%; height: 100%; border: none;"/>
            </div>
            <p style="color: #ff7e5f;">Waiting for payment confirmation...</p>
            <div class="loading-bar"><div id="paymentProgress"></div></div>
        `;
        
        // Simulate successful payment after 10 seconds
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            document.getElementById('paymentProgress').style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                handlePaymentConfirmation();
            }
        }, 1000); // 10 seconds total delay (10 intervals * 1000ms)

    } else if (paymentMethod === 'Card') {
        modalTitle.textContent = "Enter Card Details";
        paymentContent.innerHTML = `
            <form id="cardForm" onsubmit="processCardPayment(event)">
                <input type="text" 
                       placeholder="XXXX XXXX XXXX XXXX" 
                       required 
                       oninput="formatCardNumber(event)"
                       maxlength="19"
                       title="Card number must be 16 digits">
                <input type="text" placeholder="Card Holder Name" required>
                <div style="display: flex; gap: 10px;">
                    <input type="text" 
                           placeholder="MM / YY" 
                           required 
                           oninput="formatExpiryDate(event)"
                           maxlength="7"
                           title="Format must be MM / YY (e.g., 06 / 26)">
                    <input type="password" 
                           placeholder="CVV" 
                           required 
                           pattern="[0-9]{3,4}"
                           minlength="3" 
                           maxlength="4"
                           title="3 or 4 digit security code">
                </div>
                <button type="submit" class="btn">Submit & Pay ₹${totalAmount}</button>
            </form>
        `;
        modalActions.innerHTML = `<p style="font-size:0.8rem; color:#888;"><button class="btn" style="background-color: gray; margin-top: 10px;" onclick="closePaymentModal()">Cancel Payment</button></p>`;
    }
}


function placeOrder(event) {
  event.preventDefault();
  
  // --- 1. Get Authentication Token & Data ---
  const userToken = localStorage.getItem('userToken');
  if (!userToken) {
      alert("Please log in before placing an order.");
      window.location.href = 'login.html';
      return;
  }
  
  // --- 2. Gather Form Data ---
  const delivery_name = document.getElementById("name").value;
  const delivery_address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;
  const paymentMethod = document.getElementById("payment").value;

  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before placing an order.");
    return;
  }

  // --- 3. Format Cart Items for API ---
  // NOTE: You must match the product IDs used in the mock backend data (101, 102, 103, 104, etc.)
  const apiItems = cart.map(item => ({
      // Temporary mapping based on mock data in the backend's data.js
      id: item.name.includes('Paracetamol') ? 101 : 
          item.name.includes('Insulin') ? 102 : 
          item.name.includes('Wheelchair') ? 103 : 
          item.name.includes('Crutches') ? 104 : 0, // 0 is a placeholder for unmapped items
      name: item.name,
      quantity: item.quantity
  }));
  
  const orderData = {
      items: apiItems, // Send the formatted cart items with IDs and quantity
      delivery_name,
      delivery_address,
      phone,
      payment_method: paymentMethod,
      total_amount: total 
  };
  
  // --- 4. Call the Backend API to Place Order ---
  fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          // Send the JWT Token for Authorization
          'Authorization': `Bearer ${userToken}` 
      },
      body: JSON.stringify(orderData)
  })
  .then(response => response.json().then(data => ({ status: response.status, body: data })))
  .then(({ status, body }) => {
      if (status === 201) {
          // Success: The order is recorded in the database. Proceed to payment modal/confirmation
          const order = { ...orderData, total_amount: orderData.total_amount, estimatedDelivery: "5-7 business days" };
          showPaymentModal(paymentMethod, order);
      } else if (status === 401 || status === 403) {
           alert(`Session expired. Please log in again. (${body.message})`);
           window.location.href = 'login.html';
      } else {
          alert(`Order Failed: ${body.message || 'An unknown error occurred. Check stock/product ID mapping.'}`);
      }
  })
  .catch(error => {
      console.error('Network Error:', error);
      alert('Network error placing order. Is the server running on port 3000?');
  });

}

// =======================================================
// === ORDER TRACKING FUNCTIONS (API INTEGRATION) ===
// =======================================================

async function loadOrders() {
    let orderList = document.getElementById("orderList");
    if (!orderList) return;

    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        orderList.innerHTML = "<p>Please <a href='login.html'>log in</a> to view your orders.</p>";
        return;
    }
    
    orderList.innerHTML = "<p style='text-align:center;'>Fetching order history...</p>";

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        const orders = await response.json();
        
        orderList.innerHTML = "";
        
        if (orders.length === 0) {
            orderList.innerHTML = "<p>No orders yet.</p>";
            return;
        }

        orders.forEach((order, index) => {
            let li = document.createElement("li");
            
            // Map the items array for display
            const itemDetails = order.items.map(i => 
                `${i.name} (x${i.quantity})`
            ).join(", ");
            
            li.innerHTML = `
                <strong>Order #${order.id}</strong> <br>
                Date: ${new Date(order.order_date).toLocaleString()} <br>
                Name: ${order.delivery_name} <br>
                Address: ${order.delivery_address} <br>
                Payment: ${order.payment_method} <br>
                Items: ${itemDetails} <br>
                <strong>Total: ₹${order.total_amount}</strong> <br>
                <span class="status ${order.status.toLowerCase()}">Status: ${order.status}</span> <br>
                <em>Estimated Delivery: 5-7 business days</em> <br>
                <button onclick="alert('This feature needs a dedicated API endpoint (PUT /api/orders/${order.id}/status) to update the backend.')">Update Status (Local Simulation)</button>
                ${order.status === "Processing" ? `<button onclick="alert('This feature needs a dedicated API endpoint (DELETE /api/orders/${order.id}) to update the backend.')" class="cancel-btn">Cancel Order (Local Simulation)</button>` : ""}
                <hr>
            `;
            orderList.appendChild(li);
        });

    } catch (error) {
        orderList.innerHTML = '<p style="text-align:center; color:red;">Error fetching orders. Please check network/login status.</p>';
        console.error("Error loading orders:", error);
    }
}

// Final Initialization Block: Ensures all necessary page-specific logic runs after the script is loaded.

// 1. Global initializations (affects cart badge in medicine, etc.)
updateCart();
updateMedicinePageQuantities();
applyGlobalSearchFilter(); // Apply filter on page load

// 2. Check for the product pages and load products from API
const currentPagePath = window.location.pathname.split('/').pop();
if (currentPagePath === 'medicine.html') {
    loadProducts('medicine');
} else if (currentPagePath === 'surgical.html') {
    loadProducts('surgical');
}


// 3. Click-Outside Modal Handler for the checkout page
if (document.getElementById("paymentModal")) {
    window.onclick = function(event) {
        const modal = document.getElementById('paymentModal');
        // Check if the clicked element is the modal backdrop
        if (event.target === modal) {
            closePaymentModal();
        }
    };
}


// 4. Check for the orders page and load orders
if (document.getElementById("orderList")) {
    loadOrders();
}

// 5. Check for the checkout page and display summary
if (document.getElementById("orderSummaryList")) {
    displayOrderSummary();
}