// ALL-IN-ONE CHATBOT SCRIPT
// This script contains everything needed for the chatbot

console.log('🚀 ALL-IN-ONE CHATBOT STARTING...');

// ==================== CHATBOT CSS (INJECTED) ====================
function injectChatbotCSS() {
    if (!document.getElementById('chatbot-css-injected')) {
        const style = document.createElement('style');
        style.id = 'chatbot-css-injected';
        style.textContent = `
            /* Chatbot Container */
            #chatbot-container {
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 15px 50px rgba(0,0,0,0.15);
                z-index: 10000;
                border: 1px solid #e1e8ed;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chatbot-visible {
                display: flex !important;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Header */
            .chatbot-header {
                padding: 16px 20px;
                background: #f8fafc;
                border-bottom: 1px solid #eef2f7;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chatbot-header h3 {
                margin: 0;
                color: #2c3e50;
                font-size: 16px;
                font-weight: 600;
            }
            
            .chatbot-close {
                background: #e2e8f0;
                border: none;
                border-radius: 8px;
                width: 32px;
                height: 32px;
                cursor: pointer;
                font-size: 20px;
                color: #64748b;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chatbot-close:hover {
                background: #cbd5e1;
            }
            
            /* Messages */
            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: white;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .message {
                max-width: 85%;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .user-message {
                align-self: flex-end;
            }
            
            .user-message .message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 18px 4px 18px 18px;
                padding: 12px 16px;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .assistant-message {
                align-self: flex-start;
            }
            
            .assistant-message .message-content {
                background: #f1f5f9;
                color: #334155;
                border-radius: 4px 18px 18px 18px;
                padding: 12px 16px;
                font-size: 14px;
                line-height: 1.5;
                border: 1px solid #e2e8f0;
            }
            
            /* Input Area */
            .chatbot-input-area {
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #eef2f7;
                display: flex;
                gap: 12px;
                align-items: flex-end;
            }
            
            #chatbot-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 14px;
                resize: none;
                font-family: inherit;
                min-height: 24px;
                max-height: 120px;
                background: #f8fafc;
            }
            
            #chatbot-input:focus {
                outline: none;
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            #chatbot-send {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                padding: 12px 20px;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                height: 48px;
            }
            
            #chatbot-send:hover {
                opacity: 0.9;
            }
            
            /* Toggle Button */
            #chatbot-toggle-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            #chatbot-toggle-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
            }
            
            /* Mobile */
            @media (max-width: 768px) {
                #chatbot-container {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                    bottom: 80px;
                    height: 60vh;
                }
                
                #chatbot-toggle-btn {
                    padding: 10px 20px;
                    font-size: 13px;
                    bottom: 20px;
                    right: 20px;
                }
            }
            
            /* Scrollbar */
            .chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .chatbot-messages::-webkit-scrollbar-track {
                background: #f1f5f9;
            }
            
            .chatbot-messages::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Chatbot CSS injected');
    }
}

// ==================== CHATBOT CLASS ====================
class AllInOneChatbot {
    constructor() {
        console.log('🤖 Creating AllInOneChatbot...');
        this.API_URL = 'http://localhost:8000/api';
        this.isOpen = false;
        this.init();
    }
    
    init() {
        console.log('Initializing chatbot...');
        injectChatbotCSS();
        this.createUI();
        this.setupEventListeners();
        console.log('✅ Chatbot initialized successfully');
    }
    
    createUI() {
        console.log('Creating UI...');
        
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'chatbot-container';
        this.container.innerHTML = `
            <div class="chatbot-header">
                <h3>🤖 Book Assistant</h3>
                <button class="chatbot-close">×</button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="message assistant-message">
                    <div class="message-content">
                        Hello! I can answer questions about this book.<br>
                        <small>Backend: ${this.API_URL}</small>
                    </div>
                </div>
            </div>
            <div class="chatbot-input-area">
                <textarea id="chatbot-input" placeholder="Ask about the book..." rows="2"></textarea>
                <button id="chatbot-send">Send</button>
            </div>
        `;
        
        // Create toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'chatbot-toggle-btn';
        this.toggleBtn.innerHTML = '🤖 Ask AI';
        
        // Add to page
        document.body.appendChild(this.container);
        document.body.appendChild(this.toggleBtn);
        
        console.log('✅ UI created');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Toggle button
        this.toggleBtn.addEventListener('click', () => this.toggle());
        
        // Close button
        const closeBtn = this.container.querySelector('.chatbot-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Send button
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        
        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        console.log('✅ Event listeners setup');
    }
    
    toggle() {
        console.log('Toggling chatbot...');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.container.classList.add('chatbot-visible');
            const input = document.getElementById('chatbot-input');
            if (input) input.focus();
            console.log('✅ Chatbot opened');
        } else {
            this.hide();
        }
        
        return this.isOpen;
    }
    
    hide() {
        console.log('Hiding chatbot...');
        this.isOpen = false;
        this.container.classList.remove('chatbot-visible');
    }
    
    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input ? input.value.trim() : '';
        
        if (!message) {
            console.log('Empty message');
            return;
        }
        
        console.log('Sending message:', message);
        
        // Add user message
        this.addMessage('user', message);
        if (input) input.value = '';
        
        // Show typing
        this.showTyping();
        
        try {
            const response = await fetch(`${this.API_URL}/ask`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    question: message,
                    context_mode: 'book',
                    selected_text: null
                })
            });
            
            const data = await response.json();
            console.log('✅ Response received');
            
            this.removeTyping();
            this.addMessage('assistant', data.answer || 'No answer received');
            
        } catch (error) {
            console.error('❌ Backend error:', error);
            this.removeTyping();
            this.addMessage('assistant', `Error: ${error.message}\n\nMake sure backend is running at ${this.API_URL}`);
        }
    }
    
    addMessage(role, content) {
        const messagesDiv = document.getElementById('chatbot-messages');
        if (!messagesDiv) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(content)}</div>`;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    showTyping() {
        const messagesDiv = document.getElementById('chatbot-messages');
        if (!messagesDiv) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'chatbot-typing';
        typingDiv.className = 'message assistant-message';
        typingDiv.innerHTML = '<div class="message-content">Thinking...</div>';
        
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    removeTyping() {
        const typing = document.getElementById('chatbot-typing');
        if (typing) typing.remove();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==================== NAVBAR FIX ====================
function fixNavbarLinks() {
    console.log('Fixing navbar links...');
    
    // Intercept all clicks on chatbot links
    document.addEventListener('click', function(e) {
        let target = e.target;
        
        // Find the link element
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        
        if (target && target.tagName === 'A') {
            const linkText = (target.textContent || '').toLowerCase();
            const linkHref = target.getAttribute('href') || '';
            
            // Check if this is a chatbot link
            if (linkText.includes('chatbot') || linkText.includes('open chatbot') || 
                linkHref === '#' || linkHref === '#open-chatbot') {
                
                console.log('🔄 Intercepted chatbot link click');
                e.preventDefault();
                e.stopPropagation();
                
                // Open chatbot
                if (window.allInOneChatbot) {
                    window.allInOneChatbot.toggle();
                } else if (window.openChatbot) {
                    window.openChatbot();
                } else {
                    alert('Chatbot is loading... Please wait.');
                }
                
                return false;
            }
        }
    }, true);
}

// ==================== INITIALIZATION ====================
function initializeChatbot() {
    console.log('🚀 Initializing All-in-One Chatbot...');
    
    try {
        // Create chatbot instance
        window.allInOneChatbot = new AllInOneChatbot();
        
        // Make toggle available globally
        window.openChatbot = function() {
            console.log('openChatbot() called');
            if (window.allInOneChatbot) {
                return window.allInOneChatbot.toggle();
            }
            return false;
        };
        
        // Fix navbar links
        fixNavbarLinks();
        
        // Handle URL hash
        if (window.location.hash === '#open-chatbot') {
            console.log('Found #open-chatbot hash');
            setTimeout(() => {
                if (window.allInOneChatbot) {
                    window.allInOneChatbot.toggle();
                }
                // Clean URL
                history.replaceState(null, null, window.location.pathname);
            }, 1000);
        }
        
        // Create test button
        createTestButton();
        
        console.log('✅✅✅ ALL-IN-ONE CHATBOT READY ✅✅✅');
        
    } catch (error) {
        console.error('❌ Failed to initialize chatbot:', error);
        alert('Failed to load chatbot. Please check console for errors.');
    }
}

function createTestButton() {
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '✅ Test';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 180px;
        right: 30px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 12px;
        cursor: pointer;
        z-index: 9998;
        opacity: 0.8;
    `;
    
    testBtn.onclick = async function() {
        try {
            const response = await fetch('http://localhost:8000/api/status');
            const data = await response.json();
            alert(`✅ Backend Connected!\n\nStatus: ${data.status}\nAPI: http://localhost:8000`);
        } catch (error) {
            alert(`❌ Backend Error!\n\n${error.message}\n\nStart backend:\ncd backend\nuvicorn main:app --reload`);
        }
    };
    
    document.body.appendChild(testBtn);
    console.log('✅ Test button created');
}

// ==================== START EVERYTHING ====================
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}

console.log('🎯 All-in-One Chatbot script loaded');
