import { useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, getDoc, addDoc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";

import "./App.css";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCx643Qb8ZSC9zwOps_cUVrGYvfxCIfaeQ",
  authDomain: "hackthechange2024.firebaseapp.com",
  projectId: "hackthechange2024",
  storageBucket: "hackthechange2024.firebasestorage.app",
  messagingSenderId: "847642885284",
  appId: "1:847642885284:web:b659766d5bf3870d9dfa31",
  measurementId: "G-7MQ2RHQ5F8",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Initialize WebRTC
const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="app">
      {currentPage === "home" ? (
        <Menu
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          setPage={setCurrentPage}
        />
      ) : (
        <Videos
          mode={currentPage}
          callId={joinCode}
          setPage={setCurrentPage}
        />
      )}
    </div>
  );
}

function Menu({ joinCode, setJoinCode, setPage }) {
  return (
    <div className="home">
      <div className="create box">
        <button onClick={() => setPage("create")}>Create Call</button>
      </div>

      <div className="answer box">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Join with code"
        />
        <button onClick={() => setPage("join")}>Answer</button>
      </div>
    </div>
  );
}

function Videos({ mode, callId, setPage }) {
  const [webcamActive, setWebcamActive] = useState(false);
  const [roomId, setRoomId] = useState(callId);

  const localRef = useRef();
  const remoteRef = useRef();

  const setupSources = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const remoteStream = new MediaStream();

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        // Add remote track to remote stream
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      localRef.current.srcObject = localStream;
      remoteRef.current.srcObject = remoteStream;

      setWebcamActive(true);

      if (mode === "create") {
        const callDocRef = doc(collection(firestore, "calls"));
        const offerCandidates = collection(callDocRef, "offerCandidates");
        const answerCandidates = collection(callDocRef, "answerCandidates");

        setRoomId(callDocRef.id);

        // Send ICE candidates to Firestore for offer side
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await addDoc(offerCandidates, event.candidate.toJSON());
          }
        };

        // Create and send offer
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        };

        await setDoc(callDocRef, { offer });

        // Listen for answer from answer side
        const unsubscribe = onSnapshot(callDocRef, (snapshot) => {
          const data = snapshot.data();
          if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
          }
        });

        // Listen for ICE candidates from answer side
        const unsubscribeAnswerCandidates = onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.addIceCandidate(candidate);
            }
          });
        });

      } else if (mode === "join") {
        const callDocRef = doc(firestore, "calls", callId);
        const offerCandidates = collection(callDocRef, "offerCandidates");
        const answerCandidates = collection(callDocRef, "answerCandidates");

        // Send ICE candidates to Firestore for answer side
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await addDoc(answerCandidates, event.candidate.toJSON());
          }
        };

        const callData = (await getDoc(callDocRef)).data();

        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        // Create and send answer
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await updateDoc(callDocRef, { answer });

        // Listen for ICE candidates from offer side
        const unsubscribeOfferCandidates = onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              let data = change.doc.data();
              pc.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
      }

      pc.onconnectionstatechange = (event) => {
        if (pc.connectionState === "disconnected") {
          hangUp();
        }
      };
    } catch (error) {
      console.error("Error during setupSources:", error);
    }
  };

  const hangUp = async () => {
    pc.close();

    if (roomId) {
      let roomRef = doc(firestore, "calls", roomId);
      await roomRef
        .collection("answerCandidates")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });
      await roomRef
        .collection("offerCandidates")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      await deleteDoc(roomRef);
    }

    window.location.reload();
  };

  return (
    <div className="videos">
      <video
        ref={localRef}
        autoPlay
        playsInline
        className="local"
        muted
      />
      <video ref={remoteRef} autoPlay playsInline className="remote" />

      <div className="buttonsContainer">
        <button
          onClick={hangUp}
          disabled={!webcamActive}
          className="hangup button"
        >
          Hang Up
        </button>
        <div tabIndex={0} role="button" className="more button">
          <div className="popover">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId);
              }}
            >
              Copy joining code
            </button>
          </div>
        </div>
      </div>

      {!webcamActive && (
        <div className="modalContainer">
          <div className="modal">
            <h3>
              Turn on your camera and microphone and start the call
            </h3>
            <div className="container">
              <button
                onClick={() => setPage("home")}
                className="secondary"
              >
                Cancel
              </button>
              <button onClick={setupSources}>Start</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
