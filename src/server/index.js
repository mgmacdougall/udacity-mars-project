require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

// For testing only remove when done.
const spiritData = require("./spirit.json");
const opportunityData = require("./opportunity.json");
const curiostiy = require("./curiostiy.json");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// your API calls
app.get("/rover", (req, res) => {
  //https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=<API KEY HERE></API>
  const name = req.query.name;
    console.log(spiritData)
  res.json(spiritData);
});
// example API call
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
module.exports = app;
