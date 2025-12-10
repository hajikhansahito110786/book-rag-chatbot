// Simple guaranteed-working chatbot
console.log('=== SIMPLE CHATBOT LOADING ===');

// Create chatbot UI
function createChatbotUI() {
    console.log('Creating chatbot UI...');
    
    // Create container
    const container = document.createElement('div');
    container.id = 'simple-chatbot-container';
    container.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 400px;
        height: 500px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 15px 50px rgba(0,0,0,0.25);
        display: none;
        flex-direction: column;
        z-index: 10000;
        border: 1px solid #e1e8ed;
        padding: 20px;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = '<h3 style="margin:0">🤖 Book Assistant</h3>';
    container.appendChild(header);
    
    // Create messages area
    const messages = document.createElement('div');
    messages.id = 'simple-chat-messages';
    messages.style.cssText = `
        flex: 1;
        overflow-y: auto;
        margin: 15px 0;
        padding: 10px;
        background: #f8fafc;
        border-radius: 10px;
    `;
    messages.innerHTML = '<p>Hello! Ask me about the book.</p>';
    container.appendChild(messages);
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = 'display: flex; gap: 10px;';
    
    const input = document.createElement('textarea');
    input.id = 'simple-chat-input';
    input.placeholder = 'Ask about the book...';
    input.style.cssText = 'flex: 1; padding: 10px; border-radius: 8px; border: 2px solid #e2e8f0;';
    
    const sendBtn = document.createElement('button');
    sendBtn.innerHTML = 'Send';
    sendBtn.style.cssText = 'background: #667eea; color: white; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer;';
    
    sendBtn.onclick = async function() {
        const question = input.value.trim();
        if (!question) return;
        
        messages.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
        input.value = '';
        
        messages.innerHTML += '<p><em>Assistant: Thinking...</em></p>';
        
        try {
            const response = await fetch('http://localhost:8000/api/ask', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    question: question,
                    context_mode: 'book',
                    selected_text: null
                })
            });
            
            const data = await response.json();
            messages.innerHTML = messages.innerHTML.replace('<p><em>Assistant: Thinking...</em></p>', '');
            messages.innerHTML += `<p><strong>Assistant:</strong> ${data.answer}</p>`;
        } catch (error) {
            messages.innerHTML = messages.innerHTML.replace('<p><em>Assistant: Thinking...</em></p>', '');
            messages.innerHTML += `<p><strong>Error:</strong> Cannot connect to backend. Make sure it's running at http://localhost:8000</p>`;
        }
    };
    
    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    container.appendChild(inputArea);
    
    document.body.appendChild(container);
    console.log('Chatbot UI created');
    
    return container;
}

// Create toggle button
function createToggleButton() {
    console.log('Creating toggle button...');
    
    const button = document.createElement('button');
    button.id = 'simple-chatbot-toggle';
    button.innerHTML = '🤖 Ask AI';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 15px 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
    `;
    
    const container = createChatbotUI();
    
    button.onclick = function() {
        const isVisible = container.style.display === 'flex';
        container.style.display = isVisible ? 'none' : 'flex';
        console.log('Chatbot toggled:', !isVisible ? 'visible' : 'hidden');
    };
    
    document.body.appendChild(button);
    console.log('Toggle button created');
    
    // Test backend connection
    setTimeout(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/status');
            const data = await response.json();
            console.log('Backend status:', data);
        } catch (error) {
            console.error('Backend not reachable:', error.message);
        }
    }, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToggleButton);
} else {
    createToggleButton();
}

console.log('Simple chatbot script loaded');