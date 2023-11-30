const {Server} = require("socket.io");

const io = new Server(3000, {
    cors:true,
});

const  emailtosocket = new Map();
const sockettoemail = new Map();

//on connection map email to socket id and then emmit message in room and socket that user joined
//we are getting data from client that is email and room
io.on("connection" , (socket)=>{
    console.log("socket Connected : ",socket.id);
    
      socket.on("room:join", (data)=>{
        const {email , room} = data;
        emailtosocket.set(email,socket.id);
        sockettoemail.set(socket.id,email);
        io.to(room).emit("user:joined",{email , id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join" , data );
      })


      socket.on("user:call" , ({to , offer}) => {
        console.log("user:call" + to  +"  "+ socket.id + "  "+ offer);
          io.to(to).emit("icomming:call" , {from :(socket.id) , offer}); // here i can add the socket id instead of email    
        console.log("user:call from :" + socket.id  +"to : "+ to + "  "+ offer);
      })

      socket.on("call:accepted", ({ to, ans }) => {
          io.to(to).emit("call:accepted", { from: socket.id, ans });
      });

      socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
      
      socket.on("codeChange" , ({to , code})=>{
        socket.to(to).emit("codeChange" , {code});
        console.log(code);
      })
      
      });
});
