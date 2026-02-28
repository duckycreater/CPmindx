
// DOM Elements
const productTableBody = document.getElementById('product-table-body');
const userTableBody = document.getElementById('user-table-body'); // New
const openAddModalBtn = document.getElementById('open-add-modal-btn');
const productModal = document.getElementById('product-modal');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');

// Inputs
const productNameInput = document.getElementById('product-name');
const productCategoryInput = document.getElementById('product-category');
const productPriceInput = document.getElementById('product-price');
const productImageInput = document.getElementById('product-image');
const productImageFileInput = document.getElementById('product-image-file');
const previewImg = document.getElementById('preview-img');

const productBenchmarkInput = document.getElementById('product-benchmark');
const productSpecsInput = document.getElementById('product-specs');

// Navigation Elements
const navDashboard = document.getElementById('nav-dashboard');
const navProducts = document.getElementById('nav-products');
const navUsers = document.getElementById('nav-users');
const navOrders = document.getElementById('nav-orders');

const sectionDashboard = document.getElementById('section-dashboard');
const sectionProducts = document.getElementById('section-products');
const sectionUsers = document.getElementById('section-users');
const sectionOrders = document.getElementById('section-orders');

// Orders Table
const orderTableBody = document.getElementById('order-table-body');

// Dashboard Stats Elements
const totalProductsEl = document.getElementById('total-products');
const totalUsersEl = document.getElementById('total-users');

let isEditMode = false;
let editingProductId = null;

// --- Authentication Check ---
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.role_id !== 0) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = 'index.html';
        } else {
            // Init Admin Data
            initAdmin();
        }
    } else {
        window.location.href = 'index.html';
    }
});

function initAdmin() {
    fetchDashboardStats();
    fetchAdminProducts();
    fetchUsers();
    fetchOrders();
}

// --- Navigation Logic ---
function switchTab(tabName) {
    // Remove active class from all navs
    navDashboard.classList.remove('active');
    navProducts.classList.remove('active');
    navUsers.classList.remove('active');
    navOrders.classList.remove('active');

    // Hide all sections
    sectionDashboard.style.display = 'none';
    sectionProducts.style.display = 'none';
    sectionUsers.style.display = 'none';
    sectionOrders.style.display = 'none';

    // Activate selected
    if (tabName === 'dashboard') {
        navDashboard.classList.add('active');
        sectionDashboard.style.display = 'block';
    } else if (tabName === 'products') {
        navProducts.classList.add('active');
        sectionProducts.style.display = 'block';
    } else if (tabName === 'users') {
        navUsers.classList.add('active');
        sectionUsers.style.display = 'block';
    } else if (tabName === 'orders') {
        navOrders.classList.add('active');
        sectionOrders.style.display = 'block';
    }
}

navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
navProducts.addEventListener('click', (e) => { e.preventDefault(); switchTab('products'); });
navUsers.addEventListener('click', (e) => { e.preventDefault(); switchTab('users'); });
navOrders.addEventListener('click', (e) => { e.preventDefault(); switchTab('orders'); });

// --- Image Preview Handler ---
if (productImageFileInput) {
    productImageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewImg.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewImg.style.display = 'none';
        }
    });
}


// --- Dashboard Statistics ---
function fetchDashboardStats() {
    // Real-time listener for counts (Note: Collection size is expensive in pricing if large, 
    // but for this scale using snapshot.size is fine)

    db.collection('products').onSnapshot(snap => {
        totalProductsEl.textContent = snap.size;
    });

    db.collection('users').onSnapshot(snap => {
        totalUsersEl.textContent = snap.size;
    });
}


