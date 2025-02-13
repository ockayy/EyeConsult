import React from 'react';
import { Card, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import gfm from 'remark-gfm'; // Optional: for GitHub Flavored Markdown
import './CSS/Card.css';

function truncateText(text, maxLength) {
  const introIndex = text.indexOf('Introduction:**');
  if (introIndex !== -1) {
    text = text.substring(introIndex + 'Introduction:**'.length).trim();
  }

  if (text.length <= maxLength) {
    return text;
  }
  const truncated = text.substring(0, maxLength);
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}

function BlogCard({ title, text, imageUrl, buttonUrl, maxTextLength = 100 }) {
  const truncatedText = truncateText(text, maxTextLength); 

  return (
    <div className="blog-card">
      <Card>
        <Card.Img variant="top" src={imageUrl} className="card-img-top" />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            <ReactMarkdown plugins={[gfm]} children={truncatedText} />
          </Card.Text>
          {text.length > maxTextLength && (
            <Button variant="primary" href={buttonUrl}>Read More</Button>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default BlogCard;
