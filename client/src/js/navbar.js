
const navbarHTML = `
<nav class="navbar">
    <div class="container nav-content">
        <a href="index.html" class="logo">
            <i class="fas fa-desktop"></i> PC<span class="logo-highlight">Shop</span>
        </a>

        <div class="nav-links">
            <a href="index.html" id="link-home">Trang Chủ</a>
            <a href="products.html" id="link-products">Sản Phẩm</a>
            <a href="build-pc.html" id="link-build" style="color: var(--accent-color);">Xây Dựng PC</a>
            <a href="cart.html" id="link-cart">Giỏ Hàng <span id="cart-count-badge" class="badge">0</span></a>
        </div>

        <div class="nav-actions">
            <div id="auth-buttons">
                <a href="login.html" class="btn btn-primary" style="padding: 8px 15px;">Đăng Nhập</a>
            </div>

            <div id="user-menu" class="user-menu" style="display: none;">
                <div class="user-avatar" id="user-avatar">U</div>
                <div class="dropdown-menu" id="dropdown-menu">
                    <div style="padding: 10px 15px; border-bottom: 1px solid var(--border-color);">
                        <div id="user-name" style="font-weight: bold; font-size: 0.9rem;">User</div>
                        <small id="user-email" style="color: var(--text-muted); font-size: 0.8rem;">email@example.com</small>
                    </div>
                    <a href="admin.html" id="admin-link" style="display: none;"><i class="fas fa-cog"></i> Quản Trị</a>
                    <a href="my-orders.html"><i class="fas fa-box"></i> Đơn Hàng Của Tôi</a>
                    <a href="javascript:void(0)"><i class="fas fa-user"></i> Hồ Sơ</a>
                    <a href="javascript:void(0)" id="logout-btn" style="color: var(--danger-color);"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</a>
                </div>
            </div>
        </div>
    </div>
</nav>
`;

// Inject Navbar
const navbarPlaceholder = document.getElementById('navbar-placeholder');
if (navbarPlaceholder) {
    navbarPlaceholder.innerHTML = navbarHTML;
} else {
    // Fallback if placeholder not found, try to replace existing nav if any, or prepend to body
    const existingNav = document.querySelector('nav');
    if (existingNav) existingNav.outerHTML = navbarHTML;
    else document.body.insertAdjacentHTML('afterbegin', navbarHTML);
}

// Highlight Active Link
const path = window.location.pathname;
const page = path.split("/").pop();

const linkHome = document.getElementById('link-home');
const linkProducts = document.getElementById('link-products');
const linkBuild = document.getElementById('link-build');
const linkCart = document.getElementById('link-cart');

// Remove all active classes first (conceptually, though new HTML is clean)
if (linkHome) linkHome.classList.remove('active');
if (linkProducts) linkProducts.classList.remove('active');
if (linkBuild) linkBuild.classList.remove('active');
if (linkCart) linkCart.classList.remove('active');

// Add active class
if (page === 'index.html' || page === '') {
    if (linkHome) linkHome.classList.add('active');
} else if (page === 'products.html' || page === 'product-detail.html') {
    if (linkProducts) linkProducts.classList.add('active');
} else if (page === 'build-pc.html') {
    if (linkBuild) linkBuild.classList.add('active');
} else if (page === 'cart.html') {
    if (linkCart) linkCart.classList.add('active');
}
