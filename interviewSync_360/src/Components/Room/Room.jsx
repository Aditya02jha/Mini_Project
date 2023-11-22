import React, { useCallback , useEffect , useState } from "react";
import { useNavigate , useParams } from "react-router-dom";
import { useSocket } from "../../Context/SocketProvider";
import peer from "./Peer.js";

// import { send } from "vite";  

const Room = () => {
  const Navigate = useNavigate();
  const { id } = useParams();
  // console.log(id);

  const handleEnterEditor = () => {
    Navigate("/editor");
  };

  const socket = useSocket();
  const storedSocketId = localStorage.getItem("remoteSocketId");
  
  const [remoteSocketId, setRemoteSocketId] = useState(storedSocketId || null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();


  const handleUserJoined = useCallback(async({ email, id }) => {
    console.log(`Email ${email} joined room`);
    console.log(`Socket ${id} joined room`);
    //localStorage is used to store data in the browser
    localStorage.setItem("socketId", id);
    setRemoteSocketId(id);
  }, []);


  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    // console.log("Calling User", remoteSocketId, offer);
    socket.emit("user:call", { to : remoteSocketId,offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);


  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      
      console.log("Incoming Call from " , from )
      setRemoteSocketId(from);
      console.log("Incoming Call from " , remoteSocketId )
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


  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);


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


  return (
    <div>
      <nav className="flex justify-between">
        <button className="uppercase font-medium px-4 py-2 m-2 ">
          InterViewSync_360
        </button>
        <button
          className="uppercase bg-blue-500 px-4 py-2 m-2 rounded-lg hover:translate-y-2  "
          onClick={handleEnterEditor}
        >
          Editor
        </button>
      </nav>
      <h1>{remoteSocketId ? ("socket connected"): "no one is here!" }</h1>
      {myStream && <button onClick={sendStreams} >Join 🎥</button>}
      {remoteSocketId && <button onClick={handleCallUser}>Call 📞</button>}
      <div className="flex justify-center align-middle items-center gap-3 bg-gray-200 w-full h-full ">
        <div className="  w-1/2 rounded-lg ">
          {myStream && <video
            className=" shadow-xl shadow-black border-spacing-2 border-black w-full rounded-lg m-3 p-4 "
            id="myvideo"
            ref={(ref) => {
              if (ref) {
                ref.srcObject = myStream;
              }
            }}
            autoPlay
          ></video>}
        </div>
        <div className=" w-1/2 ">
          {remoteStream && <video
            className=" shadow-xl shadow-black  border-spacing-2 border-black w-full rounded-lg m-3 p-4 "
            id="remotevideo"
            ref={(ref) => {
              if (ref) {
                ref.srcObject = remoteStream;
              }
            }}
            autoPlay
          ></video>}
        </div>
      </div>
    </div>
  );
};

export default Room;
