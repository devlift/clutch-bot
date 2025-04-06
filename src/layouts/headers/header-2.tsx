"use client"
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import Menus from "./component/menus";
import logo from "@/assets/images/logo/logo_04.png";
import useSticky from "@/hooks/use-sticky";
import LoginModal from "@/app/components/common/popup/login-modal";
import AuthWrapper from "@/components/common/auth-wrapper";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const HeaderTwo = () => {
  const {sticky} = useSticky();
  const pathname = usePathname();
  const isJobsPage = pathname?.includes('job-grid') || pathname?.includes('job-details');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  useEffect(() => {
    // Check authentication state on component mount
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data?.user);
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  return (
    <>
    <header className={`theme-main-menu menu-overlay sticky-menu ${sticky?'fixed':''} ${isJobsPage ? 'jobs-header' : ''}`}>
      <div className="inner-content position-relative">
        <div className="top-header">
          <div className="d-flex align-items-center justify-content-between">
            <div className="logo order-lg-0">
              <Link href="/" className="d-flex align-items-center">
                <Image src={logo} width={150} alt="logo" priority />
              </Link>
            </div>
            <div className="right-widget ms-auto ms-lg-0 order-lg-3">
              <ul className="d-flex align-items-center style-none">
                <li>
                  <AuthWrapper />
                </li>
                {!isLoggedIn && (
                  <li className="d-none d-md-block ms-4">
                    <Link href="/register" className="btn-five">
                      Register
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <nav className="navbar navbar-expand-lg p0 ms-3 ms-lg-0 order-lg-2">
              <button
                className="navbar-toggler d-block d-lg-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="d-block d-lg-none">
                    <div className="logo">
                      <Link href="/" className="d-block">
                        <Image src={logo} alt="logo" width={150} priority />
                      </Link>
                    </div>
                  </li>
                  <Menus />
                  {!isLoggedIn && (
                    <li className="d-md-none mt-5">
                      <Link href="/register" className="btn-five w-100">
                        Register
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
    {/* login modal start */}
    <LoginModal/>
    {/* login modal end */}
    </>
  );
};

export default HeaderTwo;
