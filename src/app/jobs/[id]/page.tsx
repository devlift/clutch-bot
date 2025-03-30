import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/layouts/wrapper';
import JobPortalIntro from '@/app/components/job-portal-intro/job-portal-intro';
import JobDetailsBreadcrumb from '@/app/components/jobs/breadcrumb/job-details-breadcrumb';
import JobDetailsV1Area from '@/app/components/job-details/job-details-v1-area';
import job_data from '@/data/job-data';
import RelatedJobs from '@/app/components/jobs/related-jobs';



export const metadata: Metadata = {
  title: "Job Details v1",
};

const JobDetailsV1Page = () => {
  const job = job_data[0]
  return (
    <Wrapper>

        {/* job details breadcrumb start */}
        <JobDetailsBreadcrumb/>
        {/* job details breadcrumb end */}

        {/* job details area start */}
        <JobDetailsV1Area job={job}/>
        {/* job details area end */}

        {/* related job start */}
        <RelatedJobs category={job.category}/>
        {/* related job end */}

        {/* job portal intro start */}
        <JobPortalIntro  />
        {/* job portal intro end */}

    </Wrapper>
  );
};

export default JobDetailsV1Page;