"use client";
import React, { useState, useEffect } from "react";

import ListItemTwo from "./list-item-2";
import { IJobType } from "@/types/job-data-type";
import Pagination from "@/ui/pagination";
import JobGridItem from "../grid/job-grid-item";
import { useAppSelector } from "@/redux/hook";
import slugify from "slugify";
import NiceSelect from "@/ui/nice-select";
import FilterAreaTwo from "../filter/job-filter-2/filter-area-2";

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

const JobListV2Area = ({ itemsPerPage,grid_style=false }: { itemsPerPage: number;grid_style?:boolean }) => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const maxPrice = allJobs.reduce((max, job) => {
    return (job.wage || 0) > max ? (job.wage || 0) : max;
  }, 0);
  const { category, experience, job_type, location,english_fluency,search_key } = useAppSelector(
    (state) => state.filter
  );
  const [currentItems, setCurrentItems] = useState<Job[] | null>(null);
  const [filterItems, setFilterItems] = useState<Job[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [jobType, setJobType] = useState(grid_style ?"grid" : "list");
  const [priceValue, setPriceValue] = useState([0, maxPrice]);
  const [shortValue, setShortValue] = useState("");

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs`, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setAllJobs(data.jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setAllJobs([]);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Filter the jobs array based on the selected filters
    let filteredData = allJobs
      .filter((item) => !search_key || item.title.toLowerCase().includes(search_key.toLowerCase()))
      .filter((item) => !job_type || item.jobType === job_type)
      .filter((item) => !location || slugify(item.location.split(',')[0].toLowerCase(), '-') === location)
      .filter((item) => !priceValue || (item.wage >= priceValue[0] && item.wage <= priceValue[1]));

    if (shortValue === "price-low-to-high") {
      filteredData = [...filteredData].sort((a, b) => (a.wage || 0) - (b.wage || 0));
    }

    if (shortValue === "price-high-to-low") {
      filteredData = [...filteredData].sort((a, b) => (b.wage || 0) - (a.wage || 0));
    }

    const endOffset = itemOffset + itemsPerPage;
    setFilterItems(filteredData);
    setCurrentItems(filteredData.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredData.length / itemsPerPage));
  }, [
    itemOffset,
    itemsPerPage,
    category,
    experience,
    job_type,
    location,
    english_fluency,
    allJobs,
    priceValue,
    shortValue,
    search_key
  ]);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % allJobs.length;
    setItemOffset(newOffset);
  };
  // handleShort
  const handleShort = (item: { value: string; label: string }) => {
    setShortValue(item.value);
  };
  return (
    <>
      <section className="job-listing-three pt-110 lg-pt-80 pb-160 xl-pb-150 lg-pb-80">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <FilterAreaTwo
                maxPrice={maxPrice}
                priceValue={priceValue}
                setPriceValue={setPriceValue}
              />
            </div>

            <div className="col-12">
              <div className="job-post-item-wrapper">
                <div className="upper-filter d-flex justify-content-between align-items-center mb-25 mt-70 lg-mt-40">
                  <div className="total-job-found">
                    All <span className="text-dark">{allJobs.length}</span>{" "}
                    jobs found
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="short-filter d-flex align-items-center">
                      <div className="text-dark fw-500 me-2">Short:</div>
                      <NiceSelect
                        options={[
                          { value: "", label: "Price Short" },
                          { value: "price-low-to-high", label: "low to high" },
                          { value: "price-high-to-low", label: "High to low" },
                        ]}
                        defaultCurrent={0}
                        onChange={(item) => handleShort(item)}
                        name="Price Short"
                      />
                    </div>
                    <button
                      onClick={() => setJobType("list")}
                      className={`style-changer-btn text-center rounded-circle tran3s ms-2 list-btn 
                       ${jobType === "grid" ? "active" : ""}`}
                      title="Active List"
                    >
                      <i className="bi bi-list"></i>
                    </button>
                    <button
                      onClick={() => setJobType("grid")}
                      className={`style-changer-btn text-center rounded-circle tran3s ms-2 grid-btn 
                      ${jobType === "list" ? "active" : ""}`}
                      title="Active Grid"
                    >
                      <i className="bi bi-grid"></i>
                    </button>
                  </div>
                </div>

                <div
                  className={`accordion-box list-style ${jobType === "list" ? "show" : ""}`}
                >
                  {currentItems &&
                    currentItems.map((job) => (
                      <ListItemTwo key={job.id} item={job} />
                    ))}
                </div>

                <div
                  className={`accordion-box grid-style ${jobType === "grid" ? "show" : ""}`}
                >
                  <div className="row">
                    {currentItems &&
                      currentItems.map((job) => (
                        <div key={job.id} className="col-sm-6 mb-30">
                          <JobGridItem item={job} />
                        </div>
                      ))}
                  </div>
                </div>
                {/* <!-- /.accordion-box --> */}

                {currentItems && (
                  <div className="pt-30 lg-pt-20 d-sm-flex align-items-center justify-content-between">
                    <p className="m0 order-sm-last text-center text-sm-start xs-pb-20">
                      Showing{" "}
                      <span className="text-dark fw-500">{itemOffset + 1}</span>{" "}
                      to{" "}
                      <span className="text-dark fw-500">
                        {Math.min(
                          itemOffset + itemsPerPage,
                          filterItems.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="text-dark fw-500">
                        {filterItems.length}
                      </span>
                    </p>
                    {filterItems.length > itemsPerPage && (
                      <Pagination
                        pageCount={pageCount}
                        handlePageClick={handlePageClick}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default JobListV2Area;
