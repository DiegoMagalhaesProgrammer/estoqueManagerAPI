const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'dbadiego',
    password: '1234',
    database: 'apibd',
    port: 3306
});

exports.pool = pool;