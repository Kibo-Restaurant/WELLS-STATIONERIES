document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  (function() {
    emailjs.init("cc0diK9qLfB5KEdMn");
  })();

   // Initialize GLightbox
   const lightbox = GLightbox({
    selector: '.glightbox', // Targets both static and dynamic images
    touchNavigation: true,
    loop: true,
    zoomable: true,
    autoplayVideos: true
  });

  // Fetch product by ID from JSON
  async function fetchProductById(id) {
    try {
      const response = await fetch('json/products.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      for (const category of Object.values(data.textbooks)) {
        const product = category.find(item => item.id === id);
        if (product) return product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Add item to cart in Local Storage
  function addToCart(product, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    const cartItem = {
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.image,
      quantity: quantity
    };

    if (existingItem) {
      existingItem.quantity += quantity;
      console.log(`Updated ${product.title} quantity to ${existingItem.quantity}`);
    } else {
      cart.push(cartItem);
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
    displayCartModal(); // Refresh modal
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
    displayCartModal(); // Refresh modal
  }

  // Clear cart
  function clearCart() {
    localStorage.removeItem('cart');
    console.log('Cart cleared');
    updateCartDisplay();
    updateCartCount();
    displayCartModal(); // Refresh modal
  }

  // Update cart count in navbar
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.querySelector('#cart-count');
    if (countElement) {
      console.log(`Updating cart count to ${totalItems}`);
      countElement.textContent = totalItems || '0';
    }
  }

  // Update cart dropdown UI
  function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const dropdownCart = document.querySelector('#cart-items');
    if (dropdownCart) {
      console.log(`Cart items: ${cart.length}`);
      dropdownCart.innerHTML = cart.length === 0 ? '<p>Your cart is empty for now. Add some amazing finds!</p>' : `
        ${cart.map(item => `
          <div class="cart-item">
            
            <a href="${item.image}" class="glightbox" data-gallery="cart-gallery">
              <img src="${item.image}" alt="${item.title}" width="80">
            </a>
            <div>
              <span>${item.title}</span>
              <span>KSh ${item.price} × ${item.quantity}</span>
            </div>
          </div>
        `).join('')}
      `;
    }
  }

  // Display cart modal
  function displayCartModal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let modal = document.querySelector('#cart-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cart-modal';
      document.body.appendChild(modal);
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    modal.innerHTML = `
      <div class="cart-modal-content">
        <h2>Your Cart</h2>
        <button class="cart-modal-close">Close</button>
        ${cart.length === 0 ? '<p>Cart is empty</p>' : `
          <div class="cart-items">
            ${cart.map(item => `
              <div class="cart-item">
             
                 <a href="${item.image}" class="glightbox" data-gallery="cart-modal-gallery">
                  <img src="${item.image}" alt="${item.title}" width="80">
                </a>
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
    modal.style.display = 'block'; // Show modal

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

  // Display checkout (single product or cart view)
  async function displayCheckout() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const checkoutCart = document.querySelector('#checkout-cart');
    const descriptionDiv = document.querySelector('#book-description');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalSpan = document.querySelector('#cart-total span');

    if (productId) {
      // Single-product view
      const product = await fetchProductById(productId);
      if (product) {
        const isInCart = cart.find(item => item.id === product.id);
        checkoutCart.innerHTML = `
          <div class="cart-items">
            <div class="cart-item">
                <a href="${product.image}" class="glightbox" data-gallery="single-product">
                <img src="${product.image}" alt="${product.title}" class="img-fluid" style="max-height: 200px; object-fit: cover;">
              </a>
              <div class="cart-item-details">
                <h3>${product.title}</h3>
                <p><strong>Author:</strong> ${product.author || 'Unknown'}</p>
                <p><strong>Price:</strong> KSh ${product.price}</p>
                <button class="btn btn-primary add-to-cart-single" data-product-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">
                  ${isInCart ? `Update Cart (Qty: ${isInCart.quantity})` : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        `;
        descriptionDiv.innerHTML = '<p>Description will be available soon after approval.</p>';
        totalSpan.textContent = product.price.toFixed(2);

        document.querySelector('.add-to-cart-single')?.addEventListener('click', () => {
          const productData = {
            id: parseInt(product.id),
            title: product.title,
            price: parseFloat(product.price),
            image: product.image
          };
          addToCart(productData, 1);
          window.location.href = 'checkout.html';
        });
      } else {
        checkoutCart.innerHTML = '<p>Product not found. <a href="index.html">Shop now</a>.</p>';
        descriptionDiv.innerHTML = '';
        totalSpan.textContent = '0.00';
      }
    } else {
      // Cart view
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      checkoutCart.innerHTML = cart.length === 0 ? '<p>Your cart is empty. <a href="index.html#textbooks">Shop now</a>.</p>' : `
        <div class="cart-items">
          ${cart.map(item => `
            <div class="cart-item">
              
               <a href="${item.image}" class="glightbox" data-gallery="cart-gallery">
                <img src="${item.image}" alt="${item.title}" width="80">
              </a>
              <div class="cart-item-details">
                <span>${item.title}</span>
                <span>KSh ${item.price} × ${item.quantity}</span>
                <button type="button" class="remove-from-cart" data-product-id="${item.id}">Remove item</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      descriptionDiv.innerHTML = '';
      totalSpan.textContent = total.toFixed(2);

      // Add event listeners for remove buttons
      document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', () => {
          const productId = parseInt(button.dataset.productId);
          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          cart = cart.filter(item => item.id !== productId);
          localStorage.setItem('cart', JSON.stringify(cart));
          console.log(`Removed item with ID ${productId}`);
          updateCartDisplay();
          updateCartCount();
          displayCheckout();
        });
      });
        // Reinitialize GLightbox for cart view
        lightbox.reload(); 
    }

    // Add event listener for View Cart button
    document.querySelector('#view-cart')?.addEventListener('click', () => {
      displayCartModal();
    });
  }

  // Handle checkout with EmailJS
  document.querySelector('#checkout-form')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const county = document.querySelector('#county').value;
    if (!county) {
      alert('Please select your county before proceeding!');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const orderDetails = cart.map(item =>
      `Item: ${item.title}, Quantity: ${item.quantity}, Price: KSh ${item.price}, Subtotal: KSh ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    const message = `Order Details:\n${orderDetails}\n\nTotal: KSh ${total}\n\nCounty: ${county}`;

    const confirmCheckout = confirm(`Your total is KSh ${total}. An email with your order and county will be sent to Paywells. You will then choose your payment method. Proceed?`);
    if (!confirmCheckout) return;

    console.log('Attempting to send email with:', { subject: `New Order (Total: KSh ${total}, County: ${county})`, message });
    emailjs.send("service_0m8t3pa", "template_con1jhf", {
      subject: `New Order (Total: KSh ${total}, County: ${county})`,
      message: message
    }).then(function(response) {
      console.log('Order email sent successfully!', response);
      window.location.href = 'choose-payment.html';
    }, function(error) {
      console.error('Failed to send order email:', error);
      alert('Failed to send order details. Please try again or contact support.');
    });
  });

  // Initialize checkout
  displayCheckout();
});