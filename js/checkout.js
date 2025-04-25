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

  async function displayCheckout() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const checkoutCart = document.querySelector('#checkout-cart');
    const descriptionDiv = document.querySelector('#book-description');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (productId) {
      // Single-product view
      const product = await fetchProductById(productId);
      if (product) {
        const isInCart = cart.find(item => item.id === product.id);
        checkoutCart.innerHTML = `
          <div class="single-product">
            <div class="row">
              <div class="col-12 col-md-6">
                <img src="${product.image}" alt="${product.title}" class="img-fluid rounded" style="max-height: 300px; object-fit: cover;">
              </div>
              <div class="col-12 col-md-6">
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

        // Add to cart from single-product view
        document.querySelector('.add-to-cart-single')?.addEventListener('click', () => {
          const productData = {
            id: parseInt(product.id),
            title: product.title,
            price: parseFloat(product.price),
            image: product.image
          };
          addToCart(productData, 1);
          window.location.href = 'checkout.html'; // Reload to show cart
        });
      } else {
        checkoutCart.innerHTML = '<p>Product not found. <a href="index.html">Shop now</a>.</p>';
        descriptionDiv.innerHTML = '';
      }
    } else {
      // Cart view
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      checkoutCart.innerHTML = cart.length === 0 ? '<p>Your cart is empty. <a href="index.html">Shop now</a>.</p>' : `
        <div class="cart-items">
          ${cart.map(item => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.title}" width="60">
              <div class="cart-item-details">
                <span>${item.title}</span>
                <span>KSh ${item.price} × ${item.quantity}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <p><strong>Total: KSh ${total.toFixed(2)}</strong></p>
      `;
      descriptionDiv.innerHTML = '';
    }
  }

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
  }

  document.querySelector('#complete-checkout')?.addEventListener('click', () => {
    localStorage.removeItem('cart');
    alert('Checkout complete! (Pesapal integration pending)');
    window.location.href = 'index.html';
  });

  displayCheckout();