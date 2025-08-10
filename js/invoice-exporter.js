class InvoiceExporter {
    constructor() {
        this.companyInfo = {
            name: 'Mộc Tái Sinh',
            address: '449 Gia Phú, Phường 1, Quận 6, Hồ Chí Minh',
            phone: '077 7666 386',
            email: 'cucphuong6166@gmail.com',
            website: 'moctaisinh.vn',
            taxCode: '0123456789'
        };
    }
    async generateExcel(orderData) {
        try {
            if (typeof window.XLSX === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (typeof window.XLSX === 'undefined') {
                throw new Error('Không thể tải thư viện SheetJS');
            }
            const wb = window.XLSX.utils.book_new();
            const invoiceData = this.prepareExcelData(orderData);
            const ws = window.XLSX.utils.aoa_to_sheet(invoiceData);
            ws['!cols'] = [
                { width: 15 }, // Cột A
                { width: 40 }, // Cột B
                { width: 15 }, // Cột C
                { width: 20 }, // Cột D
                { width: 20 }  // Cột E
            ];
            window.XLSX.utils.book_append_sheet(wb, ws, 'Hóa đơn');
            const fileName = `hoa-don-${orderData.orderId}-${new Date().toISOString().split('T')[0]}.xlsx`;
            window.XLSX.writeFile(wb, fileName);
            return true;
        } catch (error) {
            return false;
        }
    }
    async printInvoice(orderData) {
        try {
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            const printContent = await this.generatePrintHTML(orderData);
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
                printWindow.close();
            };
            return true;
        } catch (error) {
            return false;
        }
    }
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                setTimeout(resolve, 500);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    prepareExcelData(orderData) {
        const data = [
            ['MỘC TÁI SINH'],
            ['Đồ gỗ thủ công từ vật liệu tái chế'],
            [''],
            ['Thông tin công ty:'],
            ['Địa chỉ:', '449 Gia Phú, Phường 1, Quận 6, Hồ Chí Minh'],
            ['Điện thoại:', '077 7666 386'],
            ['Email:', 'cucphuong6166@gmail.com'],
            ['Website:', 'moctaisinh.vn'],
            ['MST:', '0123456789'],
            [''],
            ['HÓA ĐƠN BÁN HÀNG'],
            [''],
            ['Thông tin đơn hàng:'],
            ['Số hóa đơn:', orderData.orderId],
            ['Ngày đặt:', new Date(orderData.orderDate).toLocaleDateString('vi-VN')],
            [''],
            ['Thông tin khách hàng:'],
            ['Họ và tên:', orderData.customer.name],
            ['Số điện thoại:', orderData.customer.phone],
            ['Email:', orderData.customer.email || 'Không có'],
            ['Địa chỉ:', orderData.customer.address],
            ['Ghi chú:', orderData.customer.note || 'Không có'],
            [''],
            ['Chi tiết sản phẩm:'],
            ['STT', 'Tên sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền']
        ];
        orderData.items.forEach((item, index) => {
            data.push([
                index + 1,
                item.name || `Sản phẩm ${index + 1}`,
                item.quantity,
                item.price,
                item.price * item.quantity
            ]);
        });
        data.push(['']);
        data.push(['Tổng tiền hàng:', '', '', '', orderData.total]);
        data.push(['Thuế VAT (0%):', '', '', '', 0]);
        data.push(['Tổng cộng:', '', '', '', orderData.total]);
        data.push(['']);
        data.push(['Thông tin thanh toán:']);
        data.push(['Phương thức thanh toán:', 'Thanh toán khi nhận hàng (COD)']);
        data.push(['Thời gian giao hàng dự kiến:', '3-5 ngày làm việc']);
        data.push(['']);
        data.push(['Điều khoản & Chính sách:']);
        data.push(['- Chúng tôi cam kết giao hàng đúng thời gian và chất lượng sản phẩm như mô tả']);
        data.push(['- Khách hàng có thể kiểm tra hàng trước khi thanh toán']);
        data.push(['- Chính sách đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất']);
        data.push(['- Mọi thắc mắc vui lòng liên hệ: 077 7666 386 hoặc cucphuong6166@gmail.com']);
        data.push(['']);
        data.push(['Cảm ơn quý khách đã tin tưởng và lựa chọn Mộc Tái Sinh!']);
        data.push(['Ngày xuất hóa đơn:', new Date().toLocaleDateString('vi-VN')]);
        return data;
    }
    async generatePrintHTML(orderData) {
        // Convert địa chỉ từ ID sang tên đầy đủ
        await window.addressConverter.waitForReady();
        const convertedOrderData = window.addressConverter.convertOrderAddress(orderData);
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hóa đơn ${orderData.orderId}</title>
            <style>
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                    @page { size: A4; margin: 12mm; }
                }
                body {
                    font-family: 'Times New Roman', serif;
                    margin: 12px;
                    color: #000;
                    line-height: 1.3;
                    font-size: 13px;
                    font-weight: bold;
                }
                .invoice-container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 15px;
                    background: white;
                }
                .header {
                    text-align: center;
                    border: 2px solid #000;
                    padding: 12px;
                    margin-bottom: 15px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .company-slogan {
                    font-size: 12px;
                    color: #000;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .company-info {
                    font-size: 11px;
                    color: #000;
                    line-height: 1.4;
                    font-weight: bold;
                }
                .company-info strong {
                    color: #000;
                    font-weight: bold;
                }
                .invoice-title {
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                    margin: 12px 0;
                    color: #000;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border: 2px solid #000;
                    padding: 10px;
                }
                .invoice-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    font-size: 13px;
                    font-weight: bold;
                    color: #000;
                }
                .invoice-number {
                    font-weight: bold;
                    color: #000;
                    font-size: 14px;
                }
                .section {
                    margin-bottom: 12px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 8px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 5px;
                    text-transform: uppercase;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 4px;
                }
                .info-label {
                    width: 100px;
                    font-weight: bold;
                    color: #000;
                    font-size: 12px;
                }
                .info-value {
                    flex: 1;
                    color: #000;
                    font-size: 12px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12px 0;
                    font-size: 12px;
                    font-weight: bold;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 6px 8px;
                    text-align: left;
                    color: #000;
                }
                th {
                    background-color: #fff;
                    color: #000;
                    font-weight: bold;
                    text-align: center;
                    font-size: 12px;
                    border: 2px solid #000;
                }
                .stt-col { width: 8%; text-align: center; }
                .name-col { width: 45%; }
                .qty-col { width: 12%; text-align: center; }
                .price-col { width: 17%; text-align: right; }
                .total-col { width: 18%; text-align: right; }
                .summary-section {
                    margin-top: 12px;
                    border-top: 2px solid #000;
                    padding-top: 10px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 12px;
                }
                .summary-label {
                    font-weight: bold;
                    color: #000;
                }
                .summary-value {
                    font-weight: bold;
                    color: #000;
                }
                .total-row {
                    font-size: 15px;
                    font-weight: bold;
                    color: #000;
                    border-top: 2px solid #000;
                    padding-top: 8px;
                    margin-top: 8px;
                }
                .payment-info {
                    background: white;
                    padding: 10px;
                    border: 2px solid #000;
                    margin: 15px 0;
                }
                .payment-info h4 {
                    margin: 0 0 8px 0;
                    color: #000;
                    font-size: 13px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .payment-info p {
                    margin: 4px 0;
                    font-size: 11px;
                    line-height: 1.4;
                    color: #000;
                    font-weight: bold;
                }
                .terms-section {
                    margin-top: 15px;
                    padding: 10px;
                    background: white;
                    border: 2px solid #000;
                }
                .terms-section h4 {
                    margin: 0 0 8px 0;
                    color: #000;
                    font-size: 13px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .terms-section ul {
                    margin: 0;
                    padding-left: 16px;
                    font-size: 10px;
                    color: #000;
                    line-height: 1.5;
                    font-weight: bold;
                }
                .terms-section li {
                    margin-bottom: 4px;
                }
                .footer {
                    margin-top: 15px;
                    text-align: center;
                    font-size: 11px;
                    color: #000;
                    border-top: 2px solid #000;
                    padding-top: 10px;
                    font-weight: bold;
                }
                .company-motto {
                    font-style: italic;
                    color: #000;
                    margin: 12px 0;
                    text-align: center;
                    font-size: 10px;
                    line-height: 1.4;
                    font-weight: bold;
                    border: 1px solid #000;
                    padding: 8px;
                }
                .print-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 24px;
                    background: #3b5d50;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .print-btn:hover {
                    background: #2d4a3f;
                }
            </style>
        </head>
        <body>
            <button class="print-btn no-print" onclick="window.print()">🖨️ In hóa đơn</button>
            <div class="invoice-container">
                <div class="header">
                    <div class="company-name">Mộc Tái Sinh</div>
                    <div class="company-slogan">Đồ gỗ thủ công từ vật liệu tái chế</div>
                    <div class="company-info">
                        <strong>Địa chỉ:</strong> 449 Gia Phú, Phường 1, Quận 6, Hồ Chí Minh<br>
                        <strong>Điện thoại:</strong> 077 7666 386 | <strong>Email:</strong> cucphuong6166@gmail.com<br>
                        <strong>Website:</strong> moctaisinh.vn | <strong>MST:</strong> 0123456789
                    </div>
                </div>
                <div class="invoice-title">Hóa Đơn Bán Hàng</div>
                <div class="invoice-meta">
                    <div>
                        <strong>Số hóa đơn:</strong> <span class="invoice-number">${convertedOrderData.orderId}</span>
                    </div>
                    <div>
                        <strong>Ngày:</strong> ${new Date(convertedOrderData.orderDate).toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Thông tin khách hàng</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">Họ và tên:</div>
                            <div class="info-value">${convertedOrderData.customer.name}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Số điện thoại:</div>
                            <div class="info-value">${convertedOrderData.customer.phone}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Email:</div>
                            <div class="info-value">${convertedOrderData.customer.email || 'Không có'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Địa chỉ:</div>
                            <div class="info-value">${window.addressConverter.getFullAddress(convertedOrderData.customer)}</div>
                        </div>
                        ${convertedOrderData.customer.note ? `
                        <div class="info-row" style="grid-column: 1 / -1;">
                            <div class="info-label">Ghi chú:</div>
                            <div class="info-value">${convertedOrderData.customer.note}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Chi tiết sản phẩm</div>
                    <table>
                        <thead>
                            <tr>
                                <th class="stt-col">STT</th>
                                <th class="name-col">Tên sản phẩm</th>
                                <th class="qty-col">Số lượng</th>
                                <th class="price-col">Đơn giá</th>
                                <th class="total-col">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${convertedOrderData.items.map((item, index) => `
                            <tr>
                                <td class="stt-col">${index + 1}</td>
                                <td class="name-col">${item.name}</td>
                                <td class="qty-col">${item.quantity}</td>
                                <td class="price-col">${this.formatCurrency(item.price)}</td>
                                <td class="total-col">${this.formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="summary-section">
                    <div class="summary-row">
                        <div class="summary-label">Tổng tiền hàng:</div>
                        <div class="summary-value">${this.formatCurrency(convertedOrderData.total)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Thuế VAT (0%):</div>
                        <div class="summary-value">0₫</div>
                    </div>
                    <div class="summary-row total-row">
                        <div class="summary-label">Tổng cộng:</div>
                        <div class="summary-value">${this.formatCurrency(convertedOrderData.total)}</div>
                    </div>
                </div>
                <div class="payment-info">
                    <h4>Thông tin thanh toán</h4>
                    <p><strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)</p>
                    <p><strong>Thời gian giao hàng dự kiến:</strong> 3-5 ngày làm việc</p>
                    <p><strong>Điều kiện giao hàng:</strong> Giao hàng toàn quốc, kiểm tra hàng trước khi thanh toán</p>
                </div>
                <div class="terms-section">
                    <h4>Điều khoản & Chính sách</h4>
                    <ul>
                        <li>Cam kết chất lượng sản phẩm - Kiểm tra hàng trước thanh toán</li>
                        <li>Đổi trả 7 ngày nếu lỗi NSX - LH: 077 7666 386</li>
                        <li>Sản phẩm thủ công tái chế có thể khác biệt nhỏ về màu sắc</li>
                    </ul>
                </div>
                <div class="company-motto">
                    "Từ những vật liệu tưởng chừng bỏ đi, chúng tôi thổi hồn vào gỗ vụn, tre cũ, mảnh vỡ thiên nhiên bằng đôi tay thủ công và tình yêu với đất mẹ."
                </div>
                <div class="footer">
                    <p><strong>Cảm ơn quý khách đã tin tưởng Mộc Tái Sinh!</strong></p>
                    <p>Ngày xuất hóa đơn: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
}
const invoiceExporter = new InvoiceExporter(); 