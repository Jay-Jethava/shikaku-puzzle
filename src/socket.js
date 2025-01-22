const socketio = require("socket.io");
const ShikakuGame = require("./utils/ShikakuGame.js");

const {
  saveGameToDb,
  changeGameRectangleState,
  updateGameInDb,
  loadActiveGames,
  resetGameInDb,
} = require("./modules/game/service.js");
const {
  saveSelectedRectangleToDb,
  removeDeselectedRectangleFromDb,
} = require("./modules/placedRectangle/service");

let activeGames;

const socketHandler = async (server) => {
  const io = socketio(server);

  activeGames = await loadActiveGames(); // load active games

  io.on("connection", (socket) => {
    console.log("A user connected.");

    socket.on("initGame", async ({ width, height }) => {
      const game = new ShikakuGame(width, height);
      activeGames.set(game.id, game);

      // send the game details to frontend
      socket.emit("gameInitialized", {
        gameId: game.id,
        board: game.board,
        rectangles: game.rectangles,
      });

      // save to game in the database
      saveGameToDb(game);
    });

    socket.on("placeRectangle", async ({ gameId, x, y, width, height }) => {
      const game = activeGames.get(gameId);
      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      const result = game.placeRectangle(x, y, width, height);
      if (result.valid) {
        // save the selected rectangle to db
        saveSelectedRectangleToDb({
          id: result.placedRectangle.id,
          gameId: game.id,
          width: result.placedRectangle.width,
          height: result.placedRectangle.height,
          position: result.placedRectangle.position,
          matchingRectangleId: result.placedRectangle.matchingRectangleId,
        });

        if (result.placedRectangle.matchingRectangleId) {
          // update the matching rectangle's isPlaced status in the game document
          changeGameRectangleState(
            game.id,
            result.placedRectangle.matchingRectangleId,
            true
          );
        }

        const isWin = game.checkWinCondition();
        if (isWin) {
          socket.emit("wonGame", {
            gameId,
            message: "Congratulations! You won the game",
          });

          // update game state and completion time
          updateGameInDb(game.id, {
            isComplete: true,
            completionTime: Date.now(),
          });
        } else {
          socket.emit("selectionResult", {
            valid: true,
            placedRectangle: result.placedRectangle,
          });
        }
      } else {
        socket.emit("error", { message: result.error });
      }
    });

    socket.on("deselectRectangle", async ({ gameId, id }) => {
      const game = activeGames.get(gameId);
      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      const result = game.deselectRectangle(id);
      if (result.deselected) {
        socket.emit("deselected", result);

        removeDeselectedRectangleFromDb(game.id, id);
      } else {
        socket.emit("deselected", result);
      }
    });

    socket.on("resetGame", async ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      const { board, rectangles } = game.reset();
      socket.emit("gameReset", { gameId, board, rectangles });

      // update game in database
      resetGameInDb(game.id, {
        board: board,
        rectangles: rectangles,
        startTime: game.startTime,
        isComplete: false,
        completionTime: null,
      });
    });

    socket.on("getTime", async ({ gameId }) => {
      const game = activeGames.get(gameId);
      const seconds = game.getTime();

      socket.emit("time", {
        seconds,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = socketHandler;
