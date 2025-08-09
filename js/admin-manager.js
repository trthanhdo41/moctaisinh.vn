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
        const tabElement = document.getElementById('tab-' + tabName);
        if (tabElement) {
            tabElement.classList.remove('d-none');
        }

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
            case 'categories':
                this.fetchCategories();
                break;
        }
    }

    loadInitialData() {
        // Load products data initially
        this.fetchProducts();
        // Load categories for product form
        this.loadCategoriesForForm();
    }

    async loadCategoriesForForm() {
        try {
            const response = await fetch(`${this.API_BASE}/api/categories`);
            if (response.ok) {
                const categories = await response.json();
                const select = document.getElementById('productCategory');
                if (select) {
                    select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
                    categories.filter(cat => cat.status === 'active').forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading categories for form:', error);
        }
    }

    // loadCategoriesForDisplay removed - no longer needed since category column was removed

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

    // renderCategoryIcon method removed as icon feature was removed



    // Data fetching functions
    async fetchProducts() {
        // đọc public nên không yêu cầu đăng nhập
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

    async fetchCategories() {
        this.showGlobalLoading(true);
        try {
            const response = await fetch(`${this.API_BASE}/api/categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            this.showToast('Không thể tải danh sách danh mục!', 'danger');
        } finally {
            this.showGlobalLoading(false);
        }
    }

    // Render functions
    renderProducts(products) {
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';
        
        // Store products globally
        this.products = products;

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

    renderCategories(categories) {
        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = '';
        
        // Update global categories variable for edit/delete functions
        window.categories = categories;
        this.categories = categories;

        categories.forEach((category, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${category.id || 'N/A'}</td>
                <td>${category.name || 'N/A'}</td>
                <td>${category.description || 'Chưa có mô tả'}</td>
                <td>
                    <span class="badge ${category.status === 'active' ? 'bg-success' : 'bg-secondary'}">${category.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span>
                </td>
                <td>${category.displayOrder || 0}</td>
                <td>
                    <button class="admin-btn btn-sm" onclick="window.adminManager.editCategory(${index})">Sửa</button>
                    <button class="admin-btn btn-danger btn-sm" onclick="window.adminManager.deleteCategory(${index})">Xoá</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update count
        document.getElementById('categoryCountBtn').innerText = `Tổng: ${categories.length} danh mục`;
    }

    editCategory(index) {
        if (typeof requireLoginOrBlock === 'function') { try { requireLoginOrBlock(); } catch(e){ return; } }
        const category = this.categories[index];
        if (!category) {
            this.showToast('Không tìm thấy danh mục!', 'danger');
            return;
        }
        
        document.getElementById('categoryModalLabel').textContent = 'Sửa danh mục';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryStatus').value = category.status;
        document.getElementById('categoryDisplayOrder').value = category.displayOrder;
        document.getElementById('categoryRowIndex').value = index + 2;
        document.getElementById('categoryIdGroup').style.display = 'block';
        
        // Icon logic removed
        // Icon picker removed
        
        var modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }

    deleteCategory(index) {
        if (typeof requireLoginOrBlock === 'function') { try { requireLoginOrBlock(); } catch(e){ return; } }
        console.log('deleteCategory called with index:', index);
        console.log('Available categories:', this.categories);
        
        const category = this.categories[index];
        if (!category) {
            console.error('Category not found at index:', index);
            this.showToast('Không tìm thấy danh mục!', 'danger');
            return;
        }
        
        console.log('Setting categoryDeleteIdx to:', index);
        window.categoryDeleteIdx = index;
        
        var modal = new bootstrap.Modal(document.getElementById('deleteCategoryConfirmModal'));
        modal.show();
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

// Initialize Admin Manager only after successful login
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('mts_admin_logged_in') === 'true';
    if (!isLoggedIn) {
        window.location.replace('login.html');
        return;
    }
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
        try {
            if (typeof window.requireLoginOrBlock === 'function') window.requireLoginOrBlock();
            window.updateOrderStatusHandler(index);
        } catch (e) { /* blocked */ }
    }
}; 