const express = require('express');
const { Worker } = require('worker_threads');
const { spawn } = require('child_process');
const path = require('path');
const { crawlerLogger } = require('../libs/loggers');
const allRecipesCrawler = require('../libs/crawlers/allRecipesCrawler');

let onGoingAllRecipesWork = false;
let onGoingXiachufanWork = false;

const router = express.Router();

// For initial crawling of allRecipes, validate the begin index and end index
const validateInitInput = (req) => {
  const beginIndex = parseInt(req.body.beginIndex, 10);
  const endIndex = parseInt(req.body.endIndex, 10);

  if (beginIndex && endIndex && beginIndex < endIndex) {
    return true;
  }

  return false;
};

// For updating of allRecipes, validate thecontinueErrorCount field
const validateUpdateinput = (req) => {
  const continueErrorCount = parseInt(req.body.continueErrorCount, 10);

  if (continueErrorCount && continueErrorCount > 0) {
    return true;
  }

  return false;
};

// initial crawling from begin index to end index
router.post('/init/allrecipes', (req, res) => {
  if (!validateInitInput(req)) {
    res.status(422).json({ message: 'Please provide valid beginIndex and endIndex.' });
  } else if (onGoingAllRecipesWork) {
    res.status(200).json({ message: 'OnGoingTask exist' });
  } else {
    onGoingAllRecipesWork = true;

    const data = {
      beginIndex: req.body.beginIndex,
      endIndex: req.body.endIndex,
    };
    const workerPath = path.join(__dirname, '..', 'libs', 'crawlers', 'initWorker.js');
    const worker = new Worker(workerPath, { workerData: data });

    worker.on('exit', () => {
      onGoingAllRecipesWork = false;
    });

    res.status(200).json({ message: 'Start crawling' });
  }
});

// updating and continue searching for recipes untile a certain number of continue errors
router.post('/update/allrecipes', (req, res) => {
  if (!validateUpdateinput(req)) {
    res.status(422).json({ message: 'Please provide valid continueErrorCount.' });
  } else if (onGoingAllRecipesWork) {
    res.status(200).json({ message: 'onGoingTask exist' });
  } else {
    onGoingAllRecipesWork = true;

    const data = { continueErrorCount: req.body.continueErrorCount };
    const workerPath = path.join(__dirname, '..', 'libs', 'crawlers', 'updateWorker.js');
    const worker = new Worker(workerPath, { workerData: data });

    worker.on('exit', () => {
      onGoingAllRecipesWork = false;
    });

    res.status(200).json({ message: 'updating' });
  }
});

router.delete('/index/allrecipe', (req, res) => {
  allRecipesCrawler.resetIndex(res.app.esClient)
    .then(() => {
      res.status(200).json({ message: 'Deleted all crawlerHelper' });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.post('/xiachufan', (req, res) => {
  if (onGoingXiachufanWork) {
    res.status(200).json({ message: 'onGoingTask exist' });
    return;
  }
  onGoingXiachufanWork = true;
  const crawler = spawn('scrapy', ['runspider', 'libs/crawlers/xiachufan/xiachufanRecipeCrawler.py']);

  crawler.stderr.on('data', (data) => {
    crawlerLogger.debug(data.toString());
  });

  crawler.stdout.on('data', (data) => {
    crawlerLogger.debug(data.toString());
  });

  crawler.on('exit', () => {
    crawlerLogger.debug('scrapy process exit');
    onGoingXiachufanWork = false;
  });

  res.status(200).json({ message: 'Start crawling' });
});

module.exports = router;
