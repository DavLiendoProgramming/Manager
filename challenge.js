require('./src/db/mongoose');
const Task = require('./src/models/Task');

const deleteTaskAndCount = async (id) => {
  await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({ completed: false });
  return count;
};

deleteTaskAndCount('5ee8c87391d6a22bd8a12bde')
  .then((res) => console.log(res))
  .catch((e) => console.log(e));
