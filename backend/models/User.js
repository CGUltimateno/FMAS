const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    favoriteTeams: { type: DataTypes.JSON, allowNull: true },
  },
  { sequelize, modelName: "User" }
);

module.exports = User;