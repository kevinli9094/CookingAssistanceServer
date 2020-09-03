const { MongoClient } = require('mongodb');

let mDatabase;

function initDatabase(url, databaseName, callback) {
  if (mDatabase) {
    console.warn('trying to init database again. Inoring.');
    callback(null, mDatabase);
  }

  MongoClient.connect(url, (err, client) => {
    if (err) {
      callback(err);
    }
    const db = client.db(databaseName);

    db.recipes = db.collection('recipes');
    db.user = db.collection('users');

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
