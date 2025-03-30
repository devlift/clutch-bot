import React from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setTags } from "@/redux/features/filterSlice";

const JobTags = () => {

  return (
    <div className="main-body">
      <ul className="style-none d-flex flex-wrap justify-space-between radio-filter mb-5">

          <li key="sdf">
            <input
    
              type="checkbox"
              name="tags"
 
   
            />
            <label>sdfds</label>
          </li>

      </ul>
    </div>
  );
};

export default JobTags;
