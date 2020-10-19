const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');

const { getConfig } = require('./libs/config');
const { initDatabase } = require('./libs/data/mongoDb');
const { defaultLogger } = require('./libs/loggers');
const { addSchemas } = require('./libs/schema');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const crawlingRouter = require('./routes/crawling');
const recipesRouter = require('./routes/recipes');
const pagesRouter = require('./routes/pages');

const config = getConfig();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || '9094');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/crawler', crawlingRouter);
app.use('/recipes', recipesRouter);
app.use('/page', pagesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'something went wrong'));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

initDatabase(config.databaseBaseString, config.databaseName)
  .then(async (db) => {
    app.db = db;
    app.config = config;
    app.port = app.get('port');

    try {
      await addSchemas();
    } catch (error) {
      defaultLogger.error(error.stack);
    }

    const server = http.createServer(app);

    /**
   * Event listener for HTTP server "error" event.
   */

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string'
        ? `Pipe ${app.port}`
        : `Port ${app.port}`;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          defaultLogger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          defaultLogger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /**
   * Event listener for HTTP server "listening" event.
   */

    function onListening() {
      const addr = server.address();
      const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr.port}`;
      defaultLogger.info(`Listening on ${bind}`);
    }

    /**
   * Start server
   */
    server.listen(app.port);
    server.on('error', onError);
    server.on('listening', onListening);
  })
  .catch((err) => {
    defaultLogger.error(`Error connecting to MongoDB: ${err}`);
    process.exit(2);
  });

module.exports = app;
