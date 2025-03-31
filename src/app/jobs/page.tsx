import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/layouts/wrapper';
import JobBreadcrumb from '../components/jobs/breadcrumb/job-breadcrumb';
import JobPortalIntro from '../components/job-portal-intro/job-portal-intro';
import JobListItem from '../components/jobs/list/job-list-item';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Job } from '@/types/job-data-type';

export const metadata: Metadata = {
  title: "Jobs",
};

const JobsPage = async () => {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: jobs, error } = await supabase
    .from('Job')
    .select(`
      *,
      employer:Employer(*)
    `);

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }

  const typedJobs = (jobs || []) as Job[];

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
                <div className="job-listing-wrapper mt-30 wow fadeInUp">
                  {typedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {typedJobs.map((job: Job) => (
                        <JobListItem key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <h3 className="mb-4">No jobs found</h3>
                      <p className="text-muted">
                        There are currently no job listings available.
                      </p>
                    </div>
                  )}
                </div>
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