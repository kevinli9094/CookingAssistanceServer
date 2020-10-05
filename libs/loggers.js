const log4js = require('log4js');

log4js.configure({
  appenders: {
    crawler: { type: 'file', filename: 'crawler.log' },
    general: { type: 'file', filename: 'general.log' },
    console: { type: 'console' },
  },
  categories: {
    crawler: { appenders: ['crawler'], level: 'debug' },
    console: { appenders: ['console'], level: 'warn' },
    default: { appenders: ['general'], level: 'debug' },
  },
});

const consoleLogger = log4js.getLogger('console');
const crawlerLogger = log4js.getLogger('crawler');
const defaultLogger = log4js.getLogger();

module.exports = {
  consoleLogger,
  crawlerLogger,
  defaultLogger,
};
