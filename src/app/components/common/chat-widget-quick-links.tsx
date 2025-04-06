"use client";
import React from 'react';

interface ChatWidgetQuickLinksProps {
  links: string[];
  onSelect: (link: string) => void;
}

const ChatWidgetQuickLinks: React.FC<ChatWidgetQuickLinksProps> = ({ links, onSelect }) => {
  return (
    <div className="quick-links">
      <p className="quick-links-title">Try asking about:</p>
      <div className="quick-links-items">
        {links.map((link, index) => (
          <button 
            key={index}
            className="quick-link-item"
            onClick={() => onSelect(link)}
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatWidgetQuickLinks; 