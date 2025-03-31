"use client"
import React from 'react';
import banner_1 from '@/assets/images/assets/banner.png';
import banner_2 from '@/assets/images/assets/banner_img_02.jpg';
import useSearchFormSubmit from '@/hooks/use-search-form-submit';
import JobCategorySelect from '../select/job-category';
import CounterOne from '../counter/counter-one';
import ScrollIndicator from '../common/scroll-indicator';


const HeroBannerSix = () => {
  const { handleSubmit, setSearchText } = useSearchFormSubmit();
  // handleSearchInput
  const handleSearchInput = (e:React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }
  return (
    <div className="hero-banner-six position-relative d-flex align-items-center min-vh-100">
      <div className="container">
        <div className="position-relative">
          <div className="row">
            <div className="col-xxl-8 col-xl-9 col-lg-8 m-auto text-center">
              <h2 className="wow text-white  fadeInUp" data-wow-delay="0.3s">Empowering Your Next Career Move.</h2>
              <p className=" text-white mt-25 mb-55 lg-mb-40 wow fadeInUp" data-wow-delay="0.4s">Discover the future of hiring. Clutch Jobs' AI guides every step, connecting top talent with visionary employers. Your dream job or perfect candidate is just a click away.</p>
            </div>
          </div>
          <div className="position-relative">
            <div className="row">
              <div className="col-xl-8 col-lg-9 m-auto">
                <div className="job-search-one style-two position-relative me-xxl-3 ms-xxl-3 mb-100 lg-mb-50 wow fadeInUp" data-wow-delay="0.5s">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-9">
                        <div className="input-box w-100">
                          <div className="label">Your job title, keyword and location</div>
                          <input 
                            onChange={handleSearchInput} 
                            type="text" 
                            placeholder="Construction Jobs in Toronto" 
                            className="keyword w-100" 
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <button className="fw-500 text-uppercase h-100 w-100 tran3s search-btn-two">Search</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* <div className="row">
              <div className="col-xl-8 m-auto">
                <div className="row">
                  <CounterOne style_2={true}/>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div id="banner-six-carousel" className="carousel slide pointer-event" data-bs-ride="carousel">
        <div className="carousel-inner w-100 h-100">
          <div className="carousel-item active" style={{ backgroundImage: `url(${banner_1.src})` }}>
          </div>
          {/* <div className="carousel-item" style={{ backgroundImage: `url(${banner_2.src})` }}>
          </div> */}
        </div>
      </div>
      <ScrollIndicator />
    </div>
  );
};

export default HeroBannerSix;