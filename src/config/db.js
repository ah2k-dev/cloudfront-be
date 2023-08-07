const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env",
});

const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect('mongodb+srv://zubair098:zubairorange@orangeWeb.erkg7qi.mongodb.net/');
    console.log("DB connected: " + connection.host);
  } catch (error) {
    console.log("Error connecting database: " + error);
    process.exit(1);
  }
};

module.exports = connectDB;
