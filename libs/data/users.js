const ObjectId = require('mongodb').ObjectID;

// return all users
const allUsers = (db) => db.user.find().toArray();
// create user
const createUser = (db, user) => db.user.insertOne(user);

// update user
const updateUser = (db, id, user) => db.user.findOneAndUpdate({ _id: ObjectId(id) }, { $set: user })
  .then((rawResult) => {
    if (rawResult.ok === 1) {
      if (!rawResult.value) {
        return Promise.reject(new Error('Cannot find user'));
      }
      return Promise.resolve(rawResult.value);
    }
    return Promise.reject(rawResult.lastErrorObject);
  });

// remove user
const removeUser = (db, id) => db.user.findOneAndDelete({ _id: ObjectId(id) })
  .then((rawResult) => {
    if (rawResult.ok === 1) {
      if (!rawResult.value) {
        return Promise.reject(new Error('Cannot find user'));
      }
      return Promise.resolve(rawResult.value);
    }
    return Promise.reject(rawResult.lastErrorObject);
  });

module.exports = {
  allUsers,
  createUser,
  updateUser,
  removeUser,
};
