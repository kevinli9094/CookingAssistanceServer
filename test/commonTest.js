const { expect } = require('chai');

const { convertUnitInNutrition } = require('../libs/common');

describe('convertUnitInUntrition', () => {
  it('able to convert normal nutrition info', () => {
    const testObject = {
      '@type': 'NutritionInformation',
      calories: '311.3 calories',
      carbohydrateContent: '37.1 g',
      cholesterolContent: '40 mg',
      fatContent: '13.1 g',
      fiberContent: '4.1 g',
      proteinContent: '12.1 g',
      saturatedFatContent: '8.2 g',
      sodiumContent: '638.4 mg',
      sugarContent: '7.8 g',
      transFatContent: null,
      servingSize: null,
      unsaturatedFatContent: null,
    };

    const convertedTestObject = convertUnitInNutrition(testObject);

    expect(convertedTestObject.calories).to.be.closeTo(311.3, 0.1);
    expect(convertedTestObject.carbohydrateContent).to.be.closeTo(37.1, 0.1);
    expect(convertedTestObject.cholesterolContent).to.be.closeTo(40, 0.1);
    expect(convertedTestObject.fatContent).to.be.closeTo(13.1, 0.1);
    expect(convertedTestObject.fiberContent).to.be.closeTo(4.1, 0.1);
    expect(convertedTestObject.saturatedFatContent).to.be.closeTo(8.2, 0.1);
    expect(convertedTestObject.sodiumContent).to.be.closeTo(638.4, 0.1);
    expect(convertedTestObject.sugarContent).to.be.closeTo(7.8, 0.1);
  });
});
