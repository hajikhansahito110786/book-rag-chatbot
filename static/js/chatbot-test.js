// Test script for debugging
console.log('🧪 Chatbot Test Script Loaded');

// Create test button
const testBtn = document.createElement('button');
testBtn.innerHTML = '🧪 Test';
testBtn.style.cssText = `
    position: fixed;
    bottom: 180px;
    right: 25px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    cursor: pointer;
    z-index: 9997;
    opacity: 0.7;
    transition: all 0.3s;
`;

testBtn.onclick = function() {
    const status = {
        openChatbot: typeof window.openChatbot === 'function',
        bookChatbot: !!window.bookChatbot,
        url: window.location.href,
        hash: window.location.hash
    };
    
    alert(`Test Results:\n\n` +
          `✅ openChatbot: ${status.openChatbot}\n` +
          `✅ bookChatbot: ${status.bookChatbot ? 'Loaded' : 'Not loaded'}\n` +
          `📝 URL: ${status.url}\n` +
          `🔗 Hash: ${status.hash || 'None'}`);
};

document.body.appendChild(testBtn);
console.log('Test button added');