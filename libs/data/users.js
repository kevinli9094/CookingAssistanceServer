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

// add user owned ingredients. Do not add duplication
const addIngredients = (db, id, ingredients) => db.user.findOne({ _id: ObjectId(id) })
  .then((user) => {
    if (!user.ingredients) {
      return updateUser(db, id, { ingredients });
    }
    const filtered = user.ingredients.filter((value) => !ingredients.includes(value));

    return updateUser(db, id, { ingredients: filtered.concat(ingredients) });
  });

// remove user owned ingredients
const removeIngredients = (db, id, ingredients) => db.user.findOne({ _id: ObjectId(id) })
  .then((user) => {
    if (!user.ingredients) {
      return Promise.resolve();
    }
    const filtered = user.ingredients.filter((value) => !ingredients.includes(value));
    return updateUser(db, id, { ingredients: filtered });
  });

// add user filtered dishes. Do not add duplication
const addFilteredDishes = (db, id, dishes) => db.user.findOne({ _id: ObjectId(id) })
  .then((user) => {
    if (!user.filteredDishes) {
      return updateUser(db, id, { filteredDishes: dishes });
    }
    const filtered = user.filteredDishes.filter((value) => !dishes.includes(value));

    return updateUser(db, id, { filteredDishes: filtered.concat(dishes) });
  });

// remmove user filtered dishes
const removeFilteredDishes = (db, id, dishes) => db.user.findOne({ _id: ObjectId(id) })
  .then((user) => {
    if (!user.filteredDishes) {
      return Promise.resolve();
    }
    const filtered = user.filteredDishes.filter((value) => !dishes.includes(value));
    return updateUser(db, id, { filteredDishes: filtered });
  });

const finduserById = (db, id) => db.user.findOne({ _id: ObjectId(id) });

module.exports = {
  allUsers,
  createUser,
  updateUser,
  removeUser,
  addIngredients,
  removeIngredients,
  addFilteredDishes,
  removeFilteredDishes,
  finduserById,
};
