/* ============================================
   ZINX USA — Theme JavaScript
   ============================================ */

(function() {
  'use strict';

  /* --- Mobile Menu Toggle --- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mobileNav.classList.contains('is-open');
      mobileNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active');
      menuToggle.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Sticky Header Scroll Effect --- */
  const header = document.getElementById('header');

  if (header) {
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* --- FAQ Accordion --- */
  const accordionTriggers = document.querySelectorAll('.accordion__trigger');

  accordionTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      // Close all other accordions
      accordionTriggers.forEach(function(otherTrigger) {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherTrigger.nextElementSibling.style.maxHeight = null;
        }
      });

      // Toggle current
      this.setAttribute('aria-expanded', !isExpanded);

      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  /* --- Product Image Gallery --- */
  const thumbnails = document.querySelectorAll('.product-page__thumb');
  const mainImage = document.getElementById('main-product-img');

  thumbnails.forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      const newUrl = this.getAttribute('data-image-url');
      if (mainImage && newUrl) {
        mainImage.src = newUrl;

        // Update active state
        thumbnails.forEach(function(t) { t.classList.remove('is-active'); });
        this.classList.add('is-active');
      }
    });
  });

  /* --- Quantity Selector --- */
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyInput = document.getElementById('product-quantity');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', function() {
      const current = parseInt(qtyInput.value) || 1;
      if (current > 1) {
        qtyInput.value = current - 1;
      }
    });

    qtyPlus.addEventListener('click', function() {
      const current = parseInt(qtyInput.value) || 1;
      qtyInput.value = current + 1;
    });
  }

  /* --- Smooth Scroll for Anchor Links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --- Scroll Animations (Intersection Observer) --- */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections for scroll animations
  document.querySelectorAll('.problem__card, .product-showcase__benefit, .how-it-works__step, .testimonials__card, .about-page__value').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Add visibility styles
  const style = document.createElement('style');
  style.textContent = '.is-visible { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

})();
