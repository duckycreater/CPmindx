
// Comparison Logic

const compareModal = document.getElementById('compare-modal');
const compareContent = document.getElementById('compare-content');

// Mock Database for Benchmarks
const benchmarkDB = {
    "Intel Core i3 12100F": { score: 14000, single: 3300, power: 58 },
    "AMD Ryzen 3 3100": { score: 11000, single: 2900, power: 65 },
    "Intel Core i5 13400F": { score: 26000, single: 3900, power: 65 },
    "AMD Ryzen 5 5600X": { score: 22000, single: 3500, power: 65 },
    "NVIDIA GTX 1650": { score: 9000, vram: 4, power: 75 },
    "NVIDIA RTX 3060": { score: 17000, vram: 12, power: 170 }
};

function openCompare() {
    // In a real app, these would be populated from the current selection or a search
    // For demo, we show a selector
    compareModal.classList.add('active');

    compareContent.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <div style="flex:1;">
                <label>Sản phẩm A</label>
                <select id="comp-a" class="form-control" style="background:#333; color:#fff;" onchange="renderComparison()">
                    <option value="Intel Core i3 12100F">Intel Core i3 12100F</option>
                    <option value="Intel Core i5 13400F">Intel Core i5 13400F</option>
                    <option value="NVIDIA GTX 1650">NVIDIA GTX 1650</option>
                </select>
            </div>
            <div style="flex:1;">
                <label>Sản phẩm B</label>
                <select id="comp-b" class="form-control" style="background:#333; color:#fff;" onchange="renderComparison()">
                    <option value="AMD Ryzen 3 3100">AMD Ryzen 3 3100</option>
                    <option value="AMD Ryzen 5 5600X">AMD Ryzen 5 5600X</option>
                    <option value="NVIDIA RTX 3060">NVIDIA RTX 3060</option>
                </select>
            </div>
        </div>
        <div id="comparison-result"></div>
    `;

    renderComparison(); // Initial render
}

function closeCompareModal() {
    compareModal.classList.remove('active');
}

function renderComparison() {
    const itemA = document.getElementById('comp-a').value;
    const itemB = document.getElementById('comp-b').value;
    const resDiv = document.getElementById('comparison-result');

    const dataA = benchmarkDB[itemA] || { score: 0, single: 0, power: 0 };
    const dataB = benchmarkDB[itemB] || { score: 0, single: 0, power: 0 };

    // Determine max for bar scaling
    const maxScore = Math.max(dataA.score, dataB.score) * 1.1;
    const maxSingle = Math.max(dataA.single || 0, dataB.single || 0) * 1.1;

    resDiv.innerHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Tiêu chí</th>
                    <th>${itemA}</th>
                    <th>${itemB}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Hiệu năng Tổng (PassMark)</td>
                    <td>
                        <div>${dataA.score}</div>
                        <div class="score-bar"><div class="score-fill" style="width: ${(dataA.score / maxScore) * 100}%"></div></div>
                    </td>
                    <td>
                        <div>${dataB.score}</div>
                        <div class="score-bar"><div class="score-fill" style="width: ${(dataB.score / maxScore) * 100}%"></div></div>
                    </td>
                </tr>
                <tr>
                    <td>Đơn nhân (Single Core)</td>
                    <td>
                        <div>${dataA.single || 'N/A'}</div>
                        <div class="score-bar"><div class="score-fill" style="width: ${(dataA.single / maxSingle) * 100}%"></div></div>
                    </td>
                    <td>
                        <div>${dataB.single || 'N/A'}</div>
                        <div class="score-bar"><div class="score-fill" style="width: ${(dataB.single / maxSingle) * 100}%"></div></div>
                    </td>
                </tr>
                 <tr>
                    <td>TDP (Điện năng)</td>
                    <td>${dataA.power}W</td>
                    <td>${dataB.power}W</td>
                </tr>
            </tbody>
        </table>
        <div style="margin-top: 10px; font-size: 0.8rem; color: #666; text-align: right;">
            * Dữ liệu benchmark tham khảo từ PassMark Software.
        </div>
    `;
}

// Global expose
window.openCompareModal = openCompare;
