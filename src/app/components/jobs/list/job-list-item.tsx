'use client'
import React from "react";
import Link from "next/link";
import { Job } from '@/types/job-data-type';
import CompanyLogo from "@/app/components/common/CompanyLogo";

const JobListItem = ({ job }: { job: Job }) => {
  const { id, employer, createdTime, jobType, location, title } = job;

  return (
    <div className="job-list-one position-relative border-style mb-20">
      <div className="row justify-content-between align-items-center">
        <div className="col-xxl-3 col-lg-4">
          <div className="job-title d-flex align-items-center">
            <Link href={`/jobs/${id}`} className="logo">
              <CompanyLogo 
                logo={employer?.logo || '/images/logo/default-company.png'} 
                company={employer?.name || 'Unknown Company'}
                className="lazy-img m-auto"
              />
            </Link>
            <Link href={`/jobs/${id}`} className="title fw-500 tran3s">
              {title}
            </Link>
          </div>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 ms-auto">
          <Link href={`/jobs/${id}`}
            className={`job-duration fw-500 ${jobType === "Part time" ? "part-time" : ""}`}
          >
            {jobType || 'Full time'}
          </Link>
          <div className="job-date">
            {new Date(createdTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} by{' '}
            <Link href={`/jobs/${id}`}>{employer?.name || 'Unknown Company'}</Link>
          </div>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6">
          <div className="job-location">
            <Link href={`/jobs/${id}`}>
              <i className="bi bi-geo-alt"></i>{' '}
              {location === 'Remote' ? 'Remote' : location?.split(',')[0] || 'Not Available'}
            </Link>
          </div>
        </div>
        <div className="col-lg-1">
          <div className="btn-group">
            <Link href={`/jobs/${id}`} className="apply-btn text-center tran3s">
              DETAILS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListItem; 