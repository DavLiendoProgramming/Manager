const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();
const { sendWelcomeEmail, sendByeEmail } = require('../emails/account');
//Create an User
router.post('/users', async (req, res) => {
  try {
    //Creates user and logs it with a token

    const user = new User(req.body);
    await user.save();
    //Sends Welcome emal
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

//Get own profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

//Update user
router.patch('/users/me', auth, async (req, res) => {
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
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
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
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }

    //Mongoose's method .remove() is asynchronous
    await req.user.remove();
    sendByeEmail(req.user.email, req.user.name);
    res.send(req.user);
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

//Create  Avatar
const upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a valid image format'));
    }
    cb(undefined, true);
  },
});
router.post(
  '/users/me/avatar',
  auth,
  upload.single('upload'),
  async (req, res) => {
    const buffer = sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    //use sharp to get the right size of image

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Read an user's profile pic
router.get('/users/:id/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error('Avatar not found');
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

//Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(503).send({ error: e.message });
  }
});

module.exports = router;
