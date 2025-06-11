const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const leagueRoutes = require("./routes/leagueRoutes");
const teamRoutes = require("./routes/teamRoutes");
const playerStatsRoutes = require("./routes/playerStatsRoutes");
const matchRoutes = require("./routes/matchRoutes");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");
const fs = require('fs');

const PROFILE_PICS_DIR = path.join(__dirname, 'public', 'profile_pics');
if (!fs.existsSync(PROFILE_PICS_DIR)) {
    fs.mkdirSync(PROFILE_PICS_DIR, { recursive: true });
    console.log(`Created directory: ${PROFILE_PICS_DIR}`);
} else {
    console.log(`Directory exists: ${PROFILE_PICS_DIR}`);
}

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/leagues", leagueRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerStatsRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/admin", adminRoutes);

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);

sequelize.authenticate()
  .then(() => {
    console.log(" Database Connected");

    return sequelize.sync(); 
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((error) => console.error(" DB Connection Failed:", error));
