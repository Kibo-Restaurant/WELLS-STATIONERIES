// fetch-textbooks.js
document.addEventListener('DOMContentLoaded', () => {
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
              <a href="checkout.html?id=${product.id}">
                <img src="${product.image}" alt="${product.title}" class="product-item" loading="lazy">
              </a>
              <div class="button-group">
                <button type="button" class="add-to-cart" data-product-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
                <button type="button" class="view-cart" data-product-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}" style="display: none;">View Cart</button>
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
          image: button.dataset.image,
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

  async function setupBookshop() {
    cleanCart();
    const data = await loadProducts();

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

    textbookCategories.forEach(category => {
      if (category.data) {
        populateSlides('textbooks', category.id, category.data, `${category.id}-wrapper`);
        initSwiper(category.container, category.pagination);
      } else {
        console.warn(`No data found for category: ${category.id}`);
      }
    });

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

  setupBookshop();
});