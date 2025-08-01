// Footer Loader - Load footer từ file riêng vào tất cả các trang
class FooterLoader {
    constructor() {
        this.footerContainer = null;
        this.footerPath = 'footer.html';
    }

    // Tìm container để chứa footer
    findFooterContainer() {
        // Tìm element có class footer-section hoặc id footer
        this.footerContainer = document.querySelector('.footer-section') || 
                              document.getElementById('footer') ||
                              document.querySelector('footer');
        
        if (!this.footerContainer) {
            // Nếu không tìm thấy, tạo container mới
            this.footerContainer = document.createElement('div');
            this.footerContainer.id = 'footer-container';
            document.body.appendChild(this.footerContainer);
        }
        
        return this.footerContainer;
    }

    // Load footer từ file
    async loadFooter() {
        try {
            const response = await fetch(this.footerPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerHTML = await response.text();
            
            const container = this.findFooterContainer();
            container.innerHTML = footerHTML;
            
            console.log('Footer loaded successfully');
            
            // Trigger event để thông báo footer đã load xong
            document.dispatchEvent(new CustomEvent('footerLoaded'));
            
        } catch (error) {
            console.error('Error loading footer:', error);
            this.loadFallbackFooter();
        }
    }

    // Footer dự phòng nếu không load được file
    loadFallbackFooter() {
        const container = this.findFooterContainer();
        container.innerHTML = `
            <footer class="footer-section">
                <div class="container relative">
                    <div class="row">
                        <div class="col-lg-12 text-center">
                            <p>&copy; 2025 moctaisinh.vn. Cảm hứng từ Cúc Phương. Thiết kế & đồng hành bởi Thanh Độ.</p>
                            <p><span style="font-weight:600; color:#3b5d50;">Từ gốc – đến lá – từ tim</span></p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    // Khởi tạo loader
    init() {
        // Chờ DOM load xong
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadFooter();
            });
        } else {
            this.loadFooter();
        }
    }
}

// Tự động khởi tạo khi file được load
const footerLoader = new FooterLoader();
footerLoader.init(); 