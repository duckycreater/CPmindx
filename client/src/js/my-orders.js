
// My Orders Page Logic

const ordersList = document.getElementById('orders-list');
const loginNotice = document.getElementById('login-notice');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');

// Status Labels
const STATUS_LABELS = {
    'pending': { text: 'Chờ xác nhận', class: 'status-pending' },
    'confirmed': { text: 'Đã xác nhận', class: 'status-confirmed' },
    'paid': { text: 'Đã thanh toán', class: 'status-confirmed' },
    'shipping': { text: 'Đang giao hàng', class: 'status-shipping' },
    'completed': { text: 'Hoàn thành', class: 'status-completed' },
    'cancelled': { text: 'Đã hủy', class: 'status-cancelled' }
};

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format Date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Check Auth and Load Orders
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Not logged in
        loadingState.style.display = 'none';
        loginNotice.style.display = 'block';
        return;
    }

    // Load user's orders
    try {
        const snapshot = await db.collection('orders')
            .where('userId', '==', user.uid)
            .get();

        loadingState.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            return;
        }

        ordersList.innerHTML = '';

        // Client-side sort (descending date)
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        orders.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        orders.forEach(order => {
            renderOrderCard(order.id, order);
        });

    } catch (error) {
        console.error('Error loading orders:', error);
        loadingState.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 10px;"></i>
            <p style="color: var(--danger-color);">Lỗi tải đơn hàng: ${error.message}</p>
        `;
    }
});

// Render Order Card
function renderOrderCard(orderId, order) {
    const status = STATUS_LABELS[order.status] || STATUS_LABELS['pending'];
    const paymentMethod = order.paymentMethod === 'banking' ? 'Chuyển khoản' : 'COD';

    // Items preview
    const itemsPreview = order.items
        .slice(0, 2)
        .map(item => `${item.name} x${item.quantity}`)
        .join(', ');
    const moreItems = order.items.length > 2 ? ` và ${order.items.length - 2} sản phẩm khác` : '';

    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
        <div class="order-card-header">
            <div>
                <span class="order-id">#${orderId.substring(0, 10).toUpperCase()}</span>
                <span class="order-date">• ${formatDate(order.createdAt)}</span>
            </div>
            <span class="order-status ${status.class}">${status.text}</span>
        </div>
        
        <div class="order-items-preview">
            <p><i class="fas fa-box" style="color: var(--accent-color); margin-right: 8px;"></i>${itemsPreview}${moreItems}</p>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 15px; font-size: 0.9rem; color: var(--text-muted);">
            <span><i class="fas fa-credit-card" style="margin-right: 5px;"></i>${paymentMethod}</span>
            <span><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${order.address.substring(0, 30)}...</span>
        </div>

        <div class="order-card-footer">
            <span class="order-total-price">${formatCurrency(order.total)}</span>
            <div>
                ${order.status === 'pending' ? `
                    <button class="btn btn-danger" style="padding: 8px 15px; font-size: 0.85rem;" onclick="cancelOrder('${orderId}')">
                        <i class="fas fa-times"></i> Hủy đơn
                    </button>
                ` : ''}
                <button class="btn btn-primary" style="padding: 8px 15px; font-size: 0.85rem;" onclick="viewOrderDetail('${orderId}')">
                    <i class="fas fa-eye"></i> Chi tiết
                </button>
            </div>
        </div>
    `;

    ordersList.appendChild(card);
}

// Cancel Order
window.cancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    try {
        await db.collection('orders').doc(orderId).update({
            status: 'cancelled'
        });
        alert('Đã hủy đơn hàng!');
        window.location.reload();
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Lỗi hủy đơn: ' + error.message);
    }
};

// View Order Detail (redirect to payment page or show modal)
window.viewOrderDetail = (orderId) => {
    // For now, redirect to payment page to see details
    window.location.href = `payment.html?orderId=${orderId}`;
};
