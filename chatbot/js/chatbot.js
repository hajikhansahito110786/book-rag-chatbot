// Simple Chatbot Implementation
class SimpleChatbot {
    constructor() {
        this.API_URL = 'http://148.230.88.136:8900/api';
        this.selectedText = '';
        this.contextMode = 'book';
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupListeners();
        this.setupTextSelection();
        
        // Add click handler for navbar chatbot link
        setTimeout(() => {
            this.setupNavbarLink();
        }, 1000);
    }
    
    createUI() {
        // Create chatbot HTML
        const chatbotHTML = `
            <div id="chatbot-container" class="hidden">
                <div class="chatbot-header">
                    <h3>🤖 Book Assistant</h3>
                    <button class="chatbot-close">&times;</button>
                </div>
                
                <div class="chatbot-messages" id="chat-messages">
                    <div class="message assistant-message">
                        <div class="message-content">
                            Hello! I can answer questions about this book. 
                            Try asking about any topic or select text for specific questions.
                        </div>
                    </div>
                </div>
                
                <div class="chatbot-input-area">
                    <textarea id="chat-input" placeholder="Ask about the book..." rows="1"></textarea>
                    <button class="chatbot-send" id="send-btn">Send</button>
                </div>
            </div>
            
            <button id="chatbot-toggle">
                <span>🤖</span> Ask AI
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    setupListeners() {
        // Toggle chatbot
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChatbot();
        });
        
        // Close chatbot
        document.querySelector('.chatbot-close').addEventListener('click', () => {
            this.hideChatbot();
        });
        
        // Send message
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    setupNavbarLink() {
        // Find and setup navbar chatbot link
        const links = document.querySelectorAll('a[href="#"]');
        links.forEach(link => {
            if (link.textContent.includes('Chatbot') || link.textContent.includes('Open Chatbot')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleChatbot();
                });
                console.log('Navbar chatbot link activated');
            }
        });
    }
    
    setupTextSelection() {
        // Listen for text selection
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (!selection.isCollapsed) {
                this.selectedText = selection.toString().trim();
                if (this.selectedText.length > 20) {
                    this.showNotification('Text selected! Switch to "Selected Text" mode in the chatbot.');
                }
            }
        });
    }
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage('user', message);
        input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            const response = await fetch(`${this.API_URL}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    context_mode: this.contextMode,
                    selected_text: this.contextMode === 'selected' ? this.selectedText : null
                })
            });
            
            const data = await response.json();
            this.removeTyping();
            this.addMessage('assistant', data.answer);
            
        } catch (error) {
            this.removeTyping();
            this.addMessage('assistant', 'Sorry, I cannot connect to the AI service right now. Please check if the backend is running.');
        }
    }
    
    addMessage(role, content) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
        `;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    showTyping() {
        const messagesDiv = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message assistant-message';
        typingDiv.innerHTML = `
            <div class="message-content">Thinking...</div>
        `;
        messagesDiv.appendChild(typingDiv);
    }
    
    removeTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    toggleChatbot() {
        const container = document.getElementById('chatbot-container');
        container.classList.toggle('hidden');
        
        if (!container.classList.contains('hidden')) {
            document.getElementById('chat-input').focus();
        }
    }
    
    hideChatbot() {
        document.getElementById('chatbot-container').classList.add('hidden');
    }
    
    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.className = 'chatbot-notification';
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bookChatbot = new SimpleChatbot();
    
    // Make chatbot accessible globally
    window.openChatbot = () => window.bookChatbot.toggleChatbot();
});