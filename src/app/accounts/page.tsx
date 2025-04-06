"use client";
import React from "react";
import Wrapper from "@/layouts/wrapper";
import CompanyBreadcrumb from "../components/common/common-breadcrumb";

const AccountsPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <CompanyBreadcrumb
          title="Select Account"
          subtitle="Switch between different accounts or user roles"
        />

        <div className="container mt-80 mb-150 lg-mt-60 lg-mb-100">
          <div className="row">
            <div className="col-12">
              <div className="accounts-content">
                <h2>Select Account</h2>
                <p>This page is under construction. You will be able to manage and switch between your accounts here soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default AccountsPage; 