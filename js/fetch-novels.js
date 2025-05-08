// fetch-novels.js
document.addEventListener('DOMContentLoaded', () => {
    async function loadProducts() {
      try {
        const response = await fetch('json/novels.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error loading novels:', error);
        document.querySelector('#novels .tab-content').innerHTML = '<p>Failed to load novels. Please try again later.</p>';
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
                <a href="novels-checkout.html?id=${product.id}">
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
                <span>${product.author || 'Unknown'}</span>
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
  
    async function setupNovels() {
      cleanCart();
      const data = await loadProducts();
  
      const novelCategories = [
        { id: 'fiction', container: '.swiper-fiction', pagination: '.swiper-fiction .swiper-pagination2', wrapperId: 'fiction-wrapper', data: data.novels?.fiction },
        { id: 'non-fiction', container: '.swiper-non-fiction', pagination: '.swiper-non-fiction .swiper-pagination2', wrapperId: 'non-fiction-wrapper', data: data.novels?.nonFiction },
      ];
  
      novelCategories.forEach(category => {
        if (category.data) {
          populateSlides('novels', category.id, category.data, category.wrapperId);
          initSwiper(category.container, category.pagination);
        } else {
          console.warn(`No data found for category: ${category.id}`);
        }
      });
  
      document.querySelectorAll('#novels .tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const target = document.querySelector(tab.dataset.tabTarget);
          tab.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.parentElement.parentElement.querySelectorAll('[data-tab-content]').forEach(content => content.classList.remove('active'));
          tab.classList.add('active');
          target.classList.add('active');
          const swiper = target.querySelector('.swiper').swiper;
          if (swiper) {
            swiper.update();
            swiper.slideTo(0);
          }
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
  
    setupNovels();
  });