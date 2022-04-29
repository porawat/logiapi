const mysql = require('mysql2');
const mysqlDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'samco@admin',
    database: 'logistic'
});
mysqlDb.connect((error) => {
    if (error) {
        console.error(error)
    }
    console.log("successfully connected to database")
});

module.exports = mysqlDb; 
