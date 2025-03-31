'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ListItemTwo from '../components/jobs/list/list-item-2';
import { Job } from '@/types/job-data-type';

interface SearchResultsProps {
  searchQuery: string;
}

export default function SearchResults({ searchQuery }: SearchResultsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        let query = supabase
          .from('jobs')
          .select('*, employer(*)');

        if (searchQuery) {
          // Use Supabase Full Text Search
          query = query.textSearch('fts', searchQuery, {
            type: 'websearch',
            config: 'english'
          });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        setJobs(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [searchQuery, supabase]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-5">
        <h3 className="mb-4">No jobs found</h3>
        {searchQuery && (
          <p className="text-muted">
            Try adjusting your search terms or browse all available positions.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {jobs.map((job) => (
        <ListItemTwo key={job.id} item={job} />
      ))}
    </div>
  );
} 