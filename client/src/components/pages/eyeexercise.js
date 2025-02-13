import React, { useState, useEffect } from 'react';
import Heading from '../Heading';
import Footer from '../Footer';
import ExerciseCard from '../Card';

function Exercises() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  return (
    <div>
      <Heading />
      <div className="blog-container">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.ex_id}
            title={exercise.ex_title}
            text={exercise.ex_description}
            imageUrl={`data:image/jpg;base64,${exercise.ex_pic}`} // Assuming ex_pic is Base64 encoded
            buttonUrl={`/eyeexercise/${exercise.ex_id}`}
            maxTextLength={100} // Optional: you can adjust the max length as needed
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Exercises;
