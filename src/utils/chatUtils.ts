// Chat widget interaction utilities

// Flag to track if widget is already open
let isWidgetOpen = false;

// Flag to track pending messages
const pendingMessages: string[] = [];

// Global event to open the chat widget and return a promise that resolves when opened
export const openChatWidget = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If already open, resolve immediately
    if (isWidgetOpen) {
      resolve(true);
      return;
    }

    // Set up listener for confirmation that chat is open
    const handleWidgetOpened = () => {
      isWidgetOpen = true;
      document.removeEventListener('chatWidgetOpened', handleWidgetOpened);
      resolve(true);
    };

    // Listen for open confirmation
    document.addEventListener('chatWidgetOpened', handleWidgetOpened);

    // Dispatch event to open the widget
    const event = new CustomEvent('openChatWidget');
    window.dispatchEvent(event);

    // Fallback: resolve after timeout even if no confirmation received
    setTimeout(() => {
      if (!isWidgetOpen) {
        document.removeEventListener('chatWidgetOpened', handleWidgetOpened);
        console.warn('No confirmation received that chat widget opened, continuing anyway');
        isWidgetOpen = true;
        resolve(true);
      }
    }, 2000);
  });
};

// Global event to send a silent message to the chat endpoint
export const sendSilentChatMessage = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Add to pending messages queue
    pendingMessages.push(message);
    
    // Create event for sending this specific message
    const messageId = Date.now().toString();
    
    // Listen for send confirmation
    const handleMessageSent = (event: CustomEvent) => {
      if (event.detail.messageId === messageId) {
        document.removeEventListener('silentMessageSent', handleMessageSent as EventListener);
        resolve(true);
      }
    };
    
    // Listen for send failure
    const handleMessageFailed = (event: CustomEvent) => {
      if (event.detail.messageId === messageId) {
        document.removeEventListener('silentMessageFailed', handleMessageFailed as EventListener);
        console.error('Failed to send silent message:', event.detail.error);
        resolve(false);
      }
    };
    
    // Set up event listeners
    document.addEventListener('silentMessageSent', handleMessageSent as EventListener);
    document.addEventListener('silentMessageFailed', handleMessageFailed as EventListener);
    
    // Dispatch the event with message and ID
    const event = new CustomEvent('sendSilentChatMessage', {
      detail: { message, messageId }
    });
    window.dispatchEvent(event);
    
    // Fallback: resolve after timeout even if no confirmation
    setTimeout(() => {
      document.removeEventListener('silentMessageSent', handleMessageSent as EventListener);
      document.removeEventListener('silentMessageFailed', handleMessageFailed as EventListener);
      console.warn('No confirmation received for silent message, assuming it failed');
      resolve(false);
    }, 10000);
  });
};

// Function to trigger "Apply for job" with job details
export const triggerJobApplication = async (jobDetails: any) => {
  try {
    // First open the chat widget and wait for it to be ready
    console.log('Opening chat widget...');
    await openChatWidget();
    
    // Give some time for the WebSocket to connect
    console.log('Waiting for connection to establish...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Convert job details to a JSON string
    const jobDetailsString = JSON.stringify(jobDetails);
    
    // Create application message with instructions for one-by-one questions
    const message = `Ask me screening questions for ${jobDetailsString}. Please ask the questions one at a time and wait for my response before asking the next question.`;
    // Send the silent message and wait for confirmation
    console.log('Sending application message...');
    const result = await sendSilentChatMessage(message);
    
    if (result) {
      console.log('Application message sent successfully');
    } else {
      console.error('Failed to send application message');
    }
  } catch (error) {
    console.error('Error triggering job application:', error);
  }
}; 