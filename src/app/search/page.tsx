import React from "react";
import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/headers/header";
import FooterOne from "@/layouts/footers/footer-one";
import JobBreadcrumb from "../components/jobs/breadcrumb/job-breadcrumb";
import JobPortalIntro from "../components/job-portal-intro/job-portal-intro";
import SearchItemsCom from "../components/search-area/search-items";

export const metadata: Metadata = {
  title: "Search Page",
};

const SearchPage = () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">


        {/* search breadcrumb start */}
        <JobBreadcrumb />
        {/* search breadcrumb end */}

        {/* SearchItems start */}
        <SearchItemsCom />
        {/* SearchItems end */}

    
      </div>
    </Wrapper>
  );
};

export default SearchPage;
