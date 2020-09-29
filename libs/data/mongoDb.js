const { MongoClient } = require('mongodb');
const { defaultLogger } = require('../loggers');

let mDatabase;

function initDatabase(url, databaseName) {
  return new Promise((resolve, reject) => {
    if (mDatabase) {
      defaultLogger.warn('trying to init database again. Inoring.');
      resolve(mDatabase);
    }

    MongoClient.connect(url, { useUnifiedTopology: 'true' }, (err, client) => {
      if (err) {
        reject(err);
      }
      const db = client.db(databaseName);

      db.recipes = db.collection('recipes');
      db.user = db.collection('users');
      db.crawlerHelper = db.collection('crawlerHelper');

      mDatabase = db;
      db.crawlerHelper.findOne()
        .then((result) => {
          if (!result) {
            defaultLogger.info('inserting empty crawlerHelper.');
            db.crawlerHelper.insertOne({
              allRecipesIndex: 0,
            })
              .then(() => {
                resolve(mDatabase);
              });
          }
          resolve(mDatabase);
        })
        .catch((error) => {
          defaultLogger.warn(`Error while inserting default crawler helper${error.message}`);
        });
    });
  });
}

function getDb() {
  return mDatabase;
}

module.exports = {
  getDb,
  initDatabase,
};
