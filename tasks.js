// tasks.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { verifyToken } = require('./auth');
const router = express.Router();

router.use(verifyToken);

router.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;
  const taskId = uuidv4();
  db.run(`INSERT INTO tasks (id, user_id, title, description, status) VALUES (?, ?, ?, ?, ?)`, [taskId, req.userId, title, description, status], function(err) {
    if (err) return res.status(500).send("There was a problem adding the task.");
    res.status(200).send({ id: taskId });
  });
});

router.get('/tasks', (req, res) => {
  db.all(`SELECT * FROM tasks WHERE user_id = ?`, [req.userId], (err, tasks) => {
    if (err) return res.status(500).send("There was a problem retrieving the tasks.");
    res.status(200).send(tasks);
  });
});

router.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  db.run(`UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?`, [title, description, status, req.params.id, req.userId], function(err) {
    if (err) return res.status(500).send("There was a problem updating the task.");
    res.status(200).send({ message: "Task updated successfully" });
  });
});

router.delete('/tasks/:id', (req, res) => {
  db.run(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).send("There was a problem deleting the task.");
    res.status(200).send({ message: "Task deleted successfully" });
  });
});

module.exports = router;