// comment out to deploy, comment in to run locally:
// require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const functions = require("firebase-functions");
const cors = require("cors");

app.use(cors({ origin: true }));

mongoose.connect(process.env.DATA_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

app.use(express.json());

const clueRouter = require("./routes/clue");
app.use("/clue", clueRouter);

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const ticTacToeRouter = require("./routes/ticTacToe");
app.use("/ticTacToe", ticTacToeRouter);

const connectFourRouter = require("./routes/connectFour");
app.use("/connectFour", connectFourRouter);

app.listen(3000, () => console.log("Server started"));

exports.api = functions.https.onRequest(app);
