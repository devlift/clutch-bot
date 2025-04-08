import React from "react";
import Image, { StaticImageData } from "next/image";
// internal
import logo from "@/assets/images/logo/logo_02.jpg";
import calendar from "@/assets/images/icon/linkedin.png";
import facebook from "@/assets/images/icon/calendar.png";
import glassdoor from "@/assets/images/icon/glassdoor.png";
import google from "@/assets/images/icon/google.png";
import zoom from "@/assets/images/icon/zoom.png";
import shape from "@/assets/images/shape/shape_10.svg";
import Link from "next/link";

// brand icon
function BrandIcon({ img, id, size = 60 }: { img: StaticImageData; id: string; size?: number }) {
  return (
    <div
      className={`brand-icon icon_${id} rounded-circle d-flex align-items-center justify-content-center`}
      style={{ width: `${size}px`, height: `${size}px`, overflow: 'hidden' }}
    >
      <Image 
        src={img} 
        alt="" 
        className="lazy-img"
        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
      />
    </div>
  );
}

const FeatureTwo = () => {
  return (
    <section className="text-feature-two position-relative pt-180 xl-pt-150 lg-pt-100 pb-180 xl-pb-150 lg-pb-120">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 order-lg-last">
            <div className="wow fadeInRight">
              <div className="title-one">
                <div className="sub-title">AI POWERED</div>
                <h2>Let our intelligent AI handle the heavy lifting.</h2>
              </div>
              <p className="text-lg mt-40 lg-mt-20 mb-40 lg-mb-30">
                Our cutting-edge engine works behind the scenes to automate candidate matching, skill development, and application tracking—so you can focus on success.
              </p>
              <Link href="/register"
                className="btn-five rounded-pill tran3s d-inline-flex align-items-center px-4 py-2"
              >
                <span className="fw-500 me-2">Discover How</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
          <div className="col-lg-7 order-lg-first">
            <div className="big-circle rounded-circle position-relative d-flex align-items-center justify-content-center ms-lg-5 wow fadeInLeft">
              <div className="inner-circle rounded-circle d-flex align-items-center justify-content-center">
                <Image src={logo} alt="logo" width={100} className="lazy-img" />
              </div>
              {/*  /.inner-circle  */}
              <BrandIcon id="01" img={calendar} size={75} />
              <BrandIcon id="02" img={facebook} size={65} />
              <BrandIcon id="03" img={glassdoor} size={70} />
              <BrandIcon id="04" img={google} size={60} />
              <BrandIcon id="05" img={zoom} size={90} />
              <Image
                src={shape}
                alt="shape"
                className="lazy-img shapes shape_01"
              />
            </div>
            {/*  /.big-circle  */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureTwo;
