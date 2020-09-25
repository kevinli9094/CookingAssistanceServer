const request = require('request');
const parser = require('../parsers/allRecipesParser');
const recipesDB = require('../data/recipes');

const baseUrl = 'https://www.allrecipes.com/recipe/';

const dbFieldName = 'allRecipesIndex';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const processIndex = (index, db, callback) => {
  const currentUrl = baseUrl + index;

  console.log(`sending request ${currentUrl}`);
  request(currentUrl, (error, response, body) => {
    if (error) {
      callback(index, error);
    } else if (response && response.statusCode === 200) {
      try {
        console.log(`trying to store url: ${currentUrl}`);
        recipesDB.storeIfNeeded(parser.parse(body), db)
          .then(() => {
            callback(index);
          })
          .catch((err) => {
            callback(index, err);
          });
      } catch (exception) {
        callback(index, exception);
      }
    } else {
      callback(index, new Error('No response', 'Url is not responding'));
    }
  });
};

const updateIndex = (db, index) => new Promise((resolve) => {
  const query = {};
  query[dbFieldName] = { $exists: true, $lt: index };
  db.crawlerHelper.findOneAndUpdate(query, { $set: { allRecipesIndex: index } }, (err) => {
    if (err) {
      console.log(`Something wrong when updating data!${err}`);
    }

    resolve();
  });
});

const getStartIndex = (db) => {
  const query = {};
  query[dbFieldName] = { $exists: true };
  return db.crawlerHelper.findOne(query);
};

const initalCrawling = (startIndex, stopIndex, db, callback) => {
  const skippedErrors = [];
  // eslint-disable-next-line no-async-promise-executor
  const crawlingPromise = new Promise(async (resolve) => {
    let count = 0;
    for (let currentIndex = startIndex; currentIndex <= stopIndex; currentIndex += 1) {
      // eslint-disable-next-line no-loop-func
      processIndex(currentIndex, db, (index, error) => {
        count += 1;
        if (error) {
          const newError = error;
          newError.index = index;
          skippedErrors.push(newError);
        }
        if (count === stopIndex - startIndex + 1) {
          resolve();
        }
      });

      // eslint-disable-next-line no-await-in-loop
      await sleep(2000);
    }
  });

  crawlingPromise
    .then(() => {
      updateIndex(db, stopIndex)
        .then(callback(skippedErrors));
    });
};

const update = (errorsToStop, db, callback) => {
  let currentIndex = 0;
  const updatePromise = (startIndexs) => new Promise((resolve) => {
    let currentErrorCount = 0;

    if (startIndexs) {
      currentIndex = startIndexs[dbFieldName] + 1;
    }

    while (currentErrorCount < errorsToStop) {
      // eslint-disable-next-line no-loop-func
      processIndex(currentIndex, db, (error, index) => {
        if (error) {
          console.log(`Running into error while processing ${index}. skipping error: ${error}`);
          currentErrorCount += 1;
        } else {
          currentErrorCount = 0;
        }
      });
      currentIndex += 1;
    }
    resolve();
  });

  getStartIndex(db)
    .then(updatePromise)
    .then(() => {
      updateIndex(db, currentIndex);
    })
    .then(() => {
      callback();
    })
    .catch((error) => {
      callback(error);
    });
};

module.exports = {
  initalCrawling,
  update,
};
