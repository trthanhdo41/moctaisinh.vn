class ContactManager {
    constructor() {
        this.API_BASE = 'http://localhost:8080';
        this.init();
    }
    init() {
        this.waitForFooter();
    }
    waitForFooter() {
        const checkFooter = () => {
            const footer = document.querySelector('footer');
            if (footer) {
                this.initSubscriptionForm();
                this.initContactForm();
            } else {
                setTimeout(checkFooter, 100);
            }
        };
        checkFooter();
    }
    initSubscriptionForm() {
        const form = document.querySelector('#subscriptionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubscriptionSubmit(form);
            });
        } else {
            const alternativeForm = document.querySelector('.subscription-form form');
            if (alternativeForm) {
                alternativeForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSubscriptionSubmit(alternativeForm);
                });
            }
        }
    }
    initContactForm() {
        const form = document.querySelector('#contactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit(form);
            });
        }
    }
    async handleSubscriptionSubmit(form) {
        const nameInput = form.querySelector('#subscriptionName') || form.querySelector('input[placeholder*="tên"]');
        const phoneInput = form.querySelector('#subscriptionPhone') || form.querySelector('input[placeholder*="điện thoại"]');
        if (!nameInput || !phoneInput) {
            this.showToast('Form không hợp lệ', 'error');
            return;
        }
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        if (!name) {
            this.showToast('Vui lòng nhập tên của bạn', 'error');
            return;
        }
        if (!phone) {
            this.showToast('Vui lòng nhập số điện thoại', 'error');
            return;
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="fa fa-spinner fa-spin"></span>';
        try {
            const requestData = { name: name, phone: phone };
            const response = await fetch(`${this.API_BASE}/api/contacts/subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            if (response.ok) {
                this.showToast('Đăng ký nhận tin thành công!', 'success');
                form.reset();
            } else {
                const errorText = await response.text();
                this.showToast('Lỗi: ' + errorText, 'error');
            }
        } catch (error) {
            this.saveToLocalStorage('subscription', { name, phone, timestamp: new Date().toISOString() });
            this.showToast('Đăng ký nhận tin thành công! (Lưu tạm thời)', 'success');
            form.reset();
        } finally {
            // Gửi webhook notification cho chị Phương khi đăng ký nhận tin
            this.sendContactWebhook(name, phone, 'subscription');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    async handleContactSubmit(form) {
        const nameInput = form.querySelector('#fullname');
        const phoneInput = form.querySelector('#phone');
        const emailInput = form.querySelector('#email');
        const messageInput = form.querySelector('#message');
        if (!nameInput || !phoneInput || !emailInput || !messageInput) {
            this.showToast('Form không hợp lệ', 'error');
            return;
        }
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        if (!name) {
            this.showToast('Vui lòng nhập họ và tên', 'error');
            return;
        }
        if (!phone) {
            this.showToast('Vui lòng nhập số điện thoại', 'error');
            return;
        }
        if (!email) {
            this.showToast('Vui lòng nhập email', 'error');
            return;
        }
        if (!this.isValidEmail(email)) {
            this.showToast('Email không hợp lệ', 'error');
            return;
        }
        if (!message) {
            this.showToast('Vui lòng nhập nội dung liên hệ', 'error');
            return;
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="fa fa-spinner fa-spin"></span> Gửi liên hệ...';
        try {
            const response = await fetch(`${this.API_BASE}/api/contacts/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    email: email,
                    message: message
                })
            });
            if (response.ok) {
                this.showToast('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
                form.reset();
            } else {
                const errorText = await response.text();
                this.showToast('Lỗi: ' + errorText, 'error');
            }
        } catch (error) {
            this.saveToLocalStorage('contact', { name, phone, email, message, timestamp: new Date().toISOString() });
            this.showToast('Gửi liên hệ thành công! (Lưu tạm thời)', 'success');
            form.reset();
        } finally {
            // Gửi webhook notification cho chị Phương khi liên hệ
            this.sendContactWebhook(name, phone, 'contact', email, message);
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    saveToLocalStorage(type, data) {
        try {
            const key = `moctaisinh_${type}_${Date.now()}`;
            localStorage.setItem(key, JSON.stringify(data));
            const keys = JSON.parse(localStorage.getItem('moctaisinh_keys') || '[]');
            keys.push(key);
            localStorage.setItem('moctaisinh_keys', JSON.stringify(keys));
            return true;
        } catch (error) {
            return false;
        }
    }
    getAllLocalStorageData() {
        try {
            const keys = JSON.parse(localStorage.getItem('moctaisinh_keys') || '[]');
            const data = [];
            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    data.push({
                        key: key,
                        data: JSON.parse(item)
                    });
                }
            });
            return data;
        } catch (error) {
            return [];
        }
    }
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `contact-toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'info' ? 'background: #17a2b8;' : ''}
        `;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                ${type === 'success' ? '<span class="fa fa-check-circle"></span>' : ''}
                ${type === 'error' ? '<span class="fa fa-exclamation-circle"></span>' : ''}
                ${type === 'info' ? '<span class="fa fa-info-circle"></span>' : ''}
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    // Gửi webhook notification cho chị Phương khi liên hệ
    async sendContactWebhook(name, phone, type, email = '', message = '') {
        try {
            const testWebhookUrl = 'https://2ada7f.n8nvps.site/webhook-test/contact';
            const productionWebhookUrl = 'https://2ada7f.n8nvps.site/webhook/contact';
            const isProduction = false; // false = test mode, true = production mode
            const webhookUrl = isProduction ? productionWebhookUrl : testWebhookUrl;
            
            let webhookData = {
                name: name,
                phone: phone,
                type: type,
                timestamp: new Date().toISOString(),
                notificationType: 'contact_notification'
            };

            if (type === 'subscription') {
                webhookData.message = `📧 Khách hàng mới đăng ký nhận tin!\n\n👤 Tên: ${name}\n📱 SĐT: ${phone}\n📅 Thời gian: ${new Date().toLocaleString('vi-VN')}`;
            } else if (type === 'contact') {
                webhookData.email = email;
                webhookData.message = message;
                webhookData.zaloMessage = `📞 Liên hệ mới từ khách hàng!\n\n👤 Tên: ${name}\n📱 SĐT: ${phone}\n📧 Email: ${email}\n💬 Nội dung: ${message}\n📅 Thời gian: ${new Date().toLocaleString('vi-VN')}`;
            }
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });
            
            if (response.ok) {
                console.log(`✅ Contact webhook sent successfully for ${type}`);
            } else {
                console.error(`❌ Contact webhook failed for ${type}:`, response.status);
            }
        } catch (error) {
            console.error(`❌ Contact webhook error for ${type}:`, error);
        }
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContactManager();
    });
} else {
    new ContactManager();
}
window.testContactManager = function() {
    return 'ContactManager is loaded!';
};
