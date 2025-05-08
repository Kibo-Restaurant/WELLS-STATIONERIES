// checkout.js
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  emailjs.init("6EDcVW5q9rX-iOY1n");

  // Initialize GLightbox
  const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    zoomable: true,
    autoplayVideos: true
  });

  // Initialize cart and display
  cleanCart();
  updateCartCount();
  updateCartDisplay();
  displayCheckout();

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
      for (const category of Object.values(data.stationery || {})) {
        const product = category.find(item => item.id === id);
        if (product) return product;
      }
      for (const category of Object.values(data.novels || {})) {
        const product = category.find(item => item.id === id);
        if (product) return product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Update cart display for right column
  function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const validCart = cart.filter(item => item.id && item.title && item.price && item.image && typeof item.quantity === 'number');
    if (cart.length !== validCart.length) {
      localStorage.setItem('cart', JSON.stringify(validCart));
      console.warn('Cleaned invalid cart items');
    }

    const cartItemsContainer = document.querySelector('#cart-items');
    const cartTotal = document.querySelector('#cart-total span');
    if (!cartItemsContainer || !cartTotal) {
      console.error('Cart items container or total element not found');
      return;
    }

    cartItemsContainer.innerHTML = validCart.length === 0 ? '<p>Your cart is empty.</p>' : `
      <div class="cart-items">
        ${validCart
          .map(
            item => `
              <div class="cart-item">
                <a href="${item.image}" class="glightbox" data-gallery="cart-gallery">
                  <img src="${item.image}" alt="${item.title}" width="50">
                </a>
                <div class="cart-item-details">
                  <span>${item.title}</span>
                  <span>KSh ${item.price} × ${item.quantity}</span>
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

    const total = validCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = total.toFixed(2);

    // Add event listeners for cart actions
    cartItemsContainer.querySelectorAll('.cart-remove').forEach(button => {
      button.addEventListener('click', () => {
        removeFromCart(button.dataset.id);
        displayCheckout();
      });
    });

    cartItemsContainer.querySelectorAll('.cart-quantity').forEach(input => {
      input.addEventListener('change', () => {
        updateQuantity(input.dataset.id, parseInt(input.value));
        displayCheckout();
      });
    });

    lightbox.reload();
    console.log('Checkout cart display updated:', validCart);
  }

  // Display checkout (left column: single product or cart view)
  async function displayCheckout() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const checkoutCart = document.querySelector('#checkout-cart');
    const descriptionDiv = document.querySelector('#book-description');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!checkoutCart || !descriptionDiv) {
      console.error('Checkout cart or description element not found');
      return;
    }

    if (productId) {
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

        document.querySelector('.add-to-cart-single')?.addEventListener('click', () => {
          const productData = {
            id: product.id,
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
      }
    } else {
      checkoutCart.innerHTML = cart.length === 0 ? '<p>Your cart is empty. <a href="index.html#textbooks">Shop now</a>.</p>' : `
        <div class="cart-items">
          ${cart
            .map(
              item => `
                <div class="cart-item">
                  <a href="${item.image}" class="glightbox" data-gallery="cart-gallery">
                    <img src="${item.image}" alt="${item.title}" width="80">
                  </a>
                  <div class="cart-item-details">
                    <span>${item.title}</span>
                    <span>KSh ${item.price} × ${item.quantity}</span>
                    <button class="cart-remove" data-id="${item.id}">Remove</button>
                  </div>
                </div>
              `
            )
            .join('')}
        </div>
      `;
      descriptionDiv.innerHTML = '';

      checkoutCart.querySelectorAll('.cart-remove').forEach(button => {
        button.addEventListener('click', () => {
          removeFromCart(button.dataset.id);
          displayCheckout();
        });
      });
    }

    lightbox.reload();
    console.log('Checkout cart view updated:', productId ? `Product ID: ${productId}` : 'Cart view');
  }

  // Generate PDF of order (returns a promise)
  function generatePDF(orderDetails) {
    return new Promise((resolve, reject) => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const primaryColor = [44, 122, 123];
      const textColor = [0, 0, 0]; // Replaced yellow with black
      

      const logoPath = "images/LOGO-HERE (2).png";
      const img = new Image();
      img.src = logoPath;

      img.onload = function () {
        const logoWidth = 60;
        const logoHeight = (logoWidth * 864) / 850;
        const logoX = 75;
        const logoY = 10;

        doc.addImage(img, "JPEG", logoX, logoY, logoWidth, logoHeight);

        const headerY = logoY + logoHeight + 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(...primaryColor);
        doc.text("Mtwapa Books Centre Order Confirmation", 20, headerY);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text("Thank you for your order! Details below.", 20, headerY + 10);

        doc.setDrawColor(...primaryColor);
        doc.line(20, headerY + 15, 190, headerY + 15);

        let yPos = headerY + 25;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text("Order Details:", 20, yPos);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...textColor);

        yPos += 10;
        doc.text(`Name: ${orderDetails.name}`, 20, yPos);
        yPos += 7;
        doc.text(`Email: ${orderDetails.email}`, 20, yPos);
        yPos += 7;
        doc.text(`County: ${orderDetails.county}`, 20, yPos);
        yPos += 7;
        doc.text(`Town: ${orderDetails.town}`, 20, yPos);
        yPos += 7;
        doc.text(`Order Date: ${new Date(orderDetails.orderDate).toLocaleString()}`, 20, yPos);

        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("Items:", 20, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        orderDetails.cart.forEach(item => {
          doc.text(`${item.title} (Qty: ${item.quantity}) - KSh ${(item.price * item.quantity).toFixed(2)}`, 20, yPos);
          yPos += 7;
        });

        yPos += 7;
        doc.text(`Subtotal: KSh ${orderDetails.total.toFixed(2)}`, 20, yPos);
        yPos += 7;
        doc.text(`Delivery Cost: ${orderDetails.deliveryCost ? `KSh ${orderDetails.deliveryCost.toFixed(2)}` : 'Contact for details'}`, 20, yPos);
        yPos += 7;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(`Total: KSh ${(orderDetails.total + (orderDetails.deliveryCost || 0)).toFixed(2)}`, 20, yPos);

        const footerY = yPos + 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.text("Contact Us:", 20, footerY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text("WhatsApp: +254 703 951 608", 20, footerY + 7);
        doc.text("Email: info@mtwapabookscentre.com", 20, footerY + 14);
        doc.text("Website: www.mtwapabookscentre.com", 20, footerY + 21);
        doc.setDrawColor(...primaryColor);
        doc.line(20, footerY + 28, 190, footerY + 28);

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        doc.save("MtwapaBooksCentre_Order.pdf");
        resolve();
      };

      img.onerror = function () {
        console.error("Failed to load logo image for PDF");
        alert("Error generating PDF: Logo image not found. Order still processed.");
        const headerY = 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(...primaryColor);
        doc.text("Mtwapa Books Centre Order Confirmation", 20, headerY);
        let yPos = headerY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text("Thank you for your order! Details below.", 20, yPos);
        doc.setDrawColor(...primaryColor);
        doc.line(20, yPos + 5, 190, yPos + 5);
        yPos += 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text("Order Details:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        yPos += 10;
        doc.text(`Name: ${orderDetails.name}`, 20, yPos);
        yPos += 7;
        doc.text(`Email: ${orderDetails.email}`, 20, yPos);
        yPos += 7;
        doc.text(`County: ${orderDetails.county}`, 20, yPos);
        yPos += 7;
        doc.text(`Town: ${orderDetails.town}`, 20, yPos);
        yPos += 7;
        doc.text(`Order Date: ${new Date(orderDetails.orderDate).toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("Items:", 20, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        orderDetails.cart.forEach(item => {
          doc.text(`${item.title} (Qty: ${item.quantity}) - KSh ${(item.price * item.quantity).toFixed(2)}`, 20, yPos);
          yPos += 7;
        });
        yPos += 7;
        doc.text(`Subtotal: KSh ${orderDetails.total.toFixed(2)}`, 20, yPos);
        yPos += 7;
        doc.text(`Delivery Cost: ${orderDetails.deliveryCost ? `KSh ${orderDetails.deliveryCost.toFixed(2)}` : 'Contact for details'}`, 20, yPos);
        yPos += 7;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(`Total: KSh ${(orderDetails.total + (orderDetails.deliveryCost || 0)).toFixed(2)}`, 20, yPos);
        const footerY = yPos + 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.text("Contact Us:", 20, footerY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text("WhatsApp: +254 703 951 608", 20, footerY + 7);
        doc.text("Email: info@mtwapabookscentre.com", 20, footerY + 14);
        doc.text("Website: www.mtwapabookscentre.com", 20, footerY + 21);
        doc.setDrawColor(...primaryColor);
        doc.line(20, footerY + 28, 190, footerY + 28);
        doc.save("MtwapaBooksCentre_Order.pdf");
        resolve();
      };
    });
  }

  // Handle checkout form submission
  const checkoutForm = document.querySelector('#checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const county = document.querySelector('#county').value;
      const town = document.querySelector('#town').value.trim();

      // Validate inputs
      if (!name) {
        alert('Please enter your full name.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!county) {
        alert('Please select a county.');
        return;
      }
      if (!town) {
        alert('Please enter your town.');
        return;
      }

      // Get cart data
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        alert('Your cart is empty. Add items before checking out.');
        return;
      }

      // Calculate total and delivery cost
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const localDeliveryAreas = ['Mtwapa', 'Kilifi', 'Mombasa'];
      const deliveryCost = localDeliveryAreas.includes(town) ? 200 : 0;

      // Prepare order details
      const orderDetails = {
        cart: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        name,
        email,
        county,
        town,
        total,
        deliveryCost,
        orderDate: new Date().toISOString()
      };

      // Prepare EmailJS message
      const orderSummary = cart
        .map(item => `Item: ${item.title}, Quantity: ${item.quantity}, Price: KSh ${item.price}, Subtotal: KSh ${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');
      const totalWithDelivery = total + (deliveryCost || 0);

      // Confirm checkout
      const confirmCheckout = confirm(`Your total is KSh ${totalWithDelivery.toFixed(2)}. An email with your order details will be sent to Mtwapa Books Centre, and a PDF will be downloaded. Proceed?`);
      if (!confirmCheckout) return;

      // Show notification
      const notification = document.querySelector('#checkout-notification');
      if (notification) {
        notification.style.display = 'block';
      }

      // Send email via EmailJS
      try {
        await emailjs.send("service_b3bqo9v", "template_ge5x8dq", {
          subject: `New Order (Total: KSh ${totalWithDelivery.toFixed(2)}, County: ${county})`,
          message: orderSummary + `\n\nSubtotal: KSh ${total.toFixed(2)}\nDelivery Cost: ${deliveryCost ? `KSh ${deliveryCost.toFixed(2)}` : 'Contact for details'}\nTotal: KSh ${totalWithDelivery.toFixed(2)}`,
          name,
          email,
          county,
          town
        });
        console.log('Order email sent successfully!');
      } catch (error) {
        console.error('Failed to send order email:', error);
        alert('Failed to send order details to Mtwapa Books Centre. PDF will still be generated.');
      }

      // Generate PDF and wait for completion
      try {
        await generatePDF(orderDetails);
        // Add slight delay to ensure browser initiates download
        setTimeout(() => {
          // Save order and clear cart
          localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
          clearCart();

          // Hide notification
          if (notification) {
            notification.style.display = 'none';
          }

          // Redirect to payment selection page
          window.location.href = 'choose-payment.html';
        }, 500); // 500ms delay for download to start
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        alert('Failed to generate PDF, but order was processed.');
        // Proceed with redirect even if PDF fails
        localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
        clearCart();
        if (notification) {
          notification.style.display = 'none';
        }
        window.location.href = 'choose-payment.html';
      }
    });
  } else {
    console.error('Checkout form not found');
  }
});