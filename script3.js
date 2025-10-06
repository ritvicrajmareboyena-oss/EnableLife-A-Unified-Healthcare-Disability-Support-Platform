let cart = [];
let history = [];

function addTest(testName, price) {
  cart.push({ test: testName, price: price });
  alert(`${testName} added to cart!`);
}

function openForm() {
  if (cart.length === 0) {
    alert("Please add at least one test before booking.");
    return;
  }

  document.getElementById("bookingForm").style.display = "flex";
  showCart();
}

function closeForm() {
  document.getElementById("bookingForm").style.display = "none";
}

function showCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    cartItemsDiv.innerHTML += `<p>${item.test} - ₹${item.price}</p>`;
    total += item.price;
  });

  document.getElementById("totalPrice").innerText = `Total: ₹${total}`;
}

document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const payment = document.getElementById("payment").value;

  const booking = {
    name,
    address,
    date,
    time,
    payment,
    tests: [...cart]
  };

  history.push(booking);
  updateHistory();

  alert("Booking Confirmed!");
  cart = []; // clear cart after booking
  closeForm();
  this.reset();
});

function updateHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  history.forEach((b, index) => {
    let testsList = b.tests.map(t => `${t.test} (₹${t.price})`).join(", ");
    let li = document.createElement("li");
    li.innerText = `${b.name} | ${testsList} | ${b.date} at ${b.time} | ${b.payment}`;
    list.appendChild(li);
  });
}
