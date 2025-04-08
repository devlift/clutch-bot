"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import RegisterForm from "../forms/register-form";
import google from "@/assets/images/icon/google.png";
import facebook from "@/assets/images/icon/facebook.png";

const RegisterArea = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"candidate" | "employer">("candidate");

  useEffect(() => {
    // Check if the tab query parameter is present
    const tabParam = searchParams.get('tab');
    if (tabParam === 'employer') {
      setActiveTab("employer");
    }
  }, [searchParams]);

  const handleTabChange = (tabType: "candidate" | "employer") => {
    console.log("Switching to tab:", tabType);
    setActiveTab(tabType);
  };

  return (
    <section className="registration-section position-relative pt-100 lg-pt-80 pb-150 lg-pb-80">
      <div className="container">
        <div className="user-data-form">
          <div className="text-center">
            <h2>Create Account</h2>
            <p className="mt-10">Select an account type and enter your details to get started</p>
          </div>
          <div className="form-wrapper m-auto">
            <ul className="nav nav-tabs border-0 w-100 mt-30" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "candidate" ? "active" : ""}`}
                  onClick={() => handleTabChange("candidate")}
                  data-bs-toggle="tab"
                  data-bs-target="#fc1"
                  role="tab"
                  aria-selected={activeTab === "candidate"}
                  tabIndex={-1}
                >
                  Candidates
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "employer" ? "active" : ""}`}
                  onClick={() => handleTabChange("employer")}
                  data-bs-toggle="tab"
                  data-bs-target="#fc2"
                  role="tab"
                  aria-selected={activeTab === "employer"}
                  tabIndex={-1}
                >
                  Employer
                </button>
              </li>
            </ul>
            <div className="tab-content mt-40">
              <div
                className={`tab-pane fade ${activeTab === "candidate" ? "show active" : ""}`}
                role="tabpanel"
                id="fc1"
              >
                <RegisterForm userType="candidate" />
              </div>
              <div 
                className={`tab-pane fade ${activeTab === "employer" ? "show active" : ""}`} 
                role="tabpanel" 
                id="fc2"
              >
                <RegisterForm userType="employer" />
              </div>
            </div>

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
                  <span className="ps-2">Signup with Google</span>
                </a>
              </div>
            </div>
            <p className="text-center mt-10">
              Have an account?{" "}
              <a
                href="/login"
                className="fw-500"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterArea;
