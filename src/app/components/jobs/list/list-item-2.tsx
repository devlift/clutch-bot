"use client";
import React from "react";
import Link from "next/link";
import { Job } from '@/types/job-data-type';
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { add_to_wishlist } from "@/redux/features/wishlist";
import CompanyLogo from "@/app/components/common/CompanyLogo";

interface ListItemTwoProps {
  item: Job;
}

const ListItemTwo = ({ item }: ListItemTwoProps) => {
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
            <Link href={`/jobs/${item.id}`} className="logo">
              <CompanyLogo 
                logo={item.employer?.logo} 
                company={item.employer?.name || 'Company'} 
                size={50}
              />
            </Link>
            <div className="info">
              <Link href={`/jobs/${item.id}`} className="title fw-500 tran3s">
                {item.title}
              </Link>
              <div className="company-name">{item.employer?.name}</div>
              <div className="d-flex align-items-center meta-info">
                <span className="job-type tran3s me-1">{item.jobType}</span>
                <span className="location">{item.location}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-4">
          <div className="job-salary">
            <span className="fw-500 text-dark">${item.wage}</span> /{item.wageType}
          </div>
        </div>
        <div className="col-md-3 col-sm-4 d-flex justify-content-md-end">
          <Link href={`/jobs/${item.id}`} className="apply-btn text-center tran3s">
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListItemTwo;
