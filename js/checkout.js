
// Ensure EmailJS script is loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  (function() {
    emailjs.init("cc0diK9qLfB5KEdMn"); // Your EmailJS public key
  })();

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
          <div class="single-product">
            <div class="row">
              <div class="col-12 col-md-6 single-product">
                <img src="${product.image}" alt="${product.title}" class="img-fluid rounded" style="max-height: 400px; object-fit: cover;">
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
      `;
      descriptionDiv.innerHTML = '';
      totalSpan.textContent = total.toFixed(2);
    }
  }

  // Handle checkout with EmailJS
  document.querySelector('#checkout-form')?.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

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

    // Format order details for email
    const orderDetails = cart.map(item => 
      `Item: ${item.title}, Quantity: ${item.quantity}, Price: KSh ${item.price}, Subtotal: KSh ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    const message = `Order Details:\n${orderDetails}\n\nTotal: KSh ${total}\n\nCounty: ${county}`;

    // Confirm total before sending
    const confirmCheckout = confirm(`Your total is KSh ${total}. An email with your order and county will be sent to Paywells. You will then choose your payment method. Proceed?`);
    if (!confirmCheckout) return;

    // Send order details via EmailJS
    console.log('Attempting to send email with:', { subject: `New Order (Total: KSh ${total}, County: ${county})`, message });
    emailjs.send("service_0m8t3pa", "template_con1jhf", {
      subject: `New Order (Total: KSh ${total}, County: ${county})`,
      message: message
    }).then(function(response) {
      console.log('Order email sent successfully!', response);
      // Redirect to choose-payment.html only on success
      window.location.href = 'choose-payment.html';
    }, function(error) {
      console.error('Failed to send order email:', error);
      alert('Failed to send order details. Please try again or contact support.');
    });
  });

  // Initialize checkout
  displayCheckout();
});


// // Fetch product by ID from JSON
// async function fetchProductById(id) {
//   try {
//     const response = await fetch('json/products.json');
//     if (!response.ok) throw new Error('Network response was not ok');
//     const data = await response.json();
//     for (const category of Object.values(data.textbooks)) {
//       const product = category.find(item => item.id === id);
//       if (product) return product;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return null;
//   }
// }

// // Add item to cart in Local Storage
// function addToCart(product, quantity = 1) {
//   let cart = JSON.parse(localStorage.getItem('cart')) || [];
//   const existingItem = cart.find(item => item.id === product.id);

//   const cartItem = {
//     id: product.id,
//     title: product.title,
//     price: parseFloat(product.price), // Ensure price is a number
//     image: product.image,
//     quantity: quantity
//   };

//   if (existingItem) {
//     existingItem.quantity += quantity;
//     console.log(`Updated ${product.title} quantity to ${existingItem.quantity}`);
//   } else {
//     cart.push(cartItem);
//     console.log(`Added ${product.title} to cart with quantity ${quantity}`);
//   }

//   localStorage.setItem('cart', JSON.stringify(cart));
//   updateCartDisplay(); // Update UI
//   updateCartCount(); // Update cart count
// }

// // Display checkout (single product or cart view)
// async function displayCheckout() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const productId = parseInt(urlParams.get('id'));
//   const checkoutCart = document.querySelector('#checkout-cart');
//   const descriptionDiv = document.querySelector('#book-description');
//   const cart = JSON.parse(localStorage.getItem('cart')) || [];
//   const totalSpan = document.querySelector('#cart-total span');

//   if (productId) {
//     // Single-product view
//     const product = await fetchProductById(productId);
//     if (product) {
//       const isInCart = cart.find(item => item.id === product.id);
//       checkoutCart.innerHTML = `
//         <div class="single-product">
//           <div class="row">
//             <div class="col-12 col-md-6 single-product">
//               <img src="${product.image}" alt="${product.title}" class="img-fluid rounded" style="max-height: 400px; object-fit: cover;">
//             </div>
//             <div class="col-12 col-md-6">
//               <h3>${product.title}</h3>
//               <p><strong>Author:</strong> ${product.author || 'Unknown'}</p>
//               <p><strong>Price:</strong> KSh ${product.price}</p>
//               <button class="btn btn-primary add-to-cart-single" data-product-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">
//                 ${isInCart ? `Update Cart (Qty: ${isInCart.quantity})` : 'Add to Cart'}
//               </button>
//             </div>
//           </div>
//         </div>
//       `;
//       descriptionDiv.innerHTML = '<p>Description will be available soon after approval.</p>';
//       totalSpan.textContent = product.price.toFixed(2); // Show single product price

//       // Add to cart from single-product view
//       document.querySelector('.add-to-cart-single')?.addEventListener('click', () => {
//         const productData = {
//           id: parseInt(product.id),
//           title: product.title,
//           price: parseFloat(product.price),
//           image: product.image
//         };
//         addToCart(productData, 1);
//         window.location.href = 'checkout.html'; // Reload to show cart
//       });
//     } else {
//       checkoutCart.innerHTML = '<p>Product not found. <a href="index.html">Shop now</a>.</p>';
//       descriptionDiv.innerHTML = '';
//       totalSpan.textContent = '0.00';
//     }
//   } else {
//     // Cart view
//     const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     checkoutCart.innerHTML = cart.length === 0 ? '<p>Your cart is empty. <a href="index.html">Shop now</a>.</p>' : `
//       <div class="cart-items">
//         ${cart.map(item => `
//           <div class="cart-item">
//             <img src="${item.image}" alt="${item.title}" width="60">
//             <div class="cart-item-details">
//               <span>${item.title}</span>
//               <span>KSh ${item.price} × ${item.quantity}</span>
//             </div>
//           </div>
//         `).join('')}
//       </div>
//     `;
//     descriptionDiv.innerHTML = '';
//     totalSpan.textContent = total.toFixed(2); // Update total
//   }
// }

// // Handle checkout
// document.querySelector('#complete-checkout')?.addEventListener('click', () => {
//   const cart = JSON.parse(localStorage.getItem('cart')) || [];
//   if (cart.length === 0) {
//     alert('Your cart is empty!');
//     return;
//   }

//   const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
//   const confirmCheckout = confirm(`Your total is KSh ${total}. You will be redirected to the Pesapal payment page to manually enter this amount. Proceed?`);

//   if (confirmCheckout) {
//     // Redirect to Pesapal payment page
//     window.location.href = 'https://store.pesapal.com/paywellsstationeriesandbookstore';
//   }
// });

// // Initialize checkout
// displayCheckout();