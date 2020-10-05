const { workerData } = require('worker_threads');
const DB = require('../data/mongoDb');
const crawler = require('./allRecipesCrawler');
const { getConfig } = require('../config');
const { crawlerLogger } = require('../loggers');

const config = getConfig();

DB.initDatabase(config.databaseBaseString, config.databaseName)
  .then((db) => crawler.update(workerData.continueErrorCount, db)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      crawlerLogger.error((`Error while updating: ${error}`));
      process.exit(2);
    }))
  .catch((err) => {
    crawlerLogger.error((`Error connecting to MongoDB: ${err}`));
    process.exit(2);
  });
