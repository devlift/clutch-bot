import React, { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setCategory } from "@/redux/features/filterSlice";

const JobCategory = () => {

  const [isShowMore, setIsShowMore] = useState(false);
  const { category } = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();


  return (
    <div className="main-body">
      <ul className="style-none filter-input">
    
          <li key="sdf">
            <input
              onChange={() => dispatch(setCategory(c))}
              type="checkbox"
              name={c}
              defaultValue={c}
              checked={category.includes(c)}
            />
  
          </li>

      </ul>
      <div
        onClick={() => setIsShowMore((prevState) => !prevState)}
        className="more-btn"
      >
        <i className="bi bi-dash"></i> Show {isShowMore ? "Less" : "More"}
      </div>
    </div>
  );
};

export default JobCategory;
