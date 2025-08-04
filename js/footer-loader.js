class FooterLoader {
    constructor() {
        this.footerContainer = null;
        this.footerPath = 'footer.html';
    }
    findFooterContainer() {
        this.footerContainer = document.querySelector('.footer-section') || 
                              document.getElementById('footer') ||
                              document.querySelector('footer');
        if (!this.footerContainer) {
            this.footerContainer = document.createElement('div');
            this.footerContainer.id = 'footer-container';
            document.body.appendChild(this.footerContainer);
        }
        return this.footerContainer;
    }
    async loadFooter() {
        try {
            const response = await fetch(this.footerPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerHTML = await response.text();
            const container = this.findFooterContainer();
            container.innerHTML = footerHTML;
            document.dispatchEvent(new CustomEvent('footerLoaded'));
        } catch (error) {
            this.loadFallbackFooter();
        }
    }
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
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadFooter();
            });
        } else {
            this.loadFooter();
        }
    }
}
const footerLoader = new FooterLoader();
footerLoader.init(); 