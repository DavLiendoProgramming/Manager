const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    //Get token from header
    const token = req.header('Authorization').replace('Bearer ', '');

    //Verify token and validation (remember token includes id of the user)
    const decoded = jwt.verify(token, 'signature');

    //Search for user and if it still has the token for it's session
    const user = await User.findOne({
      _id: decoded._id,
      //Checks if it still has the token
      'tokens.token': token,
    });

    //Check if user exists
    if (!user) {
      throw new Error();
    }

    //Pass the user & the session's token to the request for the next function to use
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(503).send({ error: 'Authentication error' });
  }
};
module.exports = auth;
