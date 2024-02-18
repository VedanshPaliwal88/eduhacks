const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const moment = require('moment');
const app = express();
dotenv.config();

app.use(cors());
app.use(bodyParser.json())

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.MYSQLPSWRD || "root",
    database: "db1",
});
  
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to mysql server...");
});

app.get('/get', (req, res) => {
    con.connect(function(err) {
        let query = "SELECT * FROM TRANSACTIONS"
        con.query(query, (err, result, fields) => {
            if (err) {
                console.log(err);
            }
            for(let i = 0; i < result.length; i++) {
                result[i].date = moment(result[i].date, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY HH:mm')
            }
            res.json(result);
        });
    });
});

app.post('/create', (req, res) => {
   try {
    let name = req.body.name;
    let amount = req.body.amount;
    let date = req.body.date;
    // let date = moment(req.body.date, 'DD-MM-YYYY').format('YYYY-MM-DD');

    con.connect(function(err) {
        var query = `INSERT INTO TRANSACTIONS (amount, name, date) VALUES (${amount}, '${name}', '${date}')`;
        con.query(query, function (err, result) {
            if (err) {
                console.log(err);
            }
            res.status(200).json({ message: 'Object inserted successfully.' });
        });
    });
   } catch (error) {
    console.log(error);
   }
});

app.post('/update', (req, res) => {

    try {
        const transactionId = req.body.id;
        const newAmount = req.body.amount;
        const newDate = req.body.date; 
        const newName = req.body.name;

        con.connect(function(err) {
            console.log(newDate);
            if (newDate == "") {
                var query = `UPDATE TRANSACTIONS SET amount = ${newAmount}, name = '${newName}' WHERE id = ${transactionId}`;
            } else {
                var query = `UPDATE TRANSACTIONS SET amount = ${newAmount}, name = '${newName}', date = '${newDate}' WHERE id = ${transactionId}`;
            }
            
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                }
                res.status(200).json({ message: 'Object updated successfully.' });
            });
        });
    } catch (error) {
        console.log(error);
    }
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});