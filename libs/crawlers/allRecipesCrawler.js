const request = require('request');
const parser = require('../parsers/allRecipesParser');
const recipesDB = require('../data/recipes');
const { crawlerLogger } = require('../loggers');

const baseUrl = 'https://www.allrecipes.com/recipe/';

const dbFieldName = 'allRecipesIndex';

const processIndex = (index, db) => new Promise((resolve) => {
  const currentUrl = baseUrl + index;
  const result = { index };

  crawlerLogger.debug(`sending request ${currentUrl}`);
  request(currentUrl, (error, response, body) => {
    if (error) {
      result.error = error;
      resolve(result);
    } else if (response && response.statusCode === 200) {
      try {
        crawlerLogger.debug(`trying to store url: ${currentUrl}`);
        recipesDB.storeIfNeeded(parser.parse(body), db)
          .then(() => {
            resolve(result);
          })
          .catch((err) => {
            result.error = err;
            resolve(result);
          });
      } catch (exception) {
        result.error = exception;
        resolve(result);
      }
    } else {
      result.error = new Error('No response', 'Url is not responding');
      resolve(result);
    }
  });
});

const updateIndex = (db, index) => {
  const query = {};
  query[dbFieldName] = { $exists: true, $lt: index };
  return db.crawlerHelper.findOneAndUpdate(query, { $set: { allRecipesIndex: index } })
    .then((result) => new Promise((resolve) => {
      if (!result) {
        crawlerLogger.warn('cannot find updateIndexs');
      }

      crawlerLogger.info('Successfully updated updateIndex');
      resolve();
    }));
};

const getStartIndex = (db) => {
  const query = {};
  query[dbFieldName] = { $exists: true };
  return db.crawlerHelper.findOne(query);
};

const initialCrawling = (startIndex, stopIndex, db) => {
  // eslint-disable-next-line no-async-promise-executor
  const crawlingPromise = new Promise(async (resolve) => {
    let count = 0;
    for (let currentIndex = startIndex; currentIndex <= stopIndex; currentIndex += 1) {
      // eslint-disable-next-line no-await-in-loop
      await processIndex(currentIndex, db)
      // eslint-disable-next-line no-loop-func
        .then((result) => new Promise((resolve2) => {
          count += 1;
          let messageToBeLog = `Successfully stored recipe for index : ${result.index}`;
          if (result.error) {
            messageToBeLog = `Ran into error while processing ${result.index}. message: ${result.error.message}. \nstack: ${result.error.stack}`;
          }
          crawlerLogger.debug(messageToBeLog);
          if (count === stopIndex - startIndex + 1) {
            crawlerLogger.info('Finished crawling');
            resolve();
          }
          resolve2();
        }));
    }
  });

  crawlerLogger.info(`Starting crawling from ${startIndex} to ${stopIndex}`);
  return crawlingPromise
    .then(() => {
      crawlerLogger.info('Starting calling updateIndex');
      return updateIndex(db, stopIndex + 1);
    });
};

const update = (errorsToStop, db) => {
  let currentIndex = 0;
  // eslint-disable-next-line no-async-promise-executor
  const updatePromise = (startIndexs) => new Promise(async (resolve) => {
    let currentErrorCount = 0;

    if (startIndexs) {
      currentIndex = startIndexs[dbFieldName] + 1;
    }

    while (currentErrorCount < errorsToStop) {
      // eslint-disable-next-line no-await-in-loop
      await processIndex(currentIndex, db)
      // eslint-disable-next-line no-loop-func
        .then((result) => new Promise((resolve1) => {
          if (result.error) {
            crawlerLogger.warn(`Running into error while processing ${result.index}. skipping error: ${result.error}`);
            currentErrorCount += 1;
          } else {
            currentErrorCount = 0;
          }
          resolve1();
        }));

      currentIndex += 1;
    }

    crawlerLogger.info('Finished updating.');

    resolve();
  });

  crawlerLogger.info(`Starting updating. errorsToStop = ${errorsToStop}`);
  return getStartIndex(db)
    .then((startIndexs) => updatePromise(startIndexs))
    .then(() => {
      crawlerLogger.info('Starting calling updateIndex');
      return updateIndex(db, currentIndex);
    });
};

module.exports = {
  initialCrawling,
  update,
};
