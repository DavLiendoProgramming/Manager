const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isLength(value, { min: 6 })) {
          throw new Error('Password length must be greater than 6 digits');
        }
        if (validator.contains(value, 'password')) {
          throw new Error('Password cant be password');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: { type: Buffer },
  },
  //By defect set to false, enables timestamps
  { timestamps: true }
);

//Getting the tasks created by an user
//Virtuals are not storaged in DB
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

//Send only session's information

userSchema.methods.toJSON = function () {
  //Defining the new user's object
  //You can use const user = this to replace the 'this' word
  const userObject = this.toObject();

  //Deleting unwanted properties of the response object
  delete userObject.tokens;
  delete userObject.password;
  delete userObject.avatar;

  return userObject;
};

//Generate token when login user
userSchema.methods.generateAuthToken = async function () {
  const token = await jwt.sign(
    { _id: this._id.toString() },
    process.env.JWT_SECRET
  );
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

//finding user
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }
  return user;
};

//Hashing password

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

//Deleting user's information in the database after removing user
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
});

const User = mongoose.model('User', userSchema);

module.exports = User;
