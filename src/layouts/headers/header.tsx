"use client"
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Menus from "./component/menus";
import logo from "@/assets/images/logo/logo_01.png";
import CategoryDropdown from "./component/category-dropdown";
import LoginModal from "@/app/components/common/popup/login-modal";
import AuthWrapper from "@/components/common/auth-wrapper";
import useSticky from "@/hooks/use-sticky";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Header = () => {
  const {sticky} = useSticky();
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
    <header className={`theme-main-menu menu-overlay menu-style-one sticky-menu ${sticky?'fixed':''}`}>
      <div className="inner-content position-relative">
        <div className="top-header">
          <div className="d-flex align-items-center">
            <div className="logo order-lg-0">
              <Link href="/" className="d-flex align-items-center">
                <Image src={logo} width={300} alt="logo" priority />
              </Link>
            </div>
            <div className="right-widget ms-auto ms-lg-0 order-lg-3" style={{ minWidth: '64px' }}>
              <ul className="d-flex align-items-center style-none">
                <li className="d-none d-md-block">
                  <Link href="/register" className="job-post-btn tran3s">
                    Post Job
                  </Link>
                </li>
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
            <nav className="navbar navbar-expand-lg p0 ms-lg-5 ms-3 order-lg-2">
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
                <ul className="navbar-nav align-items-lg-center">
                  <li className="d-block d-lg-none">
                    <div className="logo">
                      <Link href="/" className="d-block">
                        <Image src={logo} alt="logo" width={100} priority />
                      </Link>
                    </div>
                  </li>
                  <li className="nav-item dropdown category-btn mega-dropdown-sm">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="false"
                    >
                      <i className="bi bi-grid-fill"></i> Category
                    </a>
                    {/* CategoryDropdown start */}
                    <CategoryDropdown />
                    {/* CategoryDropdown end */}
                  </li>
                  {/* menus start */}
                  <Menus />
                  {/* menus end */}
                  <li className="d-md-none">
                    <Link href='/register' className="job-post-btn tran3s">
                      Post Job
                    </Link>
                  </li>
                  {!isLoggedIn && (
                    <li className="d-md-none">
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

export default Header;
