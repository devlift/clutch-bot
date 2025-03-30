'use client'
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

const ListItem = ({ item, style_2, cls='' }: { item: Job; style_2?: boolean; cls?: string }) => {
  const { id, employer, createdTime, jobType, location, title } = item;
  const {wishlist} = useAppSelector(state => state.wishlist);
  const isActive = wishlist.some(p => p.id === id);
  const dispatch = useAppDispatch();

  // handle add wishlist
  const handleAddWishlist = (item: Job) => {
    dispatch(add_to_wishlist(item));
  };

  return (
    <div className={`job-list-one position-relative ${cls} ${style_2?'border-style mb-20':'bottom-border'}`}>
      <div className="row justify-content-between align-items-center">
        <div className="col-xxl-3 col-lg-4">
          <div className="job-title d-flex align-items-center">
            <Link href={`/jobs/${id}`} className="logo">
              <CompanyLogo 
                logo={employer?.logo || '/images/logo/default-company.png'} 
                company={employer?.companyName || 'Unknown Company'}
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
            <Link href={`/jobs/${id}`}>{employer?.companyName || 'Unknown Company'}</Link>
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
        <div className="col-lg-2 col-md-4 col-sm-6">
          <div className="btn-group d-flex align-items-center justify-content-md-end">
            {/* Bookmark button hidden for now
            <button
              onClick={() => handleAddWishlist(item)}
              className={`save-btn text-center rounded-circle tran3s ms-3 ${
                isActive ? "active" : ""
              }`}
              title={`${isActive ? "Remove Job" : "Save Job"}`}
            >
              <i className="bi bi-bookmark-dash"></i>
            </button>
            */}
            <Link href={`/jobs/${id}`} className="apply-btn text-center tran3s">
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
