import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "../../forms/login-form";
import google from "@/assets/images/icon/google.png";
import facebook from "@/assets/images/icon/facebook.png";

const LoginModal = () => {
  // Add useEffect to fix backdrop z-index issues when the modal opens
  useEffect(() => {
    // Function to ensure backdrop is below modal
    const fixBackdropZIndex = () => {
      // Get modal and backdrop elements
      const modal = document.getElementById('loginModal');
      const backdrop = document.querySelector('.modal-backdrop');
      
      if (backdrop) {
        // Set backdrop to a lower z-index than the modal content
        backdrop.setAttribute('style', 'z-index: 1040 !important');
      }
      
      // Add event listener for when modal opens
      if (modal) {
        modal.addEventListener('shown.bs.modal', fixBackdropZIndex);
      }
    };
    
    // Call the function to set up listeners
    fixBackdropZIndex();
    
    // Cleanup event listener on component unmount
    return () => {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.removeEventListener('shown.bs.modal', fixBackdropZIndex);
      }
    };
  }, []);

  return (
    <>
      {/* Add custom styles to fix z-index issues */}
      <style jsx global>{`
        .modal-backdrop.fade.show {
          z-index: 1040 !important;
          opacity: 0.5;
        }
        
        #loginModal {
          z-index: 1050 !important;
        }
        
        #loginModal .modal-dialog {
          z-index: 1060 !important;
        }
        
        #loginModal .modal-content {
          background-color: #fff !important;
          opacity: 1 !important;
          box-shadow: 0 0 25px rgba(0,0,0,0.2) !important;
        }
      `}</style>
      
      <div
        className="modal fade"
        id="loginModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen modal-dialog-centered">
          <div className="container">
            <div className="user-data-form modal-content">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
              <div className="text-center">
                <h2>Hi, Welcome Back!</h2>
                <p>
                  Still do not have an account? <Link href="/register">Sign up</Link>
                </p>
              </div>
              <div className="form-wrapper m-auto">
                <LoginForm />
                <div className="d-flex align-items-center mt-30 mb-10">
                  <div className="line"></div>
                  <span className="pe-3 ps-3">OR</span>
                  <div className="line"></div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <a
                      href="#"
                      className="social-use-btn d-flex align-items-center justify-content-center tran3s w-100 mt-10"
                    >
                      <Image src={google} alt="google-img" />
                      <span className="ps-2">Login with Google</span>
                    </a>
                  </div>
                </div>
                <p className="text-center mt-10">
                  Do not have an account?{" "}
                  <Link href="/register" className="fw-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
