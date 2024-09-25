// profile.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { verifyToken } = require('./auth');
const router = express.Router();

router.use(verifyToken);

router.get('/profile', (req, res) => {
  db.get(`SELECT id, name, email FROM users WHERE id = ?`, [req.userId], (err, user) => {
    if (err) return res.status(500).send("There was a problem retrieving the user profile.");
    res.status(200).send(user);
  });
});

router.put('/profile', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = password ? bcrypt.hashSync(password, 8) : undefined;

  db.run(`UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`, [name, email, hashedPassword, req.userId], function(err) {
    if (err) return res.status(500).send("There was a problem updating the user profile.");
    res.status(200).send({ message: "Profile updated successfully" });
  });
});

module.exports = router;