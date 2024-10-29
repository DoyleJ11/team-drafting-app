import React, { useState, useEffect } from "react";
import socket from "./socketService";

const LobbyJoin = (props) => {
  const [userName, setUserName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");

  const handleJoinLobby = () => {
    socket.emit("joinLobby", { lobbyCode, userName });
  };

  useEffect(() => {
    socket.on("lobbyJoined", ({ lobbyCode, users }) => {
      // Navigate to the Lobby component and pass the lobbyCode and users
      props.onLobbyJoined(lobbyCode, users, userName);
    });

    socket.on("error", ({ message }) => {
      // Display error message to the user
      alert(message);
    });

    return () => {
      socket.off("lobbyJoined");
      socket.off("error");
    };
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="Enter lobby code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={handleJoinLobby}>Join Lobby</button>
    </div>
  );
};

export default LobbyJoin;
