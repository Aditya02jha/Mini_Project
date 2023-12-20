import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../Context/SocketProvider";
import peer from "./Peer.js";
import Collab_editor from "./Collab_editor.jsx";

// import { send } from "vite";

const Room = () => {
  const Navigate = useNavigate();
  const { id } = useParams();
  const handleEnterEditor = () => {
    Navigate("/editor");
  };

  const socket = useSocket();
  const storedSocketId = localStorage.getItem("remoteSocketId");

  const [remoteSocketId, setRemoteSocketId] = useState(storedSocketId || null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);

  // -----------------------------------------------------x-x-x-x-x-x USER-JOINED HANDLER -x-x-x-x-x-x-x-x-x-x---------------------------------------------

  const handleUserJoined = useCallback(async ({ email, id }) => {
    console.log(`Email ${email} joined room`);
    console.log(`Socket ${id} joined room`);
    //localStorage is used to store data in the browser
    localStorage.setItem("socketId", id);
    setRemoteSocketId(id);
  }, []);

  // -----------------------------------------------------x-x-x-xx-x-x-x-x-x-x-x-x-x-x-x-x-x-x---------------------------------------------

  const handleCallUser = useCallback(async () => {
    const offer = await peer.getOffer();
    // console.log("Calling User", remoteSocketId, offer);
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  // -----------------------------------------------------x-x-x-xx-x-x-x- INCOMING CALL  x-x-x-x-x-x-x-x---------------------------------------------

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      console.log("Incoming Call from ", from);
      setRemoteSocketId(from);
      console.log("Incoming Call from ", remoteSocketId);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // -----------------------------------------------------x-x-x-xx-x-x-x- Call ACCEPTED -x-x-x-x-x-x-x-x-x-x---------------------------------------------

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  // -----------------------------------------------------x-x-x-xx-x-x- NEGO Handler -x-x-x-x-x-x-x-x-x---------------------------------------------

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // -----------------------------------------------------x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x---------------------------------------------

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  // -----------------------------------------------------x-x-x-xx-x-x-x Socket USEEFFECT x-x-x-x-x-x-x-x-x---------------------------------------------

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("icomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);
  // -----------------------------------------------------x-x-x-xx-x-x-  USE-EFFECT x-x-x-x-x-x-x-x-x-x-x---------------------------------------------
  useEffect(() => {
    const setupMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        setMyStream(stream);
      } catch (error) {
        // Handle errors here
        console.error("Error accessing media devices:", error);
      }
    };

    setupMediaStream();
  }, [socket]);

  // -----------------------------------------------------x-x-x-xx RETURN STATEMENT-x-x-x-x-x-x-x-x-x---------------------------------------------

  // Mute / Unmute function
  const toggleMic = () => {
    if (myStream) {
      const enabled = myStream.getAudioTracks()[0].enabled;
      if (enabled) {
        myStream.getAudioTracks()[0].enabled = false;
        setMic(false);
      } else {
        myStream.getAudioTracks()[0].enabled = true;
        setMic(true);
      }
    }
  };

  // Video on / off function
  const toggleCamera = () => {
    if (myStream) {
      const enabled = myStream.getVideoTracks()[0].enabled;
      if (enabled) {
        myStream.getVideoTracks()[0].enabled = false;
        setCamera(false);
      } else {
        myStream.getVideoTracks()[0].enabled = true;
        setCamera(true);
      }
    }
  };

  const copyRoomId = ()=>{

    const roomid = id;
    navigator.clipboard.writeText(roomid);
    alert("RoomId Copied to Clipboard");
  }

  

  return (
    <div>
      <nav className="flex justify-between">
        <button className="uppercase font-medium px-4 py-2 m-2 ">
          InterViewSync_360
        </button>
      </nav>
      <div className="flex h-screen bg-dark">
        {/* Video Section */}
        <div className="flex flex-col items-center w-1/2 bg-blue-900 p-4">
          <h1 className="text-white text-lg font-bold mb-4">Video Section</h1>
          <div className="w-full rounded-lg mb-4 overflow-hidden">
            {myStream && (
              <video
                className="w-full h-full shadow-xl shadow-black border-spacing-2 border-black"
                id="myvideo"
                ref={(ref) => {
                  if (ref) {
                    ref.srcObject = myStream;
                  }
                }}
                autoPlay
              ></video>
            )}
          </div>
          <div className="w-full rounded-lg overflow-hidden">
            {remoteStream && (
              <video
                className="w-full h-full shadow-xl shadow-black border-spacing-2 border-black"
                id="remotevideo"
                ref={(ref) => {
                  if (ref) {
                    ref.srcObject = remoteStream;
                  }
                }}
                autoPlay
              ></video>
            )}
          </div>
          {/* Mute/Unmute and Video On/Off buttons */}
          <button
            className={`uppercase ${
              mic ? "bg-blue-500" : "bg-red-500"
            } px-4 py-2 m-2 rounded-lg hover:translate-y-2`}
            onClick={toggleMic}
          >
            Mute 🔇
          </button>
          <button
            className={`uppercase ${
              camera ? "bg-blue-500" : "bg-red-500"
            } px-4 py-2 m-2 rounded-lg hover:translate-y-2`}
            onClick={toggleCamera}
          >
            Video 📹
          </button>

          {myStream && (
            <button
              onClick={copyRoomId}
              className="bg-blue-500
             px-4 py-2 m-2 rounded-lg hover:translate-y-2"
            >
              RoomID
            </button>
          )}
        </div>

        {/* Editor Section */}
        <div className="w-1/2 p-4">
          <h1 className="text-white text-lg font-bold mb-4">Editor Section</h1>
          {remoteSocketId && (
            <Collab_editor socket={socket} remoteSocketId={remoteSocketId} />
          )}
          <h1>{remoteSocketId ? "socket connected" : "no one is here!"}</h1>
          {/* Join and Call buttons */}
          {myStream && <button onClick={sendStreams}>Join 🎥</button>}
          {remoteSocketId && <button onClick={handleCallUser}>Call 📞</button>}

          {/* ... (existing code) */}
          {/* Mute/Unmute and Video On/Off buttons */}

          {/* ... (existing code) */}
        </div>
      </div>
    </div>
  );
};

export default Room;