// --- User Management ---
function fetchUsers() {
    db.collection('users').onSnapshot((snapshot) => {
        userTableBody.innerHTML = '';
        if (snapshot.empty) {
            userTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Chưa có người dùng nào.</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const user = doc.data();
            const row = document.createElement('tr');

            // Determine role label
            let roleLabel = 'Khách';
            if (user.role_id === 0) roleLabel = '<span style="color:red; font-weight:bold;">Admin</span>';
            else if (user.role_id === 1) roleLabel = 'Member';

            const avatarChar = (user.username || user.email || 'U')[0].toUpperCase();

            row.innerHTML = `
                <td><div style="width: 35px; height: 35px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${avatarChar}</div></td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${roleLabel}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteUser('${doc.id}')" title="Xóa User (Demo)"><i class="fas fa-trash"></i></button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    });
}

// Delete User (Caution: This requires backend auth rules allowing generic deletes, or it will fail)
window.deleteUser = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
        try {
            await db.collection('users').doc(id).delete();
            alert('Đã xóa người dùng.');
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa: ' + error.message);
        }
    }
}


// --- Order Management ---
const STATUS_OPTIONS = {
    'pending': { label: 'Chờ xác nhận', color: '#ffc107' },
    'confirmed': { label: 'Đã xác nhận', color: '#00d2ff' },
    'paid': { label: 'Đã thanh toán', color: '#00d2ff' },
    'shipping': { label: 'Đang giao', color: '#9c27b0' },
    'completed': { label: 'Hoàn thành', color: '#2ed573' },
    'cancelled': { label: 'Đã hủy', color: '#ff4757' }
};

function fetchOrders() {
    db.collection('orders').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        orderTableBody.innerHTML = '';
        if (snapshot.empty) {
            orderTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có đơn hàng nào.</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const order = doc.data();
            const row = document.createElement('tr');

            const status = STATUS_OPTIONS[order.status] || STATUS_OPTIONS['pending'];
            const paymentMethod = order.paymentMethod === 'banking' ? 'Chuyển khoản' : 'COD';

            // Status dropdown
            let statusOptions = '';
            Object.entries(STATUS_OPTIONS).forEach(([key, val]) => {
                const selected = key === order.status ? 'selected' : '';
                statusOptions += `<option value="${key}" ${selected}>${val.label}</option>`;
            });

            row.innerHTML = `
                <td style="font-weight: 600; color: var(--accent-color);">#${doc.id.substring(0, 8).toUpperCase()}</td>
                <td>
                    <div style="font-weight: 500;">${order.customerName}</div>
                    <small style="color: var(--text-muted);">${order.phone}</small>
                </td>
                <td>${formatPrice(order.total)}</td>
                <td>${paymentMethod}</td>
                <td>
                    <select onchange="updateOrderStatus('${doc.id}', this.value)" 
                            style="padding: 5px 10px; border-radius: 5px; background: ${status.color}20; 
                                   color: ${status.color}; border: 1px solid ${status.color}; font-weight: 600;">
                        ${statusOptions}
                    </select>
                </td>
                <td>
                    <button class="action-btn edit-btn" onclick="viewOrderDetails('${doc.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteOrder('${doc.id}')" title="Xóa đơn hàng">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            orderTableBody.appendChild(row);
        });
    });
}

// Update Order Status
window.updateOrderStatus = async (orderId, newStatus) => {
    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus
        });
        // No need to reload - onSnapshot will update automatically
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Lỗi cập nhật: ' + error.message);
    }
};

// View Order Details
window.viewOrderDetails = (orderId) => {
    window.open(`payment.html?orderId=${orderId}`, '_blank');
};

// Delete Order
window.deleteOrder = async (orderId) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        try {
            await db.collection('orders').doc(orderId).delete();
            alert('Đã xóa đơn hàng.');
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Lỗi xóa đơn: ' + error.message);
        }
    }
};

