'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
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
      
      // Initialize audio context for streaming
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Create audio element for playback (using useState instead of useRef)
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
        setIsAiSpeaking(true); // AI will speak first
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          console.log(`Message type: ${message.type}`);
          
          if (message.type === 'text') {
            // Handle text message from the AI
            const content = message.token || message.content || '';
            const isFinal = message.last || message.final || false;
            
            console.log(`Received text: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}", final: ${isFinal}`);
            
            if (content && content.trim()) {
              // If we receive content, AI is speaking
              setIsAiSpeaking(true);
              setIsListening(false);
              
              // Create a speech utterance for the text if browser supports it
              if ('speechSynthesis' in window && audioElement) {
                console.log('Using browser speech synthesis for playback');
                const utterance = new SpeechSynthesisUtterance(content);
                
                // Add event handlers for speech synthesis events
                utterance.onstart = () => console.log('Speech synthesis started');
                utterance.onend = () => {
                  console.log('Speech synthesis ended');
                  if (isFinal) {
                    setIsAiSpeaking(false);
                    setIsListening(true);
                  }
                };
                utterance.onerror = (err) => console.error('Speech synthesis error:', err);
                
                speechSynthesis.speak(utterance);
              } else {
                console.warn('Speech synthesis not available in this browser');
              }
            }
            
            if (isFinal) {
              // When AI is done speaking, switch to listening mode
              // Add a slight delay to ensure any audio playback is complete
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
            setIsAiSpeaking(false);
            setIsListening(true);
          } else if (message.type === 'audio') {
            // Handle audio data if the server sends it
            console.log('Received audio data from server');
            
            if (message.payload) {
              console.log(`Audio payload received, size: ${message.payload.length}, sample rate: ${message.sampleRate || 'unknown'}`);
              
              if (audioElement) {
                console.log('Setting audio element source and playing');
                
                // Get the correct audio format from the message or default to mp3
                const format = message.format || 'mp3';
                
                // Create audio source from base64 with the correct MIME type
                const audioSrc = `data:audio/${format};base64,${message.payload}`;
                audioElement.src = audioSrc;
                
                // Add event listeners to monitor audio playback
                audioElement.onloadeddata = () => console.log('Audio data loaded');
                audioElement.onplay = () => console.log('Audio playback started');
                audioElement.onended = () => console.log('Audio playback ended');
                audioElement.onerror = (e) => console.error('Audio playback error:', e);
                
                audioElement.play().then(() => {
                  console.log('Audio playback initiated successfully');
                }).catch(err => {
                  console.error('Error playing audio:', err);
                  
                  // Try an alternative approach if the first fails
                  console.log('Trying alternative audio playback method');
                  const tmpAudio = new Audio(audioSrc);
                  tmpAudio.onloadeddata = () => console.log('Temp audio loaded');
                  tmpAudio.onplay = () => console.log('Temp audio playing');
                  tmpAudio.onended = () => console.log('Temp audio ended');
                  tmpAudio.onerror = (e) => console.error('Temp audio error:', e);
                  tmpAudio.play().catch(e => console.error('Temp audio playback failed:', e));
                });
              } else {
                console.error('Audio element not available for playback');
              }
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
      
      // Create a simplified audio-only stream for the MediaRecorder
      try {
        // Function to check for supported MIME types
        const getSupportedMimeType = () => {
          // List of MIME types to try, in order of preference
          const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/ogg;codecs=opus',
            'audio/ogg'
          ];
          
          for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              console.log(`Using supported MIME type: ${type}`);
              return type;
            }
          }
          
          // If none are supported, return empty string
          console.warn('No supported MIME types found for MediaRecorder');
          return '';
        };

        // Get supported MIME type
        const mimeType = getSupportedMimeType();
        
        // Instead of using the camera stream directly, create a dedicated audio stream
        // This can help avoid issues with complex video+audio streams
        if (streamRef.current) {
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(streamRef.current);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          
          // Use only the audio portion for recording
          const audioOnlyStream = destination.stream;
          
          // Create MediaRecorder with proper config
          const mediaRecorderOptions: MediaRecorderOptions = {
            audioBitsPerSecond: 16000  // Use a lower bitrate for better compatibility
          };
          
          // Only add mimeType if it's supported
          if (mimeType) {
            mediaRecorderOptions.mimeType = mimeType;
          }
          
          // Delay MediaRecorder creation to ensure stream is fully initialized
          setTimeout(() => {
            try {
              console.log('Creating MediaRecorder with options:', mediaRecorderOptions);
              
              // Create MediaRecorder with fallback to default options if needed
              const mediaRecorder = new MediaRecorder(audioOnlyStream, mediaRecorderOptions);
              
              // Add event handlers before starting
              mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                  console.log(`Audio data available, size: ${event.data.size} bytes`);
                  // Always send audio data when available, regardless of isListening state
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64data = reader.result?.toString().split(',')[1];
                    if (base64data) {
                      // Process the data to ensure it's a valid length for 16-bit PCM
                      // Create a Uint8Array from the base64 data to check and adjust the buffer size
                      const rawData = atob(base64data);
                      let dataLength = rawData.length;
                      
                      // Make sure the buffer length is even (required for 16-bit PCM)
                      // If it's odd, we'll clip the last byte
                      let processedData = base64data;
                      if (dataLength % 2 !== 0) {
                        console.log(`Adjusting buffer size from ${dataLength} to ${dataLength - 1} bytes to ensure it's even`);
                        // Create a new buffer that's one byte shorter
                        const newBuffer = new Uint8Array(dataLength - 1);
                        for (let i = 0; i < dataLength - 1; i++) {
                          newBuffer[i] = rawData.charCodeAt(i);
                        }
                        // Convert back to base64
                        processedData = btoa(String.fromCharCode.apply(null, [...newBuffer]));
                      }
                      
                      // Send audio in the format expected by the server
                      const message = {
                        type: 'prompt',  // Use the correct message type according to API docs
                        audio: processedData,
                        sampleRate: 16000, // Specify the sample rate
                        final: false     // Only the last chunk should be final
                      };
                      console.log(`Sending audio message, type: ${message.type}, size: ${processedData.length}`);
                      socket.send(JSON.stringify(message));
                      console.log('Audio data sent, size:', processedData.length);
                    } else {
                      console.error('Failed to convert audio to base64');
                    }
                  };
                  reader.onerror = (err) => {
                    console.error('Error reading audio data:', err);
                  };
                  reader.readAsDataURL(event.data);
                } else {
                  if (event.data.size === 0) {
                    console.warn('Audio data available but size is 0, not sending');
                  }
                  if (socket.readyState !== WebSocket.OPEN) {
                    console.warn(`WebSocket not open (state: ${socket.readyState}), cannot send audio`);
                  }
                }
              };
              
              // Handle errors in the MediaRecorder
              mediaRecorder.onerror = (error) => {
                console.error('MediaRecorder error:', error);
              };
              
              // Only try to start after handlers are set up
              console.log('Starting MediaRecorder...');
              mediaRecorder.start(100); // Send data every 100ms
              console.log('MediaRecorder started successfully');

              // Send a message to the server indicating we're using audio mode
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'setup',
                  useAudio: true,
                  sampleRate: 16000
                }));
              }
              
              // Ensure we stop recording when the connection closes
              socket.addEventListener('close', () => {
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                  try {
                    mediaRecorder.stop();
                  } catch (err) {
                    console.error('Error stopping MediaRecorder:', err);
                  }
                }
              });
            } catch (error) {
              console.error('Error creating MediaRecorder:', error);
              
              // Fallback to text input
              console.log('Using text-only interview mode...');
              
              // Send a message to the server indicating we'll use text instead
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'text_mode',
                  message: 'Client unable to stream audio, using text mode'
                }));
              }
            }
          }, 1000); // Delay MediaRecorder creation by 1 second
          
          // Keep connection alive with ping messages regardless of recording status
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
        }
      } catch (error) {
        console.error('Error setting up audio processing:', error);
        
        // Even if audio processing fails, we still want to continue with the WebSocket connection
        console.log('Continuing with interview without audio recording...');
        
        // Send a message to the server indicating we'll use text
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'text_mode',
            message: 'Client unable to setup audio processing, using text mode'
          }));
        }
        
        // Keep the WebSocket connection alive with ping messages
        const pingInterval = setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
        
        // Clean up interval when socket closes
        socket.addEventListener('close', () => {
          clearInterval(pingInterval);
        });
      }
      
    } catch (error) {
      console.error('Error starting interview:', error);
      setVoiceStatus('error');
    }
  };
  
  const closeVoiceConnection = () => {
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
      `}</style>
    </div>
  );
};

export default InterviewModal; 