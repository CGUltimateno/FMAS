const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class UserTeam extends Model {}

UserTeam.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'userId'
            }
        },
        teamId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        teamName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        teamCrest: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    { sequelize, modelName: "UserTeam" }
);

module.exports = UserTeam;