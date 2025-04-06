"use client";
import React from "react";
import Wrapper from "@/layouts/wrapper";
import CompanyBreadcrumb from "../components/common/common-breadcrumb";

const PrivacyPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <CompanyBreadcrumb
          title="Privacy Policy"
          subtitle="Learn how we collect, use, and protect your personal information"
        />

        <div className="container mt-80 mb-150 lg-mt-60 lg-mb-100">
          <div className="row">
            <div className="col-12">
              <div className="terms-content">
                <h2>Privacy Policy</h2>
                <p className="mt-20">Last Updated: April 16, 2024</p>
                
                <h4 className="mt-40">1. Introduction</h4>
                <p>
                  At Clutch Jobs, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                </p>
                
                <h4 className="mt-30">2. The Data We Collect About You</h4>
                <p>
                  Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store, and transfer different kinds of personal data about you, which we have grouped together as follows:
                </p>
                <ul className="style-none list-item mt-20">
                  <li>- <strong>Identity Data</strong> includes first name, last name, username, and professional title.</li>
                  <li>- <strong>Contact Data</strong> includes email address and telephone numbers.</li>
                  <li>- <strong>Profile Data</strong> includes your resume, employment history, skills, and professional qualifications.</li>
                  <li>- <strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, and operating system.</li>
                  <li>- <strong>Usage Data</strong> includes information about how you use our website and services.</li>
                </ul>
                
                <h4 className="mt-30">3. How We Use Your Personal Data</h4>
                <p>
                  We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="style-none list-item mt-20">
                  <li>- To register you as a new user</li>
                  <li>- To provide job listings and matching services</li>
                  <li>- To manage our relationship with you</li>
                  <li>- To improve our website and services</li>
                  <li>- To market relevant services to you (with your consent)</li>
                </ul>
                
                <h4 className="mt-30">4. Data Security</h4>
                <p>
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We also limit access to your personal data to those employees, agents, and other third parties who have a business need to know.
                </p>
                
                <h4 className="mt-30">5. Data Retention</h4>
                <p>
                  We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                </p>
                
                <h4 className="mt-30">6. Your Legal Rights</h4>
                <p>
                  Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
                </p>
                <ul className="style-none list-item mt-20">
                  <li>- Request access to your personal data</li>
                  <li>- Request correction of your personal data</li>
                  <li>- Request erasure of your personal data</li>
                  <li>- Object to processing of your personal data</li>
                  <li>- Request restriction of processing your personal data</li>
                  <li>- Request transfer of your personal data</li>
                  <li>- Right to withdraw consent</li>
                </ul>
                
                <h4 className="mt-30">7. Cookies</h4>
                <p>
                  We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                </p>
                
                <h4 className="mt-30">8. Children's Privacy</h4>
                <p>
                  Our Service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18.
                </p>
                
                <h4 className="mt-30">9. Changes to This Privacy Policy</h4>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
                </p>
                
                <h4 className="mt-30">10. Contact Us</h4>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@clutchjobs.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default PrivacyPage; 