const { MongoClient } = require('mongodb');

let mDatabase;

function initDatabase(url, databaseName, callback) {
  if (mDatabase) {
    console.warn('trying to init database again. Inoring.');
    callback(null, mDatabase);
  }

  MongoClient.connect(url, { useUnifiedTopology: 'true' }, (err, client) => {
    if (err) {
      callback(err);
    }
    const db = client.db(databaseName);

    db.recipes = db.collection('recipes');
    db.user = db.collection('users');
    db.crawlerHelper = db.collection('crawlerHelper');

    db.crawlerHelper.findOne()
      .then((entry) => {
        if (!entry) {
          db.crawlerHelper.insertOne({
            allRecipesIndex: 0,
          });
        }
      });

    mDatabase = db;
    return callback(null, mDatabase);
  });
}

function getDb() {
  return mDatabase;
}

module.exports = {
  getDb,
  initDatabase,
};
