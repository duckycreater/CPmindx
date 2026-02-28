
// DOM Elements
const productsList = document.getElementById('products-list');
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const adminLink = document.getElementById('admin-link');
const logoutBtn = document.getElementById('logout-btn');
const cartCount = document.getElementById('cart-count') || document.getElementById('cart-count-badge');

// Format Price
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Check Auth State
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';

        // Get user details from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            userName.textContent = userData.username || user.displayName;
            userEmail.textContent = userData.email;
            userAvatar.textContent = (userData.username || user.email || 'U')[0].toUpperCase();

            // Check Admin Role (Assuming role_id 0 is admin)
            if (userData.role_id === 0) {
                adminLink.style.display = 'block';
            }
        }
    } else {
        // User is signed out
        authButtons.style.display = 'block';
        userMenu.style.display = 'none';
    }
});

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.reload();
        });
    });
}

// User Menu Toggle
if (userMenu) {
    userMenu.addEventListener('click', () => {
        const dropdown = document.getElementById('dropdown-menu');
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            document.getElementById('dropdown-menu').classList.remove('show');
        }
    });
}

// Fetch Products
async function fetchProducts() {
    try {
        const snapshot = await db.collection('products').get();
        productsList.innerHTML = '';

        if (snapshot.empty) {
            productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Chưa có sản phẩm nào.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const product = doc.data();
            const productCard = document.createElement('div');
            // Setup card for double click
            productCard.classList.add('clickable-card');
            productCard.setAttribute('ondblclick', `window.location.href='product-detail.html?id=${doc.id}'`);
            productCard.title = "Nhấp đúp để xem chi tiết";

            // Render content without <a> tags
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <button class="btn btn-primary add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${doc.id}', '${product.name}', ${product.price})">
                        <i class="fas fa-cart-plus"></i> Thêm Vào Giỏ
                    </button>
                </div>
            `;

            productsList.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error getting products: ", error);
        productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Lỗi tải sản phẩm.</p>';
    }
}

// Cart Logic (Basic LocalStorage)
window.addToCart = (id, name, price) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Đã thêm vào giỏ hàng!');
};

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCount) cartCount.textContent = count;
}

// Initial Load
if (productsList) {
    fetchProducts();
}
updateCartCount();
