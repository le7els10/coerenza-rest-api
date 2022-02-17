const express = require("express");
const morgan = require("morgan");
var cors = require("cors");

const fs = require("fs");

const app = express();
app.use(cors());

//settings
app.set("port", 3300);

//middleware
app.use(morgan("dev"));
app.use(express.json());

//routes
app.post("/", (req, res) => {
  fs.readFile(`${__dirname}/assets/Movies.json`, "utf-8", (err, data) => {
    if (err) {
      throw err;
    }

    let response = JSON.parse(data);
    let validation = req.body.Akelab;
    if (Buffer.from(validation, "base64").toString() != 123456789) {
      res.json({ error: "token Akelab incorrecto" });
    }
    let currentGenders = req.body.genders;

    //filtrar por genero
    if (currentGenders && currentGenders.length > 0) {
      response.results = response.results.filter((movie) => {
        let has = false;
        currentGenders.forEach((gender) => {
          if (movie.genre_ids.includes(gender)) {
            has = true;
          }
        });

        if (has) {
          return movie;
        }
      });
    }

    //ordenar
    let currentOrders = req.body.orders;
    if (currentOrders) {
      response.results = response.results.sort(function (a, b) {
        if (currentOrders.date == 1 && currentOrders.grade == 0) {
          if (a.release_date > b.release_date) {
            return 1;
          }
        } else if (currentOrders.date == 2 && currentOrders.grade == 0) {
          if (a.release_date < b.release_date) {
            return -1;
          }
        } else if (currentOrders.grade == 2 && currentOrders.date == 0) {
          if (a.vote_average > b.vote_average) {
            return 1;
          }
        } else if (currentOrders.grade == 1 && currentOrders.date == 0) {
          if (a.vote_average < b.vote_average) {
            return -1;
          }
        }
      });
    }

    //filtrar nombre
    let currentName = req.body.name;
    if (currentName) {
      response.results = response.results.filter((movie) => {
        let title = movie.title.toLowerCase();
        return title.includes(currentName.toLowerCase());
      });
    }

    res.json(response);
  });
});

app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
