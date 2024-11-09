import { useEffect, useRef, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebase from 'firebase/app';
import 'firebase/database';  // Assuming you are using Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyCx643Qb8ZSC9zwOps_cUVrGYvfxCIfaeQ",
  authDomain: "hackthechange2024.firebaseapp.com",
  projectId: "hackthechange2024",
  storageBucket: "hackthechange2024.firebasestorage.app",
  messagingSenderId: "847642885284",
  appId: "1:847642885284:web:b659766d5bf3870d9dfa31",
  measurementId: "G-7MQ2RHQ5F8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Setup WebRTC configuration
const servers = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

// Create a peer connection for WebRTC
let pc = new RTCPeerConnection(servers);

function Firebase({ stream }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const videoRef = useRef(null);

  // Function to handle the stream passed from Debate
  const handleStream = (stream) => {
    setLocalStream(stream);
    videoRef.current.srcObject = stream;
  };

  // Function to push the video stream to Firebase (optional, for storage)
  const pushStreamToFirebase = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const videoData = {
        timestamp: new Date().toISOString(),
      };

      // Store video metadata in Firestore (or actual video in Storage)
      await setDoc(doc(firestore, "videoStreams", "stream1"), videoData);
    }
  };

  // ICE Candidate handling
  const handleICECandidate = (event) => {
    if (event.candidate) {
      // Push ICE candidate to Firebase
      firebase.database().ref("iceCandidates").push(event.candidate);
    }
  };

  // WebRTC signaling (Offer/Answer) via Firebase
  const createOffer = async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    firebase.database().ref("signaling").push({ offer });
  };

  const handleOffer = async (offer) => {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    firebase.database().ref("signaling").push({ answer });
  };

  const handleAnswer = async (answer) => {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleICECandidateFromFirebase = (candidate) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  useEffect(() => {
    // Listen for signaling messages (offer, answer, ICE candidates)
    firebase.database().ref("signaling").on("child_added", async (snapshot) => {
      const message = snapshot.val();
      if (message.offer) {
        await handleOffer(message.offer);
      } else if (message.answer) {
        await handleAnswer(message.answer);
      } else if (message.candidate) {
        await handleICECandidateFromFirebase(message.candidate);
      }
    });

    // Setup ICE candidate event
    pc.onicecandidate = handleICECandidate;

    // Setup WebRTC track event for remote video
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };
  }, [localStream]);

  useEffect(() => {
    if (stream) {
      handleStream(stream);  // Use the stream passed from Debate.jsx
      pushStreamToFirebase();  // Optionally push to Firebase
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      createOffer();  // Create an offer (for peer-to-peer communication)
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="firebase-container">
      <h1>Firebase Video Stream</h1>
      <div className="video-section">
        <video ref={videoRef} autoPlay muted playsInline />
      </div>
    </div>
  );
}

export default Firebase;
