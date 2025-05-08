// fetch-stationeries.js
document.addEventListener('DOMContentLoaded', () => {
    async function loadProducts() {
      try {
        const response = await fetch('json/stationery.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error loading stationery products:', error);
        document.querySelector('#stationeryTabsContent').innerHTML = '<p>Failed to load products. Please try again later.</p>';
        return {};
      }
    }
  
    function populateSlides(section, category, products, wrapperId) {
      const wrapper = document.querySelector(`#${wrapperId}`);
      if (!wrapper) {
        console.error(`Wrapper not found for ID: ${wrapperId}`);
        return;
      }
  
      wrapper.innerHTML = '';
      products.forEach(product => {
        wrapper.innerHTML += `
          <div class="swiper-slide">
            <div class="product-item">
              <figure class="product-style">
                <a href="stationery-checkout.html?id=${product.id}">
                  <img src="${product.image}" alt="${product.title}" class="product-item" loading="lazy">
                </a>
                <div class="button-group">
                  <button type="button" class="add-to-cart" 
                          data-product-id="${product.id}" 
                          data-title="${product.title}" 
                          data-price="${product.price}" 
                          data-image="${product.image}">
                    Add to Cart
                  </button>
                  <button type="button" class="view-cart" 
                          data-product-id="${product.id}" 
                          data-title="${product.title}" 
                          data-price="${product.price}" 
                          data-image="${product.image}" 
                          style="display: none;">
                    View Cart
                  </button>
                </div>
              </figure>
              <figcaption>
                <h3>${product.title}</h3>
                <span>${product.category}</span>
                <div class="item-price">KSh ${product.price}</div>
              </figcaption>
            </div>
          </div>
        `;
      });
  
      const addCartButtons = wrapper.querySelectorAll('.add-to-cart');
      const viewCartButtons = wrapper.querySelectorAll('.view-cart');
  
      addCartButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          const product = {
            id: button.dataset.productId, // String ID
            title: button.dataset.title,
            price: parseFloat(button.dataset.price),
            image: button.dataset.image
          };
          addToCart(product, 1);
          if (viewCartButtons[index]) {
            viewCartButtons[index].style.display = 'block';
          }
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
  
      console.log(`Populated ${products.length} slides for ${wrapperId}`);
    }
  
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
  
    async function setupStationery() {
      cleanCart();
      const data = await loadProducts();
  
      const stationeryCategories = [
        { id: 'school', container: '.swiper-school-essentials', pagination: '.swiper-school-essentials .swiper-pagination2', wrapperId: 'school-essentials-wrapper', data: data.stationery?.schoolEssentials },
        { id: 'office', container: '.swiper-office-essentials', pagination: '.swiper-office-essentials .swiper-pagination2', wrapperId: 'office-essentials-wrapper', data: data.stationery?.officeEssentials },
        { id: 'writing', container: '.swiper-writing-instruments', pagination: '.swiper-writing-instruments .swiper-pagination2', wrapperId: 'writing-instruments-wrapper', data: data.stationery?.writingInstruments },
        { id: 'paper', container: '.swiper-paper-notebooks', pagination: '.swiper-paper-notebooks .swiper-pagination2', wrapperId: 'paper-notebooks-wrapper', data: data.stationery?.paperNotebooks },
      ];
  
      stationeryCategories.forEach(category => {
        if (category.data) {
          populateSlides('stationery', category.id, category.data, category.wrapperId);
          initSwiper(category.container, category.pagination);
        } else {
          console.warn(`No data found for category: ${category.id}`);
        }
      });
  
      document.querySelectorAll('#stationeryTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', () => {
          setTimeout(() => {
            const targetId = tab.getAttribute('data-bs-target').substring(1);
            const swiper = document.querySelector(`.swiper-${targetId}-products`)?.swiper;
            if (swiper) {
              swiper.update();
              swiper.slideTo(0);
            }
          }, 100);
        });
      });
  
      updateCartCount();
      document.querySelector('#view-cart')?.addEventListener('click', () => {
        updateCartDisplay();
        const modal = document.querySelector('#cart-modal');
        if (modal) {
          modal.style.display = 'block';
        } else {
          console.error('Cart modal not found');
        }
      });
    }
  
    setupStationery();
  });