import React, { useEffect, useRef, useState } from 'react';

function firebase() {

    const servers = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
            {
                urls: "stun:stun1.l.google.com:19302",
            },
        ],
        iceCandidatePoolSize: 10,
    };
    let pc = new RTCPeerConnection(servers);

    let localStream = null; // your webcam  
    let remoteStream = null; // your friend's webca,

    
}