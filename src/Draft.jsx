import React, { useEffect, useState } from "react";
import SelectionGrid from "./SelectionGrid";
import TeamSlots from "./TeamSlots";
import socket from "./socketService";
import "./css/Draft.css";

const Draft = ({ lobbyCode, draftState, users }) => {
  const [userTurn, setUserTurn] = useState(null); // Current user turn in the draft
  const [selectedChampion, setSelectedChampion] = useState(null); // Selected champion by the user
  const [disabledChampions, setDisabledChampions] = useState([]); // Disabled champion ids
  const [localDraftState, setLocalDraftState] = useState(draftState); // Local draft state

  const team1 = draftState.team1 || []; // Ensure team data is available in draftState
  const team2 = draftState.team2 || [];

  // Emit event to lock in the champion selection
  const handleLockIn = () => {
    const currentUser = localDraftState.pickOrder[localDraftState.currentTurn];
    console.log("Locking in for user:", currentUser);
    console.log("Selected champion:", selectedChampion);

    // Emit event to server
    socket.emit("makeSelection", {
      user: currentUser,
      championID: selectedChampion.id,
      username: currentUser.name,
      userID: currentUser.id,
      pickOrder: localDraftState.currentTurn,
      lobbyCode: lobbyCode,
    });

    // Disable the selected champion globally
    setDisabledChampions((prev) => [...prev, selectedChampion.id]);

    // Clear the selected champion
    setSelectedChampion(null);
  };

  // Listen for selection updates from the server
  useEffect(() => {
    socket.on("selectionMade", ({ championId, draftState }) => {
      // Update the draftState and disabled champions
      setLocalDraftState(draftState);
      setDisabledChampions((prevDisabled) => [...prevDisabled, championId]);
    });

    return () => {
      socket.off("selectionMade"); // Cleanup the listener
    };
  }, []);

  // Determine if it is the current user's turn to pick
  useEffect(() => {
    const findTurn = localDraftState.pickOrder.findIndex(
      (user) => user.id === socket.id
    );
    console.log("Current user's index in pickOrder:", findTurn);
    console.log("Current draftState.currentTurn:", localDraftState.currentTurn);
    setUserTurn(findTurn);
  }, [localDraftState]);

  // Function to handle champion selection
  const handleChampionSelect = (champion) => {
    setSelectedChampion(champion); // Set the selected champion
  };

  // Display whose turn it is
  const currentPickingUser =
    localDraftState.pickOrder[localDraftState.currentTurn]?.name || "Unknown";

  return (
    <div className="draft-container">
      {/* Team 1 Slots */}
      <TeamSlots
        team={team1}
        draftState={localDraftState}
        socketId={socket.id}
        teamName="Team 1"
      />

      {/* Center Content */}
      <div className="center-content">
        <h2>It's {currentPickingUser}'s turn to pick!</h2>
        <SelectionGrid
          onChampionSelect={handleChampionSelect}
          disabledChampions={disabledChampions}
        />
        {/* Lock In button */}
        {userTurn === localDraftState.currentTurn && (
          <button
            className="lock-in-button"
            onClick={handleLockIn}
            disabled={!selectedChampion} // Disable if no champion is selected
          >
            Lock In
          </button>
        )}
      </div>

      {/* Team 2 Slots */}
      <TeamSlots
        team={team2}
        draftState={localDraftState}
        socketId={socket.id}
        teamName="Team 2"
      />
    </div>
  );
};

export default Draft;
