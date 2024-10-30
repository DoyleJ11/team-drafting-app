// src/App.jsx

import React, { useEffect, useState } from "react";
import socket from "./socketService";
import LobbyCreation from "./LobbyCreation";
import LobbyJoin from "./LobbyJoin";
import Lobby from "./Lobby";
import Draft from "./Draft";
import "./css/index.css";

const App = () => {
  const [currentView, setCurrentView] = useState("home");
  const [lobbyCode, setLobbyCode] = useState("");
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [draftState, setDraftState] = useState({});

  const navCreateLobby = () => {
    console.log("Navigating to Create Lobby");
    setCurrentView("createLobby");
  };

  const navJoinLobby = () => {
    console.log("Navigating to Join Lobby");
    setCurrentView("joinLobby");
  };

  const handleLobbyCreated = (lobbyCode, users, userName) => {
    setLobbyCode(lobbyCode);
    setUserName(userName);
    setUsers(users);
    setCurrentView("lobby");
  };

  const handleLobbyJoined = (lobbyCode, users, userName) => {
    setLobbyCode(lobbyCode);
    setUsers(users);
    setUserName(userName);
    setCurrentView("lobby");
  };

  const handleDraftStarted = (lobbyCode, draftState, users) => {
    setLobbyCode(lobbyCode);
    setUsers(users);
    setDraftState(draftState);
    setCurrentView("draft");
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Clean up on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div>
      {currentView == "home" && (
        <div>
          <h1>Hello, Electron and React!</h1>
          <button onClick={navCreateLobby}>Create Lobby</button>
          <button onClick={navJoinLobby}>Join Lobby</button>
        </div>
      )}

      {currentView == "createLobby" && (
        <LobbyCreation onLobbyCreated={handleLobbyCreated} />
      )}
      {currentView == "joinLobby" && (
        <LobbyJoin onLobbyJoined={handleLobbyJoined} />
      )}
      {currentView == "lobby" && (
        <Lobby
          lobbyCode={lobbyCode}
          userName={userName}
          userList={users}
          onDraftStart={handleDraftStarted}
        />
      )}
      {currentView == "draft" && (
        <Draft lobbyCode={lobbyCode} draftState={draftState} users={users} />
      )}
    </div>
  );
};

export default App;
