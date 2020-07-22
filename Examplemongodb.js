const { MongoClient, ObjectID } = require('mongodb');
const connectionURL = 'mongodb://127.0.0.1:27017';
const dbName = 'task-manager';

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true },
  { useUnifiedTopology: true },
  (error, client) => {
    if (error) {
      return console.log('Unable to conect to dabase');
    }
    console.log('MongoDB connected');
    const db = client.db(dbName);

    // db.collection('users')
    //   .updateOne(
    //     { _id: ObjectID('5ee53fbf0fb9391ef4a3ddb7') },
    //     {
    //       $inc: { age: 1 },
    //     }
    //   )
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    // db.collection('tasks')
    //   .updateMany(
    //     { completed: true },
    //     {
    //       $set: { completed: false },
    //     }
    //   )
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }
);
