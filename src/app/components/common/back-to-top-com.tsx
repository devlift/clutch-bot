"use client";
import BackToTop from "@/lib/back-to-top";
import React, { useEffect } from "react";

function BackToTopCom() {
  useEffect(() => {
    // Initialize back to top functionality, but keep it hidden
    BackToTop(".scroll-top");
  }, []);
  
  // Always add the hidden class to keep it hidden at all times
  return (
    <button className="scroll-top hidden">
      <i className="bi bi-arrow-up-short"></i>
    </button>
  );
}

export default BackToTopCom;
