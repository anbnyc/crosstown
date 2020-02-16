var express = require("express");
var path = require("path");
var cors = require("cors");
var fs = require("fs");

const { Pool, Client } = require("pg");

const client = new Pool({
  host: "localhost",
  database: "crosstown",
  port: 5432,
});

var app = express();
var PORT = 4000;

app.use(
  cors({
    allowedHeaders: ["Connection", "Keep-Alive"],
  })
);
app.set("port", PORT);
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

const tableHandler = table => (req, res) => {
  console.log("Request received: ", table);
  const { query } = req;
  const WHERE = Object.entries(query)
    .map(([k, v]) => {
      return v === "null"
        ? `${k} is null`
        : `${k} in (${v.split(",").map(d => `'${d}'`)})`;
    })
    .join(" and ");

  const q = `SELECT * FROM ${table} ${WHERE.length ? "WHERE " + WHERE : ""};`;
  console.log("Making query: ", q);

  client
    .query(q)
    .catch(e => console.error(e.stack))
    .then(data => {
      res.send(JSON.stringify(data.rows));
      console.log("Request responded: ", table, data.rows.length, " rows");
    });
};

app.get("/api/results", tableHandler("results"));
app.get("/api/datasets", tableHandler("datasets"));
app.get("/api/pct", tableHandler("results_candidate_pct"));
app.get("/api/menu", tableHandler("results_menu_options"));
app.get("/api/aded", tableHandler("results_aded_list"));

app.listen(app.get("port"), () => console.log(`app listening on port ${PORT}`));
