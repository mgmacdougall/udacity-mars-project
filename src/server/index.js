require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

// For testing only remove when done.
const spiritData = require("./spirit.json");
const opportunityData = require("./opportunity.json");
const curiostiy = require("./curiostiy.json");
const allData = require("./allData.json");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

const test = {
  photo_manifest: {
    name: "Spirit",
    landing_date: "2004-01-04",
    launch_date: "2003-06-10",
    status: "complete",
    max_sol: 2208,
    max_date: "2010-03-21",
    total_photos: 124550,
    photos: [],
  },
};
// call to get all the rovers in one shot
app.get("/rover", async (req, res) => {
  //https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=<API KEY HERE></API>
  const { name, date } = req.query;

  try {
    let photos = await fetch(
        // https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2015-6-3&api_key=DEMO_KEY
      `https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?earth_date=2010-03-21&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());

    console.log(photos)
    res.send({ photos });
  } catch (err) {
    console.log("error:", err);
  }
});

app.get("/apod", async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log("error:", err);
  }
});

app.get("/rovers", (req, res) => {
  res.json(allData);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
module.exports = app;
