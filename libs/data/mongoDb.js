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

      db.user = db.collection('users');

      mDatabase = db;
      resolve(db);
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
