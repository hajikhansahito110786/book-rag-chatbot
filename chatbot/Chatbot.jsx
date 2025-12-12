import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { 
  FaRobot, FaTimes, FaPaperPlane, FaBook, 
  FaMousePointer, FaInfoCircle, FaUser, 
  FaSpinner, FaCheckCircle, FaExclamationTriangle, FaUpload
} from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [contextMode, setContextMode] = useState('book');
  const [selectedText, setSelectedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [isIngesting, setIsIngesting] = useState(false); // New state for ingestion
  const messagesEndRef = useRef(null);

  //const API_BASE = 'http://localhost:8000/api';
  const API_BASE = 'http://localhost:8000/api'
  useEffect(() => {
    // Load saved state
    const savedState = localStorage.getItem('chatbotState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setMessages(state.messages || []);
      setContextMode(state.contextMode || 'book');
      setSelectedText(state.selectedText || '');
    }

    // Check API status
    checkApiStatus();

    // Setup text selection listener
    setupTextSelection();

    // Add welcome message if no messages
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: 'system',
          content: 'Welcome to Book Assistant! 📚\n\nI can answer questions about this book content. Try asking about topics or select specific text to ask detailed questions.',
          timestamp: new Date().toISOString()
        }
      ]);
    }

    // Scroll to bottom
    scrollToBottom();
  }, []);

  useEffect(() => {
    // Save state when messages change
    const state = {
      messages,
      contextMode,
      selectedText
    };
    localStorage.setItem('chatbotState', JSON.stringify(state));
  }, [messages, contextMode, selectedText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const ingestDocuments = async () => {
    if (isIngesting) return;

    setIsIngesting(true);
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'system',
      content: 'Ingesting documents... This may take a moment.',
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await fetch(`${API_BASE}/ingest-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_url: "https://hajikhansahito110786.github.io/aiproject1/", // Use a default or configurable URL
          chunk_size: 1000
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'system',
          content: `Ingestion successful! ${data.chunks_count} chunks added.`,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'system',
          content: `Ingestion failed: ${data.detail || 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'system',
        content: `Ingestion error: ${error.message}. Check backend.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsIngesting(false);
    }
  };

  const setupTextSelection = () => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        const text = selection.toString().trim();
        if (text.length > 20) {
          setSelectedText(text);
          showSelectionToast();
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  };

  const showSelectionToast = () => {
    if (contextMode !== 'selected') {
      // Create toast notification
      const toast = document.createElement('div');
      toast.className = 'chatbot-selection-toast';
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="background: #667eea; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i style="color: white;">✏️</i>
          </div>
          <div>
            <div style="font-weight: 600; font-size: 14px;">Text Selected!</div>
            <div style="font-size: 12px; color: #666;">Switch to "Selected Text" mode to ask about this text.</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; margin-left: 10px;">
            ×
          </button>
        </div>
      `;
      
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.zIndex = '99999';
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 5000);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          context_mode: contextMode,
          selected_text: contextMode === 'selected' ? selectedText : null
        })
      });

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'error',
        content: `Error: ${error.message}. Please check if the backend is running.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearSelection = () => {
    setSelectedText('');
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaRobot className="chatbot-toggle-icon" />
        <span className="chatbot-toggle-text">Ask AI</span>
      </button>

      {/* Chatbot Container */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <FaRobot />
              <h3>Book Assistant</h3>
            </div>
            <div className="chatbot-header-status">
              <div className={`status-indicator ${apiStatus}`} />
              <span className="status-text">
                {apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button 
              className="chatbot-ingest-button"
              onClick={ingestDocuments}
              disabled={isIngesting}
              title="Ingest Docusaurus Docs"
            >
              {isIngesting ? <FaSpinner className="spinner" /> : <FaUpload />}
            </button>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`message ${msg.role}-message`}
              >
                <div className="message-content">
                  <div className="message-header">
                    {msg.role === 'user' ? (
                      <FaUser className="message-icon user" />
                    ) : msg.role === 'assistant' ? (
                      <FaRobot className="message-icon assistant" />
                    ) : (
                      <FaExclamationTriangle className="message-icon error" />
                    )}
                    <span className="message-role">
                      {msg.role === 'user' ? 'You' : 
                       msg.role === 'assistant' ? 'Assistant' : 'Error'}
                    </span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="message-text">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources">
                      <FaInfoCircle />
                      <span>Source: </span>
                      <div className="source-list">
                        {msg.sources.map((source, index) => {
                          const urlMatch = source.match(/\(URL:\s*(.*?)\)/);
                          const url = urlMatch ? urlMatch[1] : null;
                          const title = source.replace(/\s*\(URL:.*?\)/, ''); // Remove URL part for title
                          
                          return (
                            <span key={index} className="source-item">
                              {url ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" title={title}>
                                  {title}
                                </a>
                              ) : (
                                <span>{source}</span>
                              )}
                              {index < msg.sources.length - 1 && ', '}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message assistant-message typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Context Selector */}
          <div className="chatbot-context">
            <div className="context-options">
              <label className={`context-option ${contextMode === 'book' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="context-mode"
                  value="book"
                  checked={contextMode === 'book'}
                  onChange={(e) => setContextMode(e.target.value)}
                />
                <FaBook />
                <span>Entire Book</span>
              </label>
              
              <label className={`context-option ${contextMode === 'selected' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="context-mode"
                  value="selected"
                  checked={contextMode === 'selected'}
                  onChange={(e) => setContextMode(e.target.value)}
                />
                <FaMousePointer />
                <span>Selected Text</span>
              </label>
            </div>

            {/* Selection Info */}
            <div className="selection-info">
              {contextMode === 'selected' ? (
                <>
                  <div className="selection-text">
                    {selectedText ? (
                      <>
                        <FaCheckCircle className="selection-icon" />
                        <span className="selection-preview">
                          {selectedText.length > 40 
                            ? `${selectedText.substring(0, 40)}...` 
                            : selectedText}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaInfoCircle className="selection-icon" />
                        <span>No text selected</span>
                      </>
                    )}
                  </div>
                  {selectedText && (
                    <button 
                      className="clear-selection"
                      onClick={clearSelection}
                    >
                      Clear
                    </button>
                  )}
                </>
              ) : (
                <div className="selection-text">
                  <FaBook className="selection-icon" />
                  <span>Using entire book content</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <textarea
              className="chatbot-input"
              placeholder="Ask about the book content..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
            />
            <button 
              className="chatbot-send"
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;