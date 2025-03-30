import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/layouts/wrapper';
import JobBreadcrumb from '../components/jobs/breadcrumb/job-breadcrumb';
import JobPortalIntro from '../components/job-portal-intro/job-portal-intro';
import JobListV2Area from '../components/jobs/list/job-list-v2-area';


export const metadata: Metadata = {
  title: "Job Grid v2",
};

const JobGridTwoPage = () => {
  return (
    <Wrapper>

        {/* search breadcrumb start */}
        <JobBreadcrumb />
        {/* search breadcrumb end */}

        {/* job list three start */}
        <JobListV2Area itemsPerPage={8} grid_style={true} />
        {/* job list three end */}

        {/* job portal intro start */}
        <JobPortalIntro top_border={true} />
        {/* job portal intro end */}
 
    </Wrapper>
  );
};

export default JobGridTwoPage;