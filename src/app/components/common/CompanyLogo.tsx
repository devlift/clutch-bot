'use client'
import React from 'react';
import Image from 'next/image';

const CompanyLogo = ({ 
  logo, 
  company, 
  size = 50,
  className = ''
}: { 
  logo?: string | null;
  company: string;
  size?: number;
  className?: string;
}) => {
  const [error, setError] = React.useState(false);

  // Create company initials for the placeholder
  const initials = company
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Show placeholder if no logo or error loading logo
  if (!logo || error) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: '#e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          fontSize: `${size * 0.4}px`,
          fontWeight: 'bold',
          color: '#495057',
          border: '1px solid #e0e0e0'
        }}
        className={className}
      >
        {initials}
      </div>
    );
  }

  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }} 
      className={className}
    >
      <Image
        src={logo}
        alt={`${company} logo`}
        fill
        style={{ objectFit: 'contain', padding: '4px' }}
        onError={() => setError(true)}
      />
    </div>
  );
};

export default CompanyLogo; 