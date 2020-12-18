const request = require('request');
const parser = require('../parsers/allRecipesParser');
const recipesDB = require('../data/recipes');
const { crawlerLogger } = require('../loggers');

const baseUrl = 'https://www.allrecipes.com/recipe/';

const dbHelperIndex = 'update_helper';
const allRecipeId = 'allrecipeid';

const processIndex = (index, es) => new Promise((resolve) => {
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
        recipesDB.storeIfNeeded(parser.parse(body), es)
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

const createIndexIfNotExit = (es) => es.exists({
  index: dbHelperIndex,
  id: allRecipeId,
})
  .then((exist) => {
    if (!exist) {
      return es.index({
        index: dbHelperIndex,
        id: allRecipeId,
        body: {
          index: 0,
        },
      });
    }

    return Promise.resolve();
  });

const updateIndex = (es, index) => createIndexIfNotExit(es)
  .then(() => es.update({
    index: dbHelperIndex,
    id: allRecipeId,
    body: {
      script: {
        lang: 'painless',
        source: `ctx._source.index = ctx._source.index < ${index} ? ${index} : ctx._source.index`,
      },
    },
  }));

const getStartIndex = (es) => createIndexIfNotExit(es)
  .then(() => es.search({
    index: dbHelperIndex,
    id: allRecipeId,
  })
    .then((result) => Promise.resolve(result.hits.hits[0])));

const resetIndex = (es) => createIndexIfNotExit(es)
  .then(() => es.update({
    index: dbHelperIndex,
    id: allRecipeId,
    body: {
      index: 0,
    },
  }));

const initialCrawling = (startIndex, stopIndex, es) => {
  // eslint-disable-next-line no-async-promise-executor
  const crawlingPromise = new Promise(async (resolve) => {
    let count = 0;
    for (let currentIndex = startIndex; currentIndex <= stopIndex; currentIndex += 1) {
      // eslint-disable-next-line no-await-in-loop
      await processIndex(currentIndex, es)
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
      return updateIndex(es, stopIndex + 1);
    });
};

const update = (errorsToStop, es) => {
  let currentIndex = 0;
  // eslint-disable-next-line no-async-promise-executor
  const updatePromise = (startIndexs) => new Promise(async (resolve) => {
    let currentErrorCount = 0;

    if (startIndexs) {
      currentIndex = startIndexs.index + 1;
    }

    while (currentErrorCount < errorsToStop) {
      // eslint-disable-next-line no-await-in-loop
      await processIndex(currentIndex, es)
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
  return getStartIndex(es)
    .then((startIndexs) => updatePromise(startIndexs))
    .then(() => {
      crawlerLogger.info('Starting calling updateIndex');
      return updateIndex(es, currentIndex);
    });
};

module.exports = {
  initialCrawling,
  update,
  resetIndex,
};
