// Fetch product data
async function loadProducts() {
  try {
    const response = await fetch('json/products.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading products:', error);
    document.querySelector('.tab-content').innerHTML = '<p>Failed to load products. Please try again later.</p>';
    return {};
  }
}

// Populate Swiper slides
function populateSlides(section, category, products, wrapperId) {
  const wrapper = document.querySelector(`#${wrapperId}`);
  if (!wrapper) {
    console.error(`Wrapper not found for ID: ${wrapperId}`);
    return;
  }

  wrapper.innerHTML = ''; // Clear existing slides
  products.forEach(product => {
    wrapper.innerHTML += `
      <div class="swiper-slide">
        <div class="product-item">
          <figure class="product-style">
            <a href="checkout.html?id=${product.id}">
              <img src="${product.image}" alt="${product.title}" class="product-item" loading="lazy">
            </a>
            <div class="button-group">
          <button type="button" class="add-to-cart" data-product-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
          <button type="button" class="view-cart" data-product-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">View Cart</button>
        </div>
          </figure>
          <figcaption>
            <h3>${product.title}</h3>
            <span>${product.author || 'Unknown'}</span>
            <div class="item-price">KSh ${product.price}</div>
          </figcaption>
        </div>
      </div>`;
      const addCart = document.querySelectorAll('.add-to-cart');
      const viewCartButtons = document.querySelectorAll('.view-cart');

      addCart.forEach((button, i) => {
        button.addEventListener('click', function () {
          if (viewCartButtons[i]) viewCartButtons[i].style.display = 'block';
         
        });
      });

      viewCartButtons.forEach(button => {
        button.addEventListener('click', () => {
          updateCartDisplay();
          const modal = document.querySelector('#cart-modal');
          if (modal) {
            modal.style.display = 'block';
          } else {
            console.error('Cart modal not found');
          }
        });
      });
  });
  console.log(`Populated ${products.length} slides for ${wrapperId}`);
}

// Initialize Swiper for a category
function initSwiper(container, pagination) {
  const swiper = new Swiper(container, {
    slidesPerView: 3,
    grid: {
      rows: 2,
      fill: 'row',
    },
    spaceBetween: 30,
    pagination: {
      el: pagination,
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (index + 1) + '</span>';
      },
    },
    navigation: {
      nextEl: '.swiper-button-next2',
      prevEl: '.swiper-button-prev2',
    },
    observer: true,
    observeParents: true,
    resizeObserver: true,
    watchSlidesProgress: true,
    breakpoints: {
      0: { slidesPerView: 1, grid: { rows: 1 } },
    320: { slidesPerView: 1, grid: { rows: 1 } },
    400: { slidesPerView: 2, grid: { rows: 2 } },
    1024: { slidesPerView: 3, grid: { rows: 2 } },
    },
  });
  console.log(`Swiper initialized for ${container}:`, swiper);
  return swiper;
}

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

