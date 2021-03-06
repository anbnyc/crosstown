var express = require("express");
var path = require("path");
var cors = require("cors");
require("dotenv").config();

const DEV_MODE = process.argv[2] === "dev";
console.log(DEV_MODE ? "dev mode" : "production mode");

const { Pool, Client } = require("pg");

const client = new Pool({
  host: DEV_MODE ? "localhost" : process.env.HEROKU_PSQL_HOST,
  database: DEV_MODE ? "crosstown" : process.env.HEROKU_PSQL_DB,
  user: DEV_MODE ? "" : process.env.HEROKU_PSQL_USER,
  password: DEV_MODE ? "" : process.env.HEROKU_PSQL_PWORD,
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

// if (!DEV_MODE) {
//   app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "build", "index.html"));
//   });
// }

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

const tableHandler = (table, rowMode) => (req, res) => {
  console.log("Request received: ", table);
  const { query } = req;
  const WHERE = Object.entries(query)
    .map(whereConcatenator)
    .join(" and ");

  const q = {
    text: `SELECT * FROM ${table} ${WHERE.length ? "WHERE " + WHERE : ""};`
  };
  if(rowMode){
    q.rowMode = rowMode;
  }
  console.log("Making query: ", q);

  client
    .query(q)
    .catch(e => console.error(e.stack))
    .then(data => {
      if (rowMode === "array") {
        res.send(JSON.stringify(data.rows.flat()));
      } else {
        res.send(JSON.stringify(data.rows));
      }
      console.log("Request responded: ", table, data.rows.length, " rows");
    });
};

app.get("/api/results", tableHandler("results"));
app.get("/api/datasets", tableHandler("datasets"));
app.get("/api/pct/:agg", (req, res) => {
  if (req.params.agg === "unitName") {
    return tableHandler("results_candidate_pct_by_unit_name")(req, res);
  }
  return tableHandler("results_candidate_pct")(req, res);
});
app.get("/api/menu", tableHandler("results_menu_options"));
app.get("/api/aded", tableHandler("results_aded_list", "array"));

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
  const q = {
    rowMode: "array",
    text: `SELECT DISTINCT
    CONCAT(
      ad,
      RIGHT(
        CONCAT(
          '000',
          ed
        ), 3
      )
    ) as aded
    FROM (${PREDICATE}) as foo;`,
  };

  client
    .query(q)
    .catch(e => console.error(e.stack))
    .then(data => {
      res.send(JSON.stringify(data.rows.flat()));
      console.log(
        "Request responded: [filtered results_candidate_pct]",
        data.rows.length,
        " rows"
      );
    });
});

app.listen(app.get("port"), () => console.log(`app listening on port ${PORT}`));
