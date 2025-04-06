"use client";
import React from 'react';

interface QuickLinkProps {
  links: string[];
  onSelect: (link: string) => void;
}

const ChatWidgetQuickLinks: React.FC<QuickLinkProps> = ({ links, onSelect }) => {
  return (
    <div className="chat-quicklinks">
      {links.map((link, index) => (
        <button 
          key={index} 
          className="quicklink-button"
          onClick={() => onSelect(link)}
        >
          {link}
        </button>
      ))}
      
      <style jsx>{`
        .chat-quicklinks {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #e0e0e0;
          background-color: #f9f9f9;
        }
        
        .quicklink-button {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          color: #333333;
          border-radius: 16px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .quicklink-button:hover {
          background-color: #166a9a;
          border-color: #166a9a;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ChatWidgetQuickLinks; 