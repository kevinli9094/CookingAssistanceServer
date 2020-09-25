const colors = require('colors');
const { workerData } = require('worker_threads');
const DB = require('../data/mongoDb');
const crawler = require('./allRecipesCrawler');
const { getConfig } = require('../config');

const config = getConfig();

DB.initDatabase(config.databaseBaseString, config.databaseName, (err, db) => {
  if (err) {
    console.log(colors.red(`Error connecting to MongoDB: ${err}`));
    process.exit(2);
  }

  // start updating
  crawler.update(workerData.continueErrorCount, db, (error) => {
    if (error) {
      console.log(error);
      process.exit(2);
    }

    process.exit(0);
  });
});
