# board-games-service — Backend Context

Express REST API backing the `board-games` frontend. Deployed to Google Cloud Run. See top-level `CLAUDE.md` for full-stack context and `ROADMAP.md` for planned work.

---

## Stack

- **Runtime:** Node.js 22
- **Framework:** Express 4
- **Database:** MongoDB Atlas via Mongoose 8
- **Real-time:** Socket.io 4
- **Deployment:** Google Cloud Run (`gcloud run deploy`)
- **Dev server:** nodemon on port 3000

## Run

```bash
npm install
npm run dev        # nodemon server.js → http://localhost:3000
```

## Deploy

```bash
cd board-games-service
gcloud run deploy board-games-service \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file .env.yaml
```

## Environment

```
DATA_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=<signing key>
ALLOWED_ORIGIN=http://localhost:5173,https://board-games-and-more.netlify.app
```

Set locally in `.env`. For Cloud Run, set in `.env.yaml` (excluded from Docker via `.dockerignore`).

---

## File Structure

```
server.js               # Express app + http server + Socket.io + Mongoose + route mounting
Dockerfile              # Cloud Run container definition
.env.yaml               # Cloud Run env vars (gitignored)
socket/
  index.js              # Socket.io event handlers (join-game-room)
models/
  user.js               # User → { userId, clueId, ticTacId, connectFourId, hangmanId }
  ticTacToe.js          # { userId, isGameOver, isPlayerOne, board[9] }
  connectFour.js        # { userId, isGameOver, isRedTurn, columns[7] }
  hangman.js            # { userId, isWin, wordToGuess, guessedLetters[], wrongGuesses }
  clue.js               # Full Clue game state (see schema below)
  multiplayerGame.js    # { roomCode, gameType, hostId, guestId, board, currentTurn, isGameOver, winner }
routes/
  auth.js               # POST /auth/register, POST /auth/login, POST /auth/logout
  user.js               # GET /, GET /:userId, POST /:userId, PATCH /:userId
  ticTacToe.js          # GET /, GET /:userId, POST /:userId, PATCH /:userId
  connectFour.js        # GET /, GET /:userId, POST /:userId, PATCH /:userId
  hangman.js            # GET /, GET /:userId, POST /:userId, PATCH /:userId
  clue.js               # GET /, GET /:playerName, POST /:playerName, PATCH /:playerName
  multiplayer.js        # See multiplayer routes below
middleware/
  auth.js               # JWT cookie verification → sets req.userId
route.rest              # Manual test file for VS Code REST Client extension
```

---

## API Routes

All routes return JSON. POST returns 201. Errors return 400/404/500 with `{ message }`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, sets HttpOnly JWT cookie |
| POST | `/auth/logout` | Clears JWT cookie |
| GET | `/user/:userId` | Fetch user and their game IDs |
| POST | `/user/:userId` | Create user (blocks duplicates) |
| PATCH | `/user/:userId` | Update user fields |
| GET | `/ticTacToe/:userId` | Fetch user's Tic-Tac-Toe game |
| POST | `/ticTacToe/:userId` | Create new game (blocks duplicates) |
| PATCH | `/ticTacToe/:userId` | Update game state |
| GET | `/connectFour/:userId` | Fetch user's Connect Four game |
| POST | `/connectFour/:userId` | Create new game |
| PATCH | `/connectFour/:userId` | Update game state |
| GET | `/hangman/:userId` | Fetch user's Hangman game |
| POST | `/hangman/:userId` | Create new game |
| PATCH | `/hangman/:userId` | Update game state |
| GET | `/clue/:playerName` | Fetch Clue game by player name |
| POST | `/clue/:playerName` | Create new Clue game |
| PATCH | `/clue/:playerName` | Update Clue game state |
| POST | `/multiplayer/create` | Create multiplayer game, returns roomCode |
| POST | `/multiplayer/join` | Join game by roomCode |
| GET | `/multiplayer/games` | Fetch all active games for current user |
| GET | `/multiplayer/:roomCode` | Fetch single game (host/guest only) |
| PATCH | `/multiplayer/:roomCode/move` | Save move to DB, emits `move-made` via Socket.io |

---

## Socket.io Events

| Event (client → server) | Payload | Description |
|---|---|---|
| `join-game-room` | `{ roomCode }` | Client joins the Socket.io room for that game |

| Event (server → client) | Payload | Description |
|---|---|---|
| `move-made` | `{ game }` | Broadcast to room after a move is saved to DB |

---

## Conventions

- **PATCH pattern:** All PATCH routes iterate `req.body` keys and assign them to the document, then call `.save()`. Any valid model field can be patched in one call.
- **Duplicate prevention:** POST routes check for an existing document before creating.
- **Auth:** All routes except `/auth/*` are protected by `middleware/auth.js`. JWT is read from HttpOnly cookie `bgToken`. Sets `req.userId`.
- **multiplayer.js exports a factory function** `(io) => router` so routes can emit Socket.io events. All other route files export a plain router.
- **CORS:** Controlled via `ALLOWED_ORIGIN` env var — comma-separated list of allowed origins.

---

## Clue Model (complex — full schema)

```javascript
{
  characters: [String],          // 6 suspects
  weapons: [String],             // 6 weapons
  isGameOver: Boolean,
  eliminatedPeople: [String],
  eliminatedWeapons: [String],
  eliminatedRooms: [String],
  isOpenModal: Boolean,
  isOpenResponseModal: Boolean,
  player: { name: String, roomId: Number },
  playerName: String,
  currentRoom: String,
  board: [{ id: Number, type: String }],   // 16 rooms
  thingToReveal: String,
  guesses: { person: String, weapon: String, room: String },
  confidential: { person: String, weapon: String, room: String }
}
```

Clue constants (defined in `routes/clue.js`):
- Characters: Professor Plum, Colonel Mustard, Ms. Peacock, Ms. Scarlett, Mrs. White, Mr. Green
- Weapons: Candlestick, Lead Pipe, Revolver, Wrench, Rope, Dagger
- Rooms (16): Study, Library, Dining Room, Kitchen, Pool Room, Bedroom, Walk in Closet, Hall, Billiards Room, Secret Lab, Storage Room, Ballroom, Bathroom, Conservatory, Lounge, Attic

---

## Known Issues

- **No input validation** — request bodies are written directly to MongoDB without sanitization
- **No logging** — no structured request logging (Feature 4.1 in backlog)
