const mysql = require("mysql2");


// Falls back to local dev defaults (root/no password on localhost) when
// these aren't set, but in any deployed environment (Docker/Dokploy) the
// database runs as a separate service, so DB_HOST etc. must be set via
// environment variables to point at that service instead of localhost.
const db = mysql.createPool({

host: process.env.DB_HOST || "localhost",

port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,

user: process.env.DB_USER || "root",

password: process.env.DB_PASSWORD || "",

database: process.env.DB_NAME || "ricedss"

});


module.exports=db;