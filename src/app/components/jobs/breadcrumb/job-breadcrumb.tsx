"use client";
import React from "react";
import Image from "next/image";
import shape_1 from "@/assets/images/shape/shape_02.svg";
import shape_2 from "@/assets/images/shape/shape_03.svg";
import SearchForm from "../../forms/search-form";

const JobBreadcrumb = () => {
  return (
    <div className="inner-banner-one position-relative" style={{ backgroundColor: '#1B6392' }}>
      <div className="container">
        <div className="position-relative py-5">
    
          <div className="row">
            <div className="col-xxl-8 col-xl-9 col-lg-10 m-auto">
              <form onSubmit={(e) => e.preventDefault()}>
                <SearchForm />
              </form>
            </div>
          </div>
        </div>
      </div>
      <Image src={shape_1} alt="shape" className="lazy-img shapes shape_01" />
      <Image src={shape_2} alt="shape" className="lazy-img shapes shape_02" />
    </div>
  );
};

export default JobBreadcrumb;

