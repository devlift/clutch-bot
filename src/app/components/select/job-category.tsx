import React from "react";
import NiceSelect from "@/ui/nice-select";

import slugify from "slugify";

const JobCategorySelect = ({
  setCategoryVal,
}: {
  setCategoryVal: React.Dispatch<React.SetStateAction<string>>;
}) => {

  return (
    <></>
    // <NiceSelect
    //   options={category_option}
    //   defaultCurrent={0}
    //   onChange={(item) => handleCategory(item)}
    //   name="Category"
    //   cls="category"
    // />
  );
};

export default JobCategorySelect;
