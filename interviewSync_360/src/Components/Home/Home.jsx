import React, { useCallback, useState, useEffect } from "react";
import HomepageBanner from "../../assets/HomepageBanner.jpg";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "../../Context/SocketProvider";

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [email, setEmail] = useState("");
  const [roomid, setRoomid] = useState(uuidv4()); // this is the room id that user will enter to join the room
  const handleEnterRoom = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, roomid });
      navigate(`/room/${roomid}`);
      console.log("roomid : ", roomid);
      console.log("email : ", email);
    },
    [email, socket]
  );

  const handleEnterRoom2 = useCallback( (e) => {
    e.preventDefault();
    socket.emit("room:join", { email, roomid });
    navigate(`/room/${roomid}`);
    console.log("roomid : ", roomid);
    console.log("email : ", email);
  },[email, socket, roomid]);


  const handleJoin = useCallback(
    (data) => {
      const { roomid } = data;
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoin);
    return () => {
      socket.off("room:join", handleJoin);
    };
  }, [socket, handleJoin]);

  return (
    <div className="">
      <nav className="flex items-center justify-between p-4">
        <button className="uppercase font-medium mr-auto">
          InterViewSync_360
        </button>
        <div className="flex item-center">
          <button className="uppercase bg-red-500 hover:translate-y-2 px-4 py-2 m-2 rounded-lg">
            create ➕
          </button>

          <button className="uppercase bg-red-500 px-4 py-2 m-2 rounded-lg hover:translate-y-2">
            Join ➕
          </button>
        </div>
      </nav>

      <main className="flex">
        {/* ---------------------LEFT---------------------- */}
        <div className="w-1/2">
          <div className="flex-col ">
            <h1 className="text-5xl text-left align-center font-bold ">
              Premium Video Interviews
              <br />
              Now For Free
            </h1>
            <form className="flex item-center" onSubmit={handleEnterRoom}>
              <input
                placeholder="Email"
                type="email"
                className="bg-white text-black mx-2 my-6 rounded-lg px-6 py-3 border-2 border-black"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-400 mx-2 my-6 rounded-lg px-6 py-3  border-2 border-black"
              >
                Create Room
              </button>
            </form>
            <br></br>

            <form className="flex item-center" onSubmit={handleEnterRoom2}>
              <input
                placeholder="Email"
                type="email"
                className="bg-white text-black mx-2 my-6 rounded-lg px-6 py-3 border-2 border-black"
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                placeholder="Enter room number"
                type="text"
                className="bg-white text-red mx-2 my-6 rounded-lg px-6 py-3 border-2 border-black"
                onChange={(e) => setRoomid(e.target.value)}
              />

              <button
                type="submit"
                className="bg-blue-400 mx-2 my-6 rounded-lg px-6 py-3  border-2 border-black"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>

        {/* ------------------------RIGHT --------------------- */}
        <div className="w-1/2 bg-blue-300 ">
          <img src={HomepageBanner} alt="Homepage Banner" />
        </div>
      </main>
    </div>
  );
};

export default Home;
