// Add resize functionality
enableResize() {
    const container = this.container;
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    function initResize(e) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(container).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(container).height, 10);
        
        document.documentElement.addEventListener('mousemove', doResize);
        document.documentElement.addEventListener('mouseup', stopResize);
    }

    function doResize(e) {
        if (!isResizing) return;
        
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        
        // Apply constraints
        container.style.width = Math.max(300, Math.min(800, newWidth)) + 'px';
        container.style.height = Math.max(300, Math.min(600, newHeight)) + 'px';
    }

    function stopResize() {
        isResizing = false;
        document.documentElement.removeEventListener('mousemove', doResize);
        document.documentElement.removeEventListener('mouseup', stopResize);
    }

    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        z-index: 10001;
    `;
    
    resizeHandle.addEventListener('mousedown', initResize);
    container.appendChild(resizeHandle);
}