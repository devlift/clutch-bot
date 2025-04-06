"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ChatWidgetQuickLinks from './chat-widget-quick-links';
import { useChatWebSocket } from "@/hooks/useChatWebSocket";

interface FileItem {
  name: string;
  type: string;
  size: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  files?: FileItem[];
  isStreaming?: boolean;
}

const WEBSOCKET_URL = "wss://clutch.ngrok.app/chat";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const quickLinks = [
    "Career advice", 
    "Job search tips", 
    "Interview preparation", 
    "Workplace rights"
  ];

  // Add a new state for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipText, setTooltipText] = useState("I can help with employment and career questions!");
  const [tooltipStreaming, setTooltipStreaming] = useState(false);
  
  // Add reconnection state tracking
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const maxReconnectAttempts = 3;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- WebSocket Integration --- 
  const handleMessageStream = useCallback((streamedMessage: string) => {
    setMessages(prevMessages => {
      if (prevMessages.length === 0) return prevMessages;

      const lastMessage = prevMessages[prevMessages.length - 1];

      if (lastMessage.sender === 'user') {
        // First text received after a user message, create a bot message
        return [
          ...prevMessages,
          { 
            id: Date.now().toString() + "-bot",
            text: streamedMessage, 
            sender: "bot", 
            isStreaming: true 
          }
        ];
      } else if (lastMessage.sender === 'bot') {
        // Update the existing bot message with new content
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, text: streamedMessage, isStreaming: false }
        ];
      }
      
      return prevMessages;
    });
  }, []);

  const handleWebSocketError = useCallback((event: Event) => {
    console.error("WebSocket Error:", event);
    
    setReconnectAttempts(prev => {
      const newCount = prev + 1;
      if (newCount >= maxReconnectAttempts) {
        setShowConnectionError(true);
      }
      return newCount;
    });
    
    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Connection error. Please try again later.",
        sender: "bot",
        isStreaming: false
    }]);
  }, [maxReconnectAttempts]);

  const {
    connect,
    disconnect,
    sendMessage: sendWebSocketMessage,
    status: wsStatus
  } = useChatWebSocket({
    url: WEBSOCKET_URL,
    onMessageStream: handleMessageStream,
    onCompleteMessage: () => {}, // Empty function as we're not using it
    onError: handleWebSocketError
  });

  // Implement connection with backoff
  const attemptConnection = useCallback(() => {
    if (reconnectAttempts < maxReconnectAttempts) {
      // Exponential backoff: wait longer between each attempt
      const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, backoffTime);
    }
  }, [connect, reconnectAttempts, maxReconnectAttempts]);

  const toggleChat = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      // Reset connection state when opening chat
      setReconnectAttempts(0);
      setShowConnectionError(false);
      // Connect WebSocket when chat opens
      attemptConnection();
      setIsFullScreen(false); 
    } else {
      // Disconnect WebSocket when chat closes
      disconnect();
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileItem[] = [];
      Array.from(e.target.files).forEach(file => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
      });
      setSelectedFiles(newFiles);
    }
  };

  const handleQuickLink = (link: string) => {
    sendUserMessage(link);
  };

  // Modified to send message via WebSocket
  const sendUserMessage = (text: string) => {
    if (text.trim() === "" && selectedFiles.length === 0) return;
    if (wsStatus !== 'open') {
        console.error("Cannot send message, WebSocket is not open.");
         setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: "Not connected. Please wait or try reopening the chat.",
            sender: "bot",
            isStreaming: false
        }]);
        return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString() + "-user",
      text: text,
      sender: "user" as const,
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
      isStreaming: false
    };

    // Add ONLY the user message immediately
    setMessages(prevMessages => [
        ...prevMessages,
        newUserMessage,
    ]);
    
    setInputValue("");
    setSelectedFiles([]);

    // Send the text message via WebSocket
    sendWebSocketMessage({ text });
  };

  const sendMessage = () => {
    sendUserMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to add initial message after connection
  useEffect(() => {
    if (wsStatus === 'open' && messages.length === 0) {
      // Add initial message immediately
      setMessages([
        { 
          id: Date.now().toString() + "-init", 
          text: "Hello! How can I assist you with your career today?", 
          sender: "bot", 
          isStreaming: false 
        }
      ]);
    }
  }, [wsStatus, messages.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [disconnect]);

  // Effect for tooltip - simplified to avoid extra WebSocket connection
  useEffect(() => {
    if (!showTooltip) return;
    
    // Array of helpful messages to rotate through
    const tooltipMessages = [
      "Need help with workplace concerns? Just ask me!",
      "Ask me about job opportunities and requirements.",
      "I can assist with resume advice and interview tips.",
      "Have questions about your employment rights? I'm here to help!"
    ];
    
    // Pick a random message
    const randomMessage = tooltipMessages[Math.floor(Math.random() * tooltipMessages.length)];
    
    // Start with empty text
    setTooltipText("");
    
    // Reference to the tooltip element for fade effects
    const tooltipRef = document.querySelector('.chat-tooltip');
    
    // Add fadeIn class to start the animation
    if (tooltipRef) {
      tooltipRef.classList.add('fadeIn');
    }
    
    // Simple and reliable word-by-word typing implementation
    const words = randomMessage.split(' ');
    let displayText = "";
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < words.length) {
        // Add a space before each word (except the first one)
        if (currentIndex > 0) {
          displayText += " ";
        }
        
        // Add the next word
        displayText += words[currentIndex];
        setTooltipText(displayText);
        currentIndex++;
      } else {
        // Clear the interval when all words are displayed
        clearInterval(typingInterval);
      }
    }, 150); // Delay between words
    
    // Auto-hide after 10 seconds with fade out
    const hideTimeout = setTimeout(() => {
      // Add fadeOut class to trigger CSS transition
      if (tooltipRef) {
        tooltipRef.classList.remove('fadeIn');
        tooltipRef.classList.add('fadeOut');
      }
      
      // Wait for the fade out animation to complete before hiding
      setTimeout(() => {
        setShowTooltip(false);
      }, 500); // Match the transition duration from CSS
    }, 9500); // 9.5s + 0.5s fade = 10s total
    
    return () => {
      clearInterval(typingInterval);
      clearTimeout(hideTimeout);
    };
  }, [showTooltip]);

  // Check for URL parameters to automatically open the chat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const openChat = params.get('openChat');
      const welcomeType = params.get('welcome');
      const message = params.get('message');
      
      if (openChat === 'true' && message) {
        // Open the chat automatically
        setIsOpen(true);
        setReconnectAttempts(0);
        setShowConnectionError(false);
        attemptConnection();
        
        // Clear URL parameters without refreshing the page
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Add a small delay to ensure the connection is established
        setTimeout(() => {
          // Add bot welcome message based on the user type
          setMessages([
            { 
              id: Date.now().toString() + "-welcome", 
              text: decodeURIComponent(message), 
              sender: "bot", 
              isStreaming: false 
            }
          ]);
        }, 500);
      }
    }
  }, [attemptConnection, setIsOpen, setReconnectAttempts, setShowConnectionError, setMessages]); // Include all dependencies

  return (
    <>
      {isOpen ? (
        <div className={`chat-widget-container ${isFullScreen ? 'fullscreen' : ''} fadeIn`}>
          <div className="chat-header">
             {/* Update header title to ClutchBot with status indicator */}
            <h2>
              ClutchBot 
              <span className="connection-status-indicator">
                <span 
                  className={`status-circle ${
                    showConnectionError ? 'error' : 
                    wsStatus === 'open' ? 'connected' : 
                    'connecting'
                  }`} 
                  title={
                    showConnectionError ? 'Connection failed' : 
                    wsStatus === 'open' ? 'Connected' : 
                    'Connecting...'
                  }
                ></span>
              </span>
            </h2>
            <div className="chat-controls">
              <button className="expand-btn" onClick={toggleFullScreen}>
                {isFullScreen ? <i className="bi bi-arrows-angle-contract"></i> : <i className="bi bi-arrows-angle-expand"></i>}
              </button>
              <button className="close-btn" onClick={toggleChat}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          
          <div className="chat-messages">
            {showConnectionError && (
              <div className="connection-error-message">
                <p>Unable to connect to chat service. Please try again later.</p>
                <button onClick={() => {
                  setReconnectAttempts(0);
                  setShowConnectionError(false);
                  attemptConnection();
                }}>
                  Try Again
                </button>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  {message.files && message.files.length > 0 && (
                    <div className="file-attachments">
                      {message.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="file-item">
                          <i className={`bi ${file.type.includes('image') ? 'bi-file-image' : file.type.includes('spreadsheet') ? 'bi-file-spreadsheet' : 'bi-file-text'}`}></i>
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-meta">{file.type.split('/')[1]} • {file.size}</span>
                          </div>
                          <button className="file-action">
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!message.isStreaming && message.sender === "bot" && messages.indexOf(message) === messages.length - 1 && (
                    <div className="message-time">
                        <span>just now</span>
                    </div>
                )}
              </div>
            ))}
             {/* Add a typing indicator */}
             {messages[messages.length - 1]?.isStreaming && (
                 <div className="message bot">
                     <div className="message-content typing-indicator">
                         <span></span><span></span><span></span>
                     </div>
                 </div>
             )}
            <div ref={messagesEndRef} />
          </div>

          {wsStatus === 'open' && messages.length <= 1 && !isFullScreen && (
            <ChatWidgetQuickLinks 
              links={quickLinks} 
              onSelect={handleQuickLink} 
            />
          )}

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="selected-file">
                  <i className={`bi ${file.type.includes('image') ? 'bi-file-image' : file.type.includes('spreadsheet') ? 'bi-file-spreadsheet' : 'bi-file-text'}`}></i>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-meta">{file.type.split('/')[1]} • {file.size}</span>
                  </div>
                  <button className="file-remove" onClick={() => removeFile(index)}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={wsStatus !== 'open' || showConnectionError} 
            />
            <div className="input-actions">
              <button 
                className="attach-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={wsStatus !== 'open' || showConnectionError} 
              >
                <i className="bi bi-paperclip"></i>
              </button>
              <button 
                className="send-btn" 
                onClick={sendMessage} 
                disabled={wsStatus !== 'open' || showConnectionError || (!inputValue.trim() && selectedFiles.length === 0)}
              >
                <i className="bi bi-arrow-up"></i>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelection}
              multiple
              disabled={wsStatus !== 'open' || showConnectionError}
            />
          </div>
        </div>
      ) : (
        <>
          <button 
            className={`chat-fab ${isOpen ? 'transparent' : ''}`}
            onClick={toggleChat}
          >
            <i className="bi bi-chat"></i>
          </button>
          {showTooltip && (
            <div className="chat-tooltip">
              <div className="tooltip-content">
                <p>{tooltipText || "..."}</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ChatWidget; 