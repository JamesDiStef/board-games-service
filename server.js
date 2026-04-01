// comment out to deploy, comment in to run locally:
require("dotenv").config();

// Required env vars (set in .env locally, Firebase environment config in production):
//   DATA_URL       — MongoDB connection string
//   JWT_SECRET     — the server's private signing key for JWTs (not a user password — see auth.js)
//   ALLOWED_ORIGIN — comma-separated list of allowed frontend origins (e.g. http://localhost:5173,https://board-games-and-more.netlify.app)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const functions = require("firebase-functions");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

mongoose.connect(process.env.DATA_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

app.use(express.json());

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const auth = require("./middleware/auth");

const clueRouter = require("./routes/clue");
app.use("/clue", auth, clueRouter);

const userRouter = require("./routes/user");
app.use("/user", auth, userRouter);

const ticTacToeRouter = require("./routes/ticTacToe");
app.use("/ticTacToe", auth, ticTacToeRouter);

const connectFourRouter = require("./routes/connectFour");
app.use("/connectFour", auth, connectFourRouter);

const hangmanRouter = require("./routes/hangman");
app.use("/hangman", auth, hangmanRouter);

app.listen(3000, () => console.log("Server started"));

exports.api = functions.https.onRequest(app);
