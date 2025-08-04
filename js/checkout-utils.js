/**
 * Checkout Utils - Xử lý URL checkout an toàn
 * Tạo URL checkout với thông tin đơn hàng cụ thể
 */
class CheckoutUtils {
    /**
     * Tạo URL checkout cho "Mua ngay"
     * @param {string} productId - ID sản phẩm
     * @returns {string} URL checkout hợp lệ
     */
    static createBuyNowUrl(productId) {
        const sessionId = this.generateSessionId();
        return `checkout.html?type=buynow&id=${productId}&session=${sessionId}`;
    }
    /**
     * Tạo URL checkout cho giỏ hàng
     * @returns {string} URL checkout hợp lệ
     */
    static createCartCheckoutUrl() {
        const sessionId = this.generateSessionId();
        return `checkout.html?type=cart&id=${sessionId}`;
    }
    /**
     * Tạo session ID duy nhất
     * @returns {string} Session ID
     */
    static generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${random}`;
    }
    /**
     * Lấy thông tin đơn hàng từ URL
     * @returns {object} Thông tin đơn hàng
     */
    static getOrderInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            type: urlParams.get('type'),
            id: urlParams.get('id'),
            session: urlParams.get('session')
        };
    }
    /**
     * Kiểm tra URL checkout có hợp lệ không
     * @returns {boolean} True nếu hợp lệ
     */
    static isValidCheckoutUrl() {
        const orderInfo = this.getOrderInfo();
        return orderInfo.type && orderInfo.id;
    }
    /**
     * Chuyển hướng đến checkout với thông tin đơn hàng
     * @param {string} type - Loại đơn hàng ('buynow' hoặc 'cart')
     * @param {string} productId - ID sản phẩm (cho buynow)
     */
    static redirectToCheckout(type, productId = null) {
        let url;
        if (type === 'buynow' && productId) {
            url = this.createBuyNowUrl(productId);
        } else if (type === 'cart') {
            url = this.createCartCheckoutUrl();
        } else {
            return;
        }
        window.location.href = url;
    }
    /**
     * Lưu thông tin session cho checkout
     * @param {string} type - Loại đơn hàng
     * @param {string} id - ID sản phẩm hoặc session
     */
    static saveCheckoutSession(type, id) {
        const sessionData = {
            type: type,
            id: id,
            timestamp: Date.now(),
            sessionId: this.generateSessionId()
        };
        localStorage.setItem('checkoutSession', JSON.stringify(sessionData));
    }
    /**
     * Lấy thông tin session checkout
     * @returns {object|null} Thông tin session
     */
    static getCheckoutSession() {
        try {
            return JSON.parse(localStorage.getItem('checkoutSession') || 'null');
        } catch (error) {
            return null;
        }
    }
    /**
     * Xóa thông tin session checkout
     */
    static clearCheckoutSession() {
        localStorage.removeItem('checkoutSession');
    }
    /**
     * Kiểm tra session có hết hạn không (30 phút)
     * @param {object} session - Thông tin session
     * @returns {boolean} True nếu hết hạn
     */
    static isSessionExpired(session) {
        if (!session || !session.timestamp) return true;
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        const maxAge = 30 * 60 * 1000; // 30 phút
        return sessionAge > maxAge;
    }
}
window.CheckoutUtils = CheckoutUtils; 