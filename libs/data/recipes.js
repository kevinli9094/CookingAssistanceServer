const validateRecipe = (recipe) => {
  const validInstructions = recipe && recipe.instructions && recipe.instructions.length > 0;
  const validIngredients = recipe && recipe.ingredients && recipe.ingredients.length > 0;
  if (validIngredients && validInstructions) {
    return true;
  }
  return false;
};

const getIndex = (language) => {
  if (language === 'cn') {
    return 'chinese_recipes';
  }
  return 'english_recipes';
};

const mapEsItem = (item) => {
  const newItem = item._source;
  newItem._id = item._id;
  return newItem;
};

const storeIfNeeded = (recipe, es) => {
  if (validateRecipe(recipe)) {
    // query to find a doc where it has the same author name and same title name
    const searchQuery = {
      index: getIndex(),
      body: {
        query: {
          bool: {
            must: [
              {
                match:
                {
                  author: {
                    query: recipe.author,
                  },
                },
              },
              {
                match:
                {
                  name: {
                    query: recipe.name,
                  },
                },
              },
            ],
          },
        },
      },
    };
    return es.search(searchQuery)
      .then((result) => {
        if (result.body.hits.total.value > 0) {
          return Promise.reject(new Error('Dublication. Skipping'));
        }
        // store the recipe
        return es.index({
          index: searchQuery.index,
          body: recipe,
        });
      });
  }
  return Promise.reject(new Error('Invlide recipe'));
};

// terms are string separated by space
const searchRecipe = (es, terms, page, perPage, language, user, minRating, requirements) => {
  const query = {
    index: getIndex(language),
    body: {
      query: {
        bool: {
          must: [
            {
              match:
              {
                ingredients: {
                  query: terms,
                },
              },
            },
          ],
        },
      },
      from: perPage * (page - 1),
      size: perPage,
    },
  };

  if (minRating) {
    query.body.query.bool.must.push({
      range: {
        'rating.value': {
          gte: '5',
        },
      },
    });
  }

  if (user) {
    // check what dishes needed to be filtered
    let filterById = [];
    if (user.filteredDishes && user.filteredDishes.length > 0) {
      filterById = filterById.concat(user.filteredDishes);
    }

    if (user.selectedDishes && user.selectedDishes.length > 0) {
      filterById = filterById.concat(user.selectedDishes);
    }
    query.body.query.bool.must_not = filterById.map((idStr) => ({
      term: { _id: idStr },
    }));
  }

  // // only show dishes that meets the requirement
  // if (requirements) {
  //   // fist make sure the dish has nutrition info
  //   query.nutrition = { $exists: true };

  //   Object.entries(requirements).forEach((item) => {
  //     const key = item[0];
  //     const dietGoal = item[1];
  //     if (dietGoal.strategy === 'at least') {
  //       query[`nutrition.${key}`] = { $gte: parseFloat(dietGoal.value) };
  //     } else if (dietGoal.strategy === 'at most') {
  //       query[`nutrition.${key}`] = { $lte: parseFloat(dietGoal.value) };
  //     } else {
  //       defaultLogger.warn(`Cannot recognize strategy: ${dietGoal.strategy}`);
  //     }
  //   });
  // }
  return es.search(query)
    .then((result) => Promise.resolve({
      items: result.body.hits.hits.map(mapEsItem),
      totalPageCount: Math.ceil(result.body.hits.total.value / perPage),
    }));
};

const getRecipesFromIds = (es, ids) => {
  // todo: include english_recipes index
  const query = {
    index: [getIndex('cn')],
    body: {
      query: {
        ids: {
          values: ids,
        },
      },
    },
  };

  return es.search(query)
    .then((result) => Promise.resolve(result.body.hits.hits.map(mapEsItem)));
};

module.exports = {
  storeIfNeeded,
  searchRecipe,
  getRecipesFromIds,
};
