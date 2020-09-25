const colors = require('colors');
const { workerData } = require('worker_threads');
const DB = require('../data/mongoDb');
const crawler = require('./allRecipesCrawler');
const { getConfig } = require('../config');

const config = getConfig();

const start = new Promise((resolve) => {
  DB.initDatabase(config.databaseBaseString, config.databaseName, (err, db) => {
    if (err) {
      console.log(colors.red(`Error connecting to MongoDB: ${err}`));
      process.exit(2);
    }

    // start initial crawling

    crawler.initalCrawling(
      parseInt(workerData.beginIndex, 10),
      parseInt(workerData.endIndex, 10),
      db,
      (error) => {
        if (error.length > 0) {
          console.log(error);
        }

        resolve();
      },
    );
  });
});

start
  .then(() => {
    process.exit(0);
  });
