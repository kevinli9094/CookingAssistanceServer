const express = require('express');
const userDB = require('../libs/data/users');
const recipesDB = require('../libs/data/recipes');

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

module.exports = router;
