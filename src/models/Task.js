const mongoose = require('mongoose');
const validator = require('validator');
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: String,
    default: false,
  },
});

taskSchema.pre('save', async function (next) {
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
