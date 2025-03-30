'use client';
import React, { useEffect, useState } from "react";
import slugify from "slugify";

import NiceSelect from "@/ui/nice-select";

interface Job {
  location: string;
}

interface JobsResponse {
  jobs: Job[];
}

const JobLocationSelect = ({
  locationVal,
  setLocationVal,
}: {
  locationVal: string;
  setLocationVal: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs`, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json() as JobsResponse;
        
        // Extract unique locations from jobs
        const uniqueLocations = [...new Set(data.jobs.map(job => job.location))].filter(Boolean) as string[];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };

    fetchLocations();
  }, []);

  // location_option
  const location_option = locations.map((l) => {
    return {
      value: l.split(",").join("-").toLowerCase(),
      label: l,
    };
  });

  location_option.unshift({ value: "", label: "Location" });

  const handleLocation = (item: { value: string; label: string }) => {
    setLocationVal(item.value);
  };

  return (
    <NiceSelect
      options={location_option}
      defaultCurrent={0}
      onChange={(item) => handleLocation(item)}
      name="Location"
      placeholder="Location"
    />
  );
};

export default JobLocationSelect;