// Main function to set up Textbooks section
async function setupBookshop() {
  // Clean cart on load
  cleanCart();

  const data = await loadProducts();

  // Textbooks Section
  const textbookCategories = [
    { id: 'pre-primary-ecde', container: '.swiper-pre-primary-ecde', pagination: '.swiper-pre-primary-ecde .swiper-pagination2', data: data.textbooks?.prePrimaryECDE },
    { id: 'cbc-primary', container: '.swiper-cbc-primary', pagination: '.swiper-cbc-primary .swiper-pagination2', data: data.textbooks?.cbcPrimary },
    { id: 'cbc-junior-secondary', container: '.swiper-cbc-junior-secondary', pagination: '.swiper-cbc-junior-secondary .swiper-pagination2', data: data.textbooks?.cbcJuniorSecondary },
    { id: 'cbc-senior-secondary', container: '.swiper-cbc-senior-secondary', pagination: '.swiper-cbc-senior-secondary .swiper-pagination2', data: data.textbooks?.cbcSeniorSecondary },
    { id: 'secondary-844', container: '.swiper-844-secondary', pagination: '.swiper-844-secondary .swiper-pagination2', data: data.textbooks?.Secondary844School },
    { id: 'revision-books', container: '.swiper-revision-books', pagination: '.swiper-revision-books .swiper-pagination2', data: data.textbooks?.revisionBooks },
    { id: 'reference-books', container: '.swiper-reference-books', pagination: '.swiper-reference-books .swiper-pagination2', data: data.textbooks?.ReferenceBooks },
    { id: 'professional-books', container: '.swiper-professional-books', pagination: '.swiper-professional-books .swiper-pagination2', data: data.textbooks?.professionalBooks },
  ];

  // Populate and initialize Textbooks
  textbookCategories.forEach(category => {
    if (category.data) {
      populateSlides('textbooks', category.id, category.data, `${category.id}-wrapper`);
      initSwiper(category.container, category.pagination);
    } else {
      console.warn(`No data found for category: ${category.id}`);
    }
  });

  // Tab switching logic
  document.querySelectorAll('.tabs').forEach(tabList => {
    tabList.querySelectorAll('[data-tab-target]').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget);
        tabList.querySelectorAll('[data-tab-target]').forEach(t => t.classList.remove('active'));
        tabList.parentElement.querySelectorAll('[data-tab-content]').forEach(content => content.classList.remove('active'));
        tab.classList.add('active');
        target.classList.add('active');
        const swiper = target.querySelector('.swiper').swiper;
        if (swiper) {
          swiper.update();
          swiper.slideTo(0);
        }
      });
    });
  });

  // Add event listeners for Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const product = {
        id: parseInt(button.dataset.productId),
        title: button.dataset.title,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image,
      };
      addToCart(product, 1);
    });
  });

  // Initialize cart count and modal trigger
  updateCartCount();
  document.querySelector('#view-cart')?.addEventListener('click', () => {
    updateCartDisplay();
    document.querySelector('#cart-modal').style.display = 'block';
  });
}

setupBookshop();


  // Textbooks Section
  // const textbookCategories = [
  //   { id: 'pre-primary-ecde', container: '.swiper-pre-primary-ecde', pagination: '.swiper-pre-primary-ecde .swiper-pagination2', data: data.textbooks?.prePrimaryECDE },
  //   { id: 'cbc-primary', container: '.swiper-cbc-primary', pagination: '.swiper-cbc-primary .swiper-pagination2', data: data.textbooks?.cbcPrimary },
  //   { id: 'cbc-junior-secondary', container: '.swiper-cbc-junior-secondary', pagination: '.swiper-cbc-junior-secondary .swiper-pagination2', data: data.textbooks?.cbcJuniorSecondary },
  //   { id: 'cbc-senior-secondary', container: '.swiper-cbc-senior-secondary', pagination: '.swiper-cbc-senior-secondary .swiper-pagination2', data: data.textbooks?.cbcSeniorSecondary },
  //   { id: 'secondary-844', container: '.swiper-844-secondary', pagination: '.swiper-844-secondary .swiper-pagination2', data: data.textbooks?.Secondary844School },
  //   { id: 'revision-books', container: '.swiper-revision-books', pagination: '.swiper-revision-books .swiper-pagination2', data: data.textbooks?.revisionBooks },
  //   { id: 'reference-books', container: '.swiper-reference-books', pagination: '.swiper-reference-books .swiper-pagination2', data: data.textbooks?.ReferenceBooks },
  //   { id: 'professional-books', container: '.swiper-professional-books', pagination: '.swiper-professional-books .swiper-pagination2', data: data.textbooks?.professionalBooks },
  // ];

  
  //LOCAL STORAGE LESSONS

// localStorage.setItem('username', 'john');
// const username = localStorage.getItem('username');
// console.log(username);
// localStorage.removeItem('username');
// console.log(username);
// localStorage.clear();
// console.log(username);
// console.log(localStorage.length); // Number of stored items

// const cart = [{ id: 1, title: 'Book 1', price: 700 }];
// localStorage.setItem('cart', JSON.stringify(cart));
// const retrievedCart = JSON.parse(localStorage.getItem('cart')); // [{ id: 1, ... }]
// console.log(retrievedCart);

// localStorage.setItem('test', JSON.stringify({ name: 'Test Book', price: 500 })); //Saving a value (object) as a string using the key 'test'
// console.log(JSON.parse(localStorage.getItem('test'))); //Retrieving the string using json.parse but using getitem and the key test to get it as an object again