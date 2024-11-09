import { useEffect, useRef, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCx643Qb8ZSC9zwOps_cUVrGYvfxCIfaeQ",
  authDomain: "hackthechange2024.firebaseapp.com",
  projectId: "hackthechange2024",
  storageBucket: "hackthechange2024.firebasestorage.app",
  messagingSenderId: "847642885284",
  appId: "1:847642885284:web:b659766d5bf3870d9dfa31",
  measurementId: "G-7MQ2RHQ5F8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const servers = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

let pc = new RTCPeerConnection();

function FirebaseStream({ stream }) {
  const [localStream, setLocalStream] = useState(null); // My WebCam!
  const [remoteStream, setRemoteStream] = useState(null); // Your WebCam!
}

export default FirebaseStream;