// Format Price
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Fetch Products for Admin Table
function fetchAdminProducts() {
    db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        productTableBody.innerHTML = '';
        if (snapshot.empty) {
            productTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Chưa có sản phẩm nào.</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const product = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td style="font-weight: 500;">${product.name}</td>
                <td style="text-transform: capitalize;">${product.category}</td>
                <td>${formatPrice(product.price)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEditModal('${doc.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    });
}

// Open Edit Modal
window.openEditModal = async (id) => {
    try {
        const doc = await db.collection('products').doc(id).get();
        if (!doc.exists) return alert("Sản phẩm không tồn tại");

        const data = doc.data();
        isEditMode = true;
        editingProductId = id;

        modalTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
        productNameInput.value = data.name;
        productCategoryInput.value = data.category;
        productPriceInput.value = data.price;
        productImageInput.value = data.image; // Store current URL
        productBenchmarkInput.value = data.benchmarkScore || '';
        productSpecsInput.value = data.specs ? JSON.stringify(data.specs, null, 2) : '';

        // Show current image preview
        if (data.image && previewImg) {
            previewImg.src = data.image;
            previewImg.style.display = 'block';
        }

        productModal.classList.add('active');
    } catch (e) {
        console.error(e);
        alert("Lỗi tải thông tin: " + e.message);
    }
};

// Handle Form Submit (Add or Edit)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = productNameInput.value;
    const category = productCategoryInput.value;
    const price = Number(productPriceInput.value);
    const image = productImageInput.value;
    const benchmarkScore = Number(productBenchmarkInput.value) || 0;

    let specs = {};
    try {
        if (productSpecsInput.value.trim()) {
            specs = JSON.parse(productSpecsInput.value);
        }
    } catch (err) {
        alert("Định dạng JSON ở 'Thông số kỹ thuật' không hợp lệ!");
        return;
    }

    try {
        let imageUrl = productImageInput.value; // Use existing URL if editing

        // Check if new image file is selected
        const imageFile = productImageFileInput.files[0];
        if (imageFile) {
            // Show loading state
            const submitBtn = productForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
            submitBtn.disabled = true;

            try {
                imageUrl = await uploadToCloudinary(imageFile);
            } catch (uploadError) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert('Lỗi upload ảnh lên Cloudinary. Vui lòng kiểm tra cấu hình!');
                return;
            }

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        if (!imageUrl) {
            alert('Vui lòng chọn hình ảnh sản phẩm!');
            return;
        }

        const productData = {
            name, category, price, image: imageUrl, benchmarkScore, specs
        };

        if (isEditMode && editingProductId) {
            // Update
            await db.collection('products').doc(editingProductId).update(productData);
            alert('Cập nhật sản phẩm thành công!');
        } else {
            // Add
            await db.collection('products').add({
                ...productData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('Thêm sản phẩm thành công!');
        }

        // Reset and Close
        resetModal();

    } catch (error) {
        console.error("Error saving product: ", error);
        alert('Có lỗi xảy ra: ' + error.message);
    }
});

// Delete Product
window.deleteProduct = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        try {
            await db.collection('products').doc(id).delete();
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert('Xóa thất bại: ' + error.message);
        }
    }
};

// Link Modal Logic
openAddModalBtn.addEventListener('click', () => {
    resetModal();
    productModal.classList.add('active');
});

cancelModalBtn.addEventListener('click', resetModal);

productModal.addEventListener('click', (e) => {
    if (e.target === productModal) resetModal();
});

function resetModal() {
    isEditMode = false;
    editingProductId = null;
    modalTitle.textContent = 'Thêm Sản Phẩm Mới';
    productForm.reset();
    productImageInput.value = '';
    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
    productModal.classList.remove('active');
}


// --- Seeding Feature ---
window.seedProducts = async () => {
    if (!confirm('Bạn có muốn thêm dữ liệu mẫu (sản phẩm) vào cơ sở dữ liệu không?')) return;

    const sampleProducts = [
        // ===== CPU =====
        // ===== GAMING MOUSE =====
        {
            name: "Logitech G Pro X Superlight",
            category: "mouse",
            price: 2900000,
            image: "https://product.hstatic.net/200000722513/product/g-pro-x-superlight_1d3c6f7b9a8e4f5c2_master.png",
            specs: {
                DPI: "25600",
                Weight: "63g",
                Sensor: "HERO"
            }
        },

        // ===== MONITORS =====
        {
            name: "LG UltraGear 27GP850",
            category: "monitor",
            price: 8500000,
            image: "https://product.hstatic.net/200000722513/product/27gp850_1_d2f3a4b5c6e7d8f_master.jpg",
            specs: {
                Size: "27 inch",
                Resolution: "2K QHD",
                RefreshRate: "165Hz",
                Panel: "Nano IPS"
            }
        },
        {
            name: "Asus TUF Gaming VG279QM",
            category: "monitor",
            price: 7200000,
            image: "https://product.hstatic.net/200000722513/product/vg279qm_1_a1b2c3d4e5f6g7h_master.jpg",
            specs: {
                Size: "27 inch",
                Resolution: "Full HD",
                RefreshRate: "280Hz",
                Panel: "Fast IPS"
            }
        },
        {
            name: "Samsung Odyssey G5 27 inch",
            category: "monitor",
            price: 6100000,
            image: "https://product.hstatic.net/200000722513/product/odyssey-g5_1_a1b2c3d4e5f6g7h_master.jpg",
            specs: {
                Size: "27 inch",
                Resolution: "2K QHD",
                RefreshRate: "144Hz",
                Panel: "VA Curved"
            }
        },

        // ===== SSD/HDD =====
        {
            name: "Samsung 970 EVO Plus 1TB",
            category: "storage",
            price: 2450000,
            image: "https://product.hstatic.net/200000722513/product/970-evo-plus_1_d2f3a4b5c6e7d8f_master.jpg",
            specs: {
                Type: "NVMe SSD",
                Capacity: "1TB",
                ReadSpeed: "3500MB/s",
                WriteSpeed: "3300MB/s"
            }
        },
        {
            name: "Kingston NV2 500GB",
            category: "storage",
            price: 1050000,
            image: "https://product.hstatic.net/200000722513/product/nv2-500gb_1_a1b2c3d4e5f6g7h_master.jpg",
            specs: {
                Type: "NVMe Gen4",
                Capacity: "500GB",
                ReadSpeed: "3500MB/s"
            }
        },
        {
            name: "Seagate Barracuda 2TB",
            category: "storage",
            price: 1450000,
            image: "https://product.hstatic.net/200000722513/product/barracuda-2tb_1_a1b2c3d4e5f6g7h_master.jpg",
            specs: {
                Type: "HDD",
                Capacity: "2TB",
                RPM: "7200",
                Cache: "256MB"
            }
        },
        {
            name: "Razer DeathAdder V3 Pro",
            category: "mouse",
            price: 3400000,
            image: "https://product.hstatic.net/200000722513/product/deathadder-v3-pro_9a7c6b5e4d3f2a1c_master.png",
            specs: {
                DPI: "30000",
                Weight: "64g",
                Sensor: "Focus Pro"
            }
        },
        {
            name: "SteelSeries Rival 5",
            category: "mouse",
            price: 1600000,
            image: "https://product.hstatic.net/200000722513/product/rival-5_5e4d3c2b1a9f8c7_master.png",
            specs: {
                DPI: "18000",
                Buttons: "9",
                Weight: "85g"
            }
        },

        // ===== GAMING KEYBOARD =====
        {
            name: "Keychron K8 Pro RGB",
            category: "keyboard",
            price: 2500000,
            image: "https://product.hstatic.net/200000722513/product/keychron-k8-pro_7a8b9c6d5e4f3a2_master.png",
            specs: {
                Layout: "TKL",
                Switch: "Hot-swap",
                Connection: "Bluetooth + Type-C"
            }
        },
        {
            name: "Logitech G Pro X Mechanical",
            category: "keyboard",
            price: 3100000,
            image: "https://product.hstatic.net/200000722513/product/g-pro-x-keyboard_4f3e2d1c9b8a7_master.png",
            specs: {
                Layout: "TKL",
                Switch: "GX Blue",
                RGB: "Lightsync"
            }
        },
        {
            name: "Razer BlackWidow V4",
            category: "keyboard",
            price: 4200000,
            image: "https://product.hstatic.net/200000722513/product/blackwidow-v4_8a9b7c6d5e4f3a2_master.png",
            specs: {
                Layout: "Full size",
                Switch: "Green Switch",
                RGB: "Per-key"
            }
        },

        // ===== GAMING HEADSET =====
        {
            name: "SteelSeries Arctis Nova 7",
            category: "headset",
            price: 4200000,
            image: "https://product.hstatic.net/200000722513/product/arctis-nova-7_1a2b3c4d5e6f7a8_master.png",
            specs: {
                Connection: "Wireless",
                Battery: "38h",
                Surround: "7.1"
            }
        },
        {
            name: "HyperX Cloud II Wireless",
            category: "headset",
            price: 3500000,
            image: "https://product.hstatic.net/200000722513/product/cloud-ii-wireless_9c8b7a6d5e4f3a2_master.png",
            specs: {
                Connection: "Wireless",
                Battery: "30h",
                Surround: "DTS"
            }
        },
        {
            name: "Razer BlackShark V2",
            category: "headset",
            price: 2600000,
            image: "https://product.hstatic.net/200000722513/product/blackshark-v2_3a2b1c4d5e6f7a8_master.png",
            specs: {
                Driver: "50mm",
                Surround: "7.1",
                Weight: "262g"
            }
        }

    ];

    try {
        const batch = db.batch();

        sampleProducts.forEach(item => {
            const docRef = db.collection('products').doc(); // Auto-gen ID
            batch.set(docRef, {
                ...item,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        alert(`Đã thêm ${sampleProducts.length} sản phẩm mẫu (bao gồm Laptop)!`);
    } catch (error) {
        console.error("Error seeding products: ", error);
        alert('Lỗi khi thêm dữ liệu mẫu: ' + error.message);
    }
};
