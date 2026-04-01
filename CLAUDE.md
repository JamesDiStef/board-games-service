# board-games-service — Backend Context

Express REST API backing the `board-games` frontend. Deployed to Firebase Cloud Functions. See top-level `CLAUDE.md` for full-stack context and `ROADMAP.md` for planned work.

---

## Stack

- **Runtime:** Node.js 22
- **Framework:** Express 4
- **Database:** MongoDB Atlas via Mongoose 8
- **Deployment:** Firebase Cloud Functions (`exports.api = functions.https.onRequest(app)`)
- **Dev server:** nodemon on port 3000

## Run

```bash
npm install
npm run dev        # nodemon server.js → http://localhost:3000
npm run deploy     # firebase deploy --only functions:api
```

## Environment

```
DATA_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
```

For Firebase deployment: set `DATA_URL` via Firebase environment config (`firebase functions:config:set`), not `.env` — the dotenv line in `server.js` is commented out for production.

---

## File Structure

```
server.js           # Express app + Mongoose connection + route mounting
models/
  user.js           # User → { userId, clueId, ticTacId, connectFourId, hangmanId }
  ticTacToe.js      # { userId, isGameOver, isPlayerOne, board[9] }
  connectFour.js    # { userId, isGameOver, isRedTurn, columns[7] }
  hangman.js        # { userId, isWin, wordToGuess, guessedLetters[], wrongGuesses }
  clue.js           # Full Clue game state (see schema below)
routes/
  user.js           # GET /, GET /:userId, POST /:userId, PATCH /:userId
  ticTacToe.js      # GET /, GET /:userId, POST /:userId, PATCH /:userId
  connectFour.js    # GET /, GET /:userId, POST /:userId, PATCH /:userId
  hangman.js        # GET /, GET /:userId, POST /:userId, PATCH /:userId
  clue.js           # GET /, GET /:playerName, POST /:playerName, PATCH /:id  ← uses ObjectId, inconsistent
route.rest          # Manual test file for VS Code REST Client extension
```

---

## API Routes

All routes return JSON. POST returns 201. Errors return 400/404/500 with `{ message }`.

| Method | Path | Description |
|---|---|---|
| GET | `/user/:userId` | Fetch user and their game IDs |
| POST | `/user/:userId` | Create user (blocks duplicate userIds) |
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
| PATCH | `/clue/:id` | Update Clue game by MongoDB ObjectId **(inconsistent — should be :playerName)** |

---

## Conventions

- **PATCH pattern:** All PATCH routes iterate `req.body` keys and assign them to the document, then call `.save()`. Any valid model field can be patched in one call.
- **Duplicate prevention:** POST routes check for an existing document before creating. Returns 400 if already exists.
- **Initial state:** Each route file defines its own `initialState` object used when creating a new game via POST.
- **CORS:** Fully open (`origin: true`) — intentional for the public API.
- **No auth:** `userId` is trusted from the URL param with no verification. Auth is planned (see ROADMAP.md Phase 1 / BACKLOG.md Epic 1).

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

- **No authentication** — all endpoints are open; auth is the first item in BACKLOG.md
- **No input validation** — request bodies are written directly to MongoDB without sanitization
- **Clue PATCH uses ObjectId** (`/clue/:id`) instead of `/:playerName` like every other route — needs to be normalized when auth is added
- **Unused import** — `routes/user.js` imports a Firebase Crashlytics function that is never called
- **No logging** — no structured request logging; errors surface only if Firebase logs them
