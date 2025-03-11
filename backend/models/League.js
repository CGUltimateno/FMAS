const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const League = sequelize.define("League", {
  leagueId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = League;
