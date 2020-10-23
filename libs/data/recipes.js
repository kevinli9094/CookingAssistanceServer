const { ObjectId } = require('mongodb');
const { defaultLogger } = require('../loggers');

const validateRecipe = (recipe) => {
  const validInstructions = recipe && recipe.instructions && recipe.instructions.length > 0;
  const validIngredients = recipe && recipe.ingredients && recipe.ingredients.length > 0;
  if (validIngredients && validInstructions) {
    return true;
  }
  return false;
};

// store it in db only if it has valid instructions, and valid ingredients
const storeIfNeeded = (recipe, db) => {
  if (validateRecipe(recipe)) {
    return db.recipes.findOne({ author: recipe.author, name: recipe.name })
      .then((doc) => {
        if (doc) {
          return Promise.reject(new Error('Dublication. Skipping'));
        }
        return db.recipes.insertOne(recipe);
      });
  }
  return Promise.reject(new Error('Invlide recipe'));
};

const randomRecipe = (db) => db.recipes.aggregate([{ $sample: { size: 1 } }]).toArray();

const searchRecipe = (db, terms, page, perPage, user, minRating, requirements) => {
  const query = {
    $text: { $search: terms },
  };

  if (minRating) {
    query['rating.value'] = { $gte: parseInt(minRating, 10) };
  }

  if (user) {
    // check what dishes needed to be filtered
    if (user.filteredDishes && user.filteredDishes.length > 0) {
      const filterById = user.filteredDishes;
      if (user.selectedDishes && user.selectedDishes.length > 0) {
        filterById.concat(user.selectedDishes);
      }
      query._id = { $nin: filterById.map((idStr) => ObjectId(idStr)) };
    }
  }

  // only show dishes that meets the requirement
  if (requirements) {
    // fist make sure the dish has nutrition info
    query.nutrition = { $exists: true };

    Object.entries(requirements).forEach((item) => {
      const key = item[0];
      const dietGoal = item[1];
      if (dietGoal.strategy === 'at least') {
        query[`nutrition.${key}`] = { $gte: parseFloat(dietGoal.value) };
      } else if (dietGoal.strategy === 'at most') {
        query[`nutrition.${key}`] = { $lte: parseFloat(dietGoal.value) };
      } else {
        defaultLogger.warn(`Cannot recognize strategy: ${dietGoal.strategy}`);
      }
    });
  }
  return db.recipes.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(perPage * (page - 1))
    .limit(perPage)
    .toArray()
    .then((items) => db.recipes.countDocuments(query)
      .then((count) => Promise.resolve({ items, totalPageCount: Math.ceil(count / perPage) })));
};

const getRecipesFromIds = (db, ids) => {
  const query = {
    _id: {
      $in: ids.map((id) => ObjectId(id)),
    },
  };

  return db.recipes.find(query).toArray();
};

module.exports = {
  storeIfNeeded,
  randomRecipe,
  searchRecipe,
  getRecipesFromIds,
};
