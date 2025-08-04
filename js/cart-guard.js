/**
 * Cart Guard - Bảo vệ các trang checkout và thankyou
 * Ngăn chặn truy cập khi không có sản phẩm trong giỏ hàng hoặc đơn hàng không hợp lệ
 */
class CartGuard {
    constructor() {
        this.init();
    }
    init() {
        const currentPage = this.getCurrentPage();
        if (currentPage === 'checkout') {
            this.protectCheckoutPage();
        } else if (currentPage === 'thankyou') {
            this.protectThankyouPage();
        }
    }
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('checkout.html')) return 'checkout';
        if (path.includes('thankyou.html')) return 'thankyou';
        return null;
    }
    protectCheckoutPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderType = urlParams.get('type'); // 'cart' hoặc 'buynow'
        const orderId = urlParams.get('id'); // ID sản phẩm hoặc session ID
        if (!orderType || !orderId) {
            this.showInvalidOrderError();
            return false;
        }
        if (orderType === 'buynow') {
            const checkoutCart = this.getCheckoutCart();
            if (!checkoutCart || checkoutCart.length === 0) {
                this.showInvalidOrderError();
                return false;
            }
            return true;
        } else if (orderType === 'cart') {
            const cart = this.getCart();
            if (!cart || cart.length === 0) {
                this.showCartError();
                return false;
            }
            return true;
        } else {
            this.showInvalidOrderError();
            return false;
        }
    }
    protectThankyouPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        if (!orderId) {
            this.showOrderError('Không tìm thấy thông tin đơn hàng!');
            return false;
        }
        const orders = this.getOrders();
        const currentOrder = orders.find(order => order.orderId === orderId);
        if (!currentOrder) {
            this.showOrderError('Đơn hàng không tồn tại hoặc đã bị xóa!');
            return false;
        }
        return true;
    }
    getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (error) {
            return [];
        }
    }
    getCheckoutCart() {
        try {
            return JSON.parse(localStorage.getItem('checkoutCart') || '[]');
        } catch (error) {
            return [];
        }
    }
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem('orders') || '[]');
        } catch (error) {
            return [];
        }
    }
    showCartError() {
        const errorHTML = `
            <div class="modern-error-container">
                <div class="modern-error-card">
                    <div class="error-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="9" cy="20" r="1" fill="currentColor"/>
                            <circle cx="15" cy="20" r="1" fill="currentColor"/>
                        </svg>
                    </div>
                    <h2 class="error-title">Giỏ hàng trống</h2>
                    <p class="error-description">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                    <div class="error-actions">
                        <a href="shop.html" class="btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Mua sản phẩm
                        </a>
                        <a href="cart.html" class="btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Quay lại giỏ hàng
                        </a>
                    </div>
                </div>
            </div>
        `;
        this.replacePageContent(errorHTML);
    }
    showInvalidOrderError() {
        const errorHTML = `
            <div class="modern-error-container">
                <div class="modern-error-card">
                    <div class="error-icon danger">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 class="error-title">Đơn hàng không hợp lệ</h2>
                    <p class="error-description">Không tìm thấy thông tin đơn hàng hoặc đơn hàng đã hết hạn. Vui lòng chọn sản phẩm và thử lại.</p>
                    <div class="error-actions">
                        <a href="shop.html" class="btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Mua sản phẩm
                        </a>
                        <a href="cart.html" class="btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Giỏ hàng
                        </a>
                        <a href="index.html" class="btn-tertiary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Trang chủ
                        </a>
                    </div>
                </div>
            </div>
        `;
        this.replacePageContent(errorHTML);
    }
    showOrderError(message) {
        const errorHTML = `
            <div class="modern-error-container">
                <div class="modern-error-card">
                    <div class="error-icon danger">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 class="error-title">Lỗi truy cập</h2>
                    <p class="error-description">${message}</p>
                    <div class="error-actions">
                        <a href="shop.html" class="btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Mua sản phẩm
                        </a>
                        <a href="cart.html" class="btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Giỏ hàng
                        </a>
                        <a href="index.html" class="btn-tertiary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Trang chủ
                        </a>
                    </div>
                </div>
            </div>
        `;
        this.replacePageContent(errorHTML);
    }
    replacePageContent(html) {
        document.body.innerHTML = html;
        this.addModernCSS();
    }
    addModernCSS() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: "Inter", sans-serif;
                background: linear-gradient(135deg, #3b5d50 0%, #2d4a3f 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .modern-error-container {
                width: 100%;
                max-width: 500px;
                animation: slideInUp 0.6s ease-out;
            }
            .modern-error-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(59, 93, 80, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: relative;
                overflow: hidden;
            }
            .modern-error-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #3b5d50, #2d4a3f);
            }
            .error-icon {
                margin: 0 auto 24px;
                color: #3b5d50;
                animation: pulse 2s infinite;
            }
            .error-icon.danger {
                color: #dc3545;
            }
            .error-title {
                font-size: 28px;
                font-weight: 700;
                color: #3b5d50;
                margin-bottom: 16px;
            }
            .error-description {
                font-size: 16px;
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 32px;
            }
            .error-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .btn-primary, .btn-secondary, .btn-tertiary {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 16px 24px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                text-decoration: none;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            .btn-primary {
                background: linear-gradient(135deg, #3b5d50, #2d4a3f);
                color: white;
                box-shadow: 0 4px 15px rgba(59, 93, 80, 0.4);
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(59, 93, 80, 0.6);
            }
            .btn-secondary {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            }
            .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
            }
            .btn-tertiary {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }
            .btn-tertiary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
            }
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            @media (max-width: 768px) {
                .modern-error-card {
                    padding: 30px 20px;
                    border-radius: 20px;
                }
                .error-title {
                    font-size: 24px;
                }
                .error-description {
                    font-size: 14px;
                }
                .btn-primary, .btn-secondary, .btn-tertiary {
                    padding: 14px 20px;
                    font-size: 14px;
                }
            }
            /* Thêm hiệu ứng glassmorphism */
            .modern-error-card {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
            }
            /* Thêm hiệu ứng hover cho các nút */
            .btn-primary:active, .btn-secondary:active, .btn-tertiary:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    static checkCartAccess() {
        const guard = new CartGuard();
        return guard.protectCheckoutPage();
    }
    static checkOrderAccess() {
        const guard = new CartGuard();
        return guard.protectThankyouPage();
    }
}
document.addEventListener('DOMContentLoaded', function() {
    new CartGuard();
});
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartGuard;
} 