/** Database setup for BizTime. */
const { Client } = require('pg')
require('dotenv').config()

let DB_URI;
if (process.env.NODE_ENV === 'test') {
    DB_URI = `postgresql://esther:${process.env.DB_PASSWORD}@localhost:5432/biztime_test`;
} else {
    DB_URI = `postgresql://esther:${process.env.DB_PASSWORD}@localhost:5432/biztime`;
}

let db = new Client({
    connectionString: DB_URI
});

console.log('Connection String:', DB_URI);

db.connect()
module.exports = db;