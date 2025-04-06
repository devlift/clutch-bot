"use client";
import React, { useState } from "react";
import Image from "next/image";
import * as Yup from "yup";
import { Resolver, useForm } from "react-hook-form";
import ErrorMsg from "../common/error-msg";
import icon from "@/assets/images/icon/icon_60.svg";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Helper function to generate UUID (more compatible than crypto.randomUUID())
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// form data type
type IFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Add employer-specific fields
  companyName?: string;
  website?: string;
  industry?: string;
  // Add candidate-specific fields
  resume?: File;
  // Add terms agreement field
  termsAgreed: boolean;
};

// schema - common fields
const baseSchema = {
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  termsAgreed: Yup.boolean()
    .required("You must agree to the Terms and Privacy Policy")
    .oneOf([true], "You must agree to the Terms and Privacy Policy"),
};

// employer schema
const employerSchema = Yup.object().shape({
  ...baseSchema,
  companyName: Yup.string().required().label("Company Name"),
  website: Yup.string().url().label("Website URL"),
  industry: Yup.string().label("Industry"),
});

// candidate schema
const candidateSchema = Yup.object().shape({
  ...baseSchema,
  // We'll handle resume file separately
});

// resolver
const resolver: Resolver<IFormData> = async (values) => {
  return {
    values: values.name ? values : {},
    errors: !values.name
      ? {
        name: {
          type: "required",
          message: "Name is required.",
        },
        email: {
          type: "required",
          message: "Email is required.",
        },
        password: {
          type: "required",
          message: "Password is required.",
        },
        confirmPassword: {
          type: "validate",
          message: "Please confirm your password.",
        },
        termsAgreed: {
          type: "required",
          message: "You must agree to the Terms and Privacy Policy.",
        },
        ...(values.companyName === "" 
          ? {
              companyName: {
                type: "required",
                message: "Company Name is required for employers.",
              },
            } 
          : {}),
      }
      : {},
  };
};

interface RegisterFormProps {
  userType: "candidate" | "employer";
}

