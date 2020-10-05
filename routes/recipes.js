const express = require('express');
const recipesDB = require('../libs/data/recipes');
const { defaultLogger } = require('../libs/loggers');

const router = express.Router();

// return a ramdom recipe
router.get('/', (req, res) => {
  recipesDB.randomRecipe(res.app.db)
    .then((recipes) => {
      res.status(200).json(recipes);
    });
});

// drop all recipes. Only admin can access this
router.get('/drop', (req, res) => {
  res.app.db.recipes.drop()
    .then(() => {
      res.status(200).json({ message: 'Deleted all recipes' });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.get('/search', (req, res) => {
  const notValidQueryError = new Error('Please provide valid terms for searching in the query');

  const { page = 1, limit = 10 } = req.query;

  if (req.query.terms) {
    const query = req.query.terms.replace(/,/g, ' ');
    defaultLogger.info(query);
    if (query) {
      recipesDB.searchRecipe(res.app.db, query, page, limit)
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

module.exports = router;
