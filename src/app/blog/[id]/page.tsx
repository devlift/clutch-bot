import React from "react";
import { Metadata } from "next";
import Header from "@/layouts/headers/header";
import Wrapper from "@/layouts/wrapper";
import JobPortalIntro from "../../components/job-portal-intro/job-portal-intro";
import CompanyBreadcrumb from "../../components/common/common-breadcrumb";
import FooterOne from "@/layouts/footers/footer-one";

import blog_data from "@/data/blog-data";
import BlogDetailsArea from "@/app/components/blogs/blog-details";

export const metadata: Metadata = {
  title: "Blog Details",
};

const BlogDetailsDynamicPage = ({ params }: { params: { id: string } }) => {
  const blog = blog_data.find((b) => Number(b.id) === Number(params.id))!;
  return (
    <Wrapper>
      <div className="main-page-wrapper">
     
        {/*breadcrumb start */}
        <CompanyBreadcrumb
          title="Blog"
          subtitle="Read our blog from top talents"
        />
        {/*breadcrumb end */}

        {/* blog details start */}
        <BlogDetailsArea item={blog} />
        {/* blog details end */}

        {/* job portal intro start */}
        <JobPortalIntro top_border={true} />
        {/* job portal intro end */}

   
      </div>
    </Wrapper>
  );
};

export default BlogDetailsDynamicPage;
