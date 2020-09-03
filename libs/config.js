const fs = require('fs');
const path = require('path');

const getConfig = () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config', 'settings.json'), 'utf8'));
  return config;
};

module.exports = {
  getConfig,
};
