
// Payment Page Logic

// Bank Configuration (Demo - VietQR compatible)
// Bank Configuration (VietQR - Vikki Bank)
const BANK_CONFIG = {
    bankId: 'VIKKI',              // Bank ID VietQR của Vikki Bank
    bankName: 'Vikki Bank',
    accountNo: '919498172',        // STK mới
    accountName: 'PCS', // <-- đổi đúng tên chủ TK
    template: 'compact2'
};


let currentOrder = null;
let countdownInterval = null;

// Get Order ID from URL
function getOrderId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Load Order Data
async function loadOrder() {
    const orderId = getOrderId();

    if (!orderId) {
        alert('Không tìm thấy đơn hàng!');
        window.location.href = 'cart.html';
        return;
    }

    try {
        const doc = await db.collection('orders').doc(orderId).get();

        if (!doc.exists) {
            alert('Đơn hàng không tồn tại!');
            window.location.href = 'cart.html';
            return;
        }

        currentOrder = { id: doc.id, ...doc.data() };
        renderOrderDetails();
        hideLoading();

    } catch (error) {
        console.error('Error loading order:', error);
        alert('Lỗi tải đơn hàng: ' + error.message);
        hideLoading();
    }
}

// Render Order Details
function renderOrderDetails() {
    if (!currentOrder) return;

    // Order ID
    document.getElementById('order-id-display').textContent = currentOrder.id.substring(0, 10).toUpperCase();

    // Order Items
    const itemsContainer = document.getElementById('order-items-list');
    itemsContainer.innerHTML = '';

    currentOrder.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        `;
        itemsContainer.appendChild(div);
    });

    // Total
    document.getElementById('order-total-amount').textContent = formatCurrency(currentOrder.total);
    document.getElementById('cod-amount').textContent = formatCurrency(currentOrder.total);
    document.getElementById('bank-amount').textContent = formatCurrency(currentOrder.total);

    // Shipping Info
    document.getElementById('ship-name-display').textContent = currentOrder.customerName;
    document.getElementById('ship-phone-display').textContent = currentOrder.phone;
    document.getElementById('ship-address-display').textContent = currentOrder.address;

    if (currentOrder.note) {
        document.getElementById('ship-note-container').style.display = 'flex';
        document.getElementById('ship-note-display').textContent = currentOrder.note;
    }

    // Payment Method
    if (currentOrder.paymentMethod === 'banking') {
        setupBankingPayment();
    } else {
        setupCODPayment();
    }

    // Transfer Content
    document.getElementById('transfer-content').textContent = 'DH' + currentOrder.id.substring(0, 8).toUpperCase();
}

// Setup COD Payment
function setupCODPayment() {
    document.getElementById('cod-section').style.display = 'block';
    document.getElementById('qr-section').style.display = 'none';

    document.getElementById('method-title').textContent = 'Thanh toán khi nhận hàng (COD)';
    document.getElementById('method-desc').textContent = 'Thanh toán bằng tiền mặt khi nhận hàng';
    document.querySelector('#payment-method-display i').className = 'fas fa-money-bill-wave';

    document.getElementById('confirm-btn-text').textContent = 'Xác Nhận Đặt Hàng';
}

// Setup Banking Payment with VietQR
function setupBankingPayment() {
    document.getElementById('cod-section').style.display = 'none';
    document.getElementById('qr-section').style.display = 'block';

    document.getElementById('method-title').textContent = 'Chuyển khoản ngân hàng';
    document.getElementById('method-desc').textContent = 'Quét mã QR hoặc chuyển khoản thủ công';
    document.querySelector('#payment-method-display i').className = 'fas fa-university';

    document.getElementById('confirm-btn-text').textContent = 'Tôi Đã Thanh Toán';

    // Bank Info
    document.getElementById('bank-name').textContent = BANK_CONFIG.bankName;
    document.getElementById('bank-account').textContent = BANK_CONFIG.accountNo;
    document.getElementById('bank-holder').textContent = BANK_CONFIG.accountName;

    // Generate VietQR Code
    generateVietQR();

    // Start Countdown
    startCountdown(15 * 60); // 15 minutes
}

// Generate VietQR Code using VietQR API
function generateVietQR() {
    const transferContent = 'DH' + currentOrder.id.substring(0, 8).toUpperCase();
    const amount = currentOrder.total;

    // VietQR Quick Link format
    // https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}&accountName={ACCOUNT_NAME}
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-${BANK_CONFIG.template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

    document.getElementById('qr-code-img').src = qrUrl;
    document.getElementById('qr-code-img').alt = 'Mã QR Thanh Toán - ' + transferContent;
}

// Countdown Timer
function startCountdown(seconds) {
    let remaining = seconds;

    function updateDisplay() {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('countdown').textContent =
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay();

    countdownInterval = setInterval(() => {
        remaining--;
        updateDisplay();

        if (remaining <= 0) {
            clearInterval(countdownInterval);
            alert('Hết thời gian thanh toán! Đơn hàng sẽ bị hủy.');
            cancelOrder();
        }

        // Warning at 5 minutes
        if (remaining === 300) {
            document.getElementById('countdown-timer').style.background = 'rgba(255, 71, 87, 0.3)';
        }
    }, 1000);
}

// Cancel Order
async function cancelOrder() {
    if (!currentOrder) return;

    try {
        await db.collection('orders').doc(currentOrder.id).update({
            status: 'cancelled'
        });
        window.location.href = 'cart.html';
    } catch (error) {
        console.error('Error cancelling order:', error);
    }
}

// Confirm Payment
window.confirmPayment = async () => {
    if (!currentOrder) return;

    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        // Update order status
        const newStatus = currentOrder.paymentMethod === 'banking' ? 'paid' : 'confirmed';

        await db.collection('orders').doc(currentOrder.id).update({
            status: newStatus,
            paidAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear countdown if exists
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        // Redirect to success page
        window.location.href = `order-success.html?orderId=${currentOrder.id}`;

    } catch (error) {
        console.error('Error confirming payment:', error);
        alert('Lỗi xác nhận thanh toán: ' + error.message);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> <span id="confirm-btn-text">Xác Nhận</span>';
    }
};

// Copy to Clipboard
window.copyToClipboard = (elementId) => {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const btn = document.querySelector(`#${elementId} + .copy-btn`) ||
            document.querySelector(`span:has(#${elementId}) .copy-btn`);
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Đã copy';
            btn.style.background = 'var(--accent-color)';
            btn.style.color = '#000';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Copy failed:', err);
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Đã copy: ' + text);
    });
};

// Hide Loading
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Initialize
loadOrder();
