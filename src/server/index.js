require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// call to get all the rovers in one shot
app.get("/rover", async (req, res) => {
  const { name, date } = req.query;
  try {
    let photos = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${name}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
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
  
  app.get("/rovers", async (req, res) => {
    const{name1, name2, name3} = req.query;
    const resultData = [];
    try{
      let result1 = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${name1}/?api_key=${process.env.API_KEY}`).then((res)=>res.json())
      let result2 = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${name2}/?api_key=${process.env.API_KEY}`).then((res)=>res.json())
      let result3 = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${name3}/?api_key=${process.env.API_KEY}`).then((res)=>res.json())
      resultData.push(result1,result2, result3)
      res.send(resultData)
    }catch(err){
      console.log('error:', err)
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
