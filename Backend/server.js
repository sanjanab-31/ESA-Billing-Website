const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testdb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// sample route
app.get("/", (req, res) => {
  res.send("Hello Backend!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
