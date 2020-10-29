const express = require('express');
const usersDb = require('../libs/data/users');
const { defaultLogger } = require('../libs/loggers');
const { validateJson } = require('../libs/schema');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  usersDb.allUsers(res.app.db)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(500).json({ message: 'faile to get all users' });
    });
});

// create user
router.put('/', (req, res) => {
  const { user } = req.body;

  const schemaResult = validateJson('newUser', user);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to create user. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.createUser(res.app.db, user)
    .then(() => {
      res.status(200).json({ message: 'Successfully created new user.' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'Fail to create user' });
    });
});

// delete a user by id
router.delete('/', (req, res) => {
  const id = req.body.userId;

  if (id) {
    usersDb.removeUser(res.app.db, id)
      .then(() => {
        res.status(200).json({ message: 'ok' });
      })
      .catch((error) => {
        defaultLogger.error(error.stack);
        res.status(400).json({ message: 'please provide a vlid user id' });
      });
  } else {
    res.status(400).json({ message: 'please provide a vlid user id' });
  }
});

// update a user
router.put('/edit', (req, res) => {
  const { user, id } = req.body;

  if (!id) {
    res.status(400).json({ message: 'please provide a valid id' });
    return;
  }

  const schemaResult = validateJson('editUser', user);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to update user. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.updateUser(res.app.db, id, user)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

router.put('/ingredients/add', (req, res) => {
  const { userId } = req.body;
  const { ingredients } = req.body;

  const schemaResult = validateJson('stringArray', ingredients);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to add ingredients. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.addIngredients(res.app.db, userId, ingredients)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

router.put('/ingredients/remove', (req, res) => {
  const { userId } = req.body;
  const { ingredients } = req.body;

  const schemaResult = validateJson('stringArray', ingredients);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to add ingredients. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.removeIngredients(res.app.db, userId, ingredients)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

router.put('/filtered/dishes/add', (req, res) => {
  const { userId } = req.body;
  const { dishes } = req.body;

  const schemaResult = validateJson('stringArray', dishes);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to add filtered dishes. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.addFilteredDishes(res.app.db, userId, dishes)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

router.put('/filtered/dishes/remove', (req, res) => {
  const { userId } = req.body;
  const { dishes } = req.body;

  const schemaResult = validateJson('stringArray', dishes);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to remove filtered dish. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.removeFilteredDishes(res.app.db, userId, dishes)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

router.put('/selected/dishes/add', (req, res) => {
  const { userId } = req.body;
  const { dishes } = req.body;

  const schemaResult = validateJson('stringArray', dishes);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to add dishes. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.addSelectedDishes(res.app.db, userId, dishes)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

router.put('/selected/dishes/remove', (req, res) => {
  const { userId } = req.body;
  const { dishes } = req.body;

  const schemaResult = validateJson('stringArray', dishes);
  if (!schemaResult.result) {
    res.status(400).json({
      message: 'Failed to remove dishes. Check inputs.',
      error: schemaResult.errors,
    });
    return;
  }

  usersDb.removeSelecteddDishes(res.app.db, userId, dishes)
    .then(() => {
      res.status(200).json({ message: 'ok' });
    })
    .catch((error) => {
      defaultLogger.error(error.stack);
      res.status(400).json({ message: 'fail to update user' });
    });
});

module.exports = router;
