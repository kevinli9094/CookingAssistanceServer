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

module.exports = {
  storeIfNeeded,
  randomRecipe,
};
