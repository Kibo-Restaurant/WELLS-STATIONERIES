
// In fetch-stationeries.js, remove the following functions, as they’re now in cart.js:
// cleanCart

// addToCart

// removeFromCart

// updateQuantity

// clearCart

// updateCartCount

// updateCartDisplay

// cart.js
function cleanCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item =>
    item.id && item.title && item.price && item.image && typeof item.quantity === 'number'
  );
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
}

function addToCart(product, quantity = 1) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id === product.id); // String ID
  if (existingItem) {
    existingItem.quantity += quantity;
    console.log(`Updated ${product.title} quantity to ${existingItem.quantity}`);
  } else {
    cart.push({ ...product, quantity });
    console.log(`Added ${product.title} to cart with quantity ${quantity}`);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
  updateCartCount();
}

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log(`Removed item with id ${id}`);
  updateCartDisplay();
  updateCartCount();
}

function updateQuantity(id, newQuantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(item => item.id === id);
  if (item && newQuantity > 0) {
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log(`Updated item ${item.title} to quantity ${newQuantity}`);
  } else if (item && newQuantity === 0) {
    removeFromCart(id);
  }
  updateCartDisplay();
  updateCartCount();
}

function clearCart() {
  localStorage.removeItem('cart');
  console.log('Cart cleared');
  updateCartDisplay();
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.querySelector('#cart-count');
  if (countElement) {
    console.log(`Updating cart count to ${totalItems}`);
    countElement.textContent = totalItems || '0';
  }
}

function updateCartDisplay() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const validCart = cart.filter(item => item.id && item.title && item.price && item.image && typeof item.quantity === 'number');
  if (cart.length !== validCart.length) {
    localStorage.setItem('cart', JSON.stringify(validCart));
    console.warn('Cleaned invalid cart items');
  }

  const modal = document.querySelector('#cart-modal');
  if (!modal) {
    console.error('Cart modal not found');
    return;
  }

  const cartItemsContainer = modal.querySelector('#cart-items-container');
  const cartTotal = modal.querySelector('#cart-total');
  if (!cartItemsContainer || !cartTotal) {
    console.error('Cart items container or total element not found');
    return;
  }

  const total = validCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartItemsContainer.innerHTML = validCart.length === 0 ? '<p>Cart is empty</p>' : `
    <div class="cart-items">
      ${validCart
        .map(
          item => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.title}" width="50">
              <div class="cart-item-details">
                <span>${item.title}</span>
                <span>KSh ${item.price}</span>
                <div>
                  <label>Qty: </label>
                  <input type="number" value="${item.quantity || 1}" min="0" data-id="${item.id}" class="cart-quantity">
                </div>
              </div>
              <button class="cart-remove" data-id="${item.id}">Remove</button>
            </div>
          `
        )
        .join('')}
    </div>
  `;
  cartTotal.innerHTML = `<strong>Total: KSh ${total.toFixed(2)}</strong>`;

  const dropdownCart = document.querySelector('#cart-items');
  if (dropdownCart) {
    dropdownCart.innerHTML = validCart.length === 0
      ? '<p>Your cart is empty for now. Add some amazing finds!</p>'
      : `
        ${validCart
          .map(
            item => `
              <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" width="40">
                <div>
                  <span>${item.title}</span>
                  <span>KSh ${item.price} × ${item.quantity}</span>
                </div>
              </div>
            `
          )
          .join('')}
      `;
  }

  modal.querySelector('.cart-modal-close')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.querySelectorAll('.cart-remove').forEach(button => {
    button.addEventListener('click', () => {
      removeFromCart(button.dataset.id);
    });
  });

  modal.querySelectorAll('.cart-quantity').forEach(input => {
    input.addEventListener('change', () => {
      updateQuantity(input.dataset.id, parseInt(input.value));
    });
  });

  modal.querySelector('.cart-clear')?.addEventListener('click', clearCart);

  console.log('Cart display updated:', validCart);
}

