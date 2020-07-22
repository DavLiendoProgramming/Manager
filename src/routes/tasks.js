const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

//Create a task

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Fetch all tasks

router.get('/tasks', async (req, res) => {
  //returns all Db's objects, 'tasks' its only a variable that will be
  //filled with the method's response
  try {
    const tasks = await Task.find({});
    res.status(200).send(tasks);
  } catch (e) {
    res.status(503).send(e);
  }
});

//Fetch one task

router.get(`/tasks/:id`, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Update a task

router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid Operation' });
  }

  try {
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    //Searching for task by id

    const task = await Task.findById(req.params.id);

    //Updating every task's property

    updates.forEach((update) => (task[update] = req.body[update]));

    //Running save() will save into the db and also run some middleware
    //before, specified in the schema

    await task.save();
    if (!task) {
      res.status(404).send();
    }
    res.status(203).send(task);
  } catch (e) {
    res.status(503).send();
  }
});

//Delete a task

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
