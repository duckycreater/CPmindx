
const chatbotContainer = document.getElementById('chatbot-container');

// Chatbot HTML Structure
const chatbotHTML = `
    <div id="chatbot-widget" class="chatbot-closed">
        <div id="chatbot-header">
            <div class="header-info">
                <div class="bot-icon">
                    <i class="fas fa-robot"></i>
                    <span class="status-dot"></span>
                </div>
                <div>
                    <div class="bot-name">PC Shop AI</div>
                    <div class="bot-status">Đang trực tuyến</div>
                </div>
            </div>
            <button id="chatbot-toggle"><i class="fas fa-chevron-up"></i></button>
        </div>
        <div id="chatbot-body">
            <div id="chat-messages">
                <div class="message bot-message">
                    <div class="message-content">👋 Xin chào! Tôi có thể giúp bạn tìm cấu hình PC hay linh kiện nào hôm nay không?</div>
                </div>
            </div>
            <div id="chat-input-area">
                <input type="text" id="chat-input" placeholder="Nhập câu hỏi..." autocomplete="off">
                <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    </div>
    <style>
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 10px 15px;
            background: #2a2a2a;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            width: fit-content;
            margin-bottom: 10px;
        }
        .typing-dot {
            width: 8px;
            height: 8px;
            background: #bbb;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    </style>
`;


if (chatbotContainer) {
    chatbotContainer.innerHTML = chatbotHTML;

    const widget = document.getElementById('chatbot-widget');
    const header = document.getElementById('chatbot-header');
    const messages = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const toggleIcon = header.querySelector('i.fa-chevron-up');

    // Toggle Chat
    header.addEventListener('click', () => {
        const isClosed = widget.classList.contains('chatbot-closed');

        if (isClosed) {
            widget.classList.remove('chatbot-closed');
            widget.classList.add('chatbot-open');
            toggleIcon.className = 'fas fa-chevron-down';
            input.focus();
        } else {
            widget.classList.remove('chatbot-open');
            widget.classList.add('chatbot-closed');
            toggleIcon.className = 'fas fa-chevron-up';
        }
    });

    const addMessage = (text, className) => {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        div.innerHTML = `<div class="message-content">${text}</div>`; // Wrapped in content div for consistent styling
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    };

    const showTyping = () => {
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = 'message bot-message';
        div.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    };

    const removeTyping = () => {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    };

    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user-message');
        input.value = '';
        input.disabled = true;

        showTyping();

        try {
            const responseText = await queryHuggingFace(text);
            removeTyping();
            addMessage(responseText, 'bot-message');
        } catch (error) {
            console.error(error);
            removeTyping();
            addMessage("Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.", 'bot-message error');
        } finally {
            input.disabled = false;
            input.focus();
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Mock API for testing if backend not running, or real call
    async function queryHuggingFace(prompt) {
        try {
            const response = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inputs: `<s>[INST] Bạn là trợ lý bán hàng máy tính PC Shop. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.
Câu hỏi: ${prompt} [/INST]`,
                    parameters: {
                        max_new_tokens: 250,
                        return_full_text: false
                    }
                })
            });

            const result = await response.json();
            if (Array.isArray(result) && result[0]?.generated_text) {
                return result[0].generated_text.trim();
            }
            if (result?.error) throw new Error(result.error);
            return "⚠️ Không nhận được phản hồi từ AI.";
        } catch (err) {
            // Fallback for demo purposes if backend is down
            console.warn("Backend offline? Using fallback response.");
            return "Hiện tại tôi không thể kết nối với server trí tuệ nhân tạo. Tuy nhiên, bạn có thể tham khảo mục 'Xây Dựng PC' để tự chọn cấu hình nhé!";
        }
    }
}
