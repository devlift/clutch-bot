"use client";
import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { add_to_wishlist } from "@/redux/features/wishlist";
import CompanyLogo from "@/app/components/common/CompanyLogo";

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

const ListItemTwo = ({ item }: { item: Job }) => {
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const dispatch = useAppDispatch();
  const isActive = wishlist.some((job) => job.id === item.id);

  const handleAddToWishlist = () => {
    dispatch(add_to_wishlist(item));
  };

  return (
    <div className="job-list-two position-relative border-style mb-20">
      <div className="row justify-content-between align-items-center">
        <div className="col-md-6">
          <div className="job-title d-flex align-items-center">
            <CompanyLogo 
              logo={item.employer?.logo} 
              company={item.employer?.companyName || 'Company'} 
              size={50}
            />
            <div className="ps-3 pt-2">
              <h4 className="mb-5">
                <Link href={`/jobs/${item.id}`} className="tran3s">
                  {item.title}
                </Link>
              </h4>
              <div className="meta">
                <span>{item.employer?.companyName || 'Company'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="job-info ps-xl-5 md-mt-20">
            <div className="job-meta d-flex align-items-center">
              <span className="job-location me-2">{item.location}</span>
              <span className="job-time">{item.jobType}</span>
            </div>
            <div className="job-salary">
              <span className="me-3">${item.wage}/{item.wageType}</span>
              <button
                onClick={handleAddToWishlist}
                className={`save-btn text-center rounded-circle tran3s ${
                  isActive ? "active" : ""
                }`}
                title={isActive ? "Remove Job" : "Save Job"}
              >
                <i className="bi bi-bookmark-dash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItemTwo;
