"use client";
import React from "react";
import Wrapper from "@/layouts/wrapper";
import CompanyBreadcrumb from "../components/common/common-breadcrumb";

const TermsPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <CompanyBreadcrumb
          title="Terms and Conditions"
          subtitle="Please read these terms carefully before using Clutch Jobs"
        />

        <div className="container mt-80 mb-150 lg-mt-60 lg-mb-100">
          <div className="row">
            <div className="col-12">
              <div className="terms-content">
                <h2>Terms and Conditions</h2>
                <p className="mt-20">Last Updated: April 16, 2024</p>
                
                <h4 className="mt-40">1. Acceptance of Terms</h4>
                <p>
                  By accessing or using Clutch Jobs, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
                
                <h4 className="mt-30">2. Use License</h4>
                <p>
                  Permission is granted to temporarily download one copy of the materials on Clutch Jobs for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="style-none list-item mt-20">
                  <li>- Modify or copy the materials</li>
                  <li>- Use the materials for any commercial purpose</li>
                  <li>- Attempt to decompile or reverse engineer any software contained on Clutch Jobs</li>
                  <li>- Remove any copyright or other proprietary notations from the materials</li>
                  <li>- Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
                
                <h4 className="mt-30">3. Account Registration</h4>
                <p>
                  To access certain features of the platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                
                <h4 className="mt-30">4. User Conduct</h4>
                <p>
                  As a user of Clutch Jobs, you agree not to:
                </p>
                <ul className="style-none list-item mt-20">
                  <li>- Violate any applicable laws or regulations</li>
                  <li>- Impersonate any person or entity</li>
                  <li>- Submit false or misleading information</li>
                  <li>- Upload or transmit viruses or any other type of malicious code</li>
                  <li>- Interfere with or disrupt the integrity or performance of the site</li>
                </ul>
                
                <h4 className="mt-30">5. Job Listings and Applications</h4>
                <p>
                  Employers are responsible for the accuracy of their job listings. Job seekers are responsible for the accuracy of their applications and resumes. Clutch Jobs does not guarantee employment or verify the accuracy of listings or applications.
                </p>
                
                <h4 className="mt-30">6. Limitation of Liability</h4>
                <p>
                  Clutch Jobs shall not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, the platform or materials on the platform, even if Clutch Jobs has been advised of the possibility of such damages.
                </p>
                
                <h4 className="mt-30">7. Governing Law</h4>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
                
                <h4 className="mt-30">8. Changes to Terms</h4>
                <p>
                  Clutch Jobs reserves the right, at its sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                </p>
                
                <h4 className="mt-30">9. Contact Information</h4>
                <p>
                  If you have any questions about these Terms, please contact us at support@clutchjobs.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default TermsPage; 