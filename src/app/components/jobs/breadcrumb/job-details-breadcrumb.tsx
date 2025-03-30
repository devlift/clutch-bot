import React from "react";
import Image from "next/image";
import shape_1 from "@/assets/images/shape/shape_02.svg";
import shape_2 from "@/assets/images/shape/shape_03.svg";

const JobDetailsBreadcrumb = ({ 
  title, 
  company, 
  date 
}: { 
  title: string;
  company: string;
  date: string;
}) => {
  return (
    <div className="inner-banner-one position-relative">
      <div className="container">
        <div className="position-relative">
          <div className="row">
            <div className="col-xl-8 col-lg-9 m-auto text-center">
              <h1 className="text-white">{title}</h1>
              <p className="text-white mt-20">{date} by <span className="text-white">{company}</span></p>
            </div>
          </div>
        </div>
      </div>
      <Image src={shape_1} alt="shape" className="lazy-img shapes shape_01" />
      <Image src={shape_2} alt="shape" className="lazy-img shapes shape_02" />
    </div>
  );
};

export default JobDetailsBreadcrumb;
