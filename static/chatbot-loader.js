// Chatbot Loader - Handles navbar integration
(function() {
    console.log('=== CHATBOT LOADER STARTED ===');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
    
    function initChatbot() {
        console.log('Initializing chatbot integration...');
        
        // 1. Load chatbot CSS if not already loaded
        loadChatbotCSS();
        
        // 2. Load chatbot JS
        loadChatbotJS();
        
        // 3. Setup navbar click handlers
        setupNavbarHandlers();
        
        // 4. Setup global functions
        setupGlobalFunctions();
    }
    
    function loadChatbotCSS() {
        if (!document.querySelector('link[href*="chatbot.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/aiproject1/css/chatbot.css';
            document.head.appendChild(link);
            console.log('Chatbot CSS loaded');
        }
    }
    
    function loadChatbotJS() {
        // Only load if not already loaded
        if (!window.chatbotLoaded) {
            const script = document.createElement('script');
            script.src = '/aiproject1/js/chatbot.js';
            script.async = true;
            script.onload = function() {
                console.log('Chatbot JS loaded');
                window.chatbotLoaded = true;
            };
            document.body.appendChild(script);
        }
    }
    
    function setupNavbarHandlers() {
        // Find navbar chatbot links
        const chatbotLinks = document.querySelectorAll('.navbar-chatbot-link, a[href="#open-chatbot"], a[href*="chatbot"]');
        
        chatbotLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Navbar chatbot link clicked');
                
                // If chatbot is loaded, open it
                if (window.bookChatbot && typeof window.bookChatbot.toggleChatbot === 'function') {
                    window.bookChatbot.toggleChatbot();
                } else if (window.openChatbot && typeof window.openChatbot === 'function') {
                    window.openChatbot();
                } else {
                    // Chatbot not loaded yet, show message
                    alert('Chatbot is loading... Please wait a moment or refresh the page.');
                    console.log('Chatbot not yet loaded');
                }
            });
        });
        
        console.log(`Setup ${chatbotLinks.length} navbar chatbot links`);
    }
    
    function setupGlobalFunctions() {
        // Make openChatbot globally available
        window.openChatbot = function() {
            console.log('openChatbot() called');
            if (window.bookChatbot && typeof window.bookChatbot.toggleChatbot === 'function') {
                window.bookChatbot.toggleChatbot();
            } else {
                alert('Chatbot is not ready. Please refresh the page.');
            }
        };
        
        // Add a test function
        window.testChatbot = function() {
            console.log('Testing chatbot...');
            return {
                loaded: !!window.bookChatbot,
                functions: {
                    openChatbot: typeof window.openChatbot === 'function',
                    bookChatbot: typeof window.bookChatbot !== 'undefined'
                }
            };
        };
        
        console.log('Global chatbot functions setup');
    }
    
    // Create a test button for debugging
    function createTestButton() {
        const testBtn = document.createElement('button');
        testBtn.id = 'chatbot-debug-btn';
        testBtn.innerHTML = '🐛 Debug';
        testBtn.style.cssText = `
            position: fixed;
            bottom: 150px;
            right: 30px;
            background: #f59e0b;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 10px 20px;
            font-size: 12px;
            cursor: pointer;
            z-index: 99998;
            opacity: 0.8;
        `;
        
        testBtn.onclick = function() {
            const status = window.testChatbot ? window.testChatbot() : 'testChatbot not defined';
            alert(`Chatbot Debug Info:\n${JSON.stringify(status, null, 2)}`);
            console.log('Chatbot debug:', status);
        };
        
        document.body.appendChild(testBtn);
        console.log('Debug button created');
    }
    
    // Create test button after a delay
    setTimeout(createTestButton, 2000);
})();