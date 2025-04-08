import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  content?: any;
  agent?: string;
  tool?: { name: string; arguments: any } | string;
  output?: any;
  text?: string; // For sending
}

type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

interface UseChatWebSocketOptions {
  url: string;
  onMessageStream: (delta: string) => void;
  onCompleteMessage: (fullMessage: string) => void;
  onError?: (event: Event) => void;
  onToolCallOutput?: (toolName: string, output: any) => void;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  getAuthToken?: () => Promise<string | null>;
}

export const useChatWebSocket = ({
  url,
  onMessageStream,
  onCompleteMessage,
  onError,
  onToolCallOutput,
  maxReconnectAttempts = 3,
  reconnectInterval = 2000,
  getAuthToken = async () => null,
}: UseChatWebSocketOptions) => {
  const [status, setStatus] = useState<ConnectionStatus>('closed');
  const ws = useRef<WebSocket | null>(null);
  const currentMessage = useRef<string>("");
  const reconnectCount = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef<boolean>(false);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    // Clear any existing reconnect timeouts
    clearReconnectTimeout();
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already open');
      return;
    }
    
    // Reset manual disconnect flag when attempting a new connection
    isManualDisconnect.current = false;
    
    console.log(`Connecting to ${url}...`);
    setStatus('connecting');
    
    try {
      // Get the auth token before creating the WebSocket
      const authToken = await getAuthToken();
      console.log('Auth token available:', !!authToken);
      
      // Create WebSocket with authentication headers
      let wsUrl = new URL(url);
      
      // If we have an auth token, add it as a query parameter
      if (authToken) {
        wsUrl.searchParams.append('token', authToken);
      }
      
      ws.current = new WebSocket(wsUrl.toString());

      ws.current.onopen = () => {
        console.log('WebSocket connected!');
        setStatus('open');
        reconnectCount.current = 0; // Reset reconnect counter on successful connection
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case 'text_delta':
              if (data.content && typeof data.content === 'string') {
                // Simply append the delta to the current message and pass it along
                currentMessage.current += data.content;
                onMessageStream(currentMessage.current);
              }
              break;
            case 'done':
              // Clear the current message after completion
              currentMessage.current = "";
              break;
            case 'tool_call_output':
              // Handle tool call output message type
              if (onToolCallOutput && data.tool && data.output) {
                const toolName = typeof data.tool === 'string' ? data.tool : data.tool.name;
                onToolCallOutput(toolName, data.output);
              }
              break;
            // Skip other message types - they're not needed for basic chat functionality
            default:
              // Silent ignore
              break;
          }
        } catch (error) {
          console.error('Failed to parse message or handle data:', error);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setStatus('error');
        if (onError) {
          onError(event);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed');
        setStatus('closed');
        ws.current = null;
        
        // Only attempt reconnection if it wasn't manually disconnected
        // and we haven't exceeded max reconnect attempts
        if (!isManualDisconnect.current && reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current += 1;
          const backoffTime = Math.min(
            reconnectInterval * Math.pow(2, reconnectCount.current - 1),
            30000 // Max 30 second delay
          );
          
          console.log(`Attempting reconnect ${reconnectCount.current}/${maxReconnectAttempts} in ${backoffTime}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffTime);
        } else if (reconnectCount.current >= maxReconnectAttempts) {
          console.log(`Max reconnect attempts (${maxReconnectAttempts}) reached.`);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus('error');
    }
  }, [url, onMessageStream, onCompleteMessage, onError, onToolCallOutput, maxReconnectAttempts, reconnectInterval, clearReconnectTimeout, getAuthToken]);

  const disconnect = useCallback(() => {
    // Mark as manual disconnect to prevent auto-reconnect
    isManualDisconnect.current = true;
    
    // Clear any pending reconnect attempts
    clearReconnectTimeout();
    
    if (ws.current) {
      console.log('Disconnecting WebSocket...');
      ws.current.close();
      ws.current = null;
    }
    
    setStatus('closed');
  }, [clearReconnectTimeout]);

  const sendMessage = useCallback((message: { text: string }) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('Sending:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Cannot send message.');
      
      // If not manually disconnected and connection is closed, attempt to reconnect
      if (status !== 'connecting' && !isManualDisconnect.current) {
        console.log('Attempting to reconnect before sending...');
        connect();
      }
    }
  }, [status, connect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [clearReconnectTimeout]);

  return { connect, disconnect, sendMessage, status };
}; 