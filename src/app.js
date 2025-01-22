const express = require("express");
const cors = require("cors");

// Create an express application
const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

module.exports = app;
