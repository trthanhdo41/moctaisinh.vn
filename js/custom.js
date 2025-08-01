(function() {
	'use strict';

	var tinyslider = function() {
		var el = document.querySelectorAll('.testimonial-slider');

		if (el.length > 0) {
			var slider = tns({
				container: '.testimonial-slider',
				items: 1,
				axis: "horizontal",
				controlsContainer: "#testimonial-nav",
				swipeAngle: false,
				speed: 700,
				nav: true,
				controls: true,
				autoplay: true,
				autoplayHoverPause: true,
				autoplayTimeout: 3500,
				autoplayButtonOutput: false
			});
		}
	};
	tinyslider();

	


	var sitePlusMinus = function() {

		var value,
    		quantity = document.getElementsByClassName('quantity-container');

		function createBindings(quantityContainer) {
	      var quantityAmount = quantityContainer.getElementsByClassName('quantity-amount')[0];
	      var increase = quantityContainer.getElementsByClassName('increase')[0];
	      var decrease = quantityContainer.getElementsByClassName('decrease')[0];
	      increase.addEventListener('click', function (e) { increaseValue(e, quantityAmount); });
	      decrease.addEventListener('click', function (e) { decreaseValue(e, quantityAmount); });
	    }

	    function init() {
	        for (var i = 0; i < quantity.length; i++ ) {
						createBindings(quantity[i]);
	        }
	    };

	    function increaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        console.log(quantityAmount, quantityAmount.value);

	        value = isNaN(value) ? 0 : value;
	        value++;
	        quantityAmount.value = value;
	    }

	    function decreaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        value = isNaN(value) ? 0 : value;
	        if (value > 0) value--;

	        quantityAmount.value = value;
	    }
	    
	    init();
		
	};
	sitePlusMinus();

	// Hiệu ứng fade in cho sản phẩm shop
	if (document.querySelector('.btn.btn-secondary') && document.querySelector('.fade-in-product')) {
	  document.querySelector('.btn.btn-secondary').addEventListener('click', function() {
	    var products = document.querySelectorAll('.fade-in-product');
	    products.forEach(function(item, idx) {
	      setTimeout(function() {
	        item.style.display = 'block';
	        item.style.opacity = 0;
	        item.style.transform = 'translateY(-32px)';
	        item.style.transition = 'opacity 0.5s cubic-bezier(0.23,1,0.32,1), transform 0.5s cubic-bezier(0.23,1,0.32,1)';
	        setTimeout(function() {
	          item.style.opacity = 1;
	          item.style.transform = 'translateY(0)';
	        }, 10);
	      }, idx * 90);
	    });
	    this.style.display = 'none';
	  });
	}

	// Đã xoá code tự động load địa chỉ tỉnh/thành/quận/huyện/phường/xã theo yêu cầu.

	// --- Related Products Slider ---
	function renderRelatedProducts(products) {
	  const relatedProducts = document.getElementById('relatedProducts');
	  if (!relatedProducts) return;
	  relatedProducts.innerHTML = '';
	  products.forEach(p => {
	    const item = document.createElement('div');
	    item.className = 'related-product-item';
	    item.innerHTML = `
	      <div class="card h-100 border-0 shadow-sm">
	        <img src="${p.image}" class="card-img-top" alt="${p.name}" style="height:180px;object-fit:cover;border-radius:12px 12px 0 0;">
	        <div class="card-body p-3">
	          <h5 class="card-title mb-2" style="font-size:1.1rem;font-weight:600;">${p.name}</h5>
	          <div class="card-text mb-2" style="font-size:1rem;color:#3b5d50;font-weight:500;">${formatVND(p.price)}</div>
	          <div class="card-desc" style="font-size:0.95rem;color:#666;">${truncateText(p.description, 40)}</div>
	        </div>
	      </div>
	    `;
	    item.addEventListener('click', () => {
	      window.location.href = `/shop/detail.html?id=${p.id}`;
	    });
	    relatedProducts.appendChild(item);
	  });
	}

	function initRelatedSlider() {
	  if (window.relatedSliderInstance) window.relatedSliderInstance.destroy();
	  window.relatedSliderInstance = tns({
	    container: '.related-slider',
	    items: 4,
	    slideBy: 1,
	    gutter: 24,
	    nav: false,
	    controls: true,
	    controlsContainer: '.related-slider-wrap',
	    prevButton: '.related-prev',
	    nextButton: '.related-next',
	    mouseDrag: true,
	    autoplay: false,
	    speed: 400,
	    responsive: {
	      0: { items: 1 },
	      576: { items: 2 },
	      992: { items: 3 },
	      1200: { items: 4 }
	    }
	  });
	}

	// Gọi khi load xong sản phẩm chính
	function loadAndShowRelatedProducts(currentId) {
	  fetch(`${API_BASE}/api/products`).then(res => res.json()).then(products => {
	    // Loại bỏ sản phẩm hiện tại
	    const related = products.filter(p => p.id !== currentId);
	    renderRelatedProducts(related);
	    setTimeout(initRelatedSlider, 100); // Đợi DOM render xong
	  });
	}

	// Update cart icon with item count
	function updateCartIcon() {
		const cart = JSON.parse(localStorage.getItem('cart')) || [];
		const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
		
		// Update cart icon in header if exists
		const cartIcon = document.querySelector('.nav-link img[src*="cart.svg"]');
		if (cartIcon && totalItems > 0) {
			// Add badge to cart icon
			let badge = cartIcon.parentElement.querySelector('.cart-badge');
			if (!badge) {
				badge = document.createElement('span');
				badge.className = 'cart-badge';
				badge.style.cssText = `
					position: absolute;
					top: -8px;
					right: -8px;
					background: #dc3545;
					color: white;
					border-radius: 50%;
					width: 20px;
					height: 20px;
					font-size: 12px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
				`;
				cartIcon.parentElement.style.position = 'relative';
				cartIcon.parentElement.appendChild(badge);
			}
			badge.textContent = totalItems;
		} else if (cartIcon) {
			// Remove badge if no items
			const badge = cartIcon.parentElement.querySelector('.cart-badge');
			if (badge) {
				badge.remove();
			}
		}
	}

	// Initialize cart icon on page load
	document.addEventListener('DOMContentLoaded', function() {
		updateCartIcon();
	});

})()