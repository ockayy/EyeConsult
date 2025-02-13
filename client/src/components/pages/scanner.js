import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Heading from '../Heading';
import Footer from '../Footer';
import '../CSS/scanner.css';

function Scanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle form submission
 // Update this part in handleUpload
const handleUpload = async () => {
  if (!selectedFile) {
    alert("Please select an image file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  setLoading(true);
  try {
    const response = await axios.post("http://localhost:4000/api/predict", formData);
    console.log("Backend Response:", response.data); // Log the response for debugging

    // Set prediction using the correct field
    setPrediction({
      predicted_class: response.data.prediction,
      confidence: response.data.confidence,
    });

    setErrorMessage(null);
    setShowPopup(true);
  } catch (error) {
    console.error("Error communicating with the backend:", error);

    if (error.response && error.response.status === 400) {
      setErrorMessage("The uploaded image is not recognized as an OCT scan. Please upload a proper OCT scan image.");
      setShowPopup(true);
    } else {
      alert("There was an error processing your request. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  // Close the pop-up
  const closePopup = () => {
    setShowPopup(false);
    setPrediction(null);
    setErrorMessage(null);
  };

  return (
    <div>
      <Heading />
      <div className="scanner-container">
        <div className="upload-section">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            accept="image/*"
          />
          <button onClick={handleUpload} className="upload-button">
            {loading ? "Loading..." : "Upload"}
          </button>
          {loading && (
            <div className="spinner-container">
                <div className="loading-spinner"></div>
            </div>
            )}
        </div>
        <hr />
        <div className="info-section">
          <h2>What is OCT Scan?</h2>
          <p>
            An OCT (Optical Coherence Tomography) scan is a non-invasive imaging test
            that uses light waves to take cross-section pictures of your retina.
          </p>
          
          <p>
            <b className="model-info">Our model can accurately detect the following eye conditions:</b>
            <ul>
                <li><b>Normal:</b> Healthy eyes with no signs of retinal disease.</li>
                <li><b>CNV (Choroidal Neovascularization):</b> A condition characterized by the growth of new, abnormal blood vessels in the choroid layer of the eye, which can lead to vision loss if untreated.</li>
                <li><b>DME (Diabetic Macular Edema):</b> Swelling of the macula caused by fluid accumulation as a complication of diabetes, potentially affecting central vision.</li>
                <li><b>Drusen:</b> Yellow deposits that form under the retina, often associated with age-related macular degeneration, which can impair vision over time.</li>
            </ul>
          </p>
        </div>
      </div>
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>{errorMessage ? "Error" : "Prediction Result"}</h3>
            {errorMessage ? (
            <p>{errorMessage}</p>
          ) : ( 
            <>
              <p>{prediction.predicted_class}</p>
              <p>{getDiseaseDescription(prediction.predicted_class)}</p>
              <p className="disclaimer">
                Note: The prediction is not a medical diagnosis. Please consult a doctor for confirmation.
              </p>
            </>
          )}
            <button onClick={closePopup} className="close-button">Close</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

// Helper function to get disease descriptions
const getDiseaseDescription = (disease) => {
  console.log("Disease received in getDiseaseDescription:", disease); // Log for debugging
  switch (disease) {
    case "CNV":
      return "CNV (Choroidal Neovascularization) is the formation of new blood vessels in the choroid layer of the eye.";
    case "DME":
      return "DME (Diabetic Macular Edema) is a complication of diabetes that affects the macula, causing vision loss.";
    case "Drusen":
      return "Drusen are yellow deposits under the retina, often a sign of age-related macular degeneration.";
    case "Normal":
      return "The scan appears normal with no significant signs of retinal disease.";
    default:
      return "Unknown disease detected. Please consult a healthcare professional.";
  }
};

export default Scanner;
