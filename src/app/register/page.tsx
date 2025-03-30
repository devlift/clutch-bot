import React from "react";
import { Metadata } from "next";
import Header from "@/layouts/headers/header";
import Wrapper from "@/layouts/wrapper";
import CompanyBreadcrumb from "../components/common/common-breadcrumb";
import FooterOne from "@/layouts/footers/footer-one";
import RegisterArea from "../components/register/register-area";

export const metadata: Metadata = {
  title: "Register",
};

const RegisterPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
    

        {/*breadcrumb start */}
        <CompanyBreadcrumb
          title="Register"
          subtitle="Create an account & Start posting or hiring talents"
        />
        {/*breadcrumb end */}

        {/* register area start */}
        <RegisterArea/>
        {/* register area end */}

      
      </div>
    </Wrapper>
  );
};

export default RegisterPage;
