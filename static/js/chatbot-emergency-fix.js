// EMERGENCY FIX: Prevents navbar chatbot links from breaking
(function() {
    console.log('🚨 CHATBOT EMERGENCY FIX ACTIVATED');
    
    // Function to intercept ALL clicks on chatbot links
    function interceptChatbotLinks() {
        // Intercept clicks at document level (capture phase)
        document.addEventListener('click', function(e) {
            // Find the clicked link
            let target = e.target;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            
            if (target && target.tagName === 'A') {
                const linkText = (target.textContent || '').toLowerCase();
                const linkClass = target.className || '';
                const linkHref = target.getAttribute('href') || '';
                
                // Check if this is a chatbot link
                const isChatbotLink = 
                    linkText.includes('chatbot') ||
                    linkText.includes('open chatbot') ||
                    linkClass.includes('open-chatbot-link') ||
                    linkClass.includes('navbar-chatbot-link') ||
                    linkHref === '#' ||
                    linkHref === '#open-chatbot' ||
                    linkHref.includes('chatbot');
                
                if (isChatbotLink) {
                    console.log('🚨 Intercepted chatbot link click:', linkText);
                    
                    // PREVENT default navigation
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // Try to open chatbot
                    if (window.openChatbot && typeof window.openChatbot === 'function') {
                        window.openChatbot();
                    } else if (window.bookChatbot && typeof window.bookChatbot.toggleChatbot === 'function') {
                        window.bookChatbot.toggleChatbot();
                    } else {
                        // Create emergency chatbot
                        createEmergencyChatbot();
                    }
                    
                    // NEVER navigate to #
                    return false;
                }
            }
        }, true); // Use capture phase to intercept before Docusaurus
    }
    
    // Create emergency chatbot if main one fails
    function createEmergencyChatbot() {
        console.log('Creating emergency chatbot...');
        
        // Remove existing if any
        const existing = document.getElementById('emergency-chatbot');
        if (existing) existing.remove();
        
        const chatbot = document.createElement('div');
        chatbot.id = 'emergency-chatbot';
        chatbot.innerHTML = `
            <div style="
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 15px 50px rgba(0,0,0,0.2);
                padding: 20px;
                z-index: 10001;
                border: 1px solid #e1e8ed;
                display: flex;
                flex-direction: column;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #2c3e50;">🤖 Emergency Chatbot</h3>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: #e2e8f0;
                        border: none;
                        border-radius: 8px;
                        width: 32px;
                        height: 32px;
                        cursor: pointer;
                        font-size: 20px;
                    ">×</button>
                </div>
                <div id="emergency-messages" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    background: #f8fafc;
                    border-radius: 8px;
                    margin-bottom: 15px;
                ">
                    <p>Main chatbot failed to load.</p>
                    <p><small>Backend: http://localhost:8000</small></p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <textarea id="emergency-input" placeholder="Type your question..." style="
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        resize: none;
                        font-family: inherit;
                        min-height: 60px;
                    "></textarea>
                    <button onclick="sendEmergencyMessage()" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        cursor: pointer;
                        height: 60px;
                    ">Send</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(chatbot);
        
        // Add send function
        window.sendEmergencyMessage = async function() {
            const input = document.getElementById('emergency-input');
            const messages = document.getElementById('emergency-messages');
            const question = input.value.trim();
            
            if (!question) return;
            
            messages.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
            
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
                messages.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
            }
            
            messages.scrollTop = messages.scrollHeight;
        };
        
        // Add Enter key support
        document.getElementById('emergency-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.sendEmergencyMessage();
            }
        });
    }
    
    // Also directly modify any existing chatbot links
    function modifyExistingLinks() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const text = (link.textContent || '').toLowerCase();
            const href = link.getAttribute('href') || '';
            
            if (text.includes('chatbot') && (href === '#' || href === '#open-chatbot')) {
                console.log('Modifying existing link:', text);
                
                // Remove href to prevent navigation
                link.removeAttribute('href');
                
                // Add click handler
                link.onclick = function(e) {
                    e.preventDefault();
                    if (window.openChatbot) {
                        window.openChatbot();
                    } else {
                        createEmergencyChatbot();
                    }
                    return false;
                };
                
                link.style.cursor = 'pointer';
            }
        });
    }
    
    // Run immediately
    interceptChatbotLinks();
    modifyExistingLinks();
    
    // Run again after delay (in case links load later)
    setTimeout(modifyExistingLinks, 1000);
    setTimeout(modifyExistingLinks, 3000);
    
    console.log('✅ Emergency fix applied successfully');
})();