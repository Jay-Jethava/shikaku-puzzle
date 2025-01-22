const { v4: uuidv4 } = require("uuid");

class ShikakuGame {
  constructor(width, height) {
    this.id = Date.now();
    this.width = width;
    this.height = height;
    this.board = Array(this.height)
      .fill()
      .map(() => Array(this.width).fill(0));
    this.rectangles = [];
    this.placedRectangles = [];
    this.startTime = Date.now();
    this.isComplete = false;
    this.generateRectangles();
  }

  generateRectangles() {
    this.rectangles = [];
    const totalCells = this.width * this.height;
    let remainingCells = totalCells;

    // Initialize the board (2D grid) with null values
    this.board = Array.from({ length: this.height }, () =>
      Array(this.width).fill(null)
    );

    while (remainingCells > 0) {
      const width = Math.floor(Math.random() * 3) + 1;
      const height = Math.floor(Math.random() * 3) + 1;
      const area = width * height;

      if (area <= remainingCells) {
        // Find a valid position for the rectangle
        const position = this.findValidPosition(width, height);

        if (position) {
          const rectangle = {
            id: uuidv4(),
            width,
            height,
            area,
            isPlaced: false,
            position, // Store the top-left position of the rectangle
            // position: null,
          };

          // Mark the rectangle area on the board
          for (let row = position.y; row < position.y + height; row++) {
            for (let col = position.x; col < position.x + width; col++) {
              this.board[row][col] = rectangle.area; // Mark the area number in each cell
            }
          }

          this.rectangles.push(rectangle);
          remainingCells -= area;
        }
      }
    }

    return { rectangles: this.rectangles, board: this.board };
  }

  validatePlayerSelection(x, y, width, height) {
    // Check boundaries
    if (x < 0 || y < 0 || x + width > this.width || y + height > this.height) {
      return { valid: false, reason: "Selection out of bounds" };
    }

    // Find an unplaced rectangle matching the selected dimensions
    const matchingRectangle = this.rectangles.find(
      (rect) =>
        !rect.isPlaced &&
        rect.width === width &&
        rect.height === height &&
        x === rect.position.x &&
        y === rect.position.y
    );

    console.log(this.rectangles);

    if (matchingRectangle) matchingRectangle.isPlaced = true;

    return { valid: true, matchingRectangleId: matchingRectangle?.id };
  }

  placeRectangle(x, y, width, height) {
    const validation = this.validatePlayerSelection(x, y, width, height);

    if (validation.valid) {
      const placedRectangle = {
        id: uuidv4(),
        width,
        height,
        position: {
          x,
          y,
        },
        matchingRectangleId: validation?.matchingRectangleId,
      };

      this.placedRectangles.push(placedRectangle);

      return { valid: true, placedRectangle };
    } else return { valid: false, error: validation.reason };
  }

  checkWinCondition() {
    const allPlaced = this.rectangles.every((rect) => rect.isPlaced);
    if (allPlaced) {
      this.isComplete = true;
    }
    return allPlaced;
  }

  deselectRectangle(id) {
    // find the placed rectangle by id
    const rectangle = this.placedRectangles.find((el) => el.id === id);

    if (rectangle) {
      if (rectangle?.matchingRectangleId) {
        const matchingRectangleId = this.rectangles.find(
          (el) => el.id === rectangle.matchingRectangleId
        );
        matchingRectangleId.isPlaced = false;
      }

      // Remove the rectangle from placedRectangles
      this.placedRectangles = this.placedRectangles.filter(
        (el) => el.id !== id
      );

      return { deselected: true, message: "The rectangle deselected" };
    } else return { deselected: false, message: "The rectangle not found" };
  }

  reset() {
    this.board = Array(this.height)
      .fill()
      .map(() => Array(this.width).fill(0));
    this.generateRectangles();
    this.startTime = Date.now();
    this.isComplete = false;
    return {
      board: this.board,
      rectangles: this.rectangles,
    };
  }

  getTime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // <=== Helper functions ===>
  findValidPosition(width, height) {
    // start from bottom-left (0,0) and scan upward and right
    for (let x = 0; x <= this.width - width; x++) {
      for (let y = 0; y <= this.height - height; y++) {
        if (this.canPlaceRectangle(x, y, width, height)) {
          return { x, y }; // bottom-left
        }
      }
    }
    return null;
  }

  canPlaceRectangle(x, y, width, height) {
    // check the rectangle area from bottom-left corner
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (this.board[j][i] !== null) {
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = ShikakuGame;
