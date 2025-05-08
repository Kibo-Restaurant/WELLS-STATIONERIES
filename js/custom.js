document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper(".banner-swiper", {
        speed: 600,
        parallax: true,
        loop: true, // Optional: enables continuous loop mode
        autoplay: {
          delay: 5000, // time between slides in ms (5000 = 5 seconds)
          disableOnInteraction: false, // keep autoplay active after user interaction
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
      
      
});


