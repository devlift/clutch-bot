import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/layouts/wrapper';
import JobPortalIntro from '@/app/components/job-portal-intro/job-portal-intro';
import JobDetailsBreadcrumb from '@/app/components/jobs/breadcrumb/job-details-breadcrumb';
import JobDetailsV1Area from '@/app/components/job-details/job-details-v1-area';
import RelatedJobs from '@/app/components/jobs/related-jobs';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: "Job Details",
};

async function getJob(id: string) {
  const { data: job, error } = await supabase
    .from('Job')
    .select(`
      *,
      employer:Employer(
        companyName,
        logo,
        location,
        industry,
        website,
        contactEmail,
        phone
      )
    `)
    .eq('id', id)
    .single();

  if (error || !job) {
    return null;
  }

  return {
    id: job.id,
    title: job.title,
    company: job.employer?.companyName || 'Unknown Company',
    logo: job.employer?.logo || '/assets/images/logo/logo_02.jpg',
    location: job.location,
    date: new Date(job.createdTime).toLocaleDateString(),
    duration: job.jobType || 'Full time',
    salary: job.wage || 0,
    salary_duration: job.wageType || 'per year',
    experience: job.requirements || 'Not specified',
    description: job.description || '',
    english_fluency: 'Not specified',
    website: job.employer?.website,
    email: job.employer?.contactEmail,
    phone: job.employer?.phone,
    benefits: job.benefits || [],
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    howToApply: job.howToApply || 'Contact via email',
  };
}

export default async function JobDetailsV1Page({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  return (
    <Wrapper>
      {/* job details breadcrumb start */}
      <JobDetailsBreadcrumb 
        title={job.title}
        company={job.company}
        date={job.date}
      />
      {/* job details breadcrumb end */}

      {/* job details area start */}
      <JobDetailsV1Area job={job}/>
      {/* job details area end */}

      {/* job portal intro start */}
      <JobPortalIntro />
      {/* job portal intro end */}
    </Wrapper>
  );
}