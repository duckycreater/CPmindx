
// Smart Build Logic

const smartBuildModal = document.getElementById('smart-build-modal');
const sbResultDiv = document.getElementById('sb-result');

function openSmartBuild() {
    smartBuildModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSmartBuild() {
    smartBuildModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    sbResultDiv.innerHTML = '';
}

async function smartBuild() {
    const usage = document.getElementById('sb-usage').value;
    const budget = parseInt(document.getElementById('sb-budget').value);

    if (!budget || budget < 5000000) {
        sbResultDiv.innerHTML = '<div style="color: #ff4757;">Vui lòng nhập ngân sách hợp lệ (tối thiểu 5.000.000 VNĐ).</div>';
        return;
    }

    sbResultDiv.innerHTML = '<div style="color: var(--accent-color);"><i class="fas fa-circle-notch fa-spin"></i> Đang phân tích nhu cầu và tìm linh kiện...</div>';

    let suggestion = {};
    let analysis = "Đang tạo phân tích từ AI...";

    // --- COMPONENT SELECTION ENGINE (Rule Based) ---
    if (budget < 15000000) {
        if (usage === 'game') {
            suggestion = {
                cpu: "Intel Core i3 12100F",
                gpu: "NVIDIA GTX 1650",
                ram: "8GB DDR4 3200MHz",
                mainboard: "H610M",
                psu: "550W Bronze"
            };
        } else if (usage === 'graphic') {
            suggestion = {
                cpu: "AMD Ryzen 5 5600G",
                gpu: "Integrated Vega 7",
                ram: "16GB DDR4 3200MHz",
                mainboard: "B450M",
                psu: "500W"
            };
        } else { // Office
            suggestion = {
                cpu: "Intel Core i3 12100",
                gpu: "Integrated UHD 730",
                ram: "8GB DDR4",
                mainboard: "H610M",
                psu: "450W"
            };
        }
    }
    else { // Budget >= 15M (High End / Performance)
        if (usage === 'game') {
            if (budget < 30000000) {
                suggestion = {
                    cpu: "Intel Core i5 13400F",
                    gpu: "NVIDIA RTX 3060 12GB",
                    ram: "16GB DDR4 3200MHz",
                    mainboard: "B760M",
                    psu: "650W Bronze"
                };
            } else {
                suggestion = {
                    cpu: "Intel Core i7 13700K",
                    gpu: "NVIDIA RTX 4070 Ti",
                    ram: "32GB DDR5 6000MHz",
                    mainboard: "Z790",
                    psu: "850W Gold"
                };
            }
        } else if (usage === 'graphic') {
            suggestion = {
                cpu: "AMD Ryzen 9 5900X",
                gpu: "NVIDIA RTX 3060 12GB",
                ram: "32GB DDR4",
                mainboard: "X570",
                psu: "750W Gold"
            };
        } else { // High-end Office
            suggestion = {
                cpu: "Intel Core i5 13500",
                gpu: "Integrated",
                ram: "16GB DDR4",
                mainboard: "B760M",
                psu: "550W"
            };
        }
    }

    // --- AI ADVICE GENERATION (Groq API) ---
    try {
        const prompt = `Bạn là chuyên gia tư vấn PC. Hãy phân tích ngắn gọn (tối đa 3 câu) tại sao cấu hình này tốt cho nhu cầu "${usage}" với ngân sách ${budget.toLocaleString('vi-VN')}đ:
        - CPU: ${suggestion.cpu}
        - GPU: ${suggestion.gpu}
        - RAM: ${suggestion.ram}
        - Main: ${suggestion.mainboard}
        Giải thích tập trung vào hiệu năng thực tế.`;

        // Send request to local proxy for Groq
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                inputs: `<s>[INST] ${prompt} [/INST]`,
                parameters: { max_new_tokens: 300, return_full_text: false }
            })
        });

        const result = await response.json();
        if (Array.isArray(result) && result[0]?.generated_text) {
            analysis = result[0].generated_text.trim();
        } else {
            console.warn("AI Format unexpected", result);
            analysis = "Cấu hình này được tối ưu hóa cho hiệu năng tốt nhất trong tầm giá của bạn.";
        }
    } catch (err) {
        console.error("AI Error:", err);
        analysis = "Cấu hình này được tối ưu hóa cho hiệu năng tốt nhất trong tầm giá của bạn (Không thể kết nối AI lúc này).";
    }

    // --- RENDER RESULT ---
    sbResultDiv.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">
            <div style="color:#2ed573; margin-bottom: 10px; font-style: italic;">
                <i class="fas fa-robot"></i> <strong>AI Analysis:</strong><br/>
                "${analysis}"
            </div>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 5px 0; border-bottom: 1px solid #333;">CPU: <strong>${suggestion.cpu}</strong></li>
                <li style="padding: 5px 0; border-bottom: 1px solid #333;">Mainboard: <strong>${suggestion.mainboard}</strong></li>
                <li style="padding: 5px 0; border-bottom: 1px solid #333;">VGA: <strong>${suggestion.gpu}</strong></li>
                <li style="padding: 5px 0; border-bottom: 1px solid #333;">RAM: <strong>${suggestion.ram}</strong></li>
                <li style="padding: 5px 0;">Nguồn: <strong>${suggestion.psu}</strong></li>
            </ul>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="applySuggestion()">
                Áp dụng cấu hình này
            </button>
        </div>
    `;

    // Store for application
    window.lastSuggestion = suggestion;
}

function applySuggestion() {
    if (!window.lastSuggestion) return;
    alert("Cấu hình đã được áp dụng! (Mô phỏng: Các slot đã được điền)");
    closeSmartBuild();

    // In actual implementation, manipulate 'currentBuild' in build-pc.js here
}
