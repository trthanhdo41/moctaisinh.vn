// Invoice Exporter - Hệ thống xuất hóa đơn
class InvoiceExporter {
    constructor() {
        this.companyInfo = {
            name: 'Mộc Tái Sinh',
            address: '123 Đường ABC, Quận XYZ, TP.HCM',
            phone: '0373 566 167',
            email: 'info@moctaisinh.vn',
            website: 'moctaisinh.vn',
            taxCode: '0123456789'
        };
    }

    // Tạo hóa đơn PDF
    async generatePDF(orderData) {
        try {
            // Kiểm tra xem có thư viện jsPDF không
            if (typeof window.jspdf === 'undefined') {
                // Load jsPDF từ CDN
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js');
                
                // Đợi một chút để thư viện được khởi tạo
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Kiểm tra lại sau khi load
            if (typeof window.jspdf === 'undefined') {
                throw new Error('Không thể tải thư viện jsPDF');
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Sử dụng font mặc định (không cần font tiếng Việt đặc biệt)
            doc.setFont('helvetica');

            // Header
            this.addHeader(doc);
            
            // Thông tin đơn hàng
            this.addOrderInfo(doc, orderData);
            
            // Thông tin khách hàng
            this.addCustomerInfo(doc, orderData);
            
            // Bảng sản phẩm
            this.addProductTable(doc, orderData);
            
            // Tổng tiền
            this.addTotalSection(doc, orderData);
            
            // Footer
            this.addFooter(doc);

            // Xuất file
            const fileName = `hoa-don-${orderData.orderId}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            return true;
        } catch (error) {
            console.error('Lỗi tạo PDF:', error);
            return false;
        }
    }

    // Tạo hóa đơn Excel
    async generateExcel(orderData) {
        try {
            // Kiểm tra xem có thư viện SheetJS không
            if (typeof window.XLSX === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
                
                // Đợi một chút để thư viện được khởi tạo
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Kiểm tra lại sau khi load
            if (typeof window.XLSX === 'undefined') {
                throw new Error('Không thể tải thư viện SheetJS');
            }

            // Tạo workbook
            const wb = window.XLSX.utils.book_new();
            
            // Dữ liệu hóa đơn
            const invoiceData = this.prepareExcelData(orderData);
            
            // Tạo worksheet
            const ws = window.XLSX.utils.aoa_to_sheet(invoiceData);
            
            // Thiết lập style cho worksheet
            ws['!cols'] = [
                { width: 15 }, // Cột A
                { width: 40 }, // Cột B
                { width: 15 }, // Cột C
                { width: 20 }, // Cột D
                { width: 20 }  // Cột E
            ];

            // Thêm worksheet vào workbook
            window.XLSX.utils.book_append_sheet(wb, ws, 'Hóa đơn');

            // Xuất file
            const fileName = `hoa-don-${orderData.orderId}-${new Date().toISOString().split('T')[0]}.xlsx`;
            window.XLSX.writeFile(wb, fileName);

            return true;
        } catch (error) {
            console.error('Lỗi tạo Excel:', error);
            return false;
        }
    }

    // In hóa đơn
    printInvoice(orderData) {
        try {
            // Tạo cửa sổ in mới
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            // Tạo nội dung HTML cho in
            const printContent = this.generatePrintHTML(orderData);
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Đợi tải xong rồi in
            printWindow.onload = function() {
                printWindow.print();
                printWindow.close();
            };

            return true;
        } catch (error) {
            console.error('Lỗi in hóa đơn:', error);
            return false;
        }
    }

    // Load script từ CDN
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Kiểm tra xem script đã được load chưa
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                // Đợi thêm một chút để thư viện được khởi tạo hoàn toàn
                setTimeout(resolve, 500);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Thêm header cho PDF
    addHeader(doc) {
        // Logo và thông tin công ty
        doc.setFontSize(20);
        doc.setTextColor(59, 93, 80);
        doc.text('Moc Tai Sinh', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(this.companyInfo.address, 105, 30, { align: 'center' });
        doc.text(`Phone: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`, 105, 35, { align: 'center' });
        doc.text(`Website: ${this.companyInfo.website}`, 105, 40, { align: 'center' });
        
        // Tiêu đề hóa đơn
        doc.setFontSize(16);
        doc.setTextColor(59, 93, 80);
        doc.text('INVOICE', 105, 55, { align: 'center' });
        
        doc.line(20, 60, 190, 60);
    }

    // Thêm thông tin đơn hàng
    addOrderInfo(doc, orderData) {
        doc.setFontSize(12);
        doc.setTextColor(59, 93, 80);
        doc.text('Order Information:', 20, 75);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Order ID: ${orderData.orderId}`, 20, 85);
        doc.text(`Order Date: ${new Date(orderData.orderDate).toLocaleDateString('en-US')}`, 20, 90);
        doc.text(`Status: Pending`, 20, 95);
    }

    // Thêm thông tin khách hàng
    addCustomerInfo(doc, orderData) {
        doc.setFontSize(12);
        doc.setTextColor(59, 93, 80);
        doc.text('Customer Information:', 20, 115);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Name: ${orderData.customer.name}`, 20, 125);
        doc.text(`Phone: ${orderData.customer.phone}`, 20, 130);
        doc.text(`Email: ${orderData.customer.email || 'N/A'}`, 20, 135);
        doc.text(`Address: ${orderData.customer.address}`, 20, 140);
        
        if (orderData.customer.note) {
            doc.text(`Note: ${orderData.customer.note}`, 20, 150);
        }
    }

    // Thêm bảng sản phẩm
    addProductTable(doc, orderData) {
        const startY = orderData.customer.note ? 165 : 155;
        
        // Header bảng
        const headers = [['No.', 'Product Name', 'Quantity', 'Unit Price', 'Total']];
        
        // Dữ liệu sản phẩm
        const data = orderData.items.map((item, index) => [
            index + 1,
            item.name,
            item.quantity,
            this.formatCurrency(item.price),
            this.formatCurrency(item.price * item.quantity)
        ]);
        
        // Tạo bảng
        doc.autoTable({
            head: headers,
            body: data,
            startY: startY,
            margin: { left: 20, right: 20 },
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [59, 93, 80],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            }
        });
    }

    // Thêm phần tổng tiền
    addTotalSection(doc, orderData) {
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(12);
        doc.setTextColor(59, 93, 80);
        doc.text('Tong tien:', 150, finalY);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(this.formatCurrency(orderData.total), 150, finalY + 8);
    }

    // Thêm footer
    addFooter(doc) {
        const pageHeight = doc.internal.pageSize.height;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Thank you for your purchase!', 105, pageHeight - 30, { align: 'center' });
        doc.text('Moc Tai Sinh - Quality Handcrafted Furniture', 105, pageHeight - 25, { align: 'center' });
        doc.text(`Export Date: ${new Date().toLocaleDateString('en-US')}`, 105, pageHeight - 20, { align: 'center' });
    }

    // Chuẩn bị dữ liệu cho Excel
    prepareExcelData(orderData) {
        const data = [
            ['HÓA ĐƠN BÁN HÀNG'],
            [''],
            ['Thông tin công ty:'],
            ['Tên công ty:', this.companyInfo.name],
            ['Địa chỉ:', this.companyInfo.address],
            ['Điện thoại:', this.companyInfo.phone],
            ['Email:', this.companyInfo.email],
            [''],
            ['Thông tin đơn hàng:'],
            ['Mã đơn hàng:', orderData.orderId],
            ['Ngày đặt:', new Date(orderData.orderDate).toLocaleDateString('vi-VN')],
            ['Trạng thái:', 'Chờ xử lý'],
            [''],
            ['Thông tin khách hàng:'],
            ['Họ và tên:', orderData.customer.name],
            ['Số điện thoại:', orderData.customer.phone],
            ['Email:', orderData.customer.email || 'Không có'],
            ['Địa chỉ:', orderData.customer.address],
            ['Ghi chú:', orderData.customer.note || 'Không có'],
            [''],
            ['Danh sách sản phẩm:'],
            ['STT', 'Tên sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền']
        ];

        // Thêm sản phẩm
        orderData.items.forEach((item, index) => {
            data.push([
                index + 1,
                item.name,
                item.quantity,
                item.price,
                item.price * item.quantity
            ]);
        });

        // Thêm tổng tiền
        data.push(['']);
        data.push(['Tổng tiền:', '', '', '', orderData.total]);

        return data;
    }

    // Tạo HTML cho in
    generatePrintHTML(orderData) {
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
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #3b5d50;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #3b5d50;
                    margin-bottom: 10px;
                }
                .company-info {
                    font-size: 12px;
                    color: #666;
                    line-height: 1.4;
                }
                .invoice-title {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                    color: #3b5d50;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #3b5d50;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 5px;
                }
                .info-label {
                    width: 120px;
                    font-weight: bold;
                }
                .info-value {
                    flex: 1;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #3b5d50;
                    color: white;
                    font-weight: bold;
                }
                .total-row {
                    font-weight: bold;
                    font-size: 16px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .print-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: #3b5d50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <button class="print-btn no-print" onclick="window.print()">In hóa đơn</button>
            
            <div class="header">
                <div class="company-name">${this.companyInfo.name}</div>
                <div class="company-info">
                    ${this.companyInfo.address}<br>
                    Điện thoại: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}<br>
                    Website: ${this.companyInfo.website}
                </div>
            </div>
            
            <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
            
            <div class="section">
                <div class="section-title">Thông tin đơn hàng</div>
                <div class="info-row">
                    <div class="info-label">Mã đơn hàng:</div>
                    <div class="info-value">${orderData.orderId}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Ngày đặt:</div>
                    <div class="info-value">${new Date(orderData.orderDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Trạng thái:</div>
                    <div class="info-value">Chờ xử lý</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Thông tin khách hàng</div>
                <div class="info-row">
                    <div class="info-label">Họ và tên:</div>
                    <div class="info-value">${orderData.customer.name}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Số điện thoại:</div>
                    <div class="info-value">${orderData.customer.phone}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">${orderData.customer.email || 'Không có'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Địa chỉ:</div>
                    <div class="info-value">${orderData.customer.address}</div>
                </div>
                ${orderData.customer.note ? `
                <div class="info-row">
                    <div class="info-label">Ghi chú:</div>
                    <div class="info-value">${orderData.customer.note}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="section">
                <div class="section-title">Danh sách sản phẩm</div>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData.items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${this.formatCurrency(item.price)}</td>
                            <td>${this.formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="info-row total-row">
                    <div class="info-label">Tổng tiền:</div>
                    <div class="info-value">${this.formatCurrency(orderData.total)}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Cảm ơn quý khách đã mua hàng!</p>
                <p>Mộc Tái Sinh - Đồ gỗ thủ công chất lượng cao</p>
                <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
        </body>
        </html>
        `;
    }

    // Format tiền tệ
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
}

// Khởi tạo instance
const invoiceExporter = new InvoiceExporter(); 