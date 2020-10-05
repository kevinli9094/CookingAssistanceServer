const { workerData } = require('worker_threads');
const DB = require('../data/mongoDb');
const crawler = require('./allRecipesCrawler');
const { getConfig } = require('../config');
const { crawlerLogger } = require('../loggers');

const config = getConfig();

DB.initDatabase(config.databaseBaseString, config.databaseName)
  .then((db) => crawler.initialCrawling(
    parseInt(workerData.beginIndex, 10),
    parseInt(workerData.endIndex, 10),
    db,
  )
    .then(() => {
      process.exit(0);
    }))
  .catch((err) => {
    crawlerLogger.error(`Error connecting to MongoDB: ${err}`);
    process.exit(2);
  });
