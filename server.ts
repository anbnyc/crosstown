var express = require("express");
var path = require("path");
var cors = require("cors");
var fs = require("fs");
require("dotenv").config();

const { Pool, Client } = require("pg");

const client = new Pool({
  host: process.env.HEROKU_PSQL_HOST,
  database: process.env.HEROKU_PSQL_DB,
  user: process.env.HEROKU_PSQL_USER,
  password: process.env.HEROKU_PSQL_PWORD,
  // host: "localhost",
  // database: "crosstown",
  port: 5432,
});

var app = express();
var PORT = process.env.PORT || 4000;

app.use(
  cors({
    allowedHeaders: ["Connection", "Keep-Alive"],
  })
);
app.set("port", PORT);
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const whereConcatenator = ([k, v]) => {
  if (v === "null") {
    return `${k} is null`;
  }
  if (k.slice(-4) === "-min") {
    return `${k.slice(0, -4)} >= ${v}`;
  }
  if (k.slice(-4) === "-max") {
    return `${k.slice(0, -4)} <= ${v}`;
  }
  return `${k} in (${v.split(",").map(d => `'${d.replace("'", "''")}'`)})`;
};

const tableHandler = table => (req, res) => {
  console.log("Request received: ", table);
  const { query } = req;
  const WHERE = Object.entries(query)
    .map(whereConcatenator)
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

/**
 * This endpoint takes a special callback
 * because it finds the intersection of
 * all the AD/ED combinations
 * that satisfy each query
 */
app.get("/api/filter", (req, res) => {
  const { query } = req;
  let subQueries = [{}];
  for (const key in query) {
    if (Array.isArray(query[key])) {
      query[key].forEach((value, i) => {
        if (!subQueries[i]) {
          subQueries[i] = {};
        }
        subQueries[i][key] = value;
      });
    } else {
      subQueries[0][key] = query[key];
    }
  }

  const PREDICATE = subQueries.map(
    subQuery =>
      `SELECT ad, ed
        FROM results_candidate_pct
        WHERE ` +
      Object.entries(subQuery)
        .map(whereConcatenator)
        .join(" and ")
  ).join(`
      INTERSECT
    `);

  // see MATERIALIZED VIEW results_aded_list
  const q = `SELECT DISTINCT
    CONCAT(
      ad,
      RIGHT(
        CONCAT(
          '000',
          ed
        ), 3
      )
    ) as aded
  FROM (${PREDICATE}) as foo;`;

  client
    .query(q)
    .catch(e => console.error(e.stack))
    .then(data => {
      res.send(JSON.stringify(data.rows));
      console.log(
        "Request responded: [filtered results_candidate_pct]",
        data.rows.length,
        " rows"
      );
    });
});

app.listen(app.get("port"), () => console.log(`app listening on port ${PORT}`));
