const orderItemsContainer = document.getElementById('order-items');
const subtotalEl = document.getElementById('subtotal-price');
const finalTotalEl = document.getElementById('final-total');

const shipName = document.getElementById('ship-name');
const shipPhone = document.getElementById('ship-phone');
const shipAddress = document.getElementById('ship-address');
const shipNote = document.getElementById('ship-note');

let cart = [];

/* ================= LOAD CART ================= */
function loadCheckout() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>Giỏ hàng trống.</p>';
        subtotalEl.innerText = '0 ₫';
        finalTotalEl.innerText = '0 ₫';
        return;
    }

    orderItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '8px';

        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div>x${item.quantity}</div>
            </div>
            <div>${itemTotal.toLocaleString('vi-VN')} ₫</div>
        `;

        orderItemsContainer.appendChild(div);
    });

    const formatted = total.toLocaleString('vi-VN') + ' ₫';
    subtotalEl.innerText = formatted;
    finalTotalEl.innerText = formatted;
}

/* ================= PREFILL USER ================= */
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const snap = await db.collection('users').doc(user.uid).get();
        if (snap.exists) {
            const data = snap.data();
            if (data.username) shipName.value = data.username;
        }
    }
});

/* ================= PLACE ORDER ================= */
async function placeOrder() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const name = shipName.value.trim();
    const phone = shipPhone.value.trim();
    const address = shipAddress.value.trim();
    const note = shipNote.value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (!name || !phone || !address) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    try {
        const user = auth.currentUser;
        const userId = user ? user.uid : 'guest';

        const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const orderData = {
            userId,
            customerName: name,
            phone,
            address,
            note,
            items: cart,
            total,
            paymentMethod,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const ref = await db.collection('orders').add(orderData);

        localStorage.removeItem('cart');

        window.location.href = `payment.html?orderId=${ref.id}`;

    } catch (err) {
        console.error(err);
        alert('Lỗi đặt hàng');
    }
}

/* ================= PREVENT RELOAD ================= */
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault(); // 🚫 CHẶN RELOAD
    placeOrder();
});

loadCheckout();
