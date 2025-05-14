import React from 'react';
import { useGetMatchLineupsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/Lineup.scss';

// Reusable Player List Component
const PlayerList = ({ players, type }) => (
  <div>
    <h4 className={type === 'starting' ? "lineup__substitutes-title" : "lineup__substitutes-title"}>
      {type === 'starting' ? 'Starting XI' : 'Substitutes'}
    </h4>
    {players.map((player) => (
      <div className={`lineup__player ${type === 'substitute' ? 'lineup__player--substitute' : ''}`} key={player.numbe}>
        <div className="lineup__player-number">{player.number}</div>
        <div className="lineup__player-info">
          <span className="lineup__player-name">{player.name}</span>
          <span className={`lineup__player-position ${player.position.toLowerCase()}`}>
            {player.position}
          </span>
        </div>
      </div>
    ))}
  </div>
);

function Lineup({ matchId }) {
  const { data: fetchedLineups, isLoading, error } = useGetMatchLineupsQuery(matchId, {
    skip: !matchId
  });

  // Static fallback for PSG vs Arsenal
  const staticLineups = [
    {
      team: { name: 'Paris Saint-Germain' },
      starting: [
        { number: 1, name: 'Donnarumma', position: 'Goalkeeper' },
        { number: 2, name: 'Hakimi', position: 'Defender' },
        { number: 5, name: 'Marquinhos', position: 'Defender' },
        { number: 51, name: 'Willian Pacho', position: 'Defender' },
        { number: 25, name: 'Nuno Mendes', position: 'Defender' },
        { number: 87, name: 'Joao Neves', position: 'Midfielder' },
        { number: 8, name: 'Fabian Ruiz', position: 'Midfielder' },
        { number: 17, name: 'Vitinha', position: 'Midfielder' },
        { number: 14, name: 'Desire Doue', position: 'Forward' },
        { number: 7, name: 'Kvaratskhelia', position: 'Forward' },
        { number: 29, name: 'Bradley Barcola', position: 'Forward' },
      ],
      substitutes: [
        { number: 39, name: 'Matvey Safonov', position: 'Goalkeeper' },
        { number: 80, name: 'Arnau Tenas', position: 'Goalkeeper' },
        { number: 35, name: 'Lucas Beraldo', position: 'Defender' },
        { number: 48, name: 'Axel Tape', position: 'Defender' },
        { number: 21, name: 'Lucas Hernandez', position: 'Defender' },
        { number: 19, name: 'Kang-in Lee', position: 'Midfielder' },
        { number: 24, name: 'Senny Mayulu', position: 'Midfielder' },
        { number: 33, name: 'Warren Zaïre-Emery', position: 'Midfielder' },
        { number: 49, name: 'Ibrahim Mbaye', position: 'Forward' },
        { number: 10, name: 'Ousmane Dembele', position: 'Forward' },
        { number: 9, name: 'Goncalo Ramos', position: 'Forward' }
      ]
    },
    {
      team: { name: 'Arsenal' },
      starting: [
        { number: 22, name: 'Raya', position: 'Goalkeeper' },
        { number: 12, name: 'Timber', position: 'Defender' },
        { number: 15, name: 'Kiwior', position: 'Defender' },
        { number: 2, name: 'Saliba', position: 'Defender' },
        { number: 49, name: 'Lewis-Skelly', position: 'Defender' },
        { number: 5, name: 'Thomas Partey', position: 'Midfielder' },
        { number: 8, name: 'Odegaard (c)', position: 'Midfielder' },
        { number: 41, name: 'Declan Rice', position: 'Midfielder' },
        { number: 7, name: 'Saka', position: 'Forward' },
        { number: 23, name: 'Mikel Merino', position: 'Forward' },
        { number: 11, name: 'Martinelli', position: 'Forward' }
      ],
      substitutes: [
        { number: 32, name: 'Neto', position: 'Goalkeeper' },
        { number: 36, name: 'Tommy Setford', position: 'Goalkeeper' },
        { number: 3, name: 'Kieran Tierney', position: 'Defender' },
        { number: 17, name: 'Zinchenko', position: 'Defender' },
        { number: 4, name: 'Ben White', position: 'Defender' },
        { number: 33, name: 'Riccardo Calafiori', position: 'Defender' },
        { number: 20, name: 'Jorginho', position: 'Midfielder' },
        { number: 45, name: 'Jack Henry-Francis', position: 'Midfielder' },
        { number: 19, name: 'Trossard', position: 'Forward' },
        { number: 30, name: 'Sterling', position: 'Forward' },
        { number: 37, name: 'Nathan Butler-Oyedeji', position: 'Forward' },
        { number: 53, name: 'Ethan Nwaneri', position: 'Forward' }
      ]
    }
  ];

  // Use static if no matchId or if error occurs
  const lineups = (!matchId || error) ? staticLineups : fetchedLineups;

  if (isLoading) return <div className="lineup loading">Loading lineups...</div>;

  if (!lineups || lineups.length < 2) {
    return <div className="lineup empty">No lineup data available</div>;
  }

  const [homeTeam, awayTeam] = lineups;

  return (
    <div className="lineup">
      <h2 className="lineup__title">Starting XI</h2>
      <div className="lineup__container">
        {/* Home Team */}
        <div className="lineup__team">
          <h3 className="lineup__team-name">{homeTeam.team.name}</h3>
          <PlayerList players={homeTeam.starting} type="starting" />
          <PlayerList players={homeTeam.substitutes} type="substitute" />
        </div>

        <div className="lineup__divider"></div>

        {/* Away Team */}
        <div className="lineup__team">
          <h3 className="lineup__team-name">{awayTeam.team.name}</h3>
          <PlayerList players={awayTeam.starting} type="starting" />
          <PlayerList players={awayTeam.substitutes} type="substitute" />
        </div>
      </div>
    </div>
  );
}

export default Lineup;
