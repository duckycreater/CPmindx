
const detailContainer = document.getElementById('product-detail-content');

// Helper to get Query Param
function getQueryParam(param) {
    const urlParams = new URL(window.location.href).searchParams;
    return urlParams.get(param);
}

const productId = getQueryParam('id');

async function loadProductDetail() {
    if (!productId) {
        detailContainer.innerHTML = '<p style="text-align:center;">Không tìm thấy sản phẩm.</p>';
        return;
    }

    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) {
            detailContainer.innerHTML = '<p style="text-align:center;">Sản phẩm không tồn tại.</p>';
            return;
        }

        const product = doc.data();

        // Build Specs HTML
        let specsHtml = '';
        if (product.specs) {
            for (const [key, value] of Object.entries(product.specs)) {
                specsHtml += `<tr><th>${key}</th><td>${value}</td></tr>`;
            }
        } else {
            specsHtml = '<tr><td colspan="2">Chưa có thông số chi tiết.</td></tr>';
        }

        // Build Benchmark HTML
        let benchmarkHtml = '';
        if (product.benchmarkScore) {
            benchmarkHtml = `
                <div class="benchmark-score">
                    <div class="score-circle">${product.benchmarkScore}</div>
                    <div>
                        <h4 style="margin:0;">Điểm Benmark</h4>
                        <small style="color: var(--text-muted);">Hiệu năng tham khảo</small>
                    </div>
                </div>
            `;
        }

        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);

        detailContainer.innerHTML = `
            <div class="product-gallery">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500'">
            </div>
            <div class="product-info-detail">
                <h1>${product.name}</h1>
                <p class="product-category" style="text-transform: uppercase; color: var(--accent-color); margin-bottom: 10px;">${product.category}</p>
                <div class="product-price-detail">${formattedPrice}</div>
                
                <button class="btn btn-primary" onclick="addToCart('${doc.id}', '${product.name}', ${product.price})" style="margin-bottom: 30px; padding: 15px 30px; font-size: 1.1rem;">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                </button>

                ${benchmarkHtml}

                <h3 style="margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Thông Số Kỹ Thuật</h3>
                <table class="specs-table">
                    <tbody>
                        ${specsHtml}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Error loading product detail:", error);
        detailContainer.innerHTML = '<p style="text-align:center; color:red;">Lỗi tải dữ liệu.</p>';
    }
}

// Initialize
loadProductDetail();
