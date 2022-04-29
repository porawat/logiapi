require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require("express");
var mysqlDb = require('./config/database');
const auth = require('./middleware/auth');
const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
  next();
})
const bodyParser = require('body-parser');
const cors = require("cors");
app.use(express.json());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true, parameterLimit: 50000 }));
const whitelist = [
  'http://localhost:5001',
  'http://localhost:42000',
]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions));
var site = require('./routes/site');
app.use('/site', site);
app.post('/welcome', auth, (req, res) => {
  res.status(200).send('welcom ');
})
app.get('/', (req, res) => {
  return res.send('<center><h1>welcome to RESTfull API</h1></center>');
});

module.exports = app;