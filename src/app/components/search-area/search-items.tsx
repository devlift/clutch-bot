"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import slugify from "slugify";
import ListItemTwo from "../jobs/list/list-item-2";
import JobGridItem from "../jobs/grid/job-grid-item";
import { IJobType } from "@/types/job-data-type";
import job_data from "@/data/job-data";

const SearchItems = () => {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<IJobType[]>(job_data);
  const [jobType, setJobType] = useState<string>("list");
  const location = searchParams.get("location");
  const search = searchParams.get("search");
  const company = searchParams.get("company");
  
  const locationMatch = (item:IJobType) => {
    return slugify(item.location.split(",").join("-").toLowerCase(), "-") ===
    location;
  }
  const companyMatch = (item:IJobType) => {
    return slugify(item.company.split(",").join("-").toLowerCase(), "-") ===
    company;
  }
  const titleMatch = (item:IJobType) => {
    if(search){
      return item.title.toLowerCase().includes(search.toLowerCase());
    }
    return false;
  }

  useEffect(() => {
    // location && company && search all are match
    if (location && company && search) {
      setJobs(
        job_data.filter((j: IJobType) => {
          const matchLocation = locationMatch(j);
          const matchCompany = companyMatch(j);
          const matchTile = titleMatch(j);
          return matchLocation && matchCompany && matchTile;
        })
      );
    }
    // location && company all are match
    if (location && company) {
      setJobs(
        job_data.filter((j: IJobType) => {
          const matchLocation = locationMatch(j);
          const matchCompany = companyMatch(j);
          return matchLocation && matchCompany;
        })
      );
    }
    // location && search all are match
    if (location && search) {
      setJobs(
        job_data.filter((j: IJobType) => {
          const matchLocation = locationMatch(j);
          const matchTile = titleMatch(j);
          return matchLocation && matchTile;
        })
      );
    }
    if (location) {
      setJobs(
        job_data.filter((j: IJobType) => {
          const matchLocation = locationMatch(j);
          return matchLocation;
        })
      );
    }
    if (search) {
      setJobs(
        job_data.filter((j: IJobType) => {
          const matchTile = titleMatch(j);
          return matchTile;
        })
      );
    }
    if (company) {
      setJobs(
        job_data.filter((j: IJobType) => {
          const matchCompany = companyMatch(j);
          return matchCompany;
        })
      );
    }
  }, [company, location, search]);

  return (
    <section className="job-listing-three pt-110 lg-pt-80 pb-160 xl-pb-150 lg-pb-80">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="filter-area-tab">
              <div className="light-bg border-20 ps-4 pe-4">
                <a className="filter-header border-20 d-block search" href="#">
                  <span className="main-title fw-500 text-dark">
                   {jobs.length === 0 ? 'No Products Found' : 'Search Products'} 
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchItems;
