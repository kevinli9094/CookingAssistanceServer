const express = require('express');
const recipesDB = require('../libs/data/recipes');

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

module.exports = router;
