// src/App.jsx

import React, { useEffect } from "react";
import socket from "./socketService";

const App = () => {
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
      <h1>Hello, Electron and React!</h1>
    </div>
  );
};

export default App;
