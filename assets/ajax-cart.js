(function() {
  'use strict';

  // --- Sticky Mobile Add To Cart ---
  const stickyBar = document.getElementById('product-sticky-bar');
  const mainAtcBtn = document.querySelector('.product-page__add-to-cart');
  const stickyAtcBtn = document.getElementById('sticky-atc-btn');

  if (stickyBar && mainAtcBtn) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Show sticky bar when main ATC is scrolled OUT of view (upwards)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          stickyBar.classList.add('is-visible');
        } else {
          stickyBar.classList.remove('is-visible');
        }
      });
    }, { threshold: 0 });

    observer.observe(mainAtcBtn);

    // Trigger main ATC when sticky is clicked
    if (stickyAtcBtn) {
      stickyAtcBtn.addEventListener('click', () => {
        mainAtcBtn.click();
      });
    }
  }

  // --- Ajax Cart Drawer ---
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const cartCloseBtn = document.getElementById('cart-drawer-close');
  const cartLinks = document.querySelectorAll('a[href="/cart"], .header__cart');
  const contShopBtn = document.getElementById('btn-continue-shopping');

  function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add('is-open');
    if (cartOverlay) cartOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateCartDrawer();
  }

  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('is-open');
    if (cartOverlay) cartOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (cartDrawer) {
    cartLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
    if (contShopBtn) contShopBtn.addEventListener('click', closeCartDrawer);
  }

  const clearCartBtn = document.getElementById('btn-clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      fetch(window.Shopify.routes.root + 'cart/clear.js', { method: 'POST' })
        .then(() => updateCartDrawer());
    });
  }

  // Intercept Add to Cart forms
  const atcForms = document.querySelectorAll('form[action="/cart/add"]');
  atcForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) submitBtn.innerHTML = 'Adding...';

      fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      })
      .then(response => response.json())
      .then(data => {
        if (submitBtn) submitBtn.innerHTML = originalText;
        openCartDrawer();
      })
      .catch((error) => {
        console.error('Error:', error);
        if (submitBtn) submitBtn.innerHTML = originalText;
      });
    });
  });

  // Update Cart Drawer DOM
  function updateCartDrawer() {
    fetch(window.Shopify.routes.root + '?section_id=cart-drawer')
      .then((response) => response.text())
      .then((html) => {
        // In a real scenario we'd parse the section HTML and replace innerHTML
        // For this streamlined version, we just fetch /cart.js to update counts
        fetch(window.Shopify.routes.root + 'cart.js')
          .then(res => res.json())
          .then(cart => {
            document.querySelectorAll('.header__cart-count, #cart-drawer-count').forEach(el => {
              el.textContent = cart.item_count;
            });
            buildCartItems(cart);
          });
      });
  }

  function buildCartItems(cart) {
    const itemsContainer = document.getElementById('cart-drawer-items');
    const emptyState = document.getElementById('cart-drawer-empty');
    const footer = document.getElementById('cart-drawer-footer');
    const totalEl = document.getElementById('cart-drawer-total');
    const clearBtnWrapper = document.getElementById('cart-drawer-clear');
    
    if (!itemsContainer) return;

    if (cart.item_count === 0) {
      itemsContainer.innerHTML = '';
      emptyState.style.display = 'block';
      footer.style.display = 'none';
      if (clearBtnWrapper) clearBtnWrapper.style.display = 'none';
      updateShippingProgress(0);
      return;
    }

    emptyState.style.display = 'none';
    footer.style.display = 'block';
    if (clearBtnWrapper) clearBtnWrapper.style.display = 'block';
    
    let itemsHtml = '';
    cart.items.forEach(item => {
      itemsHtml += `
        <div class="cart-drawer-item">
          <img src="${item.image}" alt="${item.title}" class="cart-drawer-item__img">
          <div class="cart-drawer-item__info">
            <a href="${item.url}" class="cart-drawer-item__title">${item.product_title}</a>
            <div class="cart-drawer-item__price">${formatMoney(item.final_line_price)}</div>
            <div class="cart-drawer-item__qty">
              <button type="button" class="cart-drawer-item__qtybtn minus" data-key="${item.key}" data-qty="${item.quantity - 1}">-</button>
              <input type="text" class="cart-drawer-item__qtyinput" value="${item.quantity}" readonly>
              <button type="button" class="cart-drawer-item__qtybtn plus" data-key="${item.key}" data-qty="${item.quantity + 1}">+</button>
            </div>
            <button type="button" class="cart-drawer-item__remove" data-key="${item.key}">Remove</button>
          </div>
        </div>
      `;
    });
    
    itemsContainer.innerHTML = itemsHtml;
    totalEl.innerHTML = formatMoney(cart.total_price);
    updateShippingProgress(cart.total_price);

    // Bind quantity events
    itemsContainer.querySelectorAll('.cart-drawer-item__qtybtn, .cart-drawer-item__remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = btn.getAttribute('data-key');
        const qty = btn.classList.contains('cart-drawer-item__remove') ? 0 : parseInt(btn.getAttribute('data-qty'));
        changeItemQuantity(key, qty);
      });
    });
  }

  function changeItemQuantity(key, quantity) {
    fetch(window.Shopify.routes.root + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
    .then(res => res.json())
    .then(cart => {
      updateCartDrawer();
    });
  }

  function updateShippingProgress(totalPrice) {
    const shippingEl = document.getElementById('cart-drawer-shipping');
    if (!shippingEl) return;
    
    const threshold = parseInt(shippingEl.getAttribute('data-threshold')) || 5000; // Default $50.00
    const progressEl = document.getElementById('cart-shipping-progress');
    const amountEl = document.getElementById('cart-shipping-amount');
    
    if (totalPrice >= threshold) {
      if(progressEl) progressEl.style.width = '100%';
      shippingEl.innerHTML = '<strong>You got FREE SHIPPING! 🚚</strong>';
    } else {
      const remaining = threshold - totalPrice;
      const percent = (totalPrice / threshold) * 100;
      if(progressEl) progressEl.style.width = `${percent}%`;
      if(amountEl) amountEl.innerHTML = formatMoney(remaining);
    }
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

})();
