import React from 'react';
import { IJobType } from '@/types/job-data-type';
import CompanyLogo from '@/app/components/common/CompanyLogo';

interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  date: string;
  duration: string;
  salary: number;
  salary_duration: string;
  experience: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  howToApply: string;
}

const JobDetailsV1Area = ({job}: {job: Job}) => {
  // Safe parsing function with string cleanup
  const safeParseArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        // Clean up the string - remove escaped quotes and normalize
        const cleanString = data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        const parsed = JSON.parse(cleanString);
        
        // If parsed result is an object with specific properties, extract the values
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          // Handle cases like {"financial_benefits": [...], "other_benefits": [...]}
          return Object.values(parsed).flat().filter(item => typeof item === 'string');
        }
        
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse JSON string:', e);
        // If parsing fails, try to clean up the string and use it directly
        if (typeof data === 'string') {
          return [data.replace(/\\"/g, '"').replace(/\\\\/g, '\\')];
        }
        return [];
      }
    }
    return [];
  };

  // Parse JSON strings if needed
  const requirements = safeParseArray(job.requirements);
  const responsibilities = safeParseArray(job.responsibilities);
  const benefits = safeParseArray(job.benefits);

  // Clean up description if it's a JSON string
  const description = typeof job.description === 'string' 
    ? job.description.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    : job.description;

  return (
    <section className="job-details pt-100 lg-pt-80 pb-130 lg-pb-80">
      <div className="container">
        <div className="row">
          <div className="col-xxl-9 col-xl-8">
            <div className="details-post-data me-xxl-5 pe-xxl-4">
              <div className="post-date">{job.date} by <a href="#" className="fw-500 text-dark">{job.company}</a></div>
              <h3 className="post-title">{job.title}</h3>

              <div className="post-block border-style mt-50 lg-mt-30">
                <div className="d-flex align-items-center">
                  <div className="block-numb text-center fw-500 text-white rounded-circle me-2">1</div>
                  <h4 className="block-title">Overview</h4>
                </div>
                <p>{description || 'No description available for this position. Please refer to the requirements and responsibilities sections below for more information about this role.'}</p>
              </div>

              <div className="post-block border-style mt-40 lg-mt-30">
                <div className="d-flex align-items-center">
                  <div className="block-numb text-center fw-500 text-white rounded-circle me-2">2</div>
                  <h4 className="block-title">Requirements</h4>
                </div>
                <ul className="list-type-one style-none mb-15">
                  {requirements.length > 0 ? (
                    requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))
                  ) : (
                    <li>No specific requirements listed.</li>
                  )}
                </ul>
              </div>

              <div className="post-block border-style mt-40 lg-mt-30">
                <div className="d-flex align-items-center">
                  <div className="block-numb text-center fw-500 text-white rounded-circle me-2">3</div>
                  <h4 className="block-title">Responsibilities</h4>
                </div>
                <ul className="list-type-one style-none mb-15">
                  {responsibilities.length > 0 ? (
                    responsibilities.map((resp: string, index: number) => (
                      <li key={index}>{resp}</li>
                    ))
                  ) : (
                    <li>No specific responsibilities listed.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-xl-4">
            <div className="job-company-info ms-xl-5 ms-xxl-0 lg-mt-50">
              <div className="d-flex justify-content-center">
                <CompanyLogo 
                  logo={typeof job.logo === 'string' ? job.logo : null} 
                  company={job.company}
                  size={60}
                  className="lazy-img m-auto logo"
                />
              </div>
              <div className="text-md text-dark text-center mt-15 mb-20 text-capitalize">{job.company}</div>
              {job.website && (
                <a href={job.website} className="website-btn tran3s" target="_blank" rel="noopener noreferrer">
                  Visit website
                </a>
              )}

              <div className="border-top mt-40 pt-40">
                <ul className="job-meta-data row style-none">
                  {job.salary > 0 && (
                    <li className="col-xl-7 col-md-4 col-sm-6">
                      <span>Salary</span>
                      <div>${job.salary}/{job.salary_duration}</div>
                    </li>
                  )}
                  {job.location && (
                    <li className="col-xl-7 col-md-4 col-sm-6">
                      <span>Location</span>
                      <div>{job.location}</div>
                    </li>
                  )}
                  {job.website && (
                    <li className="col-xl-7 col-md-4 col-sm-6">
                      <span>Website</span>
                      <div><a href={job.website} target="_blank" rel="noopener noreferrer">{job.website}</a></div>
                    </li>
                  )}
                  {job.phone && (
                    <li className="col-xl-7 col-md-4 col-sm-6">
                      <span>Phone</span>
                      <div><a href={`tel:${job.phone}`}>{job.phone}</a></div>
                    </li>
                  )}
                </ul>
              </div>
              {job.howToApply && (
                <a href={`mailto:${job.email}`} className="btn-ten fw-500 text-white w-100 text-center tran3s mt-25">
                  Apply Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobDetailsV1Area;