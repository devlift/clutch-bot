import React from "react";
import Link from "next/link";
import ListItem from "./list-item";

interface Job {
  id: string;
  createdTime: string;
  employerId: string;
  title: string;
  description: string;
  tags: string[];
  wage: number;
  wageType: string;
  location: string;
  jobType: string;
  schedule: string;
  hours: string;
  startDate: string;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  howToApply: string;
  advertiseUntil: string;
  jobBankId: string;
  status: string;
  employer?: {
    id: string;
    companyName: string;
    logo: string;
    website: string;
    location: string;
    contactEmail: string;
    phone: string;
    industry: string;
  }
}

async function getJobs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch jobs');
    const data = await res.json();
    console.log('Jobs data from API:', JSON.stringify(data.jobs, null, 2));
    return data.jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

const processTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') return tags.split(',').map(tag => tag.trim());
  return [];
};

export async function JobListItems({style_2=false}:{style_2?:boolean}) {
  const jobs = await getJobs();
  console.log('Jobs in JobListItems:', JSON.stringify(jobs, null, 2));
  
  return (
    <>
      {jobs?.map((job: Job) => (
        <ListItem 
          key={job.id} 
          item={job}
          style_2={style_2} 
        />
      ))}
    </>
  )
}

const JobListOne = () => {
  return (
    <>
      <section className="job-listing-one mt-180 xl-mt-150 lg-mt-100">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6">
              <div className="title-one">
                <h2 className="text-dark wow fadeInUp" data-wow-delay="0.3s">New job listing</h2>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="d-flex justify-content-lg-end">
                <Link
                  href="/job-list-v1"
                  className="btn-six d-none d-lg-inline-block"
                >
                  Explore all jobs
                </Link>
              </div>
            </div>
          </div>

          <div className="job-listing-wrapper border-wrapper mt-80 lg-mt-40 wow fadeInUp">
            <JobListItems />
          </div>

          <div className="text-center mt-40 d-lg-none">
            <Link href="/job-list-v1" className="btn-six">
              Explore all jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default JobListOne;
