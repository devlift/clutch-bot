"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DebugAuth = () => {
  const [authData, setAuthData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session
        const { data: sessionData } = await supabase.auth.getSession();
        
        // Get user
        const { data } = await supabase.auth.getUser();
        
        setAuthData({
          session: sessionData.session,
          user: data?.user
        });
      } catch (error) {
        console.error("Debug auth error:", error);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async () => {
      checkAuth();
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  if (!authData) return null;
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  const isLoggedIn = !!authData.user;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      maxHeight: expanded ? '300px' : '30px',
      overflow: 'auto'
    }}>
      <div onClick={toggleExpanded} style={{ cursor: 'pointer' }}>
        Auth Status: {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
        {isLoggedIn && ` (${authData.user.email})`}
        {expanded ? ' ▲' : ' ▼'}
      </div>
      
      {expanded && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '5px' }}>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Force Sign Out
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
            {JSON.stringify(authData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugAuth; 