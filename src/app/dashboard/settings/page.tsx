"use client";
import React from "react";
import Wrapper from "@/layouts/wrapper";
import CompanyBreadcrumb from "../../components/common/common-breadcrumb";

const SettingsPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <CompanyBreadcrumb
          title="Account Settings"
          subtitle="Manage your account settings and preferences"
        />

        <div className="container mt-80 mb-150 lg-mt-60 lg-mb-100">
          <div className="row">
            <div className="col-12">
              <div className="settings-content">
                <h2>Account Settings</h2>
                <p>This page is under construction. You will be able to manage your account settings here soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default SettingsPage; 