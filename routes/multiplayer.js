const express = require("express");
const router = express.Router();
const MultiplayerGame = require("../models/multiplayerGame");

module.exports = (io) => {
  const blankBoards = {
    ticTacToe: Array.from({ length: 9 }, (_, i) => ({ id: i, value: "" })),
    connectFour: Array.from({ length: 7 }, (_, col) => ({
      id: col,
      squares: Array.from({ length: 6 }, (_, row) => ({ id: row, color: "" })),
    })),
  };

  function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // POST /multiplayer/create
  router.post("/create", async (req, res) => {
    const { gameType } = req.body;

    if (!blankBoards[gameType]) {
      return res.status(400).json({ message: "Invalid gameType" });
    }

    let roomCode;
    let attempts = 0;
    while (attempts < 10) {
      const candidate = generateRoomCode();
      const exists = await MultiplayerGame.findOne({ roomCode: candidate });
      if (!exists) {
        roomCode = candidate;
        break;
      }
      attempts++;
    }

    if (!roomCode) {
      return res.status(500).json({ message: "Could not generate unique room code" });
    }

    try {
      const game = new MultiplayerGame({
        roomCode,
        gameType,
        hostId: req.userId,
        board: blankBoards[gameType],
        currentTurn: req.userId,
      });
      const saved = await game.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // POST /multiplayer/join
  router.post("/join", async (req, res) => {
    const { roomCode } = req.body;

    try {
      const game = await MultiplayerGame.findOne({ roomCode });

      if (!game) {
        return res.status(404).json({ message: "Room not found" });
      }
      if (game.guestId) {
        return res.status(400).json({ message: "Room is full" });
      }
      if (game.hostId === req.userId) {
        return res.status(400).json({ message: "You created this room" });
      }

      game.guestId = req.userId;
      const saved = await game.save();
      res.status(200).json(saved);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // GET /multiplayer/games
  router.get("/games", async (req, res) => {
    try {
      const games = await MultiplayerGame.find({
        $or: [{ hostId: req.userId }, { guestId: req.userId }],
        isGameOver: false,
      });
      res.json(games);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET /multiplayer/:roomCode
  router.get("/:roomCode", async (req, res) => {
    try {
      const game = await MultiplayerGame.findOne({ roomCode: req.params.roomCode });

      if (!game) {
        return res.status(404).json({ message: "Room not found" });
      }
      if (game.hostId !== req.userId && game.guestId !== req.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(game);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // PATCH /multiplayer/:roomCode/move
  router.patch("/:roomCode/move", async (req, res) => {
    const { board, isGameOver, winner, currentTurn } = req.body;

    try {
      const game = await MultiplayerGame.findOne({ roomCode: req.params.roomCode });

      if (!game) {
        return res.status(404).json({ message: "Room not found" });
      }
      if (game.hostId !== req.userId && game.guestId !== req.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (game.currentTurn !== req.userId) {
        return res.status(403).json({ message: "Not your turn" });
      }
      if (game.isGameOver) {
        return res.status(400).json({ message: "Game is already over" });
      }

      game.board = board;
      game.isGameOver = isGameOver ?? false;
      game.winner = winner ?? null;
      game.currentTurn = currentTurn;

      const saved = await game.save();

      io.to(req.params.roomCode).emit("move-made", { game: saved });

      res.json(saved);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  return router;
};
