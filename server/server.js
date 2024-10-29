// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const { nanoid } = require("nanoid");
const lobbies = new Map();

// Middleware (if needed)
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Socket.io setup
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("createLobby", (data) => {
    //Generate new lobby code
    const lobbyCode = nanoid(5);

    //Create lobby empty lobby object except for lobby code
    const lobby = {
      code: lobbyCode,
      users: [],
      settings: {},
      draftState: {},
    };

    //Add lobby instance to lobbies map with key of lobbyCode
    lobbies.set(lobbyCode, lobby);

    //Push the host to the users array
    lobby.users.push({
      id: socket.id,
      name: data.userName,
      isHost: true,
    });

    //Join socket.io room with same name as lobby code
    socket.join(lobbyCode);

    socket.emit("lobbyCreated", { lobbyCode, users: lobby.users });
  });

  socket.on("joinLobby", ({ lobbyCode, userName }) => {
    //Search for lobby
    const lobby = lobbies.get(lobbyCode);

    //Make sure lobby exists.
    if (lobby) {
      lobby.users.push({
        id: socket.id,
        name: userName,
        isHost: false,
      });

      //Join socket.io room with same name as lobby code
      socket.join(lobbyCode);

      // Notify client that lobby was joined with updated user list
      socket.emit("lobbyJoined", { lobbyCode, users: lobby.users });

      // Notify all clients in lobby that a new user has joined with updated user list
      socket.to(lobbyCode).emit("userJoined", { userName, users: lobby.users });
    } else {
      socket.emit("error", { message: "Lobby not found." });
    }
  });

  // Handle events here
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    lobbies.forEach((lobby) => {
      const userIndex = lobby.users.findIndex((user) => user.id === socket.id);
      if (userIndex !== -1) {
        const [removedUser] = lobby.users.splice(userIndex, 1);

        // Notify others in the lobby about user disconnection
        io.to(lobby.code).emit("userLeft", {
          userName: removedUser.name,
          users: lobby.users,
        });

        // If there are no players in the lobby, close it.
        if (lobby.users.length === 0) {
          lobbies.delete(lobby.code);
        } else if (removedUser.isHost) {
          // If host leaves, assign a new host.
          newHost = lobby.users[0];
          newHost.isHost = true;
          io.to(lobby.code).emit("newHost", {
            userName: newHost.name,
            users: lobby.users,
          });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 1991;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
