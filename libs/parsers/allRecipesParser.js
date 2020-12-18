const cheerio = require('cheerio');
const { convertUnitInNutrition } = require('../common');

const removeEndingCharIfNeeded = (string) => {
  const lastChar = string.charAt(string.length - 1);
  if (lastChar === ';' || lastChar === '.' || lastChar === ' ') {
    return string.substring(0, string.length - 1);
  }

  return string;
};

const extractUnit = (string) => string.split(' ')[0];

const ifNotEmpty = (selector) => selector
          && selector[0]
          && selector[0].childNodes
          && selector[0].childNodes[0];

const getValue = (selector) => selector[0].childNodes[0].data;

const getArray = (selector) => {
  const array = [];
  if (selector && selector.length > 0) {
    for (let i = 0; i < selector.length; i += 1) {
      if (selector[i]
                  && selector[i].childNodes
                  && selector[i].childNodes[0]
      ) {
        array.push(selector[i].childNodes[0].data);
      }
    }
  }

  return array;
};

const convertJson = (json) => {
  if (json && json.length === 2) {
    const recipe = json[1];
    const convertedJson = {};

    const instructions = [];

    for (let i = 0; i < recipe.recipeInstructions.length; i += 1) {
      instructions.push({
        text: recipe.recipeInstructions[i].text,
      });
    }

    const ratingValue = ((recipe.aggregateRating && recipe.aggregateRating.ratingValue) || 0) * 2;
    const ratingCount = (recipe.aggregateRating && recipe.aggregateRating.ratingCount) || 0;

    convertedJson.name = recipe.name;
    convertedJson.description = recipe.description;
    convertedJson.img = recipe.image.url;
    convertedJson.ingredients = recipe.recipeIngredient;
    convertedJson.originUrl = recipe.mainEntityOfPage;
    convertedJson.author = recipe.author.name;
    convertedJson.prepTime = recipe.prepTime && recipe.prepTime.substring(4);
    convertedJson.cookTime = recipe.cookTime && recipe.cookTime.substring(4);
    convertedJson.totalTime = recipe.totalTime && recipe.totalTime.substring(4);
    convertedJson.instructions = instructions;
    convertedJson.rating = {
      value: ratingValue,
      count: ratingCount,
    };
    convertedJson.nutrition = convertUnitInNutrition(recipe.nutrition);

    return convertedJson;
  }
  return {};
};

const parse = (data) => {
  const $ = cheerio.load(data);

  const existingJsonData = $('script[type="application/ld+json"]');

  // first format
  if (ifNotEmpty(existingJsonData)) {
    const jsonText = existingJsonData[0].childNodes[0].data;

    const json = JSON.parse(jsonText);
    return convertJson(json);
  }

  // second format
  const result = {};

  // extract name
  const nameSelector = $('h1[itemprop="name"]');
  if (ifNotEmpty(nameSelector)) {
    result.name = getValue(nameSelector);
  }

  // extract description
  const descriptionSelector = $('div[itemprop="description"]');
  if (ifNotEmpty(descriptionSelector)) {
    result.description = getValue(descriptionSelector);
  }

  // extract image
  const imageSelector = $('[itemprop="image"]');
  if (imageSelector && imageSelector.length > 0) {
    result.img = imageSelector[0].attribs.src;
  }

  // extract ingredients
  const ingredientsSelector = $('[itemprop="recipeIngredient"], [itemprop="ingredients"]');
  if (ifNotEmpty(ingredientsSelector)) {
    result.ingredients = getArray(ingredientsSelector);
  }

  // extract originUrl
  const originUrlSelector = $('#canonicalUrl');
  if (originUrlSelector && originUrlSelector.length > 0) {
    result.originUrl = originUrlSelector[0].attribs.href;
  }

  // extract author
  const authorSelector = $('[itemprop="author"]');
  if (ifNotEmpty(authorSelector)) {
    result.author = getValue(authorSelector);
  }

  // extract prep time
  const prepTimeSelector = $('[itemprop="prepTime"]');
  if (prepTimeSelector && prepTimeSelector.length > 0) {
    result.prepTime = prepTimeSelector[0].attribs.datetime.substr(2);
  }

  // extract cook time
  const cookTimeSelector = $('[itemprop="cookTime"]');
  if (cookTimeSelector && cookTimeSelector.length > 0) {
    result.cookTime = cookTimeSelector[0].attribs.datetime.substr(2);
  }

  // extract total time
  const totalTimeSelector = $('[itemprop="totalTime"]');
  if (totalTimeSelector && totalTimeSelector.length > 0) {
    result.totalTime = totalTimeSelector[0].attribs.datetime.substr(2);
  }

  // extract instructions
  const instructionsSelector = $('[itemprop="recipeInstructions"]');
  if (instructionsSelector && instructionsSelector.length > 0) {
    const instructions = [];
    instructionsSelector[0].childNodes.forEach((node) => {
      if (node && node.name === 'li') {
        instructions.push(node.childNodes[1].children[0].data);
      }
    });

    result.instructions = instructions;
  }

  const rating = {};
  // extract rating value
  const ratingSelector = $('[itemprop="ratingValue"]');
  if (ratingSelector && ratingSelector.length > 0) {
    rating.value = parseFloat(ratingSelector[0].attribs.content) * 2;
  }

  // extract rating count
  const ratingCountSelector = $('[itemprop="reviewCount"]');
  if (ratingCountSelector && ratingCountSelector.length > 0) {
    rating.count = parseInt(ratingCountSelector[0].attribs.content, 10);
  }
  result.rating = rating;

  // extract nutrition
  const nutrition = {};
  // find all the spans that is direct child of nutrition-summary-facts
  const nutritionSelector = $('.nutrition-summary-facts > span');

  if (nutritionSelector && nutritionSelector.length > 0) {
    nutritionSelector.each((index, span) => {
      // if it has itemprop property, it means it has the key and the amount
      if (span && span.attribs && span.attribs.itemprop) {
        const key = span.attribs.itemprop;
        if (span.children[0].data && parseFloat(span.children[0].data)) {
          let value = removeEndingCharIfNeeded(span.children[0].data);

          // check whether it has a separte span for the unit
          if (index + 1 < nutritionSelector.length) {
            const nextSpan = nutritionSelector[index + 1];
            if (nextSpan && nextSpan.attribs && nextSpan.attribs['aria-hidden']) {
              const unit = extractUnit(nextSpan.children[0].data);
              value = `${value} ${unit}`;
            }
          }

          nutrition[key] = convertUnitInNutrition(value);
        }
      }
    });

    if (Object.keys(nutrition).length > 0) {
      result.nutrition = nutrition;
    }
  }

  return result;
};

module.exports = {
  parse,
};
