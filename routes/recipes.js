const express = require('express');
const recipesDB = require('../libs/data/recipes');
const userDB = require('../libs/data/users');

const router = express.Router();

router.get('/search', (req, res) => {
  const notValidQueryError = new Error('Please provide valid terms for searching in the query');

  const { page = 1, limit = 10, language } = req.query;

  if (req.query.terms) {
    const query = req.query.terms;
    if (query) {
      recipesDB.searchRecipe(res.app.esClient, query, page, limit, language)
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    } else {
      res.status(500).json(notValidQueryError);
    }
  } else {
    res.status(500).json(notValidQueryError);
  }
});

router.get('/user/search', (req, res) => {
  const {
    page = 1, limit = 10, userId, minRating, language,
  } = req.query;

  const requirements = req.query;
  delete requirements.page;
  delete requirements.limit;
  delete requirements.userId;
  delete requirements.minRating;

  if (!userId) {
    res.status(500).json({ message: 'please provide userId' });
    return;
  }

  userDB.findUserById(res.app.db, userId)
    .then((user) => {
      if (!user.ingredients) {
        return Promise.reject(new Error('user does not have any ingredient'));
      }
      const query = user.ingredients.toString().replace(/,/g, ' ');
      return recipesDB.searchRecipe(
        res.app.esClient,
        query,
        page,
        limit,
        user,
        language,
        minRating,
        requirements,
      )
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          res.status(500).json({ message: `failed to search for recipe${error.message}` });
        });
    })
    .catch((error) => {
      res.status(500).json({ message: `failed to search for recipe: ${error.message}` });
    });
});

module.exports = router;
