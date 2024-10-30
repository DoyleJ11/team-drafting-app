import React, { useEffect, useState } from "react";
import "./css/SelectionGrid.css"; // Import the CSS file for styling
import socket from "./socketService";

const SelectionGrid = ({ onChampionSelect, disabledChampions }) => {
  const [champions, setChampions] = useState([]);
  const [selectedChampion, setSelectedChampion] = useState(null);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const response = await fetch(
          "https://ddragon.leagueoflegends.com/cdn/14.21.1/data/en_US/champion.json"
        );
        const data = await response.json();
        setChampions(Object.values(data.data));
      } catch (error) {
        console.error("Error fetching champions:", error);
      }
    };

    fetchChampions();
  }, []);

  // Select the champion and notify the Draft component
  const selectChamp = (champion) => {
    console.log("Champion selected:", champion);
    setSelectedChampion(champion);
    onChampionSelect(champion); // Notify parent component
  };

  return (
    <div className="selection-grid-container">
      <div className="selection-grid">
        {champions.map((champion) => (
          <button
            className="champion-button"
            key={champion.id}
            onClick={() => selectChamp(champion)}
            disabled={disabledChampions.includes(champion.id)} // Disable selected champions
          >
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${champion.image.full}`}
              alt={champion.name}
              className="champion-image"
            />
            <span className="champion-name">{champion.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectionGrid;
