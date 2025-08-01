// Order Manager - Lưu đơn hàng vào Google Sheets
class OrderManager {
    async saveOrderToSheet(orderData) {
        try {
            // Chuyển đổi mã số địa danh thành tên
            await addressConverter.waitForReady();
            const convertedOrderData = addressConverter.convertOrderAddress(orderData);
            
            // Format dữ liệu cho Google Sheets (khớp với header: id, date, name, phone, email, address, province, district, ward, items, total, note, status)
            const orderRow = [
                convertedOrderData.orderId,                    // A: id
                new Date().toLocaleString('vi-VN'),   // B: date
                convertedOrderData.customer.name,              // C: name
                convertedOrderData.customer.phone,             // D: phone
                convertedOrderData.customer.email,             // E: email
                convertedOrderData.customer.address,           // F: address
                convertedOrderData.customer.province,          // G: province (tên thay vì mã số)
                convertedOrderData.customer.district,          // H: district (tên thay vì mã số)
                convertedOrderData.customer.ward,              // I: ward (tên thay vì mã số)
                this.formatOrderItems(convertedOrderData.items), // J: items
                convertedOrderData.total,                      // K: total
                convertedOrderData.customer.note,              // L: note
                'Chờ xử lý'                          // M: status
            ];

            // Gửi đến backend
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderRow)
            });

            if (response.ok) {
                return true;
            } else {
                // Fallback: lưu vào localStorage
                this.saveOrderToLocalStorage(orderData);
                return false;
            }
        } catch (error) {
            // Fallback: lưu vào localStorage
            this.saveOrderToLocalStorage(orderData);
            return false;
        }
    }

    formatOrderItems(items) {
        if (!items || !Array.isArray(items)) return '';
        return items.map(item => `${item.name} (x${item.quantity})`).join(', ');
    }

    saveOrderToLocalStorage(orderData) {
        try {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));
        } catch (error) {
            // Silent fail
        }
    }

    async sendWebhookNotification(orderData) {
        try {
            // Gọi webhook n8n - Test và Production
            const testWebhookUrl = 'https://2ada7f.n8nvps.site/webhook-test/new-order';
            const productionWebhookUrl = 'https://2ada7f.n8nvps.site/webhook/new-order';
            
            // Chọn webhook dựa trên environment (có thể thay đổi khi deploy)
            const isProduction = false; // Đổi thành true khi deploy
            const webhookUrl = isProduction ? productionWebhookUrl : testWebhookUrl;
            
            // Dữ liệu gửi đến webhook n8n
            const webhookData = {
                orderId: convertedOrderData.orderId,
                orderDate: new Date().toLocaleString('vi-VN'),
                customer: {
                    name: convertedOrderData.customer.name,
                    phone: convertedOrderData.customer.phone,
                    email: convertedOrderData.customer.email || '',
                    address: convertedOrderData.customer.address,
                    province: convertedOrderData.customer.province,
                    district: convertedOrderData.customer.district,
                    ward: convertedOrderData.customer.ward,
                    note: convertedOrderData.customer.note || ''
                },
                items: convertedOrderData.items,
                total: convertedOrderData.total,
                status: 'Chờ xử lý',
                // Thêm thông tin cho n8n workflow
                notificationType: 'new_order',
                timestamp: new Date().toISOString()
            };
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });

            // Silent success/fail - không log gì
        } catch (error) {
            // Silent fail - không ảnh hưởng đến quá trình đặt hàng
        }
    }
}

const orderManager = new OrderManager();
window.orderManager = orderManager; 