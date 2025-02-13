// src/components/AppointmentCard.jsx
import React, { useState, useEffect } from "react";
import "./CSS/AppointmentCard.css";
import Messages from "./Messages"; // Your chat component
import VideoFrame from "./VideoFrame";

import axios from "axios";

function AppointmentCard({
  appointment,
  token,
  isDoctor,
  onCancel,
  onUpdatePrescription,
  onUpdateDateTime, // <--- function to update date/time
  onStartCall,
}) {
  const {
    appointment_id,
    appointment_date,
    appointment_time,
    description,
    status,
    fee,
    patient_fname,
    patient_lname,
    gender,
    prescription,
  } = appointment;

  // Prescription states
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [tempPrescription, setTempPrescription] = useState(prescription || "");
  const [tempStatus, setTempStatus] = useState(status || "");
  const [callStatus, setCallStatus] = useState('no-call');
  const [roomUrl, setRoomUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Messages
  const [showMessages, setShowMessages] = useState(false);

  // Date/Time editing states (for doctors)
  const [showDateTimeEdit, setShowDateTimeEdit] = useState(false);
  const [editDate, setEditDate] = useState(appointment_date || "");
  const [editTime, setEditTime] = useState(appointment_time || "");

  // ---------------------- PRESCRIPTION ----------------------
  const handlePrescriptionSave = () => {
    onUpdatePrescription(appointment_id, tempPrescription, tempStatus);
    setShowPrescriptionForm(false);
  };

  // ---------------------- DATE/TIME UPDATE ----------------------
  const handleDateTimeSave = () => {
    // Trigger the parent's callback to actually update on the server
    onUpdateDateTime(appointment_id, editDate, editTime);
    setShowDateTimeEdit(false);
  };

   // Check call status periodically
   useEffect(() => {
    const checkCallStatus = async () => {
      try {
        const response = await axios.get(
          `/api/appointments/${appointment_id}/call-status`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.status === 'active' && response.data.call) {
          setCallStatus('active');
          setRoomUrl(response.data.call.room_url);
        } else {
          setCallStatus('no-call');
          setRoomUrl(null);
        }
      } catch (error) {
        console.error('Error checking call status:', error);
      }
    };

    const intervalId = setInterval(checkCallStatus, 5000);
    return () => clearInterval(intervalId);
  }, [appointment_id, token]);

  // Handle starting a call (doctor only)
  const handleStartCall = async () => {
    setIsLoading(true);
    try {
      console.log('Starting call for appointment:', appointment_id);
      
      const response = await axios.post(
        `/api/appointments/${appointment_id}/create-room`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Call creation response:', response.data);
      
      if (!response.data.call?.room_url) {
        throw new Error('No room URL received from server');
      }
      
      setRoomUrl(response.data.call.room_url);
      setCallStatus('active');
      
      // Add a notification for successful call creation
      alert('Video call room created successfully! You can now start the call.');
      
    } catch (error) {
      console.error('Detailed error in starting call:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      alert(`Failed to start call: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joining a call (patient only)
  const handleJoinCall = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/calls/${appointment_id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCallStatus('joined');
    } catch (error) {
      console.error('Error joining call:', error);
      alert('Failed to join call');
    }
    setIsLoading(false);
  };

  // Handle ending a call
  const handleEndCall = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/calls/${appointment_id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCallStatus('no-call');
      setRoomUrl(null);
    } catch (error) {
      console.error('Error ending call:', error);
      alert('Failed to end call');
    }
    setIsLoading(false);
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <h3>Appointment #{appointment_id}</h3>
        {isDoctor && (
          <div className="header-fee">
            <p>
              <b>Fee:</b> {fee || 0}
            </p>
          </div>
        )}
      </div>

      {/* Basic Fields */}
      <p>
        <b>Date:</b> {appointment_date ? appointment_date : <i>Not set</i>}
      </p>
      <p>
        <b>Time:</b> {appointment_time ? appointment_time : <i>Not set</i>}
      </p>
      <p>
        <b>Description:</b> {description || <i>None</i>}
      </p>
      <p>
        <b>Status:</b> {status || "N/A"}
      </p>

      {/* If Doctor, show patient info */}
      {isDoctor && (
        <p>
          <b>Patient:</b> {patient_fname} {patient_lname} ({gender})
        </p>
      )}

      {/* Prescription */}
      <p>
        <b>Prescription:</b>{" "}
        {prescription ? prescription : <i>No prescription yet</i>}
      </p>

      <div className="appt-actions">
        {/* Cancel Button */}
        <button
          onClick={() => onCancel(appointment_id)}
          className="cancel-appointment-btn"
        >
          Cancel
        </button>

        {/* Date/Time Edit Button (Doctor only) */}
        {isDoctor && (
          <button
            className="update-appointment-btn"
            onClick={() => setShowDateTimeEdit(!showDateTimeEdit)}
          >
            {showDateTimeEdit ? "Close Date/Time Edit" : "Edit Date/Time"}
          </button>
        )}
      </div>

      {/* Date/Time Edit Form (only if showDateTimeEdit == true) */}
      {showDateTimeEdit && isDoctor && (
        <div className="datetime-edit-form">
          <label>Date:</label>
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
          <label>Time:</label>
          <input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
          />

          <button className="save-btn" onClick={handleDateTimeSave}>
            Save Date & Time
          </button>
        </div>
      )}

      {/* Prescription Edit Button (Doctor only) */}
      {isDoctor && (
        <button
          className="update-appointment-btn"
          onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
        >
          {showPrescriptionForm
            ? "Close Prescription Form"
            : "Edit Prescription"}
        </button>
      )}

      {/* Prescription Form */}
      {showPrescriptionForm && isDoctor && (
        <div className="prescription-form">
          <textarea
            placeholder="Enter prescription"
            value={tempPrescription}
            onChange={(e) => setTempPrescription(e.target.value)}
          />
          <br />
          <select
            value={tempStatus}
            onChange={(e) => setTempStatus(e.target.value)}
          >
            <option value="">-- Select Status --</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <br />
          <button className="save-btn" onClick={handlePrescriptionSave}>
            Save Prescription & Status
          </button>
        </div>
      )}

      <hr />

      {/* Messages Button & Section */}
      <button
        className="toggle-messages-btn"
        onClick={() => setShowMessages(!showMessages)}
      >
        {showMessages ? "Hide Messages" : "Show Messages"}
      </button>
      {showMessages && (
        <div className="messages-area">
          <Messages appointmentId={appointment_id} token={token} />
        </div>
      )}

<div className="video-call-section">
        {isDoctor ? (
          // Doctor's view
          <>
            {callStatus === 'no-call' && (
              <button
                className="start-call-btn"
                onClick={handleStartCall}
                disabled={isLoading}
              >
                {isLoading ? 'Starting Call...' : 'Start Video Call'}
              </button>
            )}
            {callStatus === 'active' && roomUrl && (
              <>
                <VideoFrame
                  roomUrl={roomUrl}
                  isDoctor={true}
                  onLeave={handleEndCall}
                />
                <button
                  className="end-call-btn"
                  onClick={handleEndCall}
                  disabled={isLoading}
                >
                  End Call
                </button>
              </>
            )}
          </>
        ) : (
          // Patient's view
          <>
            {callStatus === 'active' && !roomUrl && (
              <button
                className="join-call-btn"
                onClick={handleJoinCall}
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Video Call'}
              </button>
            )}
            {callStatus === 'active' && roomUrl && (
              <VideoFrame
                roomUrl={roomUrl}
                isDoctor={false}
                onLeave={handleEndCall}
              />
            )}
            {callStatus === 'no-call' && (
              <p className="call-status">No active call</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;
