import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/layouts/wrapper';
import JobBreadcrumb from '../components/jobs/breadcrumb/job-breadcrumb';
import JobPortalIntro from '../components/job-portal-intro/job-portal-intro';
import { JobListItems } from '../components/jobs/list/job-list-one';

export const metadata: Metadata = {
  title: "Jobs",
};

const JobsPage = () => {
  return (
    <Wrapper>
      {/* search breadcrumb start */}
      <JobBreadcrumb />
      {/* search breadcrumb end */}

      {/* job list start */}
      <div className="job-list-one position-relative pt-110 lg-pt-80 pb-130 lg-pb-80">
        <div className="container">
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="job-list-one-content ms-xxl-5 ms-xl-4">
                <JobListItems />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* job list end */}

      {/* job portal intro start */}
      <JobPortalIntro top_border={true} />
      {/* job portal intro end */}
    </Wrapper>
  );
};

export default JobsPage;