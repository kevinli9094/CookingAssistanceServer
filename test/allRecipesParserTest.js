const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

const { parse } = require('../libs/parsers/allRecipesParser');

describe('all recepies parser', () => {
    it('testing covert format 1 data', () => {
        const testDataPath = path.join(__dirname, 'testData', 'allRecipesFormat1.txt');

        const converted = parse(fs.readFileSync(testDataPath));

        expect(converted.name).to.equal('Peanut Butter Bars I');
        expect(converted.img).to.equal('https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fimages.media-allrecipes.com%2Fuserphotos%2F4548869.jpg');
        expect(converted.ingredients).to.be.an('array');
        expect(converted.ingredients).to.has.lengthOf(6);
        expect(converted).to.have.ownPropertyDescriptor('description');
        expect(converted).to.have.ownPropertyDescriptor('originUrl');
        expect(converted).to.have.ownPropertyDescriptor('author');
        expect(converted).to.have.ownPropertyDescriptor('prepTime');
        expect(converted).to.have.ownPropertyDescriptor('cookTime');
        expect(converted).to.have.ownPropertyDescriptor('totalTime');
        expect(converted).to.have.ownPropertyDescriptor('instructions');
        expect(converted).to.have.ownPropertyDescriptor('rating');
        expect(converted).to.have.ownPropertyDescriptor('nutrition');
    });

    it('testing covert format 2 data', () => {
        const testDataPath = path.join(__dirname, 'testData', 'allRecipesFormat2.txt');

        const converted = parse(fs.readFileSync(testDataPath));

        expect(converted).to.have.ownPropertyDescriptor('name');
        expect(converted).to.have.ownPropertyDescriptor('img');
        expect(converted).to.have.ownPropertyDescriptor('ingredients');
        expect(converted).to.have.ownPropertyDescriptor('description');
        expect(converted).to.have.ownPropertyDescriptor('originUrl');
        expect(converted).to.have.ownPropertyDescriptor('author');
        expect(converted).to.have.ownPropertyDescriptor('prepTime');
        expect(converted).to.have.ownPropertyDescriptor('cookTime');
        expect(converted).to.have.ownPropertyDescriptor('totalTime');
        expect(converted).to.have.ownPropertyDescriptor('instructions');
        expect(converted).to.have.ownPropertyDescriptor('rating');
        expect(converted).to.have.ownPropertyDescriptor('nutrition');
    });

    it('testing covert format 2 data with empty fields', () => {
        const testDataPath = path.join(__dirname, 'testData', 'allRecipesFormat2EmptyFields.txt');

        const converted = parse(fs.readFileSync(testDataPath));

        expect(converted).to.have.ownPropertyDescriptor('name');
        expect(converted).to.have.ownPropertyDescriptor('img');
        expect(converted).to.not.have.ownPropertyDescriptor('ingredients');
        expect(converted).to.have.ownPropertyDescriptor('description');
        expect(converted).to.have.ownPropertyDescriptor('originUrl');
        expect(converted).to.not.have.ownPropertyDescriptor('author');
        expect(converted).to.have.ownPropertyDescriptor('prepTime');
        expect(converted).to.have.ownPropertyDescriptor('cookTime');
        expect(converted).to.have.ownPropertyDescriptor('totalTime');
        expect(converted).to.have.ownPropertyDescriptor('instructions');
        expect(converted.instructions).to.have.lengthOf(0);
        expect(converted).to.have.ownPropertyDescriptor('rating');
        expect(converted).to.not.have.ownPropertyDescriptor('nutrition');
    });
});