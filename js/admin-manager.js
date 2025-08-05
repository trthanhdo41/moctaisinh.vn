/**
 * Admin Manager - Quản lý admin panel
 * Bao gồm: Quản lý sản phẩm, đơn hàng, blog với chức năng đồng bộ Google Sheets
 */

class AdminManager {
    constructor() {
        this.API_BASE = 'http://localhost:8080';
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initTabNavigation();
        this.loadInitialData();
    }

    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.admin-sidebar a').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab(a.getAttribute('data-tab'));
            });
        });

        // Mobile tab selector
        document.getElementById('adminTabMobile').addEventListener('change', (e) => {
            this.showTab(e.target.value);
        });

        // Refresh buttons
        document.getElementById('btnRefreshOrders').addEventListener('click', () => this.fetchOrders());
    }

    initTabNavigation() {
        // Show products tab by default
        this.showTab('products');
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.add('d-none');
        });

        // Show selected tab
        document.getElementById('tab-' + tabName).classList.remove('d-none');

        // Update active state in sidebar
        document.querySelectorAll('.admin-sidebar a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('data-tab') === tabName) {
                a.classList.add('active');
            }
        });

        // Update mobile selector
        document.getElementById('adminTabMobile').value = tabName;

        // Load data for the tab
        switch(tabName) {
            case 'products':
                this.fetchProducts();
                break;
            case 'orders':
                this.fetchOrders();
                break;
            case 'blogs':
                this.fetchBlogs();
                break;
        }
    }

    loadInitialData() {
        // Load products data initially
        this.fetchProducts();
    }

    // Utility functions
    showToast(message, type = 'success') {
        let icon = '';
        let toastClass = '';
        if (type === 'success') { 
            icon = '✔️'; 
            toastClass = 'toast-success'; 
        } else if (type === 'danger' || type === 'error') { 
            icon = '❌'; 
            toastClass = 'toast-error'; 
        } else if (type === 'warning') { 
            icon = '⚠️'; 
            toastClass = 'toast-warning'; 
        }

        const toast = document.createElement('div');
        toast.className = `custom-toast ${toastClass}`;
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => { 
            toast.classList.add('fade-out'); 
        }, 3000);
        setTimeout(() => { 
            toast.remove(); 
        }, 4000);
    }

    showGlobalLoading(show = true) {
        document.getElementById('globalLoading').style.display = show ? 'flex' : 'none';
    }

    formatVND(number) {
        if (!number) return '0₫';
        return Number(number).toLocaleString('vi-VN') + '₫';
    }



    // Data fetching functions
    async fetchProducts() {
        this.showGlobalLoading(true);
        try {
            const response = await fetch(`${this.API_BASE}/api/products`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            this.showToast('Không thể tải danh sách sản phẩm!', 'danger');
        } finally {
            this.showGlobalLoading(false);
        }
    }

    async fetchOrders() {
        this.showGlobalLoading(true);
        try {
            const response = await fetch(`${this.API_BASE}/api/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await response.json();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            this.showToast('Không thể tải danh sách đơn hàng!', 'danger');
        } finally {
            this.showGlobalLoading(false);
        }
    }

    async fetchBlogs() {
        this.showGlobalLoading(true);
        try {
            const response = await fetch(`${this.API_BASE}/api/blogs`);
            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }
            const blogs = await response.json();
            this.renderBlogs(blogs);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            this.showToast('Không thể tải danh sách blog!', 'danger');
        } finally {
            this.showGlobalLoading(false);
        }
    }

    // Render functions
    renderProducts(products) {
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        products.forEach((product, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id || 'N/A'}</td>
                <td>${product.name || 'N/A'}</td>
                <td>${this.formatVND(product.price)}</td>
                <td>${product.description || 'N/A'}</td>
                <td>
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width:60px;max-height:60px;cursor:pointer;" onclick="showImageModal('${product.image}')">` : 'Không có ảnh'}
                </td>
                <td>
                    <button class="admin-btn btn-sm" onclick="editProduct(${index})">Sửa</button>
                    <button class="admin-btn btn-danger btn-sm" onclick="deleteProduct(${index})">Xoá</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update count
        document.getElementById('productCountBtn').innerText = `Tổng: ${products.length} sản phẩm`;
    }

    renderOrders(orders) {
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '';

        orders.forEach((order, index) => {
            const tr = document.createElement('tr');
            const statusClass = this.getStatusClass(order.status || 'Chờ xử lý');
            tr.innerHTML = `
                <td><strong>${order.id || 'N/A'}</strong></td>
                <td>${order.date || 'N/A'}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${order.customerPhone || 'N/A'}</td>
                <td>${order.customerAddress || 'N/A'}</td>
                <td><strong>${this.formatVND(order.total || 0)}</strong></td>
                <td><span class="badge ${statusClass}">${order.status || 'Chờ xử lý'}</span></td>
                <td>
                    <button class="admin-btn btn-sm" onclick="viewOrderDetail(${index})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="admin-btn btn-warning btn-sm" onclick="updateOrderStatus(${index})" title="Cập nhật trạng thái">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update count
        document.getElementById('orderCountBtn').innerText = `Tổng: ${orders.length} đơn hàng`;
    }

    renderBlogs(blogs) {
        const tbody = document.querySelector('#blogsTable tbody');
        tbody.innerHTML = '';

        blogs.forEach((blog, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${blog.id || 'N/A'}</td>
                <td>${blog.title || 'N/A'}</td>
                <td>${blog.content || 'N/A'}</td>
                <td>${blog.author || 'N/A'}</td>
                <td>${blog.date || 'N/A'}</td>
                <td>
                    ${blog.image ? `<img src="${blog.image}" alt="${blog.title}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">` : '<span class="text-muted">Không có ảnh</span>'}
                </td>
                <td>
                    <button class="admin-btn btn-sm" onclick="editBlog(${index})">Sửa</button>
                    <button class="admin-btn btn-danger btn-sm" onclick="deleteBlog(${index})">Xoá</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update count
        document.getElementById('blogCountBtn').innerText = `Tổng: ${blogs.length} bài viết`;
    }

    getStatusClass(status) {
        switch(status) {
            case 'Đã xử lý': return 'bg-success';
            case 'Đang xử lý': return 'bg-warning';
            case 'Đã hủy': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
}

// Initialize Admin Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new AdminManager();
});

// Global functions for order management
window.viewOrderDetail = function(index) {
    // This will be implemented in the main admin.html file
    if (window.viewOrderDetailHandler) {
        window.viewOrderDetailHandler(index);
    }
};

window.updateOrderStatus = function(index) {
    // This will be implemented in the main admin.html file
    if (window.updateOrderStatusHandler) {
        window.updateOrderStatusHandler(index);
    }
}; 