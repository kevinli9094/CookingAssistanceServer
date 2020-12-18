const { workerData } = require('worker_threads');
const { Client } = require('@elastic/elasticsearch');
const crawler = require('./allRecipesCrawler');
const { getConfig } = require('../config');
const { crawlerLogger } = require('../loggers');

const config = getConfig();

const client = new Client({ node: config.elasticSearchUrl });

crawler.initialCrawling(
  parseInt(workerData.beginIndex, 10),
  parseInt(workerData.endIndex, 10),
  client,
)
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    crawlerLogger.error(`Error initialting crawling for all recipe: ${err}`);
    process.exit(2);
  });
