const { unit } = require('mathjs');
const { defaultLogger } = require('./loggers');

const standaradUnit = {
  carbohydrateContent: 'g',
  cholesterolContent: 'mg',
  fatContent: 'g',
  fiberContent: 'g',
  proteinContent: 'g',
  saturatedFatContent: 'g',
  servingSize: null,
  sodiumContent: 'mg',
  sugarContent: 'g',
  transFatContent: null,
  unsaturatedFatContent: null,
};

const visibleField = ['calories', 'carbohydrate', 'cholesterol', 'fat', 'fiber', 'protein', 'saturatedFat', 'sodium', 'sugar'];

const visibleToActualFieldMap = {
  calories: 'calories',
  carbohydrate: 'carbohydrateContent',
  cholesterol: 'cholesterolContent',
  fat: 'fatContent',
  fiber: 'fiberContent',
  protein: 'proteinContent',
  saturatedFat: 'saturatedFatContent',
  sodium: 'sodiumContent',
  sugar: 'sugarContent',
};

const actualToVisibleFieldMap = {
  calories: 'calories',
  carbohydrateContent: 'carbohydrate',
  cholesterolContent: 'cholesterol',
  fatContent: 'fat',
  fiberContent: 'fiber',
  proteinContent: 'protein',
  saturatedFatContent: 'saturatedFat',
  sodiumContent: 'sodium',
  sugarContent: 'sugar',
};

const convertUnitInNutrition = (nutritionInfo) => {
  const result = {};

  Object.entries(nutritionInfo).forEach((pair) => {
    const key = pair[0];
    const value = pair[1];

    if (value) {
      switch (key) {
        case 'calories':
          result[key] = parseFloat(value);
          break;
        default:
          if (standaradUnit[key]) {
            result[key] = unit(value).toNumber(standaradUnit[key]);
          } else {
            defaultLogger.warn(`unrecognized key while converting unit: ${key}`);
          }
      }
    }
  });

  return result;
};

module.exports = {
  standaradUnit,
  visibleField,
  visibleToActualFieldMap,
  actualToVisibleFieldMap,
  convertUnitInNutrition,
};
