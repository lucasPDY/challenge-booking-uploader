const express = require("express");
const cors = require("cors");
const fs = require("fs");
const parseBookings = require("../src/util").parseBookings;

const app = express();
app.use(cors()); // so that app can access
app.use(express.json()); // Middleware to recognize the incoming Request Object as a JSON Object

const bookingsData = JSON.parse(fs.readFileSync("./server/bookings.json"));
let bookings = parseBookings(bookingsData);

app.get("/bookings", (_, res) => {
  res.json(bookings);
});

app.post("/bookings", (req, res) => {
  const newBookings = parseBookings(req.body);
  bookings = [...bookings, ...newBookings];
  res.json(bookings);
});

app.listen(3004);
module.exports = app;
