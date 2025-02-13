import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import Heading from './Heading';
import Footer from './Footer';
import './CSS/BlogDisplay.css';

function BlogDisplay() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Heading />
      <div className="blog-display">
        <h1>{blog.blog_title}</h1>
        <img src={`data:image/jpg;base64,${blog.blog_image}`} alt={blog.blog_title} className="blog-image" />
        <div className='exercise-description'>
          <ReactMarkdown plugins={[gfm]} children={blog.blog_description} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BlogDisplay;
