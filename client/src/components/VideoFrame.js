import React, { useEffect, useState, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import './CSS/VideoFrame.css';

const VideoFrame = ({ roomUrl, isDoctor, onLeave }) => {
  const [callFrame, setCallFrame] = useState(null);
  const [error, setError] = useState(null);
  const frameContainer = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!roomUrl || !frameContainer.current) return;

    const startCall = async () => {
      try {
        console.log('Starting call with URL:', roomUrl); // Debug log

        // Clean up any existing frame
        if (frameRef.current) {
          frameRef.current.destroy();
        }

        // Create frame configuration
        const frameConfig = {
          iframeStyle: {
            width: '100%',
            height: '400px',
            border: '1px solid #ccc',
            borderRadius: '8px'
          },
          showLeaveButton: true,
          showFullscreenButton: true,
          dailyConfig: {
            experimentalChromeVideoMuteLightOff: true,
          }
        };

        // Create the frame
        const frame = await DailyIframe.createFrame(
          frameContainer.current,
          frameConfig
        );

        frameRef.current = frame;

        // Configure event handlers
        frame
          .on('loaded', () => {
            console.log('Daily.co frame loaded'); // Debug log
          })
          .on('started-camera', () => {
            console.log('Local camera started');
          })
          .on('camera-error', () => {
            console.log('Camera access error');
            setError('Camera access failed. Please check your permissions.');
          })
          .on('joining-meeting', () => {
            console.log('Joining meeting...'); // Debug log
          })
          .on('joined-meeting', () => {
            console.log('Successfully joined meeting'); // Debug log
          })
          .on('left-meeting', () => {
            console.log('Left meeting');
            onLeave && onLeave();
          })
          .on('error', (evt) => {
            console.error('Daily.co error:', evt); // Debug log
            setError(evt.errorMsg);
          });

        // Join the call
        await frame.join({
          url: roomUrl,
          startVideoOff: !isDoctor,
          startAudioOff: false,
        });

        setCallFrame(frame);
      } catch (err) {
        console.error('Error starting call:', err); // Debug log
        setError(err.message || 'Failed to start video call');
      }
    };

    startCall();

    // Cleanup function
    return () => {
      console.log('Cleaning up video frame'); // Debug log
      if (frameRef.current) {
        frameRef.current.destroy();
        frameRef.current = null;
      }
    };
  }, [roomUrl, isDoctor, onLeave]);

  // Handle errors
  if (error) {
    return (
      <div className="video-error">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry Call
        </button>
      </div>
    );
  }

  return (
    <div className="video-frame-wrapper">
      <div ref={frameContainer} className="video-frame" />
      {callFrame && (
        <div className="video-controls">
          <button 
            onClick={() => callFrame.setLocalVideo(!callFrame.localVideo())}
            className="control-button"
          >
            {callFrame.localVideo() ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
          <button 
            onClick={() => callFrame.setLocalAudio(!callFrame.localAudio())}
            className="control-button"
          >
            {callFrame.localAudio() ? 'Mute' : 'Unmute'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoFrame;