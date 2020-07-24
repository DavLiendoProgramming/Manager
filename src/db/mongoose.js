//Connecting to the DB through Mongoose.

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
