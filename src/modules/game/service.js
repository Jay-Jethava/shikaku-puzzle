const Game = require("./model");
const PlacedRectangle = require("../placedRectangle/model");
const ShikakuGame = require("../../utils/ShikakuGame");
const { expression } = require("joi");

exports.saveGameToDb = async (game) => {
  try {
    await Game.create({
      id: game.id,
      width: game.width,
      height: game.height,
      board: game.board,
      rectangles: game.rectangles,
      startTime: game.startTime,
      isComplete: game.isComplete,
    });
  } catch (error) {
    console.error("Error saving game:", error);
  }
};

exports.changeGameRectangleState = async (gameId, rectangleId, isPlaced) => {
  try {
    await Game.findOneAndUpdate(
      {
        id: gameId,
        "rectangles.id": rectangleId,
      },
      {
        $set: { "rectangles.$.isPlaced": isPlaced },
      }
    );
  } catch (error) {
    console.error("Error updating game rectangle state:", error);
  }
};

exports.updateGameInDb = async (gameId, data) => {
  try {
    await Game.updateOne({ id: gameId }, data);
  } catch (error) {
    console.error("Error update game", error);
  }
};

exports.resetGameInDb = async (gameId, newGameData) => {
  try {
    // update all rectangles in the game to set isPlaced:false
    await Game.updateOne({ id: gameId }, newGameData);

    // delete all placed rectangles of this game
    await PlacedRectangle.deleteMany({ gameId });
  } catch (error) {
    console.error("Error rest game in db", error);
  }
};

exports.loadActiveGames = async () => {
  try {
    const activeGames = new Map();

    const games = await Game.find({ isComplete: false });
    await Promise.all(
      games.map(async (gameData) => {
        const placedRectangles = await PlacedRectangle.find({
          gameId: gameData.id,
        });

        const game = new ShikakuGame(gameData.width, gameData.height);
        game.id = gameData.id;
        game.board = gameData.board;
        game.rectangles = gameData.rectangles;
        game.placedRectangles = placedRectangles;
        game.startTime = gameData.startTime;
        game.isComplete = gameData.isComplete;

        activeGames.set(game.id, game);
      })
    );

    console.log(`Loaded ${activeGames.size} active games from database`);

    return activeGames;
  } catch (error) {
    console.error("Error loading active games:", error);
  }
};
