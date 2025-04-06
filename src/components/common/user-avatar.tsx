"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from "@/lib/supabase";
import Image from 'next/image';
import { User } from '@supabase/supabase-js';

interface UserAvatarProps {
  user: User | null;
  userName?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        avatarRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle user sign out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      // Redirect to home page or refresh
      window.location.href = '/';
    }
  };
  
  // Get first letter of user's name for avatar
  const getInitial = () => {
    if (userName && userName.length > 0) {
      return userName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };
  
  return (
    <div className="user-avatar-container">
      <div 
        ref={avatarRef}
        className="user-avatar" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="avatar-circle">
          {getInitial()}
        </div>
      </div>
      
      {isOpen && (
        <div ref={popoverRef} className="avatar-popover">
          <div className="popover-menu">
            <Link href="/dashboard/settings" className="menu-item">
              <i className="bi bi-gear"></i>
              <span>Settings</span>
            </Link>
            <Link href="/help" className="menu-item">
              <i className="bi bi-question-circle"></i>
              <span>Help Center</span>
            </Link>
            <div className="menu-divider"></div>
            <Link href="/subscription" className="menu-item">
              <i className="bi bi-credit-card"></i>
              <span>My Subscription</span>
            </Link>
            <Link href="/accounts" className="menu-item">
              <i className="bi bi-people"></i>
              <span>Select Account</span>
            </Link>
            <button onClick={handleSignOut} className="menu-item sign-out">
              <i className="bi bi-box-arrow-right"></i>
              <span>Sign Out</span>
            </button>
            <div className="menu-divider"></div>
            <div className="user-profile">
              <div className="avatar-circle-large">
                {getInitial()}
              </div>
              <div className="user-details">
                <h6>{userName || user?.email?.split('@')[0] || 'User'}</h6>
                <p className="team-name">Teams <span className="team-value">devlift</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar; 