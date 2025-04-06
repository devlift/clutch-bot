"use client";
import React from "react";
import Wrapper from "@/layouts/wrapper";
import CompanyBreadcrumb from "../components/common/common-breadcrumb";

const HelpCenterPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <CompanyBreadcrumb
          title="Help Center"
          subtitle="Find answers to your questions and get support"
        />

        <div className="container mt-80 mb-150 lg-mt-60 lg-mb-100">
          <div className="row">
            <div className="col-12">
              <div className="help-center-content">
                <h2>Help Center</h2>
                <p>This page is under construction. Our Help Center will be available soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default HelpCenterPage; 