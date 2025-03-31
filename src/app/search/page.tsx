import React from 'react';
import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import JobListItem from '@/app/components/jobs/list/job-list-item';
import { Job } from '@/types/job-data-type';
import JobBreadcrumb from '@/app/components/jobs/breadcrumb/job-breadcrumb';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: "Search Jobs - Clutch Jobs",
  description: "Search through thousands of jobs using our AI-powered search engine",
};

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const headersList = headers();
  const cookieStore = cookies();

  try {
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const searchParamsQ = searchParams.q;
    const searchQuery = typeof searchParamsQ === 'string' ? searchParamsQ : '';

    // Fetch jobs with search
    let query = supabase
      .from('Job')
      .select(`
        *,
        employer:Employer(*)
      `);

    if (searchQuery) {
      query = query.textSearch('fts', searchQuery, {
        type: 'websearch',
        config: 'english'
      });
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    const typedJobs = (jobs || []) as Job[];

    return (
      <Wrapper>
        <div className="main-page-wrapper">
          <JobBreadcrumb />
          <div className="job-list-one position-relative pt-110 lg-pt-80 pb-130 lg-pb-80">
            <div className="container">
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <div className="job-list-one-content ms-xxl-5 ms-xl-4">
                    <div className="row justify-content-between align-items-center">
                      <div className="col-lg-6">
                        <div className="title-one">
                          <h2 className="main-font color-blue wow fadeInUp" data-wow-delay="0.3s">
                            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Jobs'}
                          </h2>
                          <p className="text-md mt-12">
                            {typedJobs.length} {typedJobs.length === 1 ? 'job' : 'jobs'} found
                          </p>
                        </div>
                      </div>
                    </div>
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
                          {searchQuery && (
                            <p className="text-muted">
                              Try adjusting your search terms or browse all available positions.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  } catch (error) {
    console.error('Error in SearchPage:', error);
    return (
      <Wrapper>
        <div className="main-page-wrapper">
          <JobBreadcrumb />
          <section className="job-listing-one mt-50 lg-mt-30">
            <div className="container">
              <div className="text-center py-5">
                <h3 className="mb-4">Error loading jobs</h3>
                <p className="text-muted">
                  There was an error loading the job listings. Please try again later.
                </p>
              </div>
            </div>
          </section>
        </div>
      </Wrapper>
    );
  }
}
