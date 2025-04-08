"use client";
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';

const UserDebug = () => {
  const { user, employerId, candidateId, loading } = useAuth();
  const [expanded, setExpanded] = useState(false);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-debug" style={{
      position: 'fixed', 
      right: '10px', 
      bottom: '10px', 
      zIndex: 1000,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: expanded ? '400px' : '200px',
      cursor: 'pointer'
    }}>
      <div onClick={() => setExpanded(!expanded)}>
        <strong>User:</strong> {user ? user.email : 'Not logged in'} {expanded ? '▲' : '▼'}
      </div>
      
      {expanded && (
        <div>
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
          <p><strong>Employer ID:</strong> {employerId || 'None'}</p>
          <p><strong>Candidate ID:</strong> {candidateId || 'None'}</p>
          <button
            onClick={() => {
              console.log('User:', user);
              console.log('Employer ID:', employerId);
              console.log('Candidate ID:', candidateId);
            }}
            style={{
              background: '#166a9a',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Log to Console
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDebug; 