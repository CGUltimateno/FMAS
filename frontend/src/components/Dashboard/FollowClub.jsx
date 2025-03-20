import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/Dashboard/FollowClub.scss";

const FollowClub = () => {
  const [activeClub, setActiveClub] = useState(2);
  const scrollRef = useRef(null);

  const clubs = [
    { id: 1, name: "Man United", logo: "https://upload.wikimedia.org/wikipedia/ar/e/e1/Manchester_United_FC.png" },
    { id: 2, name: "Chelsea", logo: "https://upload.wikimedia.org/wikipedia/hif/0/0d/Chelsea_FC.png" },
    { id: 3, name: "Arsenal", logo: "https://upload.wikimedia.org/wikipedia/hif/8/82/Arsenal_FC.png" },
    { id: 4, name: "Liverpool", logo: "https://upload.wikimedia.org/wikipedia/ar/archive/b/b2/20180719151401%21Liverpool_FC_logo.png" },
    { id: 5, name: "Man City", logo: "https://cdn.freebiesupply.com/images/large/2x/manchester-city-logo-png-transparent.png" },
    { id: 6, name: "Tottenham", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png" },
    { id: 7, name: "Leicester", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/1200px-Leicester_City_crest.svg.png" },
    { id: 8, name: "Everton", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png" },
    { id: 9, name: "West Ham", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png" },
    { id: 10, name: "Newcastle", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png" },

  ];

  const handleSelect = (id) => {
    setActiveClub(id);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 100;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 100;
    }
  };

  return (
      <div className="follow-club-container">
        <div className="follow-club-header">
          <h2 className="follow-club-title">
            <span role="img" aria-label="trophy" className="trophy-icon">🏆</span>
            Follow Club
          </h2>
          <div className="arrow-controls">
            <button onClick={scrollLeft}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={scrollRight}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="clubs-scroll-wrapper" ref={scrollRef}>
          {clubs.map((club) => (
              <div
                  key={club.id}
                  className={`club-circle ${activeClub === club.id ? "active" : ""}`}
                  onClick={() => handleSelect(club.id)}
              >
                <img src={club.logo} alt={`${club.name} Logo`} />
              </div>
          ))}
        </div>
      </div>
  );
};

export default FollowClub;