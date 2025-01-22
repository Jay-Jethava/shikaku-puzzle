const PlacedRectangle = require("./model");
const { changeGameRectangleState } = require("../game/service");

exports.saveSelectedRectangleToDb = async (data) => {
  try {
    await PlacedRectangle.create(data);
  } catch (error) {
    console.error("Error saving game:", error);
  }
};

exports.removeDeselectedRectangleFromDb = async (gameId, rectangleId) => {
  try {
    // find the placed rectangle to get its matchingRectangleId
    const placedRectangle = await PlacedRectangle.findOne({
      gameId,
      id: rectangleId,
    });

    if (placedRectangle?.matchingRectangleId) {
      // update the matching rectangle's isPlaced status in the game rectangles
      changeGameRectangleState(
        gameId,
        placedRectangle.matchingRectangleId,
        false
      );
    }

    // delete the placed rectangle
    await PlacedRectangle.deleteOne({ id: rectangleId, gameId });
  } catch (error) {
    console.error("Error remove deselected rectangle from db:", error);
  }
};
