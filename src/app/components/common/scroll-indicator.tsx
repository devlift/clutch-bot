import React from 'react';

const ScrollIndicator = () => {
  return (
    <div className="scroll-indicator-wrapper">
      <div className="scroll-indicator">
        <div className="scroll-dot"></div>
      </div>
      <style jsx>{`
        .scroll-indicator-wrapper {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .scroll-indicator {
          width: 30px;
          height: 50px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 25px;
          position: relative;
          animation: fadeInOut 2s infinite;
        }

        .scroll-dot {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          animation: scrollDown 2s infinite;
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes scrollDown {
          0% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, 20px);
            opacity: 0;
          }
          51% {
            transform: translate(-50%, 0);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollIndicator; 