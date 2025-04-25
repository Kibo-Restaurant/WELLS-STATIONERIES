// cart.js
// Validate and clean cart
function cleanCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item =>
      item.id && item.title && item.price && item.image && typeof item.quantity === 'number'
    );
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  }
  
  // Add item to cart in Local Storage
  function addToCart(product, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
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
  
  // Remove item from cart
  function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log(`Removed item with id ${id}`);
    updateCartDisplay();
    updateCartCount();
  }
  
  // Update item quantity
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
  
  // Clear cart
  function clearCart() {
    localStorage.removeItem('cart');
    console.log('Cart cleared');
    updateCartDisplay();
    updateCartCount();
  }
  
  // Update cart count in UI
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.querySelector('#cart-count');
    if (countElement) countElement.textContent = totalItems || '0';
  }
  
  // Display cart in modal and dropdown
  function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const validCart = cart.filter(item => item.id && item.title && item.price && item.image && typeof item.quantity === 'number');
    if (cart.length !== validCart.length) {
      localStorage.setItem('cart', JSON.stringify(validCart));
      console.warn('Cleaned invalid cart items');
    }
  
    // Update modal
    let modal = document.querySelector('#cart-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cart-modal';
      document.body.appendChild(modal);
    }
  
    const total = validCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    modal.innerHTML = `
      <div class="cart-modal-content">
        <h2>Your Cart</h2>
        <button class="cart-modal-close">Close</button>
        ${validCart.length === 0 ? '<p>Cart is empty</p>' : `
          <div class="cart-items">
            ${validCart.map(item => `
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
            `).join('')}
          </div>
          <p><strong>Total: KSh ${total.toFixed(2)}</strong></p>
          <button class="cart-clear">Clear Cart</button>
          <a href="checkout.html" class="btn btn-primary mt-2">Proceed to Checkout</a>
        `}
      </div>
    `;
  
    // Update dropdown
    const dropdownCart = document.querySelector('#cart-items');
    if (dropdownCart) {
      dropdownCart.innerHTML = validCart.length === 0 ? '<p>Your cart is empty for now. Add some amazing finds!</p>' : `
        ${validCart.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" width="40">
            <div>
              <span>${item.title}</span>
              <span>KSh ${item.price} × ${item.quantity}</span>
            </div>
          </div>
        `).join('')}
      `;
    }
  
    // Event listeners for modal actions
    modal.querySelector('.cart-modal-close')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    modal.querySelectorAll('.cart-remove').forEach(button => {
      button.addEventListener('click', () => {
        removeFromCart(parseInt(button.dataset.id));
      });
    });
  
    modal.querySelectorAll('.cart-quantity').forEach(input => {
      input.addEventListener('change', () => {
        updateQuantity(parseInt(input.dataset.id), parseInt(input.value));
      });
    });
  
    modal.querySelector('.cart-clear')?.addEventListener('click', clearCart);
  }