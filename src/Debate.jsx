import React, { useEffect, useRef, useState } from 'react';
import FirebaseStream from './FirebaseStream.jsx';

function Debate() {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [videoStream, setVideoStream] = useState(null);

  // Start video stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setVideoStream(stream);

      videoRef.current.onloadeddata = () => {
        videoRef.current.play();
      };
    } catch (err) {
      console.error('Error accessing webcam: ', err);
    }
  };

  // Start speech recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      console.log('Transcript:', transcript);
      setTranscription(transcript);

      // Set isSpeaking to true when audio is detected
      setIsSpeaking(true);

      // Reset isSpeaking to false after a short delay
      setTimeout(() => setIsSpeaking(false), 4000);
    };

    recognition.onerror = (event) => {
      console.error('SpeechRecognition error:', event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    startVideo();
    startSpeechRecognition();

    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
      stopSpeechRecognition();
    };
  }, []);

  return (
    <div className="debate-container">
      <div className="video-section">
        <div className="video-feed">
          <video ref={videoRef} className="video-element" autoPlay muted playsInline />
        </div>
      </div>
      <div className="transcript-section">
        <p>{transcription}</p>
      </div>

      {/* Pass videoStream to FirebaseStream for WebRTC handling */}
      {videoStream && <FirebaseStream localStream={videoStream} />}
    </div>
  );
}

export default Debate;
