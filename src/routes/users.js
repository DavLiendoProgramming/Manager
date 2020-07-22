const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
//Create an User

router.post('/users', async (req, res) => {
  try {
    //Creates user and logs it with a token

    const user = new User(req.body);
    const token = await user.generateAuthToken();

    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

//Get own profile

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

//Update user

router.patch('/users/:id', async (req, res) => {
  //Getting keys from the request's body
  const updates = Object.keys(req.body);

  //Defining the the updates for the route
  const allowedUpdates = ['name', 'email', 'password', 'age'];

  //Comparing valid updates with the keys from the request
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  if (!isValid) {
    return res.status(400).send({ error: 'Invalid Operation' });
  }
  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    const user = await User.findById(req.params.id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    if (!user) {
      res.status(404).send();
    }
    res.status(203).send(user);
  } catch (e) {
    res.status(503).send();
  }
});

//Fetch user

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Delete an user

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

//login

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    console.log(token);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

//Loging out an user

router.post('/users/logout', auth, async (req, res) => {
  try {
    //Delete the session's token from the array
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    //Save the user's data to the db
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(503).send();
  }
});

//Log them all out
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(503).send(e);
  }
});

module.exports = router;
//te quedaste en el video 8 ...otra vez
