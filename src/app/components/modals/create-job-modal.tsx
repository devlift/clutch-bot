"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface JobDetails {
  title: string;
  description: string;
  wage: number;
  wageType: string;
  requirements: string[];
  location: string;
  jobType: string;
  schedule: string;
  benefits: string[];
  responsibilities: string[];
  howToApply: string[] | string;
  advertiseUntil: string;
  tags: string[];
}

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDetails: JobDetails;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, jobDetails }) => {
  // Set default wage type without converting to uppercase
  const initialFormData = {
    ...jobDetails,
    wageType: jobDetails.wageType || 'Salary',
    jobType: jobDetails.jobType || 'Full-time',
  };
  
  const [formData, setFormData] = useState<JobDetails>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the auth context to get user and employer information
  const { user, employerId } = useAuth();

  useEffect(() => {
    // Update form data when jobDetails change
    setFormData({
      ...jobDetails,
      wageType: jobDetails.wageType || 'Salary',
      jobType: jobDetails.jobType || 'Full-time',
    });
  }, [jobDetails]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: keyof JobDetails) => {
    const values = e.target.value.split('\n').filter(item => item.trim() !== '');
    setFormData(prevData => ({
      ...prevData,
      [field]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user) {
        setError("You must be logged in to create a job posting");
        setIsSubmitting(false);
        return;
      }

      if (!employerId) {
        setError("Could not find your employer profile. Please complete your profile before posting a job.");
        setIsSubmitting(false);
        return;
      }

      // Process tags safely
      let tagArray: string[] = [];
      if (Array.isArray(formData.tags)) {
        tagArray = formData.tags as string[];
      } else if (typeof formData.tags === 'string' && formData.tags) {
        tagArray = (formData.tags as string).split(',').map((tag: string) => tag.trim());
      }

      // Format data for insertion
      const jobData = {
        id: uuidv4(), // Generate a UUID for the job
        employerId: employerId,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        wage: formData.wage,
        wageType: formData.wageType, // Do not convert to uppercase
        requirements: Array.isArray(formData.requirements) ? formData.requirements : [],
        benefits: Array.isArray(formData.benefits) ? formData.benefits : [],
        responsibilities: Array.isArray(formData.responsibilities) ? formData.responsibilities : [],
        howToApply: Array.isArray(formData.howToApply) ? formData.howToApply : 
                    typeof formData.howToApply === 'string' ? [formData.howToApply] : [],
        schedule: formData.schedule || '',
        hours: '', // Adding the missing hours field
        startDate: '', // Adding the missing startDate field
        advertiseUntil: formData.advertiseUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        tags: tagArray,
        createdTime: new Date().toISOString()
      };
      
      // Log the exact data being sent to verify the status value
      console.log("Final job data:", jobData);

      // Insert job into database with additional error handling and logging cleanup
      try {
        const { data, error: insertError } = await supabase
          .from('Job')
          .insert([jobData])
          .select();

        if (insertError) {
          console.error("Error inserting job:", insertError);
          
          // Check for specific error types
          if (insertError.code === '23505') {
            setError("A job with this information already exists.");
          } else if (insertError.code === '23502') {
            setError("Missing required fields: " + insertError.message);
          } else if (insertError.code === '42P01') {
            setError("Database table not found. Please contact support.");
          } else if (insertError.code === '42703') {
            setError("Invalid field in job data: " + insertError.message);
          } else {
            setError(`Failed to create job posting: ${insertError.message}`);
          }
          
          setIsSubmitting(false);
          return;
        }

        if (!data || data.length === 0) {
          setError("Job was created but no data was returned. Please check the jobs listing.");
          setIsSubmitting(false);
          return;
        }

        console.log("Job created successfully:", data[0].id);
        setSuccess(true);
        // Reset form after 2 seconds and close modal
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } catch (insertErr: any) {
        console.error("Exception during job insertion:", insertErr);
        setError(`Error during database operation: ${insertErr.message}`);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Error in form submission:", err);
      setError(`An unexpected error occurred: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Job Posting</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {success ? (
              <div className="alert alert-success">
                Job posting created successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Job Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Job Type</label>
                    <select 
                      className="form-select" 
                      name="jobType" 
                      value={formData.jobType} 
                      onChange={handleChange}
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Wage/Salary</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="wage" 
                      value={formData.wage} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Wage Type</label>
                    <select 
                      className="form-select" 
                      name="wageType" 
                      value={formData.wageType} 
                      onChange={handleChange}
                      required
                    >
                      <option value="Salary">Salary</option>
                      <option value="Hourly">Hourly</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    rows={5}
                    required
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Requirements (one per line)</label>
                    <textarea 
                      className="form-control" 
                      value={Array.isArray(formData.requirements) ? formData.requirements.join('\n') : formData.requirements} 
                      onChange={(e) => handleArrayChange(e, 'requirements')}
                      rows={5}
                    ></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Responsibilities (one per line)</label>
                    <textarea 
                      className="form-control" 
                      value={Array.isArray(formData.responsibilities) ? formData.responsibilities.join('\n') : formData.responsibilities} 
                      onChange={(e) => handleArrayChange(e, 'responsibilities')}
                      rows={5}
                    ></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Benefits (one per line)</label>
                    <textarea 
                      className="form-control" 
                      value={Array.isArray(formData.benefits) ? formData.benefits.join('\n') : formData.benefits} 
                      onChange={(e) => handleArrayChange(e, 'benefits')}
                      rows={5}
                    ></textarea>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">How To Apply</label>
                    <textarea 
                      className="form-control" 
                      name="howToApply" 
                      value={Array.isArray(formData.howToApply) ? formData.howToApply.join('\n') : formData.howToApply} 
                      onChange={(e) => handleArrayChange(e, 'howToApply')}
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Work Schedule</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="schedule" 
                      value={formData.schedule} 
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Advertise Until</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="advertiseUntil" 
                      value={formData.advertiseUntil} 
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="tags" 
                      value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags} 
                      onChange={(e) => {
                        const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                        setFormData(prev => ({ ...prev, tags: tagsArray }));
                      }}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                  <button 
                    type="submit" 
                    className="btn theme-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Job Posting'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal; 