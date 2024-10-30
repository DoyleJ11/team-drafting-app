import React, { useEffect, useState } from "react";
import socket from "./socketService";

const Lobby = ({ lobbyCode, userName, userList, onDraftStart }) => {
  const [users, setUsers] = useState(userList || []);
  const [currentUser, setCurrentUser] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enableBans: false,
    duplicateSelections: false,
    teamSelectionMode: "Randomize",
    timerDuration: 30,
  });

  const handleStartDraft = () => {
    console.log("Emitting start draft with lobbyCode:", lobbyCode);
    socket.emit("startDraft", { users, settings, lobbyCode });
  };

  const toggleSettingsModal = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSubmitSettings = (e) => {
    e.preventDefault();
    console.log("Settings submitted:", settings);
    // You can emit this to the server or use it in other parts of your app
  };

  useEffect(() => {
    socket.on("draftStarted", ({ draftState, users }) => {
      // Navigate to the Draft component and pass the draftState,
      onDraftStart(lobbyCode, draftState, users);
    });
  });

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
      socket.off("newHost");
    };
  }, []);

  useEffect(() => {
    const currentUser = users.find((user) => user.id === socket.id);
    setCurrentUser(currentUser);
  }, [users]);

  return (
    <div>
      {currentUser?.isHost && (
        <>
          <button onClick={toggleSettingsModal}>
            {isOpen ? "Close Settings" : "Open Settings"}
          </button>

          {isOpen && (
            <div className="settings-modal">
              <form onSubmit={handleSubmitSettings}>
                <div>
                  <label>
                    Enable Bans:
                    <select
                      name="enableBans"
                      value={settings.enableBans}
                      onChange={handleSettingsChange}
                    >
                      <option value={false}>False</option>
                      <option value={true}>True</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label>
                    Duplicate Selections:
                    <select
                      name="duplicateSelections"
                      value={settings.duplicateSelections}
                      onChange={handleSettingsChange}
                    >
                      <option value={false}>False</option>
                      <option value={true}>True</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label>
                    Team Selection Mode:
                    <select
                      name="teamSelectionMode"
                      value={settings.teamSelectionMode}
                      onChange={handleSettingsChange}
                    >
                      <option value="Randomize">Randomize</option>
                      <option value="Captains">Captains</option>
                      <option value="Self select">Self select</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label>
                    Timer Duration:
                    <select
                      name="timerDuration"
                      value={settings.timerDuration}
                      onChange={handleSettingsChange}
                    >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={45}>45</option>
                      <option value={60}>60</option>
                    </select>
                  </label>
                </div>

                <button type="submit">Submit Settings</button>
              </form>
            </div>
          )}
        </>
      )}
      <h2>Lobby Code: {lobbyCode}</h2>
      <h3>Users in Lobby:</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} {user.isHost ? " (Host)" : ""}
          </li>
        ))}
      </ul>
      {currentUser?.isHost && (
        <button onClick={handleStartDraft}>Start Draft</button>
      )}
      {/* Additional lobby controls and settings */}
    </div>
  );
};

export default Lobby;
