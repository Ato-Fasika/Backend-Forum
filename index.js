const express = require("express");
const mysql = require('mysql2')
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 80;
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, "0.0.0.0", () => {
  console.log("Listening...");
});

require('dotenv').config()
// const connection = mysql.createConnection(process.env.DATABASE_URL)
// console.log('Connected to PlanetScale!')
// // connection.end()
// Host: sql9.freesqldatabase.com
// Database name: sql9621306
// Database user: sql9621306
// Database password: SjLZFXmYh3
// Port number: 3306
let connection = mysql.createConnection({
  user: "sql9621306",
  password: "SjLZFXmYh3",
  host: "sql9.freesqldatabase.com",
  database: "sql9621306"
});
// let connection = mysql.connection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) console.log(err);
  else console.log("You are succesfully Connected to DB");
});

let tempId = 0;
let profile = `CREATE TABLE if not exists profile(
  user_profile_id int auto_increment,
  user_id int(11) not null,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  PRIMARY KEY (user_profile_id)
 
)`;
let registration = `CREATE TABLE if not exists registration(
  user_id int auto_increment,
  user_name varchar(255) not null,
  user_email varchar(255) not null,
  password varchar(255) not null,
  PRIMARY KEY (user_id)
)`;

let questionTable = `CREATE TABLE if not exists question(
  question_id int auto_increment,
  user_id int(11) not null,
  question varchar(255) not null,
  description TEXT not null,
  PRIMARY KEY (question_id)
    )`;
    let answer = `CREATE TABLE if not exists answer(
      answer_id int auto_increment,
      user_id int(11) not null,
      answer varchar(255) not null,
      PRIMARY KEY (answer_id)
  
     )`;
connection.query(registration, (err, results, fields) => {
  if (err) console.log(err);
});
connection.query(profile, (err, results, fields) => {
  if (err) throw err;
});
connection.query(questionTable, (err, results) => {
  if (err) throw err;
  console.log("Table  created succesfully");
});
connection.query(answer, (err, results) => {
  if (err) throw err;
});
app.post("/createaccount", (req, res) => {
  let info = req.body;
  const name = info.name;
  const fathersName = info.fatherName;
  const email = info.email;
  const password = info.password;
  const username = info.username;
  let checkEmail = `SELECT * FROM registration WHERE  user_email =?`;
  let checkUsername = `SELECT * FROM registration WHERE user_name =?`;
  let dataInsert = `INSERT INTO registration (user_name,user_email,password) VALUES (?, ?, ?)`;

  connection.query(checkEmail, [email], (err, results) => {
    if (err) {
      throw err;
    } else if (results.length > 0) {
      res.end("This email allready exist");
    } else {
      connection.query(checkUsername, [username], (err, results) => {
        if (err) {
          throw err;
        } else if (results.length > 0) {
          res.end("The user name already exist");
        } else {
          connection.query(
            dataInsert,
            [username, email, password],
            (err, results, fields) => {
              if (err) {
                throw err;
              } else {
                res.end("Account created successfully");
                console.log(results);
                tempId = results.insertId;
                console.log(tempId);
              }
            }
          );
          connection.query(
            `INSERT INTO profile(user_id,first_name,last_name) VALUES (?, ?, ?)`,
            [tempId, name, fathersName],
            (err, results) => {
              if (err) throw err;
            }
          );
        }
      });
    }
  });
});
app.post("/login", (req, res) => {
  let info = req.body;
  const email = info.email;
  const password = info.password;
  connection.query(
    `SELECT * FROM registration WHERE user_email = ? and password = ? `,
    [email, password],
    (err, results) => {
      if (err) {
        throw err;
      } else if (results.length == 0) {
        res.end("The user in this account does't exist");
      } else {
        tempId = results[0].user_id;
        console.log("user detected");
        console.log(tempId);
        let data = { user: [] };
        data.user = results;
        var stringdata = JSON.stringify(data);
        res.end(stringdata);
      }
    }
  );
});
app.get("/user", (req, res) => {
  connection.query(
    `SELECT * FROM registration WHERE user_id = ? `,
    [tempId],
    (err, results) => {
      if (err) {
        throw err;
      } else if (results.length == 0) {
        console.log("the user in this id doesn't find");
      } else {
        let data = { user: [] };
        data.user = results;
        var stringdata = JSON.stringify(data);
        res.end(stringdata);
      }
    }
  );
});
app.post("/question", (req, res) => {
  console.log(tempId);
  let info = req.body;
  let title = info.title;
  let description = info.description;
  let insertData = `INSERT INTO question (user_id,question,description) VALUE (?, ?, ?)`;
  connection.query(
    insertData,
    [tempId, title, description],
    (err, results) => {
      if (err) throw err;
      console.log("Question inseted successfully");
    }
  );
});
app.post("/answer", (req, res) => {
  console.log(tempId);
  let insertAnswer = `INSERT INTO answer(user_id,answer) VALUES  (?, ?)`;
  let info = req.body.answer;
  connection.query(insertAnswer, [tempId, info], (err, results) => {
    if (err) throw err;
    console.log("answer inserted");
  });
});
app.get("/userQuestion", (req, res) => {
  let userQuestion = `SELECT registration.user_id,registration.user_name,question.question,question.question_id FROM registration,question WHERE registration.user_id = question.user_id ORDER BY question.question_id`;
  connection.query(userQuestion, (err, results) => {
    if (err) {
      throw err;
    } else {
      console.log(results);
      let data = { user: [] };
      data.user = results;
      var stringdata = JSON.stringify(data);
      res.end(stringdata);
    }
  });
});
