// TeamSlots.jsx

import React from "react";
import "./css/TeamSlots.css";

const TeamSlots = ({ team, draftState, socketId, teamName }) => {
  return (
    <div className="team-container">
      <h3>{teamName}</h3>
      {team.map((user, index) => {
        const isCurrentTurn =
          draftState.pickOrder[draftState.currentTurn]?.id === user.id;
        const isCurrentUser = user.id === socketId;

        // Find the user's selection if they've made one
        const userSelection = draftState.userSelections.find(
          (selection) => selection.userID === user.id
        );

        // Determine class names
        let slotClassName = "slot";
        if (isCurrentTurn) slotClassName += " current-turn";
        if (isCurrentUser && isCurrentTurn) slotClassName += " my-turn";

        return (
          <div key={user.id} className={slotClassName}>
            <div className="user-name">{user.name}</div>
            {userSelection ? (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${userSelection.championID}.png`}
                alt={userSelection.championID}
                className="champion-icon"
              />
            ) : (
              <div className="placeholder">Waiting...</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamSlots;
