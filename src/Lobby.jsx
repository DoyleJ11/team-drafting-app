import React, { useEffect, useState } from "react";
import socket from "./socketService";

const Lobby = ({ lobbyCode, userName, userList }) => {
  const [users, setUsers] = useState(userList || []);

  useEffect(() => {
    socket.on("userJoined", ({ userName, users }) => {
      setUsers(users);
    });

    return () => {
      socket.off("userJoined");
    };
  }, []);

  useEffect(() => {
    socket.on("userLeft", ({ userName, users }) => {
      setUsers(users);
    });

    socket.on("newHost", ({ userName, users }) => {
      setUsers(users);
    });

    return () => {
      socket.off("userLeft");
    };
  }, []);
  return (
    <div>
      <h2>Lobby Code: {lobbyCode}</h2>
      <h3>Users in Lobby:</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} {user.isHost ? " (Host)" : ""}
          </li>
        ))}
      </ul>
      {/* Additional lobby controls and settings */}
    </div>
  );
};

export default Lobby;
