'use client';

import React, { useState, useRef, useEffect } from 'react';

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions?: string[]; // Make questions optional
}

const InterviewModal: React.FC<InterviewModalProps> = ({ isOpen, onClose, questions }) => {
  const [videoStatus, setVideoStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<string[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<string[]>([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [typedResponse, setTypedResponse] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioAccumulatorRef = useRef<string[]>([]);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Initialize webcam when modal opens
  useEffect(() => {
    if (isOpen) {
      initWebcam();
    } else {
      stopWebcam();
      closeVoiceConnection();
    }
    
    return () => {
      stopWebcam();
      closeVoiceConnection();
    };
  }, [isOpen]);
  
  const initWebcam = async () => {
    setVideoStatus('loading');
    setAudioStatus('loading');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setVideoStatus('ready');
        
        // Test audio by checking for audio tracks
        if (stream.getAudioTracks().length > 0) {
          setAudioStatus('ready');
        } else {
          setAudioStatus('error');
        }
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setVideoStatus('error');
      setAudioStatus('error');
    }
  };
  
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  // Replace the MediaRecorder useEffect with Web Speech API recognition
  useEffect(() => {
    if (voiceStatus !== 'connected' || !streamRef.current) return;
    
    console.log('Setting up Web Speech API for client-side transcription');
    
    try {
      // Check if SpeechRecognition is available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }
      
      // Create speech recognition instance
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      // Handle speech recognition results - using proper Twilio format
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const isFinal = event.results[event.results.length - 1].isFinal;
        
        // Log interim results for debugging
        console.log(`Speech recognized: "${transcript}" (final: ${isFinal})`);
        
        // Only send final results to the server
        if (isFinal && wsRef.current?.readyState === WebSocket.OPEN && sessionId) {
          console.log('Sending final transcription to server in Twilio format');
          wsRef.current.send(JSON.stringify({
            type: 'prompt',
            voicePrompt: transcript,  // Must use voicePrompt, not text (Twilio format)
            last: true,               // Must use last, not final (Twilio format)
            sessionId: sessionId
          }));
        }
      };
      
      // Handle errors
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted');
        } else {
          setVoiceStatus('error');
        }
      };
      
      // Handle recognition end
      recognitionInstance.onend = () => {
        console.log('Speech recognition session ended');
        setRecognitionActive(false);
        
        // Restart if we're still in listening mode
        if (isListening && !isAiSpeaking) {
          try {
            console.log('Restarting speech recognition after session ended');
            recognitionInstance.start();
            setRecognitionActive(true);
          } catch (err) {
            console.error('Error restarting recognition after end:', err);
          }
        }
      };
      
      // Store the recognition instance
      setRecognition(recognitionInstance);
      
      // Clean up function
      return () => {
        try {
          recognitionInstance.stop();
          setRecognitionActive(false);
          console.log('Speech recognition cleaned up');
        } catch (err) {
          // Ignore errors when stopping recognition that hasn't started
        }
      };
    } catch (error) {
      console.error('Error setting up speech recognition:', error);
    }
  }, [voiceStatus, sessionId]);

  // Add useEffect to handle listening state changes
  useEffect(() => {
    if (!recognition) return;
    
    console.log(`Listening state changed - isListening: ${isListening}, isAiSpeaking: ${isAiSpeaking}, recognitionActive: ${recognitionActive}`);
    
    if (isListening && voiceStatus === 'connected' && !isAiSpeaking) {
      if (!recognitionActive) {
        try {
          recognition.start();
          setRecognitionActive(true);
          console.log('Speech recognition started');
        } catch (err) {
          console.error('Error starting speech recognition:', err);
          setRecognitionActive(false);
        }
      }
    } else if (recognitionActive) {
      try {
        recognition.stop();
        setRecognitionActive(false);
        console.log('Speech recognition stopped');
      } catch (err) {
        // Ignore errors when stopping recognition that hasn't started
      }
    }
  }, [isListening, voiceStatus, recognition, isAiSpeaking, recognitionActive]);

  // Handle audio accumulation
  const handleAudioMessage = (payload: string) => {
    try {
      // Add to audio accumulator
      audioAccumulatorRef.current.push(payload);
      console.log(`Added audio to accumulator, size: ${audioAccumulatorRef.current.length}`);
      
      // Clear any existing processing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      // Set a new timeout to process audio after a short delay
      // This allows us to collect multiple chunks before processing
      processingTimeoutRef.current = setTimeout(() => {
        if (audioAccumulatorRef.current.length > 0) {
          // Combine all accumulated audio data
          const combinedAudio = audioAccumulatorRef.current;
          console.log(`Processing ${combinedAudio.length} audio chunks`);
          
          // Clear the accumulator
          audioAccumulatorRef.current = [];
          
          // Play directly from the accumulated audio
          playAudioFromChunks(combinedAudio);
        }
      }, 300); // 300ms delay to collect chunks
    } catch (error) {
      console.error('Error handling audio message:', error);
    }
  };

  // Direct audio playback from chunks
  const playAudioFromChunks = (chunks: string[]) => {
    if (chunks.length === 0) return;
    
    console.log(`Attempting to play ${chunks.length} audio chunks`);
    setIsProcessingAudio(true);
    setIsAiSpeaking(true);
    setIsListening(false);
    
    // Play first chunk to test
    let currentIndex = 0;
    
    // Create a new audio element
    const playNextChunk = () => {
      if (currentIndex >= chunks.length) {
        console.log('Finished playing all chunks');
        setIsProcessingAudio(false);
        setIsAiSpeaking(false);
        setTimeout(() => setIsListening(true), 300);
        return;
      }
      
      const chunk = chunks[currentIndex];
      console.log(`Playing chunk ${currentIndex + 1}/${chunks.length}`);
      
      try {
        // Create and play audio
        const audio = new Audio(`data:audio/mp3;base64,${chunk}`);
        currentAudioRef.current = audio;
        
        // Event handlers
        audio.onloadeddata = () => console.log(`Chunk ${currentIndex + 1} loaded`);
        audio.onplay = () => console.log(`Chunk ${currentIndex + 1} playing`);
        audio.onended = () => {
          console.log(`Chunk ${currentIndex + 1} ended`);
          currentIndex++;
          playNextChunk();
        };
        audio.onerror = (e) => {
          console.error(`Error playing chunk ${currentIndex + 1}:`, e);
          // Try playing MP3 directly with a simpler approach
          trySimplePlayback(chunk, currentIndex, () => {
            currentIndex++;
            playNextChunk();
          });
        };
        
        // Force autoplay
        audio.autoplay = true;
        
        // Start playback with a timeout fallback
        const playPromise = audio.play();
        
        if (playPromise) {
          playPromise.catch(err => {
            console.error(`Play error on chunk ${currentIndex + 1}:`, err);
            // Try alternative playback
            trySimplePlayback(chunk, currentIndex, () => {
              currentIndex++;
              playNextChunk();
            });
          });
        }
        
        // Safety timeout
        setTimeout(() => {
          if (currentAudioRef.current === audio) {
            console.log(`Safety timeout on chunk ${currentIndex + 1}`);
            currentIndex++;
            playNextChunk();
          }
        }, 5000);
      } catch (err) {
        console.error(`Error initializing chunk ${currentIndex + 1}:`, err);
        currentIndex++;
        playNextChunk();
      }
    };
    
    // Start playing
    playNextChunk();
  };
  
  // Simple fallback playback method
  const trySimplePlayback = (chunk: string, index: number, onComplete: () => void) => {
    console.log(`Trying simple playback for chunk ${index + 1}`);
    
    try {
      // Create element directly in the DOM
      const audioEl = document.createElement('audio');
      audioEl.src = `data:audio/mp3;base64,${chunk}`;
      audioEl.style.display = 'none';
      document.body.appendChild(audioEl);
      
      audioEl.onended = () => {
        document.body.removeChild(audioEl);
        onComplete();
      };
      
      audioEl.onerror = () => {
        document.body.removeChild(audioEl);
        console.error(`Simple playback failed for chunk ${index + 1}`);
        onComplete();
      };
      
      // Force play
      audioEl.play().catch(() => {
        document.body.removeChild(audioEl);
        console.error(`Simple play() failed for chunk ${index + 1}`);
        onComplete();
      });
      
      // Safety timeout
      setTimeout(() => {
        if (document.body.contains(audioEl)) {
          document.body.removeChild(audioEl);
          onComplete();
        }
      }, 5000);
    } catch (err) {
      console.error(`Simple playback error for chunk ${index + 1}:`, err);
      onComplete();
    }
  };

  const startInterview = async () => {
    try {
      setVoiceStatus('connecting');
      
      // Call the web-voice endpoint to initialize a voice session
      const response = await fetch('https://clutch.ngrok.app/web-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructions: 'You are conducting a job interview. Ask relevant questions about the candidate\'s experience and skills.'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start voice session: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Voice session initialized:', data);
      
      // Store session ID for use in messages
      setSessionId(data.session_id);
      
      // Create audio element for playback
      const newAudioElement = new Audio();
      newAudioElement.autoplay = true;
      setAudioElement(newAudioElement);
      
      // Connect to the WebSocket URL provided by the server
      const wsUrl = data.websocket_url;
      if (!wsUrl) {
        throw new Error('No WebSocket URL provided by server');
      }
      
      console.log('Connecting to WebSocket:', wsUrl);
      const socket = new WebSocket(`wss://clutch.ngrok.app${wsUrl}`);
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setVoiceStatus('connected');
        
        // Send setup message in Twilio format
        socket.send(JSON.stringify({
          type: 'setup',
          sessionId: data.session_id
        }));
        
        setIsAiSpeaking(true); // AI will speak first
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          console.log(`Message type: ${message.type}`);
          
          if (message.type === 'text') {
            // Handle text message from the AI (Twilio format uses "token" not "content")
            const content = message.token || '';
            const isFinal = message.last || false; // Twilio uses "last" not "final"
            
            console.log(`Received text: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}", last: ${isFinal}`);
            
            // Accumulate text
            setCurrentUtterance(prev => [...prev, content]);
            
            if (content && content.trim()) {
              // Wait for audio to play
              console.log('Received text content, waiting for audio playback');
            }
            
            // If final message and no audio is being processed
            if (isFinal && audioAccumulatorRef.current.length === 0 && !isProcessingAudio && audioBuffer.length === 0) {
              setTimeout(() => {
                setIsAiSpeaking(false);
                setIsListening(true);
              }, 500);
            }
          } else if (message.type === 'speaking_started') {
            // Server indicates AI is speaking
            console.log('Server indicated AI is speaking');
            setIsAiSpeaking(true);
            setIsListening(false);
          } else if (message.type === 'speaking_ended') {
            // Server indicates AI is done speaking, now listen to user
            console.log('Server indicated AI is done speaking');
            if (audioAccumulatorRef.current.length === 0 && !isProcessingAudio && audioBuffer.length === 0) {
              setIsAiSpeaking(false);
              setIsListening(true);
            }
          } else if (message.type === 'audio') {
            // Handle audio data from ElevenLabs (MP3 format)
            console.log('Received audio data from server (ElevenLabs MP3)');
            
            if (message.payload) {
              console.log(`Received audio data, length: ${message.payload.length}`);
              
              // Process the audio with our accumulator
              handleAudioMessage(message.payload);
            } else {
              console.warn('Audio message received but no payload found');
            }
          } else if (message.type === 'error') {
            console.error('WebSocket error message:', message.error);
            setVoiceStatus('error');
          } else {
            console.log(`Unhandled message type: ${message.type}`);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setVoiceStatus('error');
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setVoiceStatus('idle');
        setIsListening(false);
        setIsAiSpeaking(false);
      };
      
      // Save the socket reference
      wsRef.current = socket;
      
      // Setup ping interval
      const pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Send ping every 30 seconds
      
      // Clean up interval when socket closes
      socket.addEventListener('close', () => {
        clearInterval(pingInterval);
      });
      
    } catch (error) {
      console.error('Error starting interview:', error);
      setVoiceStatus('error');
    }
  };
  
  const closeVoiceConnection = () => {
    // Clear any pending audio processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    // Clear audio accumulator
    audioAccumulatorRef.current = [];
    
    // Stop current audio playback
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = ''; // Clear src to release resources
      } catch (err) {
        console.error('Error stopping audio playback:', err);
      }
      currentAudioRef.current = null;
    }
    
    // Clear audio buffer
    setAudioBuffer([]);
    setIsProcessingAudio(false);
    setCurrentUtterance([]);
    
    // Clean up speech recognition if active
    if (recognition) {
      try {
        recognition.stop();
        setRecognitionActive(false);
      } catch (err) {
        // Ignore errors
      }
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(err => {
        console.error('Error closing audio context:', err);
      });
      audioContextRef.current = null;
    }
    
    setVoiceStatus('idle');
    setIsListening(false);
    setIsAiSpeaking(false);
    setSessionId(null);
  };
  
  // Handle text area auto-resize
  useEffect(() => {
    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set the height to match the content (plus a small buffer)
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };
    
    adjustTextareaHeight();
  }, [typedResponse]);

  // Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTypedResponse(e.target.value);
  };
  
  // Send typed response
  const sendTypedResponse = () => {
    if (!typedResponse.trim() || !wsRef.current?.readyState || !sessionId) return;
    
    // Disable listening while sending typed response
    setIsListening(false);
    
    console.log('Sending typed response:', typedResponse);
    wsRef.current.send(JSON.stringify({
      type: 'prompt',
      voicePrompt: typedResponse.trim(),
      last: true,
      sessionId: sessionId
    }));
    
    // Clear input after sending
    setTypedResponse('');
    
    // Re-enable listening after sending
    setTimeout(() => {
      if (!isAiSpeaking) {
        setIsListening(true);
      }
    }, 300);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="interview-modal-wrapper">
      <div className="interview-modal-dialog">
        <div className="interview-modal-header">
          <h5 className="interview-modal-title">Video Interview Setup</h5>
          <button type="button" className="interview-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="interview-modal-body">
          <div className="webcam-container">
            <div className="video-test-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted 
                className="webcam-feed"
                style={{ width: '100%', height: '400px', backgroundColor: '#000', objectFit: 'cover' }}
              />
              
              {videoStatus === 'error' && (
                <div className="video-error-message mt-2 text-center">
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Unable to access camera. Please check permissions and try again.
                  </div>
                </div>
              )}
              
              {voiceStatus === 'connected' && (
                <div className="audio-status-overlay">
                  {isListening && (
                    <div className="listening-indicator">
                      <div className="mic-pulse"></div>
                      <div className="listening-text">Listening...</div>
                    </div>
                  )}
                  {isAiSpeaking && (
                    <div className="ai-speaking-indicator">
                      <div className="speaker-pulse"></div>
                      <div className="speaking-text">AI is speaking...</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="device-status mt-3">
              <div className="row align-items-center">
                <div className="col-md-5">
                  <div className="card border rounded h-100">
                    <div className="card-body p-3 d-flex align-items-center">
                      <div className="bg-light rounded-circle p-2 me-3 text-success">
                        <i className="bi bi-camera-video fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">Camera</h6>
                        <div className="text-muted">
                          {videoStatus === 'loading' && 'Checking...'}
                          {videoStatus === 'ready' && 'Working properly'}
                          {videoStatus === 'error' && 'Not detected'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-5">
                  <div className="card border rounded h-100">
                    <div className="card-body p-3 d-flex align-items-center">
                      <div className="bg-light rounded-circle p-2 me-3 text-success">
                        <i className="bi bi-mic fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">Microphone</h6>
                        <div className="text-muted">
                          {audioStatus === 'loading' && 'Checking...'}
                          {audioStatus === 'ready' && 'Working properly'}
                          {audioStatus === 'error' && 'Not detected'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-2 d-flex align-items-center justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-light rounded-circle" 
                    onClick={() => alert('Help: Make sure to allow camera and microphone permissions in your browser.')}
                    aria-label="Help"
                  >
                    <i className="bi bi-question"></i>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-light rounded-circle" 
                    onClick={initWebcam} 
                    aria-label="Retest devices"
                  >
                    <i className="bi bi-arrow-repeat"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="interview-info mt-3 mb-0">
              <div className="card">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Audio Interview Instructions:</h6>
                  <ul className="mb-0 small">
                    <li>Speak clearly when you see the "Listening" indicator</li>
                    <li>Wait for the AI interviewer to finish speaking before responding</li>
                    <li>The interview will consist of several questions about your experience</li>
                    <li>Your audio will be streamed to the server for processing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {voiceStatus === 'connected' && (
              <div className="text-input-container mt-3">
                <div className="card">
                  <div className="card-body p-3">
                    <div className="d-flex gap-2">
                      <textarea
                        ref={textareaRef}
                        className="form-control auto-expand"
                        rows={1}
                        placeholder="Type your response here..."
                        value={typedResponse}
                        onChange={handleTextInputChange}
                        disabled={isAiSpeaking}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendTypedResponse();
                          }
                        }}
                        wrap="soft"
                      />
                      <button
                        className="btn theme-btn"
                        onClick={sendTypedResponse}
                        disabled={isAiSpeaking || !typedResponse.trim()}
                      >
                        <i className="bi bi-send"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="interview-modal-footer">
          {voiceStatus === 'idle' && (
            <button 
              type="button" 
              className="btn theme-btn"
              disabled={videoStatus !== 'ready' || audioStatus !== 'ready'}
              onClick={startInterview}
            >
              Start Interview
            </button>
          )}
          
          {voiceStatus === 'connecting' && (
            <button type="button" className="btn theme-btn" disabled>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Connecting...
            </button>
          )}
          
          {voiceStatus === 'connected' && (
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={closeVoiceConnection}
            >
              End Interview
            </button>
          )}
          
          {voiceStatus === 'error' && (
            <div className="d-flex gap-2">
              <div className="alert alert-danger mb-0 py-2">
                Connection error. Please try again.
              </div>
              <button 
                type="button" 
                className="btn theme-btn"
                onClick={startInterview}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .audio-status-overlay {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
        }
        
        .listening-indicator, .ai-speaking-indicator {
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .mic-pulse, .speaker-pulse {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        .mic-pulse {
          background-color: #28a745;
        }
        
        .speaker-pulse {
          background-color: #007bff;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
          }
        }
        
        .auto-expand {
          min-height: 38px;
          max-height: 150px;
          resize: none;
          overflow-y: hidden;
          transition: height 0.1s ease-in-out;
          white-space: normal;
          overflow-wrap: break-word;
          word-wrap: break-word;
          width: 100%;
        }
        
        .text-input-container {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default InterviewModal; 