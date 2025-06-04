import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetPlayerStatsQuery, useGetPlayerTrophiesQuery , useGetPlayerCareerQuery } from '../services/footballApi';
import PlayerInfo from '../components/PlayerStats/PlayerInfo';
import PlayerCareer from '../components/PlayerStats/PlayerCareer';
import PlayerTrophies from '../components/PlayerStats/PlayerTrophies';
import '../styles/PlayerStats/PlayerStatsPage.scss';
import SeasonPerformance from '../components/PlayerStats/SeasonPerformance';
import SeasonPerformanceDetailed from '../components/PlayerStats/SeasonPerformanceDetailed';
import PlayerStats from '../components/PlayerStats/PlayerStats';

const PlayerStatsPage = () => {
  const { playerId } = useParams();
  const { data, error, isLoading } = useGetPlayerStatsQuery(playerId);
  const { data: trophiesData } = useGetPlayerTrophiesQuery(playerId);
  const { data: careerData } = useGetPlayerCareerQuery(playerId);


  if (isLoading) return <div className="loading">Loading player data...</div>;
  if (error) return <div className="error">Error loading player data</div>;

  const playerObject = data?.fdInfo?.response?.[0];

  return (
    <div className="player-page">
      <div className="left-section">
        <PlayerInfo playerData={playerObject} />
        <SeasonPerformance stats={playerObject?.statistics} />
        <SeasonPerformanceDetailed matches={playerObject?.statistics} />
      </div>

      <div className="right-section">
          <PlayerStats stats={playerObject?.statistics || []} />
          <PlayerCareer
              career={careerData?.playerCareer?.response || []}
              playerNationality={playerObject?.player?.nationality}
          />
          <PlayerTrophies trophies={trophiesData?.playerTrophies?.response || []} />
      </div>
    </div>
  );
};

export default PlayerStatsPage;
