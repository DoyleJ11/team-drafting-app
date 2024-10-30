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

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
}

function splitTeams(arr) {
  const shuffledArray = shuffleArray(arr);
  const mid = Math.ceil(shuffledArray.length / 2); // Ensure team1 has more if odd number of elements
  const team1 = shuffledArray.slice(0, mid);
  const team2 = shuffledArray.slice(mid);

  return { team1, team2 };
}

const alternateMerge = (team1, team2) => {
  const pickOrder = [];
  const maxLength = Math.max(team1.length, team2.length); // Get the length of the larger array

  for (let i = 0; i < maxLength; i++) {
    if (i < team1.length) {
      pickOrder.push(team1[i]); // Add element from team1 if exists
    }
    if (i < team2.length) {
      pickOrder.push(team2[i]); // Add element from team2 if exists
    }
  }

  return pickOrder;
};

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

  socket.on("startDraft", ({ users, settings, lobbyCode }) => {
    console.log("Start Draft received.");
    const lobby = lobbies.get(lobbyCode);
    let team1 = [];
    let team2 = [];

    if (!lobby) {
      console.error(`Lobby with code ${lobbyCode} not found.`);
      socket.emit("error", { message: "Lobby not found." });
      return;
    }

    // Shuffle the user array and then split it into two teams
    if (users.length >= 2) {
      console.log("Splitting teams starting");
      const teams = splitTeams(users); // Proper destructuring here
      team1 = teams.team1;
      team2 = teams.team2;
      console.log("Team 1:", JSON.stringify(team1, null, 2));
      console.log("Team 2:", JSON.stringify(team2, null, 2));
    }

    const pickOrder = alternateMerge(team1, team2);
    console.log("Pick order created:", JSON.stringify(pickOrder, null, 2));

    // Ensure that each user in pickOrder has an 'id' that corresponds to their socket.id
    pickOrder.forEach((user) => {
      console.log(`User in pickOrder: ${user.name}, ID: ${user.id}`);
    });

    lobby.draftState = {
      currentTurn: 0,
      pickOrder: pickOrder,
      userTurn: "",
      userSelections: [],
      settings: settings,
      team1: team1,
      team2: team2,
    };

    console.log(
      "Draft state created:",
      JSON.stringify(lobby.draftState, null, 2)
    );

    io.to(lobby.code).emit("draftStarted", {
      draftState: lobby.draftState,
      users: users,
    });
  });

  socket.on(
    "makeSelection",
    ({ user, championID, username, userID, pickOrder, lobbyCode }) => {
      const lobby = lobbies.get(lobbyCode);
      if (!lobby) {
        console.error("Lobby not found.");
        return;
      }

      // Add the user's selection to the draftState
      lobby.draftState.userSelections.push({
        username,
        userID,
        championID,
        pickOrder,
      });

      // Increment the currentTurn in draftState
      lobby.draftState.currentTurn += 1;

      console.log("Selection Made", lobby.draftState);
      // Emit the update to all clients in the lobby
      io.to(lobby.code).emit("selectionMade", {
        championId: championID,
        draftState: lobby.draftState,
      });
    }
  );
});

const PORT = process.env.PORT || 1991;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
