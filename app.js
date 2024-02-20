const express = require("express");
const app = express();
const cors = require("cors");
//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cors middleware
app.use(cors({ origin: true, credentials: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

// Routes

app.get("/sync-data/:deviceId", (req, res) => {
  const deviceId = req.params.deviceId;
  const date = new Date();
  res.status(200).json({
    day: date.getDay(),
    date: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    deviceId: deviceId,
  });
});

module.exports = app;

//testsuccess@gocash