const RegisterForm: React.FC<RegisterFormProps> = ({ userType }) => {
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const router = useRouter();

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormData>({ resolver });

  // handle resume file change
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Handle drag events for the file upload area
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Check if the file type is acceptable
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
      } else {
        setError("Please upload a PDF, DOC, or DOCX file");
      }
    }
  };

  // Function to format file size nicely
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // on submit
  const onSubmit = async (data: IFormData) => {
    try {
      setLoading(true);
      setError(null);

      // First, check if the Candidate table has the expected structure
      console.log("Checking Candidate table structure...");
      const { data: candidateTableInfo, error: tableError } = await supabase
        .from('Candidate')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error("Table info error:", tableError);
      } else {
        console.log("Table info:", candidateTableInfo);
      }

      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw new Error(authError.message);
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      const userId = authData.user.id;

      // 2. Create user profile
      const { error: userError } = await supabase
        .from('User') // Use uppercase first letter to match existing schema
        .insert({
          id: userId,
          name: data.name,
          email: data.email,
        });

      if (userError) throw new Error(userError.message);

      // 3. Create specific profile based on user type
      if (userType === "employer") {
        // Create employer profile using the user ID from Auth
        console.log("Creating employer profile with user ID:", userId);
        
        const { error: employerError } = await supabase
          .from('Employer') // Use uppercase first letter to match existing schema
          .insert({
            id: userId, // Use the same ID from Auth
            userId: userId, // This column now exists with the correct casing
            companyName: data.companyName,
            website: data.website || null,
            industry: data.industry || null,
          });

        if (employerError) {
          console.error("Employer insert error:", employerError);
          throw new Error(employerError.message);
        }
      } else {
        // Create candidate profile using the user ID from Auth
        console.log("Creating candidate profile with user ID:", userId);
        
        // Log the payload we're sending to Supabase
        const candidatePayload = {
          id: userId, // Use the same ID from Auth
          userId: userId
        };
        console.log("Candidate insert payload:", candidatePayload);
        
        // Try the insert with careful error handling
        try {
          const { data: insertedData, error: candidateError } = await supabase
            .from('Candidate') // Use uppercase C to match existing schema
            .insert(candidatePayload)
            .select(); // Add select() to return the inserted row
          
          if (candidateError) {
            console.error("Candidate insert error:", candidateError);
            throw new Error(candidateError.message);
          }
          
          console.log("Insert successful, returned data:", insertedData);

          // Handle resume upload if provided
          if (resumeFile) {
            try {
              // Wait a moment for auth session to stabilize
              console.log("Waiting for authentication to establish...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Get the current session to ensure we have authentication
              let sessionData;
              let retryCount = 0;
              const maxRetries = 3;
              
              // Retry getting session a few times if needed
              while (retryCount < maxRetries) {
                const sessionResponse = await supabase.auth.getSession();
                sessionData = sessionResponse.data;
                
                if (sessionData?.session) {
                  console.log("Authentication session established on attempt", retryCount + 1);
                  break;
                }
                
                console.log(`No valid session found, retry attempt ${retryCount + 1}/${maxRetries}`);
                retryCount++;
                
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
              }
              
              if (!sessionData?.session) {
                console.warn("No valid session found after retries. Using user ID from registration.");
                // Fall back to the user ID from registration
              }
              
              // Use either the authenticated user ID from session or fall back to the registration ID
              const authUserId = sessionData?.session?.user?.id || userId;
              const fileName = `${authUserId}/${Date.now()}_${resumeFile.name.replace(/\s+/g, '_')}`;
              
              console.log("Attempting to upload resume to storage bucket...");
              
              // Upload with explicit content type
              const { data: uploadedFile, error: uploadError } = await supabase
                .storage
                .from('resumes')
                .upload(fileName, resumeFile, {
                  cacheControl: '3600',
                  upsert: true,
                  contentType: resumeFile.type || 'application/octet-stream'
                });

              if (uploadError) {
                console.error("Resume upload error:", uploadError);
                throw new Error(uploadError.message);
              } else {
                console.log("Resume uploaded successfully:", uploadedFile);

                // Generate a public URL for the file
                const { data: publicUrlData } = supabase
                  .storage
                  .from('resumes')
                  .getPublicUrl(fileName);
                
                const publicUrl = publicUrlData?.publicUrl;
                console.log("File public URL:", publicUrl);

                // Update candidate with resume path - try multiple column names to ensure at least one works
                try {
                  console.log("Updating candidate record with file info...");
                  
                  // Update with the correct field mapping
                  const { error: updateError } = await supabase
                    .from('Candidate')
                    .update({ 
                      resume_url: publicUrl, // Use the public URL for resume_url field
                      resume_filename: resumeFile.name
                      // Don't set the resume field as it should be for actual content
                    })
                    .eq('id', authUserId);

                  if (updateError) {
                    console.error("Resume path update error:", updateError);
                    
                    // Second attempt with minimal fields
                    console.log("Retrying with minimal fields...");
                    const { error: retryError } = await supabase
                      .from('Candidate')
                      .update({ 
                        resume_url: publicUrl // Just set the resume_url
                      })
                      .eq('id', authUserId);
                      
                    if (retryError) {
                      console.error("Second resume update attempt failed:", retryError);
                    } else {
                      console.log("Second resume update succeeded with just resume_url field");
                    }
                  } else {
                    console.log("Resume metadata updated successfully");
                  }
                } catch (dbError) {
                  console.error("Database operation failed:", dbError);
                  // Continue with registration despite DB error
                }
              }
            } catch (uploadError) {
              console.error("Resume processing error:", uploadError);
              // Continue with registration even if resume upload fails
            }
          }
        } catch (candError) {
          console.error("Detailed candidate creation error:", candError);
          throw candError;
        }
      }

      // Instead of just redirecting to home page, add parameters to trigger chat widget with welcome message
      const welcomeType = userType === 'employer' ? 'employer' : 'candidate';
      const welcomeMessage = encodeURIComponent(
        userType === 'employer' 
          ? "Welcome to Clutch Jobs! As an employer, you can create and update job listings, review candidate applications, and communicate with potential hires. How can I help you get started today?"
          : "Welcome to Clutch Jobs! As a candidate, you can apply for jobs, participate in interviews, and communicate with employers. Would you like to start searching for jobs or complete your profile?"
      );

      // Make sure all parameters are properly encoded
      console.log("Redirecting with chat params:", { welcomeType, openChat: true, message: welcomeMessage });

      // Success - redirect to home page with query params to trigger chat
      window.location.href = `/?welcome=${welcomeType}&openChat=true&message=${welcomeMessage}`;
      // Don't use router.push as it may not trigger a full page reload which is needed

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>Name*</label>
            <input
              type="text"
              placeholder="Enter your full name"
              {...register("name", { required: `Name is required!` })}
              name="name"
            />
            <div className="help-block with-errors">
              <ErrorMsg msg={errors.name?.message!} />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>Email*</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              {...register("email", { required: `Email is required!` })}
              name="email"
            />
            <div className="help-block with-errors">
              <ErrorMsg msg={errors.email?.message!} />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-20">
            <label>Password*</label>
            <input
              type={`${showPass ? "text" : "password"}`}
              placeholder="Enter Password"
              className="pass_log_id"
              {...register("password", { required: `Password is required!` })}
              name="password"
            />
            <span
              className="placeholder_icon"
              onClick={() => setShowPass(!showPass)}
            >
              <span className={`passVicon ${showPass ? "eye-slash" : ""}`}>
                <Image src={icon} alt="pass-icon" />
              </span>
            </span>
            <div className="help-block with-errors">
              <ErrorMsg msg={errors.password?.message!} />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-20">
            <label>Confirm Password*</label>
            <input
              type={`${showPass ? "text" : "password"}`}
              placeholder="Enter Password Again"
              className="pass_log_id"
              {...register("confirmPassword", { required: `Please confirm your password!` })}
              name="confirmPassword"
            />
            <span
              className="placeholder_icon"
              onClick={() => setShowPass(!showPass)}
            >
              <span className={`passVicon ${showPass ? "eye-slash" : ""}`}>
                <Image src={icon} alt="pass-icon" />
              </span>
            </span>
            <div className="help-block with-errors">
              <ErrorMsg msg={errors.confirmPassword?.message!} />
            </div>
          </div>
        </div>

        {/* Employer-specific fields */}
        {userType === "employer" && (
          <>
            <div className="col-12">
              <div className="input-group-meta position-relative mb-25">
                <label>Company Name*</label>
                <input
                  type="text"
                  placeholder="Enter your company name"
                  {...register("companyName", { required: userType === "employer" })}
                  name="companyName"
                />
                <div className="help-block with-errors">
                  <ErrorMsg msg={errors.companyName?.message!} />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="input-group-meta position-relative mb-25">
                <label>Website</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  {...register("website")}
                  name="website"
                />
                <div className="help-block with-errors">
                  <ErrorMsg msg={errors.website?.message!} />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="input-group-meta position-relative mb-25">
                <label>Industry</label>
                <input
                  type="text"
                  placeholder="Enter your industry"
                  {...register("industry")}
                  name="industry"
                />
              </div>
            </div>
          </>
        )}

        {/* Candidate-specific fields */}
        {userType === "candidate" && (
          <div className="col-12">
            <div className="input-group-meta position-relative mb-25">
              <label>Resume (Optional)</label>
              <div 
                className={`custom-file-upload ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="file-input"
                />
                {!resumeFile ? (
                  <label htmlFor="resume-upload" className="file-label">
                    <div className="upload-icon">
                      <i className={`bi ${isDragging ? 'bi-file-earmark-arrow-down' : 'bi-cloud-arrow-up'}`}></i>
                    </div>
                    <div className="upload-text">
                      <span className="primary-text">{isDragging ? 'Drop your file here' : 'Choose a file'}</span>
                      <span className="secondary-text">{isDragging ? '' : 'or drag it here'}</span>
                    </div>
                  </label>
                ) : (
                  <div className="file-preview">
                    <div className="file-info">
                      <div className="file-icon">
                        <i className={`bi ${
                          resumeFile.name.endsWith('.pdf') ? 'bi-file-earmark-pdf' : 
                          resumeFile.name.endsWith('.doc') || resumeFile.name.endsWith('.docx') ? 'bi-file-earmark-word' : 
                          'bi-file-earmark'
                        }`}></i>
                      </div>
                      <div className="file-details">
                        <span className="file-name" title={resumeFile.name}>{resumeFile.name}</span>
                        <span className="file-size">{formatFileSize(resumeFile.size)}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="remove-file"
                      onClick={() => setResumeFile(null)}
                      aria-label="Remove file"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}
              </div>
              <small className="text-muted mt-2">Supported formats: PDF, DOC, DOCX (Max 10MB)</small>
            </div>
          </div>
        )}

        <div className="col-12">
          <div className="terms-checkbox mb-25">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="termsAgreed"
                className="styled-checkbox"
                {...register("termsAgreed", { required: "You must agree to the Terms and Privacy Policy" })}
              />
              <label htmlFor="termsAgreed" className="checkbox-label">
                <span className="required-indicator">* </span>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">Terms and Conditions</a> &{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="terms-link">Privacy Policy</a>
              </label>
            </div>
            <div className="help-block with-errors mt-5">
              <ErrorMsg msg={errors.termsAgreed?.message!} />
            </div>
          </div>
        </div>

        {error && (
          <div className="col-12 mt-10">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        <div className="col-12">
          <button 
            type="submit" 
            className="btn-eleven fw-500 tran3s d-block mt-20"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
