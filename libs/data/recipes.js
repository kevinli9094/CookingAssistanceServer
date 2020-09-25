const validateRecipe = (recipe) => {
  const validInstructions = recipe && recipe.instructions && recipe.instructions.length > 0;
  const validIngredients = recipe && recipe.ingredients && recipe.ingredients.length > 0;
  if (validIngredients && validInstructions) {
    return true;
  }
  return false;
};

// store it in db only if it has valid instructions, and valid ingredients
const storeIfNeeded = (recipe, db) => new Promise((resolve, reject) => {
  if (validateRecipe(recipe)) {
    db.recipes.insertOne(recipe, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  } else {
    resolve();
  }
});

const randomRecipe = (db) => db.recipes.aggregate([{ $sample: { size: 1 } }]).toArray();

module.exports = {
  storeIfNeeded,
  randomRecipe,
};
