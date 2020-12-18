const { workerData } = require('worker_threads');
const { Client } = require('@elastic/elasticsearch');
const crawler = require('./allRecipesCrawler');
const { getConfig } = require('../config');
const { crawlerLogger } = require('../loggers');

const config = getConfig();

const client = new Client({ node: config.elasticSearchUrl });

crawler.update(workerData.continueErrorCount, client)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    crawlerLogger.error((`Error while updating: ${error}`));
    process.exit(2);
  });
