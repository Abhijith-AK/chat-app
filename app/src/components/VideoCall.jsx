import React, { useEffect, useRef, useState } from "react";
import { ImPhoneHangUp } from "react-icons/im";
import { socket } from "../App";

const VideoCall = ({ setVideoCallTrigger, selectedUser, currentUser }) => {
    const [callAccepted, setCallAccepted] = useState(false);
    const [stream, setStream] = useState(null);
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const peerConnection = useRef(new RTCPeerConnection());
    useEffect(() => {
        const initStream = async () => {
            try {
                const currentStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setStream(currentStream);
                if (myVideo.current) myVideo.current.srcObject = currentStream;

                currentStream.getTracks().forEach(track => peerConnection.current.addTrack(track, currentStream));
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };

        initStream();

        // ✅ Ensure peerConnection is only initialized once
        if (!peerConnection.current) {
            peerConnection.current = new RTCPeerConnection();
        }

        peerConnection.current.ontrack = (event) => {
            console.log("📡 Received remote track event:", event.streams);
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
                console.log("✅ Remote video set successfully.");
            } else {
                console.warn("⚠️ userVideo is null, retrying...");
                setTimeout(() => {
                    if (userVideo.current) {
                        userVideo.current.srcObject = event.streams[0];
                        console.log("✅ Remote video set successfully after retry.");
                    }
                }, 500);
            }
        };

        handleIncomingCall()

        // code to display callee video feed in userVideo
        socket.on("call-accepted", async (signal) => {
            console.log("📩 Received call-accepted signal:", signal);
            console.log("🔍 Current signaling state:", peerConnection.current.signalingState);

            try {
                if (peerConnection.current.signalingState === "have-local-offer") {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                    setCallAccepted(true);
                    console.log("✅ Remote description (answer) set successfully.");

                    // ✅ Ensure `ontrack` is triggered for the remote stream
                    peerConnection.current.ontrack = (event) => {
                        console.log("📡 Received remote track event (callee's video):", event.streams);

                        if (userVideo.current) {
                            userVideo.current.srcObject = event.streams[0];
                            console.log("✅ Callee's video set successfully.");
                        } else {
                            console.warn("⚠️ userVideo is null, retrying...");
                            setTimeout(() => {
                                if (userVideo.current) {
                                    userVideo.current.srcObject = event.streams[0];
                                    console.log("✅ Callee's video set successfully after retry.");
                                }
                            }, 500);
                        }
                    };
                } else {
                    console.warn("⚠️ Skipping setRemoteDescription: Already in stable state.");
                }
            } catch (error) {
                console.error("❌ Error setting remote description:", error);
            }
        });


        socket.on("ice-candidate", async (candidate) => {
            if (peerConnection.current.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log("✅ ICE Candidate added successfully.");
                } catch (error) {
                    console.error("❌ Error adding ICE candidate:", error);
                }
            } else {
                console.warn("⚠️ ICE Candidate received before remote description was set, retrying...");
                setTimeout(async () => {
                    if (peerConnection.current.remoteDescription) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                        console.log("✅ ICE Candidate added successfully after retry.");
                    }
                }, 500);
            }
        });

        return () => {
            if (peerConnection.current) {
                console.log("🔄 Cleaning up peer connection...");
                peerConnection.current.ontrack = null;
                peerConnection.current.onicecandidate = null;

                // Do not close peerConnection here, only remove event listeners
                // Closing will be handled on call end
            }
            socket.off("call-accepted");
            socket.off("ice-candidate");
        };

    }, []);

    const handleIncomingCall = async (signal, from) => {

        if (!videoCallNotifier) return;

        try {
            const peerConnection = new RTCPeerConnection();

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", event.candidate, videoCallNotifier.from);
                }
            };

            await peerConnection.setRemoteDescription(new RTCSessionDescription(videoCallNotifier.signal));

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit("answer", { answer, to: videoCallNotifier.from });



            setVideoCallTrigger(true);
        } catch (error) {
            console.error("Error accepting call:", error);
        }

        try {
            console.log("📩 Incoming call from:", from);
            console.log("🛠️ WebRTC state before handling call:", peerConnection.current.signalingState);

            // ✅ Validate `signal` before using it
            if (!signal || !signal.sdp || !signal.type) {
                console.error("❌ Invalid signal received:", signal);
                return;
            }

            // ✅ Ensure we receive the caller's video when tracks are added
            peerConnection.current.ontrack = (event) => {
                console.log("📡 Received remote track event (Caller’s Video):", event.streams);
                if (userVideo.current) {
                    userVideo.current.srcObject = event.streams[0];
                    console.log("✅ Caller's video set successfully.");
                } else {
                    console.warn("⚠️ userVideo is null, retrying...");
                    setTimeout(() => {
                        if (userVideo.current) {
                            userVideo.current.srcObject = event.streams[0];
                            console.log("✅ Caller's video set successfully after retry.");
                        }
                    }, 500);
                }
            };

            // ✅ Set the remote description (caller’s offer)
            if (peerConnection.current.signalingState === "stable") {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                console.log("✅ Remote description (offer) set successfully.");
            } else {
                console.warn("⚠️ Skipping setRemoteDescription: Incorrect state.");
            }

            // ✅ Get callee's media
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setStream(stream);

            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }

            // ✅ Add callee’s tracks BEFORE creating an answer
            stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

            console.log("🎥 Callee's local tracks added.");

            // ✅ Create and send an answer
            if (peerConnection.current.signalingState === "have-remote-offer") {
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                console.log("📨 Sending answer:", answer);
                socket.emit("answer", { answer, to: from });
            } else {
                console.warn("⚠️ Skipping createAnswer: Incorrect signaling state.");
            }

        } catch (error) {
            console.error("❌ Error handling incoming call:", error);
        }
    };


    console.log("🛠️ WebRTC state before setting remote description:", peerConnection.current.signalingState);
    console.log("🛠️ Remote description before setting:", peerConnection.current.remoteDescription);

    const startCall = async () => {
        if (!stream) {
            console.error("Stream not initialized");
            return;
        }

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", event.candidate, selectedUser._id);
            }
        };

        // ✅ Ensure tracks are added only once
        if (peerConnection.current.getSenders().length === 0) {
            stream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, stream);
            });
            console.log("🎥 Local tracks added to peer connection.");
        } else {
            console.warn("⚠️ Tracks already added, skipping duplicate addition.");
        }

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("start-call", { offer, to: selectedUser._id, from: currentUser._id });
    };


    const leaveCall = () => {
        stream.getTracks().forEach(track => track.stop());
        setVideoCallTrigger(false);
        socket.emit("end-call", { to: selectedUser._id, from: currentUser._id });
    };


    console.log("👀 Checking userVideo element:", userVideo.current);

    return (
        <>
            <button id="startCallBtn" hidden onClick={startCall}></button>
            <div className="flex flex-col md:flex-row items-center w-full justify-evenly">
                <div className="w-[40%] h-[40vh] rounded bg-black flex items-center justify-center">
                    <video ref={myVideo} autoPlay muted className="w-full h-full rounded" />
                </div>
                <div className="w-[40%] h-[40vh] rounded bg-black flex items-center justify-center">
                    {callAccepted ? (
                        <video ref={userVideo} autoPlay className="w-full h-full rounded" />
                    ) : (
                        <p className="text-white">Waiting for User...</p>
                    )}
                </div>
            </div>

            <div className="flex space-x-4 mt-6">
                <button onClick={leaveCall} className="flex gap-1 px-4 py-2 bg-red-500 text-white rounded-lg">
                    End Call <ImPhoneHangUp className="ms-2" size={25} />
                </button>
            </div>
        </>
    );
};

export default VideoCall;