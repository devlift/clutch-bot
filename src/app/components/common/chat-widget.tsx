"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ChatWidgetQuickLinks from './chat-widget-quick-links';
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import ReactMarkdown from 'react-markdown';
import { supabase } from "@/lib/supabase";
import CreateJobModal from '../modals/create-job-modal';
import InterviewModal from './interview-modal';

interface FileItem {
  name: string;
  type: string;
  size: string;
}

interface JobDetailsOutput {
  title: string;
  description: string;
  wage: number;
  wageType: string;
  requirements: string[];
  location: string;
  jobType: string;
  schedule: string;
  benefits: string[];
  responsibilities: string[];
  howToApply: string[] | string;
  advertiseUntil: string;
  status: string;
  tags: string[];
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  files?: FileItem[];
  isStreaming?: boolean;
  toolOutput?: {
    tool: string;
    output: any;
  };
}

const WEBSOCKET_URL = "wss://clutch.ngrok.app/chat";

// Get auth token function
const getSupabaseAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    // Return the access token if session exists
    return data.session?.access_token || null;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

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

  // Add state for job details modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetailsOutput | null>(null);

  // Add state for interview modal and questions
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  // Add a state for typing indicator
  const [isTyping, setIsTyping] = useState(false);

  // --- WebSocket Integration --- 
  const handleMessageStream = useCallback((streamedMessage: string) => {
    // Hide typing indicator when we start receiving a response
    setIsTyping(false);
    
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
    
    // Hide typing indicator on error
    setIsTyping(false);
    
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

  // Add new function to handle tool call outputs
  const handleToolCallOutput = useCallback((toolName: string, output: any) => {
    console.log(`Received tool output from ${toolName}:`, output);
    
    if (toolName === 'create_job_details') {
      // Process the output - remove status and ensure wageType has proper case
      const processedOutput = {
        ...output,
        // Use proper case for wageType (Salary or Hourly)
        wageType: output.wageType 
          ? (output.wageType.toLowerCase() === 'hourly' ? 'Hourly' : 'Salary') 
          : 'Salary'
      };
      
      // Delete status if it exists
      if ('status' in processedOutput) {
        delete processedOutput.status;
      }
      
      // Store the job details with proper formatting
      setJobDetails(processedOutput);
      
      // Add a message with the job details and a button
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I've created a draft job posting based on our conversation. Would you like to review and publish it?",
        sender: "bot",
        isStreaming: false,
        toolOutput: {
          tool: toolName,
          output: processedOutput
        }
      }]);
    } 
    else if (toolName === 'start_interview') {
      // Process the interview questions
      let questions: string[] = [];
      
      // Check if output is an array or convert it to an array
      if (Array.isArray(output)) {
        questions = output;
      } else if (typeof output === 'object' && output.questions && Array.isArray(output.questions)) {
        questions = output.questions;
      } else if (typeof output === 'string') {
        try {
          // Try to parse as JSON if it's a string
          const parsed = JSON.parse(output);
          questions = Array.isArray(parsed) ? parsed : 
                    (parsed.questions && Array.isArray(parsed.questions)) ? parsed.questions : [];
        } catch (e) {
          // If not parseable JSON, split by newlines and filter empty lines
          questions = output.split('\n').filter(q => q.trim() !== '');
        }
      }
      
      // Store the interview questions
      setInterviewQuestions(questions);
      
      // Add a message with the button to start the interview
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I've prepared interview questions based on the job description. Would you like to start the video interview now?",
        sender: "bot",
        isStreaming: false,
        toolOutput: {
          tool: toolName,
          output: questions
        }
      }]);
    }
  }, []);

  // Add this function to handle messages complete
  const handleMessageComplete = useCallback(() => {
    // Ensure typing indicator is hidden when message is complete
    setIsTyping(false);
  }, []);

  const {
    connect,
    disconnect,
    sendMessage: sendWebSocketMessage,
    status: wsStatus
  } = useChatWebSocket({
    url: WEBSOCKET_URL,
    onMessageStream: handleMessageStream,
    onCompleteMessage: handleMessageComplete, // Add the complete handler
    onError: handleWebSocketError,
    getAuthToken: getSupabaseAuthToken,
    onToolCallOutput: handleToolCallOutput
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

    // Show typing indicator
    setIsTyping(true);

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
    // Skip on server side
    if (typeof window === 'undefined') return;
    
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('openChat') === 'true') {
      // Reset connection state
      setReconnectAttempts(0);
      setShowConnectionError(false);
      // Open chat and connect
      setIsOpen(true);
      attemptConnection();
    }
  }, [attemptConnection, setIsOpen, setReconnectAttempts, setShowConnectionError, setMessages]); // Include all dependencies

  // Function to send a message to the server without displaying in UI
  const sendSilentMessage = useCallback((message: string) => {
    // Only send if connection is open
    if (wsStatus === 'open') {
      sendWebSocketMessage({ text: message });
      return true;
    }
    return false;
  }, [wsStatus, sendWebSocketMessage]);

  // Add event listeners
  useEffect(() => {
    // Handler for opening the chat widget
    const handleOpenChatWidget = () => {
      if (!isOpen) {
        // Reset connection state
        setReconnectAttempts(0);
        setShowConnectionError(false);
        // Open chat and connect
        setIsOpen(true);
        attemptConnection();
      }

      // Dispatch an event to confirm the widget is open
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('chatWidgetOpened'));
      }, 100);
    };

    // Handler for sending silent messages
    const handleSilentMessage = (event: CustomEvent<{message: string, messageId: string}>) => {
      const { message, messageId } = event.detail;
      
      // If chat is closed, open it first
      if (!isOpen) {
        setIsOpen(true);
        attemptConnection();
      }
      
      // Function to send the message and report success
      const trySendMessage = () => {
        if (wsStatus === 'open') {
          console.log('Sending silent message through WebSocket');
          sendWebSocketMessage({ text: message });
          // Report success
          document.dispatchEvent(new CustomEvent('silentMessageSent', { 
            detail: { messageId } 
          }));
          return true;
        }
        return false;
      };
      
      // Initial attempt after a delay to ensure connection is ready
      setTimeout(() => {
        // If already connected, send immediately
        if (trySendMessage()) return;
        
        // Otherwise set up retries
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds max
        
        const interval = setInterval(() => {
          attempts++;
          
          // Update connection status in console
          console.log(`Connection status: ${wsStatus}, attempt ${attempts}/${maxAttempts}`);
          
          // Try to send message
          if (trySendMessage()) {
            clearInterval(interval);
          } 
          // Stop trying after max attempts
          else if (attempts >= maxAttempts) {
            document.dispatchEvent(new CustomEvent('silentMessageFailed', { 
              detail: { 
                messageId,
                error: 'Connection not established after maximum attempts' 
              } 
            }));
            clearInterval(interval);
          }
        }, 500);
      }, 1000);
    };

    // Handler for starting an interview
    const handleStartInterview = (event: CustomEvent<{messageId: string, jobTitle: string}>) => {
      const { messageId, jobTitle } = event.detail;
      
      // If chat is closed, open it first
      if (!isOpen) {
        setIsOpen(true);
        attemptConnection();
      }
      
      // Function to send the interview request
      const trySendInterviewRequest = () => {
        if (wsStatus === 'open') {
          console.log('Sending interview request through WebSocket');
          // Send a message to trigger the start_interview tool
          sendWebSocketMessage({ 
            text: `Start a video interview for the ${jobTitle} position with screening questions.` 
          });
          
          // This will be handled by the AI which should trigger the start_interview tool
          // Report success
          document.dispatchEvent(new CustomEvent('interviewRequestSent', { 
            detail: { messageId } 
          }));
          return true;
        }
        return false;
      };
      
      // Try to send with similar retry logic as silent messages
      setTimeout(() => {
        if (trySendInterviewRequest()) return;
        
        let attempts = 0;
        const maxAttempts = 10;
        
        const interval = setInterval(() => {
          attempts++;
          
          console.log(`Connection status for interview: ${wsStatus}, attempt ${attempts}/${maxAttempts}`);
          
          if (trySendInterviewRequest()) {
            clearInterval(interval);
          } 
          else if (attempts >= maxAttempts) {
            document.dispatchEvent(new CustomEvent('interviewRequestFailed', { 
              detail: { 
                messageId,
                error: 'Connection not established for interview request' 
              } 
            }));
            clearInterval(interval);
          }
        }, 500);
      }, 1000);
    };

    // Add event listeners
    window.addEventListener('openChatWidget', handleOpenChatWidget);
    window.addEventListener('sendSilentChatMessage', handleSilentMessage as EventListener);
    document.addEventListener('startInterview', handleStartInterview as EventListener);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChatWidget);
      window.removeEventListener('sendSilentChatMessage', handleSilentMessage as EventListener);
      document.removeEventListener('startInterview', handleStartInterview as EventListener);
    };
  }, [isOpen, attemptConnection, wsStatus, sendWebSocketMessage]);

  // Add function to handle opening the job modal
  const handleOpenJobModal = () => {
    if (jobDetails) {
      setShowJobModal(true);
    } else {
      console.error("No job details available");
    }
  };

  // Add function to handle opening the interview modal
  const handleOpenInterviewModal = () => {
    // Simply open the modal - we'll generate questions dynamically
    setShowInterviewModal(true);
  };

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
                  {message.sender === 'bot' ? (
                    <>
                      <ReactMarkdown>{typeof message.text === 'string' ? message.text : ''}</ReactMarkdown>
                      {message.toolOutput?.tool === 'create_job_details' && (
                        <div className="mt-3">
                          <button 
                            className="btn theme-btn btn-sm"
                            onClick={handleOpenJobModal}
                          >
                            Create Posting
                          </button>
                        </div>
                      )}
                      {message.toolOutput?.tool === 'start_interview' && (
                        <div className="mt-3">
                          <button 
                            className="btn theme-btn btn-sm"
                            onClick={handleOpenInterviewModal}
                          >
                            Start Interview
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>{typeof message.text === 'string' ? message.text : ''}</p>
                  )}
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
            
            {/* Show typing indicator when waiting for response */}
            {isTyping && (
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
      
      {/* Add job details modal */}
      {showJobModal && jobDetails && (
        <CreateJobModal 
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          jobDetails={jobDetails}
        />
      )}
      
      {/* Add interview modal */}
      {showInterviewModal && (
        <InterviewModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          questions={interviewQuestions}
        />
      )}
    </>
  );
};

export default ChatWidget; 