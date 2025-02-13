import React, { useState, useEffect } from 'react';
import Heading from '../Heading';
import Footer from '../Footer';
import BlogCard from '../Card';


function Blog() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div>
      <Heading />
      <div className="blog-container">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.blog_id}
            title={blog.blog_title}
            text={blog.blog_description}
            imageUrl={`data:image/jpg;base64,${blog.blog_image}`} // Assuming blog_image is Base64 encoded
            buttonUrl={`/blog/${blog.blog_id}`}
            maxTextLength={100} // Optional: you can adjust the max length as needed
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Blog;
