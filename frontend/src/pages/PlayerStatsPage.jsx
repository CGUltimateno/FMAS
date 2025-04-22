import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetPlayerStatsQuery } from '../services/footballApi';
import PlayerInfo from '../components/PlayerStats/PlayerInfo';
import PlayerCareer from '../components/PlayerStats/PlayerCareer';
import PlayerTrophies from '../components/PlayerStats/PlayerTrophies';
import '../styles/PlayerStats/PlayerStatsPage.scss';
import SeasonPerformance from '../components/PlayerStats/SeasonPerformance';
import SeasonPerformanceDetailed from '../components/PlayerStats/SeasonPerformanceDetailed';

const PlayerStatsPage = () => {
  const { playerId } = useParams();
  const { data, error, isLoading } = useGetPlayerStatsQuery(playerId);
  console.log(data)
  if (isLoading) return <div className="loading">Loading player data...</div>;
  if (error) return <div className="error">Error loading player data</div>;

  return (
<div class="player-page">
  <div class="left-section">
    <PlayerInfo player={data} />
    <SeasonPerformance stats={data} />
    <SeasonPerformanceDetailed matches={data} />

  </div>

  <div class="right-section">
  <PlayerCareer career={data.career} />
  <PlayerTrophies trophies={data.trophies} />

  </div>
</div>


  );
};

export default PlayerStatsPage;