const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "word.exe",
  host: "localhost",
  port: 5432,
  database: "eyeconsult",
});

module.exports = pool;



