import React from "react";
import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";

import HeroBannerSix from "@/app/components/hero-banners/hero-banner-six";

import CategorySectionSix from "@/app/components/category/category-section-6";
import { TrendingJobs } from "@/app/components/category/category-section-3";
import { JobListItems } from "@/app/components/jobs/list/job-list-one";
import FancyBannerThree from "@/app/components/fancy-banner/fancy-banner-3";

import FeatureTwo from "@/app/components/features/feature-two";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Clutch Jobs – AI-Powered Job Search & Hiring Platform",
  description: "Discover Clutch Jobs, an AI-driven platform that connects top talent with leading employers. Enjoy personalized job matches, streamlined hiring, and a smarter recruitment process.",
};

const HomeSix = async () => {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        {/* hero banner start */}
        <HeroBannerSix />
        {/* hero banner end */}

        {/* category section start */}
        {/* <CategorySectionSix style_2={true} /> */}
        {/* category section end */}

        {/* trending jobs start */}
        {/* <section className="category-section-three pt-140 lg-pt-100">
          <div className="container">
            <div className="position-relative">
              <div className="title-one mb-60 lg-mb-40">
                <h2 className="main-font color-blue wow fadeInUp" data-wow-delay="0.3s">Trending Jobs</h2>
              </div>
              <TrendingJobs />
            </div>
          </div>
        </section> */}
        {/* trending jobs end */}

        {/* job list items start */}
        <section className="job-listing-one mt-160 lg-mt-100 sm-mt-80">
          <div className="container">
            <div className="row justify-content-between align-items-center">
              <div className="col-lg-6">
                <div className="title-one">
                  <h2 className="main-font color-blue wow fadeInUp" data-wow-delay="0.3s">New job listings</h2>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="d-flex justify-content-lg-end">
                  <Link href="/job-list-v1" className="btn-six d-none d-lg-inline-block">Explore all jobs
                  </Link>
                </div>
              </div>
            </div>
            <div className="job-listing-wrapper mt-60 md-mt-40 wow fadeInUp">
              {/* @ts-expect-error Async Server Component */}
              <JobListItems style_2={true} />
            </div>
            <div className="text-center mt-40 d-lg-none">
              <Link href="/job-list-v1" className="btn-six">Explore all jobs</Link>
            </div>
          </div>
        </section>
        {/* job list items end */}

        {/* fancy banner start */}
        <FancyBannerThree style_2={true} />
        {/* fancy banner end */}

        {/* text feature two start */}
        <FeatureTwo />
        {/* text feature two end */}
      </div>
    </Wrapper>
  );
};

export default HomeSix;
