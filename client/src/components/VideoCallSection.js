// VideoCallSection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoFrame from './VideoFrame';

function VideoCallSection({ appointmentId, token }) {
  const [callStatus, setCallStatus] = useState('no-call');
  const [roomUrl, setRoomUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkCallStatus = async () => {
      try {
        console.log('Checking call status for appointment:', appointmentId); // Debug log
        const response = await axios.get(
          `/api/appointments/${appointmentId}/call-status`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Call status response:', response.data); // Debug log
        
        if (response.data.status === 'active' && response.data.call) {
          setCallStatus('active');
          setRoomUrl(response.data.call.room_url);
          console.log('Room URL set to:', response.data.call.room_url); // Debug log
        } else {
          setCallStatus('no-call');
          setRoomUrl(null);
        }
      } catch (error) {
        console.error('Error checking call status:', error);
      }
    };

    checkCallStatus();
    const intervalId = setInterval(checkCallStatus, 5000);
    return () => clearInterval(intervalId);
  }, [appointmentId, token]);

  const handleJoinCall = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/calls/${appointmentId}/join`,
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

  const handleEndCall = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/calls/${appointmentId}/end`,
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

  console.log('Current call status:', callStatus, 'Room URL:', roomUrl); // Debug log

  return (
    <div className="video-call-section">
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
        <div className="video-frame-container">
          <VideoFrame
            roomUrl={roomUrl}
            isDoctor={false}
            onLeave={handleEndCall}
          />
          <button
            className="end-call-btn"
            onClick={handleEndCall}
            disabled={isLoading}
          >
            End Call
          </button>
        </div>
      )}
      {callStatus === 'no-call' && (
        <p className="call-status">No active call</p>
      )}
    </div>
  );
}

export default VideoCallSection;