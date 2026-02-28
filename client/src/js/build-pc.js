
const componentList = document.getElementById('component-list');
const totalPriceEl = document.getElementById('total-build-price');
const selectionModal = document.getElementById('selection-modal');
const selectionList = document.getElementById('selection-list');
const modalSlotTitle = document.getElementById('modal-slot-title');

const slots = [
    { key: 'cpu', name: 'Vi Xử Lý (CPU)' },
    { key: 'mainboard', name: 'Bo Mạch Chủ' },
    { key: 'ram', name: 'RAM' },
    { key: 'gpu', name: 'Card Đồ Họa (VGA)' },
    { key: 'storage', name: 'Ổ Cứng (SSD/HDD)' }, // using 'rom' key as per our data convention so far
    { key: 'psu', name: 'Nguồn (PSU)' },
    { key: 'case', name: 'Vỏ Máy (Case)' }
];

let currentBuild = {}; // key -> product object

// Initialize Slots
function initSlots() {
    componentList.innerHTML = '';
    slots.forEach(slot => {
        const item = currentBuild[slot.key];
        const hasItem = !!item;

        const el = document.createElement('div');
        el.className = 'component-slot';
        el.innerHTML = `
            <div class="slot-title">${slot.name}</div>
            <div class="selected-item">
                ${hasItem ? `<div style="display:flex; align-items:center; gap:10px;">
                                <img src="${item.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                                <div>
                                    <div style="font-weight:600; color:#fff;">${item.name}</div>
                                    <div style="font-size:0.9rem; color:var(--accent-color);">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</div>
                                </div>
                             </div>`
                : 'Chưa chọn linh kiện'}
            </div>
            ${hasItem
                ? `<button class="btn btn-danger" style="padding: 5px 10px;" onclick="removePart('${slot.key}')"><i class="fas fa-times"></i></button>`
                : `<button class="select-btn" onclick="openSelection('${slot.key}', '${slot.name}')">Chọn</button>`
            }
        `;
        componentList.appendChild(el);
    });
    updateTotal();
}

// Open Modal
window.openSelection = async (key, name) => {
    modalSlotTitle.textContent = `Chọn ${name}`;
    selectionList.innerHTML = '<p style="text-align:center; padding: 20px;">Đang tải dữ liệu...</p>';
    selectionModal.classList.add('active');

    try {
        // Query param "category" might need to map to our convention
        // Simple mapping: 'rom' might be stored as 'rom', 'ssd', etc. For now assuming strict match.
        // Or if we want to support multiple categories for one slot (e.g. SSD and HDD for storage), we need more complex logic.
        // Our 'rom' key in data was used for SSD in seed.

        const snapshot = await db.collection('products').where('category', '==', key).get();

        selectionList.innerHTML = '';
        if (snapshot.empty) {
            selectionList.innerHTML = '<p style="text-align:center; padding: 20px;">Không có linh kiện này trong kho.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const p = doc.data();
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <div style="flex-grow:1;">
                    <div style="font-weight:bold; color:#fff;">${p.name}</div>
                    <div style="color:var(--accent-color);">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                </div>
                <button class="btn btn-primary" onclick="selectPart('${key}', '${doc.id}')">Chọn</button>
            `;
            // Manually attach data to avoid escaping issues
            item.querySelector('button').onclick = () => selectPart(key, { id: doc.id, ...p });
            selectionList.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        selectionList.innerHTML = '<p style="color:red; text-align:center;">Lỗi tải dữ liệu.</p>';
    }
};

window.closeSelectionModal = () => {
    selectionModal.classList.remove('active');
};

window.selectPart = (key, product) => {
    currentBuild[key] = product;
    closeSelectionModal();
    initSlots();
    checkCompatibility();
};

window.removePart = (key) => {
    delete currentBuild[key];
    initSlots();
    checkCompatibility();
};

window.updateTotal = () => {
    let total = 0;
    Object.values(currentBuild).forEach(p => total += p.price);
    totalPriceEl.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
};

window.resetBuild = () => {
    if (confirm('Bạn có chắc muốn làm mới cấu hình?')) {
        currentBuild = {};
        initSlots();
    }
};

window.addAllToCart = () => {
    const parts = Object.values(currentBuild);
    if (parts.length === 0) {
        alert('Cấu hình đang trống!');
        return;
    }

    if (confirm(`Thêm ${parts.length} sản phẩm này vào giỏ hàng?`)) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        parts.forEach(p => {
            const existing = cart.find(c => c.id === p.id);
            if (existing) existing.quantity++;
            else cart.push({ id: p.id, name: p.name, price: p.price, quantity: 1 });
        });

        localStorage.setItem('cart', JSON.stringify(cart));

        // Try calling updateCartCount from main.js if accessible, or just reload/alert
        if (window.updateCartCount) window.updateCartCount();

        alert('Đã thêm toàn bộ cấu hình vào giỏ hàng!');
    }
};

// Compatibility Checking Logic
function checkCompatibility() {
    let issues = [];
    const cpu = currentBuild['cpu'];
    const mobo = currentBuild['mainboard'];
    const ram = currentBuild['ram'];
    const gpu = currentBuild['gpu'];
    const psu = currentBuild['psu'];

    // 1. Socket Check (CPU vs Motherboard)
    if (cpu && mobo) {
        const cpuSocket = (cpu.specs && cpu.specs.Socket) || '';
        const moboSocket = (mobo.specs && mobo.specs.Socket) || '';
        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
            issues.push(`Lỗi Socket: CPU (${cpuSocket}) không khớp với Bo mạch chủ (${moboSocket}).`);
        }
    }

    // 2. RAM Type Check
    if (mobo && ram) {
        const moboRamType = (mobo.specs && mobo.specs.MemoryType) || '';
        const ramType = (ram.specs && ram.specs.Type) || '';
        if (moboRamType && ramType && moboRamType !== ramType) {
            issues.push(`Lỗi RAM: Bo mạch chủ hỗ trợ ${moboRamType} nhưng RAM là ${ramType}.`);
        }
    }

    // 3. Power Check (GPU vs PSU)
    if (gpu && psu) {
        const gpuPower = (gpu.specs && parseInt(gpu.specs.Power)) || 0;
        const psuPower = (psu.specs && parseInt(psu.specs.Wattage)) || 0;
        if (gpuPower && psuPower && gpuPower > psuPower) {
            issues.push(`Cảnh báo Nguồn: VGA yêu cầu công suất lớn hơn công suất nguồn (${gpuPower}W > ${psuPower}W).`);
        }
    }

    updateUICompatibility(issues);
}

function updateUICompatibility(issues) {
    const compDiv = document.getElementById('compatibility-status');
    if (!compDiv) return;

    if (issues.length === 0) {
        let hasParts = Object.keys(currentBuild).length > 0;
        compDiv.innerHTML = hasParts
            ? `<div style="color: #2ed573;"><i class="fas fa-check-circle"></i> Linh kiện tương thích!</div>`
            : `<div style="color: var(--text-muted);">Chọn linh kiện để kiểm tra tương thích.</div>`;
    } else {
        compDiv.innerHTML = issues.map(issue =>
            `<div style="color: #ff4757; margin-bottom: 5px;"><i class="fas fa-exclamation-triangle"></i> ${issue}</div>`
        ).join('');
    }
}

// Smart Build & Compare logic will be imported/global

// Removed old copyPartsList since we have the sidebar now

// Start
initSlots();
checkCompatibility();
