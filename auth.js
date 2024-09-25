const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const router = express.Router();

const secretKey = 'your_secret_key';

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const userId = uuidv4();

  db.run(`INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`, [userId, name, email, hashedPassword], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).send("Email already exists.");
      }
      return res.status(500).send("There was a problem registering the user.");
    }
    const token = jwt.sign({ id: userId }, secretKey, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token: token });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token: token });
  });
});

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
}

module.exports = { router, verifyToken };