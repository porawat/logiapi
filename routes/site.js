const express = require("express");
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
var mysqlDb = require('../config/database');
router.get('/', (req, res) => {
  res.send('<center><h1>samco stock online api</h1></center>')
});
router.get('/user', auth,(req, res) => {
  mysqlDb.query("SELECT *,empId,firstname,lastname,token FROM users", (error, results, fields) => {
    if (error) throw error;
    let message = ""
    if (results === undefined || results.length == 0) {
      message = "is empty"
    } else {
      message = "successfully"
    }
    return res.status(200).json({ error: false, data: results, message: message });
  })
});
router.post("/register", async (req, res) => {
  try {
    const { empId, firstname, lastname, password } = req.body;
    if (!(empId && firstname && lastname && password)) {
      res.status(400).send("All input is requried")
    }
    mysqlDb.query(`SELECT * FROM users where empId = ${empId}`, async (error, results, fields) => {
      if (error) throw error;
      let message = ""
      if (results === undefined || results.length == 0) {
        message = "is empty"
        encrytedPassword = await bcrypt.hash(password, 10)
        token = jwt.sign({
          empId, firstname
        }, process.env.TOKEN_KEY, { expiresIn: "24h" })
        //console.log(token)
        mysqlDb.query(`INSERT INTO users (empId,firstname,lastname,password,createAt,token) VALUES (?,?,?,?,?,?)`, [empId, firstname, lastname, encrytedPassword, timestamp(),token], (error, results, fields) => {
          if (error) throw error;
          return res.send({ error: false, data: results, message: "successfully added" });
        })
      } else {
        message = "user already exist . please login"
        return res.send({ error: false, data: results, message: message });
      }
    })
  } catch (err) {
    console.log(err)
  }
})
router.post("/login", async (req, res) => {
  try {
    const { empId, password } = req.body;
    if (!(empId && password)) {
      res.status(400).send("All input is requried")
    }
    mysqlDb.query(`SELECT * FROM users where empId = ${empId}`, async (error, results, fields) => {
      if (error) throw error;
      if (results === undefined || results.length == 0) {
        res.json({ error: true, message: 'user is empty' })
      } else {
        const dbpass = results[0]['password'];
        const pass = await bcrypt.compare(password, dbpass);
        if (pass === true) {
          token = jwt.sign({
            empId: results[0]['empId'], firstname: results[0]['firstname']
          }, process.env.TOKEN_KEY, { expiresIn: "24h" })
          results[0]['token'] = token
          mysqlDb.query(` UPDATE users SET token = '${token}' where empId = ${empId}`, (error, rs, fields) => {
            if (rs.affectedRows === 1) {
              res.status(200).json({ error: false, data: results, message: 'successfully' })
            } else {
              res.status(200).json({ error: false, message: 'password is wrong' })
            }
          })
        } else {
          res.json({ error: false, data: [], message: 'password is wrong' })
        }
      }
    })
  } catch (err) {
    console.log(err)
  }
})
router.post('/bulkuser', auth, async (req, res) => {
  var user = req.body.user;
  var newuser = []
  for (let i = 0; i < user.length; i++) {
    encrytedPassword = await bcrypt.hash(user[i]['password'], 10)
    var token = jwt.sign({
      empId: user[i]['empId'], firstname: user[i]['firstname']
    }, process.env.TOKEN_KEY, { expiresIn: "24h" })
    newuser.push({ empId: user[i]['empId'], firstname: user[i]['firstname'], lastname: user[i]['lastname'], password: encrytedPassword, token: token })
  }
  var sql = "INSERT INTO users (empId, firstname, lastname,password,token) VALUES ?";

  mysqlDb.query(sql, [newuser.map(item => [item.empId, item.firstname, item.lastname, item.password, item.token])], (error, results) => {
    if (error) {
      return res.json({ error: true, data: error, message: 'Duplicate entry' })
    } else {
      return res.json({ error: false, data: results, message: 'successfully' })
    }
  });
})
async function generatearray(array) {
  var add = '';// = [];
  for (let index = 0; index < array.length; index++) {
    if (index == array.length - 1) {
      add = add + "'" + array[index].Request_No + "'";
    } else {
      add = add + "'" + array[index].Request_No + "',";
    }
  }
  return add;
}
function timestamp(){
  var date_ob = new Date();
var day = ("0" + date_ob.getDate()).slice(-2);
var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
var year = date_ob.getFullYear();
var date = year + "-" + month + "-" + day;
var hours = date_ob.getHours();
var minutes = date_ob.getMinutes();
var seconds = date_ob.getSeconds();
var dateTime = date + " " + hours + ":" + minutes + ":" + seconds;
return dateTime;
}
module.exports = router;      