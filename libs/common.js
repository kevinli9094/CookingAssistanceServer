const { unit } = require('mathjs');
const { defaultLogger } = require('./loggers');

const standaradunit = {
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
          if (standaradunit[key]) {
            result[key] = unit(value).toNumber(standaradunit[key]);
          } else {
            defaultLogger.warn(`unrecognized key while converting unit: ${key}`);
          }
      }
    }
  });

  return result;
};

module.exports = {
  standaradunit,
  convertUnitInNutrition,
};
