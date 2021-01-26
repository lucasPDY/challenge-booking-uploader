const express = require("express");
const cors = require("cors");
const fs = require("fs");
const parseBookings = require("../src/util").parseBookings;

const app = express();
app.use(cors()); // so that app can access
// More info about express.json() found at https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded
app.use(express.json()); // Middleware to recognize the incoming Request Object as a JSON Object

const bookingsData = JSON.parse(fs.readFileSync("./server/bookings.json"));
console.log(bookingsData);
let bookings = parseBookings(bookingsData);

app.get("/bookings", (_, res) => {
  res.json(bookings);
});

app.post("/bookings", (req, res) => {
  // `req.body` contains data in a format similar to `bookingsData`, hence parsing it is needed
  const newBookings = parseBookings(req.body);
  bookings = [...bookings, ...newBookings];
  res.status(200).json(bookings);
});

app.listen(3004);
module.exports = app;
