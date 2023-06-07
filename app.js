// index.js
const express = require("express");
const app = express();
const routes = require("./routes");

app.use(express.static(__dirname));
app.use("/", routes);

app.listen(3002, () => {
  console.log("Server started on port 3002");
});
