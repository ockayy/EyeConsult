import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import Heading from "./Heading";
import Footer from "./Footer";
import "./CSS/BlogDisplay.css";

function ExerciseDisplay() {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  if (!exercise) {
    return <div>Loading...</div>;
  }

  // Use the provided ex_pic_type or default to 'jpg'
  const imgType = exercise.ex_pic_type || "jpg";
  const imgSrc = exercise.ex_pic
    ? `data:image/${imgType};base64,${exercise.ex_pic}`
    : "/default-exercise.jpg"; // Optional fallback image path

  return (
    <div className="exercise-display-container">
      <Heading />
      <h1 className="exercise-title">{exercise.ex_title}</h1>
      <div className="blog-display">
        <div className="exercise-image-container">
          <img src={imgSrc} alt={exercise.ex_title} className="blog-image" />
        </div>
        <div className="exercise-description">
          <ReactMarkdown plugins={[gfm]} children={exercise.ex_description} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ExerciseDisplay;
