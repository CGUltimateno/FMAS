const FootballDataService = require("../services/MatchService");
const axios = require("axios");

function mapLeagueIdToDivisionCode(leagueId) {
  const map = {
    39: "E0", 61: "F1", 78: "D1", 135: "I1", 140: "SP1",
    40: "E1", 62: "F2", 79: "D2", 136: "I2", 141: "SP2",
    94: "N1", 88: "P1", 144: "SC0", 145: "SC1", 147: "SC3",
    203: "G1", 235: "RUS", 82: "B1", 188: "AUT", 196: "ROM",
    215: "POL", 208: "DEN", 214: "FIN"
  };

  return map[leagueId] || "STD";
}
class MatchController {

  
    async getMatchDetails(req, res) {
        const matchId = req.params.matchId;
        try {
            const matchDetails = await FootballDataService.getMatchDetails(matchId);
            res.status(200).json(matchDetails);
        } catch (error) {
            console.error("Error fetching match details:", error);
            res.status(500).json({ message: "Error fetching match details" });
        }
    }

    async getMatchStats(req, res) {
        const matchId = req.params.matchId;
        try {
            const matchStats = await FootballDataService.getMatchStats(matchId);
            res.status(200).json(matchStats);
        } catch (error) {
            console.error("Error fetching match stats:", error);
            res.status(500).json({ message: "Error fetching match stats" });
        }
    }
    
    async getMatchLineups(req, res) {
        const matchId = req.params.matchId;
        try {
            const lineups = await FootballDataService.getMatchLineups(matchId);
            res.status(200).json(lineups);
        } catch (error) {
            console.error("Error fetching match lineups:", error);
            res.status(500).json({ message: "Error fetching match lineups" });
        }
    }
    
    async getMatchHeadToHead(req, res) {
        const { team1Id, team2Id } = req.params;
        try {
            const headToHead = await FootballDataService.getMatchHeadToHead(team1Id, team2Id);
            res.status(200).json(headToHead);
        } catch (error) {
            console.error("Error fetching match head-to-head:", error);
            res.status(500).json({ message: "Error fetching match head-to-head" });
        }
    }

    async getMatchEvents(req, res) {
        const matchId = req.params.matchId;
        try {
            const events = await FootballDataService.getMatchEvents(matchId);
            res.status(200).json(events);
        } catch (error) {
            console.error("Error fetching match events:", error);
            res.status(500).json({ message: "Error fetching match events" });
        }
    }

    

async predictMatchFromFixture(req, res) {
  const fixtureId = req.params.fixtureId;

  try {
    const matchDetails = await FootballDataService.getMatchDetails(fixtureId);
    const match = matchDetails?.response?.[0];

    if (!match) return res.status(404).json({ message: "Match not found." });

    const payload = {
      home_team_id: match.teams.home.id,
      away_team_id: match.teams.away.id,
      fixture_id: match.fixture.id,
      fixture_date: match.fixture.date.split("T")[0],
      division: mapLeagueIdToDivisionCode(match.league.id)
    };

    const predictionRes = await axios.post("http://localhost:8000/PredictFromFixture", payload);
    res.status(200).json(predictionRes.data);

  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: "Error predicting match outcome." });
  }
}

    async predictAllUpcomingFixtures(req, res) {
  try {
    const fixtures = await FootballDataService.getUpcomingFixtures(20);
    const predictions = [];

    for (const match of fixtures) {
      const payload = {
        home_team_id: match.teams.home.id,
        away_team_id: match.teams.away.id,
        fixture_id: match.fixture.id,
        fixture_date: match.fixture.date.split("T")[0],
        division: mapLeagueIdToDivisionCode(match.league.id) // make sure this function exists
      };

      try {
        const predictionRes = await axios.post("http://localhost:8000/PredictFromFixture", payload);
        predictions.push({
          fixture_id: payload.fixture_id,
          home_team: match.teams.home.name,
          away_team: match.teams.away.name,
          date: payload.fixture_date,
          prediction: predictionRes.data
        });
      } catch (err) {
        predictions.push({
          fixture_id: payload.fixture_id,
          error: "Prediction failed",
          reason: err.message
        });
      }
    }

    res.status(200).json(predictions);

  } catch (error) {
    console.error("Failed to predict upcoming fixtures:", error);
    res.status(500).json({ message: "Error during batch prediction" });
  }
}

   

};

module.exports = new MatchController();