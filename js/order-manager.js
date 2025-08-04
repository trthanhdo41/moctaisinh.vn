class OrderManager {
    async saveOrderToSheet(orderData) {
        try {
            await addressConverter.waitForReady();
            const convertedOrderData = addressConverter.convertOrderAddress(orderData);
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
                this.saveOrderToLocalStorage(orderData);
                return false;
            }
        } catch (error) {
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
        }
    }
    async sendWebhookNotification(orderData) {
        try {
            const testWebhookUrl = 'https://2ada7f.n8nvps.site/webhook-test/new-order';
            const productionWebhookUrl = 'https://2ada7f.n8nvps.site/webhook/new-order';
            const isProduction = false; // Đổi thành true khi deploy
            const webhookUrl = isProduction ? productionWebhookUrl : testWebhookUrl;
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
        } catch (error) {
        }
    }
}
const orderManager = new OrderManager();
window.orderManager = orderManager; 