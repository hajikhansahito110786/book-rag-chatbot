class BookChatbot {
    constructor() {
        this.selectedText = '';
        this.contextMode = 'book';
        this.chatHistory = [];
        this.API_BASE = 'http://127.0.0.1:8000/api';
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.setupEventListeners();
        this.setupTextSelection();
        this.loadState();
        
        this.showWelcomeMessage();
    }

    createChatbotUI() {
        const chatbotHTML = `
        <div id="chatbot-container" class="chatbot-container hidden">
            <div class="chatbot-header">
                <h3>
                    <i class="fas fa-robot"></i>
                    Book Assistant
                </h3>
                <button id="close-chatbot" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="chatbot-body">
                <div id="chat-messages" class="chat-messages"></div>
            </div>
            
            <div class="chatbot-footer">
                <div class="context-mode">
                    <label class="mode-option">
                        <input type="radio" name="context-mode" value="book" checked>
                        <i class="fas fa-book"></i>
                        <span>Entire Book</span>
                    </label>
                    <label class="mode-option">
                        <input type="radio" name="context-mode" value="selected">
                        <i class="fas fa-mouse-pointer"></i>
                        <span>Selected Text</span>
                    </label>
                </div>
                
                <div id="selection-info" class="selection-info">
                    <span id="selection-status">
                        <i class="fas fa-info-circle"></i> No text selected
                    </span>
                    <button id="clear-selection" class="clear-btn">
                        Clear
                    </button>
                </div>
                
                <div class="input-area">
                    <textarea 
                        id="chat-input" 
                        placeholder="Ask a question about the book..." 
                        rows="1"
                        autocomplete="off"
                    ></textarea>
                    <button id="send-btn" class="send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <button id="chatbot-toggle" class="chatbot-toggle-btn">
            <span class="chat-icon">🤖</span>
            <span class="chat-label">Ask AI</span>
        </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        // Toggle chatbot
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChatbot();
        });

        // Close chatbot
        document.getElementById('close-chatbot').addEventListener('click', () => {
            this.hideChatbot();
        });

        // Send message
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send
        document.getElementById('chat-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.getElementById('chat-input').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Context mode change
        document.querySelectorAll('input[name="context-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.contextMode = e.target.value;
                this.updateSelectionInfo();
                this.saveState();
            });
        });

        // Clear selection
        document.getElementById('clear-selection').addEventListener('click', () => {
            this.clearSelection();
        });
    }

    setupTextSelection() {
        // Listen for text selection
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (!selection.isCollapsed) {
                const selectedText = selection.toString().trim();
                if (selectedText.length > 20) {
                    this.selectedText = selectedText;
                    this.updateSelectionInfo();
                    this.showSelectionToast();
                }
            }
        });
    }

    showWelcomeMessage() {
        const messagesDiv = document.getElementById('chat-messages');
        messagesDiv.innerHTML = `
            <div class="welcome-message">
                <p><strong>Welcome to Book Assistant! 📚</strong></p>
                <p>I can answer questions about the uploaded book content.</p>
                <p><strong>Try asking:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>What is machine learning?</li>
                    <li>Explain deep learning</li>
                    <li>What are the applications of AI?</li>
                </ul>
                <p><small>Select text from the book and switch to "Selected Text" mode for specific questions.</small></p>
            </div>
        `;
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (this.isTyping) {
            this.showNotification('Please wait for the current response...');
            return;
        }
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Add user message
        this.addMessage('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        this.isTyping = true;
        
        try {
            console.log('Sending request to:', `${this.API_BASE}/ask`);
            console.log('Payload:', {
                question: message,
                context_mode: this.contextMode,
                selected_text: this.contextMode === 'selected' ? this.selectedText : null
            });
            
            const response = await fetch(`${this.API_BASE}/ask`, {
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response:', data);
            
            this.removeTypingIndicator();
            this.isTyping = false;
            
            // Add AI response
            this.addMessage('assistant', data.answer);
            
            // Add source info
            if (data.sources && data.sources.length > 0) {
                this.addSourceInfo(data.context_used);
            }
            
            // Save to history
            this.chatHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            }, {
                role: 'assistant',
                content: data.answer,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 20 messages
            if (this.chatHistory.length > 40) {
                this.chatHistory = this.chatHistory.slice(-40);
            }
            
            this.saveState();
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.isTyping = false;
            this.addMessage('error', `Error: ${error.message}. Please check if the backend is running at ${this.API_BASE}`);
        }
    }

    addMessage(role, content) {
        const messagesDiv = document.getElementById('chat-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (role === 'error') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i>
                        <div>
                            <div class="message-text">${this.escapeHtml(content)}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${time}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const icon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
            const sender = role === 'user' ? 'You' : 'Assistant';
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <i class="${icon}" style="color: ${role === 'user' ? '#667eea' : '#764ba2'}; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                            <div class="message-text">${this.escapeHtml(content)}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                                ${time} • ${sender}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    addSourceInfo(contextUsed) {
        const messagesDiv = document.getElementById('chat-messages');
        
        const sourceDiv = document.createElement('div');
        sourceDiv.className = 'message assistant-message';
        sourceDiv.style.opacity = '0.7';
        sourceDiv.style.fontSize = '11px';
        
        sourceDiv.innerHTML = `
            <div class="message-content">
                <div style="color: #64748b;">
                    <i class="fas fa-database"></i> Using: ${contextUsed === 'selected' ? 'Selected text' : 'Book content'}
                </div>
            </div>
        `;
        
        messagesDiv.appendChild(sourceDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    showTypingIndicator() {
        const messagesDiv = document.getElementById('chat-messages');
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message assistant-message';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateSelectionInfo() {
        const statusEl = document.getElementById('selection-status');
        const clearBtn = document.getElementById('clear-selection');
        
        if (this.contextMode === 'selected') {
            if (this.selectedText) {
                const preview = this.selectedText.length > 50 
                    ? this.selectedText.substring(0, 50) + '...' 
                    : this.selectedText;
                statusEl.innerHTML = `<i class="fas fa-text-height"></i> Selected: "${preview}"`;
                clearBtn.style.display = 'inline-block';
            } else {
                statusEl.innerHTML = '<i class="far fa-file-alt"></i> No text selected';
                clearBtn.style.display = 'none';
            }
        } else {
            statusEl.innerHTML = '<i class="fas fa-book"></i> Using entire book';
            clearBtn.style.display = 'none';
        }
    }

    showSelectionToast() {
        if (this.contextMode !== 'selected') {
            const toast = document.createElement('div');
            toast.className = 'notification-toast';
            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: #667eea; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-mouse-pointer" style="color: white;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #2d3748;">Text Selected!</div>
                        <div style="font-size: 13px; color: #718096;">Switch to "Selected Text" mode to ask about this specific text.</div>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.querySelectorAll('.notification-toast').forEach(t => t.remove());
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 5000);
        }
    }

    showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: #10b981; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-info-circle" style="color: white;"></i>
                </div>
                <div style="flex: 1; color: #2d3748;">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 3000);
    }

    clearSelection() {
        this.selectedText = '';
        this.updateSelectionInfo();
        this.saveState();
        this.showNotification('Selection cleared.');
    }

    toggleChatbot() {
        const container = document.getElementById('chatbot-container');
        container.classList.toggle('hidden');
        
        if (!container.classList.contains('hidden')) {
            setTimeout(() => {
                document.getElementById('chat-input').focus();
            }, 300);
        }
    }

    hideChatbot() {
        const container = document.getElementById('chatbot-container');
        container.classList.add('hidden');
    }

    saveState() {
        const state = {
            chatHistory: this.chatHistory,
            contextMode: this.contextMode,
            selectedText: this.selectedText
        };
        localStorage.setItem('bookChatbotState', JSON.stringify(state));
    }

    loadState() {
        try {
            const saved = localStorage.getItem('bookChatbotState');
            if (saved) {
                const state = JSON.parse(saved);
                this.chatHistory = state.chatHistory || [];
                this.contextMode = state.contextMode || 'book';
                this.selectedText = state.selectedText || '';
                
                const radio = document.querySelector(`input[name="context-mode"][value="${this.contextMode}"]`);
                if (radio) radio.checked = true;
                
                this.updateSelectionInfo();
                this.loadChatHistory();
            }
        } catch (e) {
            console.log('No saved state found');
        }
    }

    loadChatHistory() {
        if (this.chatHistory.length > 0) {
            const messagesDiv = document.getElementById('chat-messages');
            messagesDiv.innerHTML = '';
            
            this.chatHistory.forEach(msg => {
                if (msg.role !== 'system') {
                    this.addMessage(msg.role, msg.content);
                }
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.bookChatbot = new BookChatbot();
});