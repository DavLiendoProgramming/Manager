const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

//Create a task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Read all tasks
router.get('/tasks', auth, async (req, res) => {
  //returns all Db's objects, 'tasks' its only a variable that will be
  //filled with the method's response
  const sort = {};
  const match = {};
  //Querying only completed tasks
  //Defined match object, and inside it match: {completed:true}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    //The auth middleware passes the user to the req object
    //First way of getting tasks
    // const tasks = await Task.find({ owner: req.user._id });
    //Second way: populating req.user.tasks virtual object
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    //used the match option of virtual populate method to match only completed tasks
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(503).send(e);
  }
});

//Read one task

router.get(`/tasks/:id`, auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Update a task

router.patch('/tasks/:id', auth, async (req, res) => {
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

    //Searching for task by id & owner

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send();
    }
    //Updating every task's property

    updates.forEach((update) => (task[update] = req.body[update]));

    //Running save() will save into the db and also run some middleware
    //before, specified in the schema

    await task.save();
    res.status(203).send(task);
  } catch (e) {
    res.status(503).send();
  }
});

//Delete a task

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
