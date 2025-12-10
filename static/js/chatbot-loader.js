// Chatbot Loader - Main integration script
(function() {
    console.log('🚀 Chatbot Loader Starting...');
    
    // Global function to open chatbot
    window.openChatbot = function() {
        console.log('openChatbot() called');
        
        // Try main chatbot first
        if (window.bookChatbot && typeof window.bookChatbot.toggleChatbot === 'function') {
            window.bookChatbot.toggleChatbot();
            return true;
        }
        
        // Try emergency chatbot
        const emergencyChatbot = document.getElementById('emergency-chatbot');
        if (emergencyChatbot) {
            emergencyChatbot.style.display = emergencyChatbot.style.display === 'none' ? 'flex' : 'none';
            return true;
        }
        
        // If nothing works, show message
        console.warn('No chatbot found');
        alert('Please wait for chatbot to load, or refresh the page.');
        return false;
    };
    
    // Setup navbar links (complementary to emergency fix)
    function setupNavbarLinks() {
        const links = document.querySelectorAll('.open-chatbot-link, [href*="chatbot"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.openChatbot) {
                    e.preventDefault();
                    window.openChatbot();
                }
            });
        });
        console.log(`Setup ${links.length} navbar links`);
    }
    
    // Handle hash in URL (#open-chatbot)
    function handleUrlHash() {
        if (window.location.hash === '#open-chatbot') {
            console.log('Found #open-chatbot hash, opening chatbot...');
            setTimeout(() => {
                if (window.openChatbot) window.openChatbot();
                // Clean URL
                history.replaceState(null, null, window.location.pathname);
            }, 800);
        }
    }
    
    // Initialize
    function init() {
        console.log('Initializing chatbot loader...');
        setupNavbarLinks();
        handleUrlHash();
        console.log('✅ Chatbot loader ready');
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 
