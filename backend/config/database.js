const dotenv = require("dotenv");
dotenv.config();
const { Sequelize } = require("sequelize");

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 60000, 
  },
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log(" Database Connected Successfully"))
  .catch((error) => console.error(" DB Connection Failed:", error));

module.exports = sequelize;
