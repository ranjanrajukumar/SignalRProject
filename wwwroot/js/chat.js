"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .configureLogging(signalR.LogLevel.Error)
    .build();
let localStream;
let peerConnections = {};
let remoteVideo = document.getElementById("remoteVideo");
const targetUserId = generateUniqueUserId();

// Function to generate a random user ID
function generateUniqueUserId() {
    return Math.random().toString(36).substr(2, 9);
}
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} says ${message}`;
});

connection.on("ReceiveVideoOffer", async (senderId, answer) => {
    if (senderId !== storedTargetUserId) {
        // Ignore messages not intended for this tab
        return;
    }
    console.log("Received video offer from: " + senderId);
    var peerConnection = peerConnections[senderId];
    if (!peerConnection) {
        peerConnection = new RTCPeerConnection();
        peerConnections[senderId] = peerConnection;
        console.log("peerCoonection1", peerConnection);
        console.error("Peer connection not found for sender: " + senderId);
        //return;
    }

    try {
        console.log("peerCoonection2", peerConnection);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));

        // Create the answer
        const localDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(localDescription);

        console.log("Local answer set successfully");

        // Send the answer to the remote user
        connection.invoke("SendVideoAnswer", senderId, JSON.stringify(localDescription));
    } catch (error) {
        console.error("Failed to handle video answer: " + error);
    }
});




connection.on("ReceiveVideoAnswer", async (senderId, answerJson) => {
    const storedTargetUserId = localStorage.getItem("targetUserId");
    if (senderId !== storedTargetUserId) {
        // Ignore messages not intended for this tab
        return;
    }
    console.log("Received video answer from: " + senderId);
    const peerConnection = peerConnections[senderId];

    if (!peerConnection) {
        console.error("Peer connection not found for sender: " + senderId);
        return;
    }

    try {
        const answer = JSON.parse(answerJson);
        const remoteDesc = new RTCSessionDescription(answer);

        if (peerConnection.signalingState === "have-remote-offer") {
            await peerConnection.setRemoteDescription(remoteDesc);
            await peerConnection.setLocalDescription({ type: "rollback" });
        } else if (peerConnection.signalingState === "have-local-offer") {
            await peerConnection.setLocalDescription({ type: "rollback" });
            await peerConnection.setRemoteDescription(remoteDesc);
            await peerConnection.setLocalDescription(answer);
        }
    } catch (error) {
        console.error("Failed to set remote description:", error);
    }
});





connection.on("ReceiveNewICECandidate", async (senderId, candidate) => {
    const storedTargetUserId = localStorage.getItem("targetUserId");
    if (senderId !== storedTargetUserId) {
        // Ignore messages not intended for this tab
        return;
    }

    console.log("Received new ICE candidate from: " + senderId);
    const peerConnection = peerConnections[storedTargetUserId];

    if (!peerConnection) {
        console.error("Peer connection not found for sender: " + senderId);
        return;
    }

    await peerConnection.addIceCandidate(candidate);
});

// Enable SignalR logging
//signalR.LogLevel = {
//    trace: false,
//    debug: false,
//    info: false,
//    warning: false,
//    error: true
//};
//signalR.LogLevel = signalR.HttpTransportType.LongPolling;
//signalR.LoggerFactory = new signalR.ConsoleLoggerFactory();

connection.start().then(function () {
    console.log("SignalR connection started.");
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    console.error("SignalR connection error: " + err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    connection.invoke("SendMessage", user, message).catch(function (err) {
        console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("startVideoChatButton").addEventListener("click", async function () {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        let localVideo = document.getElementById("localVideo");
        localVideo.srcObject = localStream;
        localStorage.setItem("targetUserId", targetUserId);
        
        const offer = await createOffer();

        // Create a new video element for the remote user
        const remoteVideoElement = document.createElement("video");
        remoteVideoElement.id = "remoteVideo_" + targetUserId;
        remoteVideoElement.autoplay = true;

        //// Append the remote video element to the container
        const remoteVideosContainer = document.getElementById("remoteVideosContainer");
        remoteVideosContainer.appendChild(remoteVideoElement);
        //remoteVideoElement.srcObject = localStream;
        // Create a new RTCPeerConnection for this tab
        const peerConnection = new RTCPeerConnection();
        peerConnections[targetUserId] = peerConnection;
        console.log("peerConnection", peerConnections);
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            remoteVideoElement.srcObject = remoteStream;
        };
        await connection.invoke("StartVideoChat", targetUserId, JSON.stringify(offer));
    } catch (err) {
        console.error(err.toString());
    }
});

async function createOffer() {
    const peerConnection = new RTCPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
}
document.getElementById("endVideoChatButton").addEventListener("click", function () {
    // End video chat
    console.log("Video chat ended.");
    // ...
});
