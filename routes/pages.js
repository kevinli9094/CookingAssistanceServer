const express = require('express');
const userDB = require('../libs/data/users');
const recipesDB = require('../libs/data/recipes');
const commonjs = require('../libs/common');
const { validateJson } = require('../libs/schema');

const router = express.Router();

/* GET create user page. */
router.get('/user/create', (req, res) => {
  res.render('createUser', { title: 'Create User' });
});

router.get('/admin', (req, res) => {
  res.render('adminPanel', { title: 'Admin Panel' });
});

router.get('/user/edit/:id', (req, res) => {
  const userId = req.params.id;

  userDB.findUserById(res.app.db, userId)
    .then((user) => {
      if (user.filteredDishes && user.filteredDishes.length > 0) {
        recipesDB.getRecipesFromIds(res.app.db, user.filteredDishes)
          .then((dishes) => {
            res.render('editUser', {
              title: 'Edit user', filteredDishes: dishes, user, userId,
            });
          });
      } else {
        res.render('editUser', { title: 'Edit user', user, userId });
      }
    })
    .catch((error) => {
      res.render('error', { message: 'Failed to retrieve user, please make sure the userId is correct', error });
    });
});

const processQuery = (req) => {
  const page = (req.query.page && parseInt(req.query.page, 10)) || 1;
  const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
  const minRating = (req.query.minRating && parseInt(req.query.minRating, 10));
  const searchQuery = req.query.searchQuery && req.query.searchQuery.replace(/,/g, ' ');

  let requirements = null;
  let requirementsForUser = null;
  Object.entries(req.query).forEach((pair) => {
    const visibleKey = pair[0];
    const actualKey = commonjs.visibleToActualFieldMap[visibleKey];
    if (actualKey) {
      if (!requirements) {
        requirements = {};
      }
      if (!requirementsForUser) {
        requirementsForUser = {};
      }
      const dietGoalString = pair[1];
      dietGoalString.value = parseInt(dietGoalString.value, 10);

      requirements[actualKey] = dietGoalString;
      requirementsForUser[visibleKey] = dietGoalString;
    }
  });
  return {
    page, limit, minRating, searchQuery, requirements, requirementsForUser,
  };
};

router.get('/search/:id', (req, res) => {
  const userId = req.params.id;

  if (userId) {
    const schemaResult = validateJson('searchQuery', req.query);
    if (!schemaResult.result) {
      res.render('error', { message: 'Invalid query', error: schemaResult.errors });
      return;
    }

    const {
      page, limit, minRating, searchQuery, requirements, requirementsForUser,
    } = processQuery(req);

    userDB.findUserById(res.app.db, userId)
      .then((user) => {
        let query = '';
        if (user.ingredients && user.ingredients.length > 0) {
          query = user.ingredients.toString().replace(/,/g, ' ');
        }

        if (searchQuery) {
          query += ` ${searchQuery}`;
        }

        return recipesDB.searchRecipe(res.app.db, query, page, limit, user, minRating, requirements)
          .then((result) => {
            if (user.selectedDishes && user.selectedDishes.length > 0) {
              recipesDB.getRecipesFromIds(res.app.db, user.selectedDishes)
                .then((userSelectedDishes) => {
                  res.render('search', {
                    title: 'Search', userId, user, fields: commonjs.visibleField, result, page, limit, minRating, searchQuery, requirements: requirementsForUser, userSelectedDishes,
                  });
                });
              return;
            }
            res.render('search', {
              title: 'Search', userId, user, fields: commonjs.visibleField, result, page, limit, minRating, searchQuery, requirements: requirementsForUser,
            });
          })
          .catch((error) => {
            res.render('error', { message: 'Unable to search for recipes', error });
          });
      })
      .catch((error) => {
        res.render('error', { message: 'Failed to retrieve user, please make sure the userId is correct', error });
      });
  } else {
    res.render('error', { message: 'Failed to retrieve user, please make sure the userId is correct' });
  }
});

router.get('/search', (req, res) => {
  const schemaResult = validateJson('searchQuery', req.query);
  if (!schemaResult.result) {
    res.render('error', { message: 'Invalid query', error: schemaResult.errors });
    return;
  }

  const {
    page, limit, minRating, searchQuery, requirements, requirementsForUser,
  } = processQuery(req);

  if (!searchQuery) {
    res.render('search', {
      title: 'Search', fields: commonjs.visibleField, result: null, page, limit, minRating, searchQuery, requirements: requirementsForUser,
    });
  }

  recipesDB.searchRecipe(res.app.db, searchQuery, page, limit, null, minRating, requirements)
    .then((result) => {
      res.render('search', {
        title: 'Search', fields: commonjs.visibleField, result, page, limit, minRating, searchQuery, requirements: requirementsForUser,
      });
    })
    .catch((error) => {
      res.render('error', { message: 'Unable to search for recipes', error });
    });
});
module.exports = router;
