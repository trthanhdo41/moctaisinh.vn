# Hướng Dẫn Sử Dụng Tính Năng Xuất Hóa Đơn - Mộc Tái Sinh

## Tổng Quan

Tính năng xuất hóa đơn cho phép khách hàng xuất thông tin đơn hàng dưới nhiều định dạng khác nhau sau khi đặt hàng thành công.

## Các Tính Năng

### 1. Xuất PDF
- Tạo file PDF chuyên nghiệp với đầy đủ thông tin đơn hàng
- Bao gồm thông tin công ty, khách hàng, sản phẩm và tổng tiền
- Hỗ trợ font tiếng Việt
- Tự động tải xuống với tên file: `hoa-don-[orderId]-[date].pdf`

### 2. Xuất Excel
- Tạo file Excel (.xlsx) với dữ liệu có cấu trúc
- Dễ dàng chỉnh sửa và quản lý
- Tự động tải xuống với tên file: `hoa-don-[orderId]-[date].xlsx`

### 3. In Hóa Đơn
- Mở cửa sổ in với giao diện đẹp mắt
- Tối ưu hóa cho việc in ấn
- Có thể in trực tiếp hoặc lưu thành PDF

## Cách Sử Dụng

### Trên Trang Thank You
1. Sau khi đặt hàng thành công, truy cập trang "Cảm ơn"
2. Nhấn vào nút "Xuất hóa đơn" (dropdown)
3. Chọn một trong ba tùy chọn:
   - **Xuất PDF**: Tạo file PDF
   - **Xuất Excel**: Tạo file Excel
   - **In hóa đơn**: Mở cửa sổ in

### Trên Mobile
- Giao diện tự động điều chỉnh cho màn hình nhỏ
- Dropdown menu hiển thị dạng modal trên mobile
- Tất cả chức năng hoạt động bình thường

## Cấu Trúc Dữ Liệu

### Thông Tin Công Ty
```javascript
{
    name: 'Mộc Tái Sinh',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    phone: '0373 566 167',
    email: 'info@moctaisinh.vn',
    website: 'moctaisinh.vn',
    taxCode: '0123456789'
}
```

### Thông Tin Đơn Hàng
```javascript
{
    orderId: 'MTS-2024-001',
    orderDate: '2024-01-15T10:30:00Z',
    customer: {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'example@email.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        note: 'Ghi chú đơn hàng'
    },
    items: [
        {
            name: 'Bàn gỗ tái sinh',
            quantity: 2,
            price: 1500000
        }
    ],
    total: 3000000
}
```

## Thư Viện Sử Dụng

### PDF Generation
- **jsPDF**: Tạo file PDF
- **jsPDF-AutoTable**: Tạo bảng trong PDF
- **Font Support**: Hỗ trợ font tiếng Việt

### Excel Generation
- **SheetJS (XLSX)**: Tạo file Excel
- **Auto Column Width**: Tự động điều chỉnh độ rộng cột

### Print Functionality
- **HTML Print**: Sử dụng CSS print media queries
- **Responsive Design**: Tối ưu cho in ấn

## Tùy Chỉnh

### Thay Đổi Thông Tin Công Ty
Chỉnh sửa trong file `js/invoice-exporter.js`:

```javascript
this.companyInfo = {
    name: 'Tên Công Ty Mới',
    address: 'Địa Chỉ Mới',
    phone: 'Số Điện Thoại Mới',
    email: 'email@moi.com',
    website: 'website-moi.com',
    taxCode: 'Mã Số Thuế Mới'
};
```

### Thay Đổi Style PDF
Chỉnh sửa các phương thức trong class `InvoiceExporter`:
- `addHeader()`: Header của PDF
- `addOrderInfo()`: Thông tin đơn hàng
- `addCustomerInfo()`: Thông tin khách hàng
- `addProductTable()`: Bảng sản phẩm
- `addTotalSection()`: Phần tổng tiền
- `addFooter()`: Footer của PDF

### Thay Đổi Style Excel
Chỉnh sửa phương thức `prepareExcelData()` để thay đổi cấu trúc dữ liệu Excel.

### Thay Đổi Style Print
Chỉnh sửa phương thức `generatePrintHTML()` để thay đổi giao diện in.

## Xử Lý Lỗi

### Lỗi Tạo PDF
- Kiểm tra kết nối internet (cần tải thư viện từ CDN)
- Kiểm tra dữ liệu đơn hàng có hợp lệ không
- Xem console để biết chi tiết lỗi

### Lỗi Tạo Excel
- Kiểm tra kết nối internet
- Kiểm tra dữ liệu đơn hàng
- Đảm bảo trình duyệt hỗ trợ File API

### Lỗi In
- Kiểm tra cài đặt máy in
- Đảm bảo trình duyệt cho phép popup
- Kiểm tra cài đặt bảo mật trình duyệt

## Tối Ưu Hóa

### Performance
- Thư viện được tải từ CDN để giảm kích thước file
- Sử dụng async/await để xử lý bất đồng bộ
- Loading state để cải thiện UX

### Security
- Không lưu trữ dữ liệu nhạy cảm
- Xác thực dữ liệu trước khi xử lý
- Sanitize input để tránh XSS

### Accessibility
- Hỗ trợ keyboard navigation
- Screen reader friendly
- High contrast mode

## Browser Support

### PDF Generation
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Excel Generation
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Print Functionality
- Tất cả trình duyệt hiện đại

## Troubleshooting

### PDF Không Tải Được
1. Kiểm tra kết nối internet
2. Thử refresh trang
3. Kiểm tra console để xem lỗi
4. Thử trình duyệt khác

### Excel Không Tải Được
1. Kiểm tra kết nối internet
2. Kiểm tra cài đặt bảo mật trình duyệt
3. Thử trình duyệt khác

### In Không Hoạt Động
1. Kiểm tra cài đặt máy in
2. Cho phép popup trong trình duyệt
3. Thử in từ menu trình duyệt

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề với tính năng xuất hóa đơn, vui lòng liên hệ:
- Email: info@moctaisinh.vn
- Hotline: 0373 566 167
- Website: moctaisinh.vn 