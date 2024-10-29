import React, { useState, useEffect } from "react";
import socket from "./socketService";

const LobbyCreation = (props) => {
  const [userName, setUserName] = useState("");

  const handleCreateLobby = () => {
    socket.emit("createLobby", { userName });
  };

  useEffect(() => {
    socket.on("lobbyCreated", ({ lobbyCode, users }) => {
      props.onLobbyCreated(lobbyCode, users, userName);
    });

    return () => {
      socket.off("lobbyCreated");
    };
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={handleCreateLobby}>Create Lobby</button>
    </div>
  );
};

export default LobbyCreation;
