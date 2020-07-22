//Connect to DB
require('./db/mongoose');
const express = require('express');

//Models from mongoose

const User = require('./models/User');
const Task = require('./models/Task');

//Defining routes

app = express();
const userRouter = require('./routes/users');
const taskRouter = require('./routes/tasks');
const port = process.env.PORT || 3000;

//Middleware

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is up on port: ' + port);
});
