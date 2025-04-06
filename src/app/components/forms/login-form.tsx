"use client";
import React, { useState } from "react";
import Image from "next/image";
import * as Yup from "yup";
import { Resolver, useForm } from "react-hook-form";
import ErrorMsg from "../common/error-msg";
import icon from "@/assets/images/icon/icon_60.svg";
import { supabase } from "@/lib/supabase";

// form data type
type IFormData = {
  email: string;
  password: string;
};

// schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});

// resolver
const resolver: Resolver<IFormData> = async (values) => {
  return {
    values: values.email ? values : {},
    errors: !values.email
      ? {
          email: {
            type: "required",
            message: "Email is required.",
          },
          password: {
            type: "required",
            message: "Password is required.",
          },
        }
      : {},
  };
};

const LoginForm = () => {
  const [showPass, setShowPass] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormData>({ resolver });
  
  // on submit
  const onSubmit = async (data: IFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Attempting login with:", data.email);
      
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      console.log("Auth response:", { 
        success: !!authData?.user, 
        user: authData?.user?.email,
        error: authError?.message 
      });
      
      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData?.user) {
        setError("Login failed: No user returned");
        return;
      }
      
      // Verify the user exists in our database
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('id, name')
        .eq('id', authData.user.id)
        .single();
      
      console.log("User data from DB:", userData, "Error:", userError);
      
      // If user doesn't exist in our database yet, create a record
      if (userError || !userData) {
        console.log("User not found in database, creating record...");
        
        // Create basic user record 
        const { data: newUser, error: createError } = await supabase
          .from('User')
          .insert([
            { 
              id: authData.user.id,
              name: authData.user.email?.split('@')[0] || 'User',
              email: authData.user.email
            }
          ])
          .select();
        
        console.log("Created user:", newUser, "Error:", createError);
        
        if (createError) {
          console.error("Error creating user record:", createError);
        }
      }
      
      // Close the modal programmatically on successful login
      const modal = document.getElementById('loginModal');
      const bsModal = (window as any).bootstrap?.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      } else {
        // Fallback for when bootstrap is not loaded yet
        const closeBtn = modal?.querySelector('.btn-close') as HTMLElement;
        closeBtn?.click();
      }
      
      reset();
      
      console.log("Login successful, reloading page...");
      // Force refresh the page to update UI with authenticated state
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
      <div className="row">
        {error && (
          <div className="col-12 mb-20">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>Email*</label>
            <input
              type="email"
              placeholder="james@example.com"
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
                <Image src={icon} alt="icon" />
              </span>
            </span>
            <div className="help-block with-errors">
              <ErrorMsg msg={errors.password?.message!} />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="agreement-checkbox d-flex justify-content-between align-items-center">
            <div>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Keep me logged in</label>
            </div>
            <a href="#">Forget Password?</a>
          </div>
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn-eleven fw-500 tran3s d-block mt-20"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
