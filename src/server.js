const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");
const socketHandler = require("./socket.js");

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Server
server.listen(PORT, () => {
  console.log(`Server running on the port :${PORT}`);
});

// Socket Handler
socketHandler(server);

// DB Connection
const DB = process.env.DATABASE.replace("<password>", process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("✔ Database connection successful"))
  .catch((err) => {
    console.log("🧩 Database connection failed");
    console.log(err.message);
  });

process.on("uncaughtException", (err) => {
  console.error(`🧩 Uncaught Exception 🤪`);
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error(`🧩 Unhandled Rejection 🤪`);
  console.error(err);
});
