class BlogManager {
  constructor() {
    this.API_BASE = "http://localhost:8080";
    this.blogPostsContainer = null;
    this.loadingDiv = null;
    this.blogLoading = null;
    this.allBlogs = [];
    this.currentIndex = 0;
    this.pageSize = 9; // Show 9 blogs by default
    this.loadMoreBtn = null;
    this.loadMoreSection = null;
    this.init();
  }

  init() {
    this.blogPostsContainer = document.getElementById("blogPostsContainer");
    this.loadingDiv = document.getElementById("blogPostsLoading");
    this.blogLoading = document.getElementById("blogLoading");
    this.loadMoreSection = document.getElementById("loadMoreSection");
    this.loadMoreBtn = this.loadMoreSection
      ? this.loadMoreSection.querySelector("button")
      : null;

    if (this.blogPostsContainer) {
      this.loadBlogPosts();
    }

    // Add event listener to load more button
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener("click", () => {
        this.loadMore();
      });
    }
  }

  async loadBlogPosts() {
    try {
      // Hiển thị loading overlay
      if (this.blogLoading) {
        this.blogLoading.style.display = "flex";
      }

      const response = await fetch(`${this.API_BASE}/api/blogs`);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu blog");
      }

      const blogs = await response.json();
      this.allBlogs = blogs;

      // Ẩn loading state
      if (this.loadingDiv) {
        this.loadingDiv.style.display = "none";
      }
      if (this.blogLoading) {
        this.blogLoading.style.display = "none";
      }

      if (blogs.length === 0) {
        this.showEmptyState();
        return;
      }

      // Initialize currentIndex to show first pageSize blogs
      this.currentIndex = Math.min(this.pageSize, blogs.length);
      this.renderBlogPosts();
    } catch (error) {
      console.error("Error loading blog posts:", error);
      this.showErrorState();
    }
  }

  showEmptyState() {
    if (this.blogPostsContainer) {
      this.blogPostsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="text-muted mb-3">
                        <i class="fas fa-newspaper fa-3x"></i>
                    </div>
                    <h5 class="text-muted">Chưa có bài viết nào</h5>
                    <p class="text-muted">Chúng tôi sẽ sớm chia sẻ những câu chuyện thú vị về gỗ tái sinh</p>
                </div>
            `;
    }
  }

  showErrorState() {
    if (this.loadingDiv) {
      this.loadingDiv.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="text-danger mb-3">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <h5 class="text-danger">Không thể tải bài viết</h5>
                    <p class="text-muted">Vui lòng thử lại sau hoặc liên hệ với chúng tôi</p>
                    <button onclick="blogManager.loadBlogPosts()" class="btn btn-primary mt-3">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
    }
    if (this.blogLoading) {
      this.blogLoading.style.display = "none";
    }
  }

  renderBlogPosts() {
    if (!this.blogPostsContainer) return;

    // Clear container
    this.blogPostsContainer.innerHTML = "";

    // Render blogs up to currentIndex
    for (let i = 0; i < this.currentIndex; i++) {
      const blog = this.allBlogs[i];
      if (!blog) continue;

      const blogCol = document.createElement("div");
      blogCol.className = "col-12 col-sm-6 col-md-4 mb-5";

      // Format date
      const blogDate = blog.date
        ? new Date(blog.date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      // Use default image if none provided
      const blogImage = blog.image || "images/post-1.jpg";

      blogCol.innerHTML = `
        <div class="post-entry">
          <a href="javascript:void(0)" class="post-thumbnail" data-blog-id="${
            blog.id
          }" data-blog-title="${blog.title}" data-blog-content="${
        blog.content
      }" data-blog-author="${blog.author || "Mộc Tái Sinh"}" data-blog-date="${
        blog.date || ""
      }" data-blog-image="${blogImage}">
            <img src="${blogImage}" alt="${blog.title}">
          </a>
          <div class="post-content-entry">
            <h3><a href="javascript:void(0)" data-blog-id="${
              blog.id
            }" data-blog-title="${blog.title}" data-blog-content="${
        blog.content
      }" data-blog-author="${blog.author || "Mộc Tái Sinh"}" data-blog-date="${
        blog.date || ""
      }" data-blog-image="${blogImage}">${blog.title}</a></h3>
            <div class="meta">
              <span>Tác giả: ${blog.author || "Mộc Tái Sinh"}</span>
              ${
                blogDate
                  ? `<span style="margin-left: auto;">${blogDate}</span>`
                  : ""
              }
            </div>
            <p>${
              blog.content.length > 150
                ? blog.content.substring(0, 150) + "..."
                : blog.content
            }</p>
            <a href="javascript:void(0)" class="read-more" data-blog-id="${
              blog.id
            }" data-blog-title="${blog.title}" data-blog-content="${
        blog.content
      }" data-blog-author="${blog.author || "Mộc Tái Sinh"}" data-blog-date="${
        blog.date || ""
      }" data-blog-image="${blogImage}">Đọc thêm</a>
          </div>
        </div>
      `;

      // Add event listeners after creating the element
      const thumbnail = blogCol.querySelector(".post-thumbnail");
      const titleLink = blogCol.querySelector("h3 a");
      const readMore = blogCol.querySelector(".read-more");

      [thumbnail, titleLink, readMore].forEach((element) => {
        if (element) {
          element.addEventListener("click", (e) => {
            e.preventDefault();
            const id = element.getAttribute("data-blog-id");
            const title = element.getAttribute("data-blog-title");
            const content = element.getAttribute("data-blog-content");
            const author = element.getAttribute("data-blog-author");
            const date = element.getAttribute("data-blog-date");
            const image = element.getAttribute("data-blog-image");
            this.showBlogDetail(id, title, content, author, date, image);
          });
        }
      });

      this.blogPostsContainer.appendChild(blogCol);
    }

    // Show/hide load more button based on whether there are more blogs to show
    if (this.loadMoreSection) {
      if (this.currentIndex < this.allBlogs.length) {
        this.loadMoreSection.style.display = "block";
      } else {
        this.loadMoreSection.style.display = "none";
      }
    }
  }

  loadMore() {
    if (this.blogLoading) {
      this.blogLoading.style.display = "flex";
    }

    setTimeout(() => {
      this.currentIndex = Math.min(
        this.currentIndex + this.pageSize,
        this.allBlogs.length
      );
      this.renderBlogPosts();

      if (this.blogLoading) {
        this.blogLoading.style.display = "none";
      }
    }, 600);
  }

  showBlogDetail(id, title, content, author, date, image) {
    // Format date
    const blogDate = date
      ? new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const modal = document.createElement("div");
    modal.id = "blogDetailModal";
    modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            padding: 20px;
        `;

    modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease-out;
            ">
                <div style="position: relative;">
                    <button onclick="blogManager.closeBlogDetail()" style="
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        background: rgba(255,255,255,0.9);
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                        cursor: pointer;
                        z-index: 10;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                    
                    <div style="border-radius: 16px 16px 0 0; overflow: hidden;">
                        <img src="${image}" alt="${this.escapeHtml(
      title
    )}" style="width: 100%; height: 350px; object-fit: cover;">
                    </div>
                    
                    <div style="padding: 32px; padding-bottom: 16px;">
                        <h2 style="margin-bottom: 16px; color: #3b5d50; font-size: 1.8rem; font-weight: 600;">${this.escapeHtml(
                          title
                        )}</h2>
                        
                        <div style="margin-bottom: 0; color: #666; font-size: 0.9rem;">
                            <span style="font-weight: 500;">Tác giả: ${this.escapeHtml(
                              author || "Mộc Tái Sinh"
                            )}</span>
                            ${
                              blogDate
                                ? `<span style="margin: 0 8px;">•</span><span>${blogDate}</span>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
                
                <div style="
                    padding: 0 32px 32px 32px;
                    border-top: 1px solid #eee;
                ">
                    <div style="padding-top: 24px; line-height: 1.8; color: #333; font-size: 1rem;">
                        ${content.replace(/\n/g, "<br>")}
                    </div>
                    
                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                        <div style="margin-bottom: 12px;">
                            <a href="shop.html" style="
                                display: inline-block;
                                padding: 8px 16px;
                                background: #3b5d50;
                                color: white;
                                text-decoration: none;
                                border-radius: 6px;
                                font-size: 14px;
                                font-weight: 500;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#2d4a3f'" onmouseout="this.style.background='#3b5d50'">
                                <i class="fas fa-shopping-bag" style="margin-right: 6px;"></i>
                                Khám phá sản phẩm
                            </a>
                        </div>
                        <div style="color: #666; font-size: 12px;">
                            © 2025 <a href="index.html" style="color: #3b5d50; text-decoration: none; font-weight: 500;">moctaisinh.vn</a> - Hành trình mộc tái sinh
                        </div>
                    </div>
                </div>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            @keyframes modalSlideOut {
                from {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeBlogDetail();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeBlogDetail();
      }
    });
  }

  closeBlogDetail() {
    const modal = document.getElementById("blogDetailModal");
    if (modal) {
      modal.style.animation = "modalSlideOut 0.2s ease-in";
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 200);
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize blog manager immediately
window.blogManager = new BlogManager();

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  if (window.blogManager) {
    window.blogManager.init();
  }
});
