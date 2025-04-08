'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { openChatWidget, sendSilentChatMessage, triggerJobApplication } from '@/utils/chatUtils';

// Define the ChatContext interface with Promise-based methods
interface ChatContextInterface {
  openChat: () => Promise<boolean>;
  sendSilentMessage: (message: string) => Promise<boolean>;
  applyForJob: (jobDetails: any) => Promise<void>;
}

// Create the context with default values
const ChatContext = createContext<ChatContextInterface>({
  openChat: async () => false,
  sendSilentMessage: async () => false,
  applyForJob: async () => {},
});

// Export the hook for easy access to the context
export const useChat = () => useContext(ChatContext);

// ChatProvider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to open the chat widget
  const openChat = useCallback(async () => {
    return await openChatWidget();
  }, []);

  // Function to send a silent message to the chat
  const sendSilentMessage = useCallback(async (message: string) => {
    return await sendSilentChatMessage(message);
  }, []);

  // Function to start the job application process
  const applyForJob = useCallback(async (jobDetails: any) => {
    await triggerJobApplication(jobDetails);
  }, []);

  // Provide the context value to children
  return (
    <ChatContext.Provider
      value={{
        openChat,
        sendSilentMessage,
        applyForJob,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}; 