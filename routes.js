// routes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("HTML file requested");
  res.sendFile(path.join(__dirname, "index.html"));
});

router.get("/scrape", require("./scrape"));

module.exports = router;
