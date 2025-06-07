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
    profilePictureUrl: { type: DataTypes.STRING, allowNull: true },
    isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
    emailVerificationTokenExpires: { type: DataTypes.DATE, allowNull: true },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false }
  },
  { sequelize, modelName: "User" }
);

module.exports = User;

