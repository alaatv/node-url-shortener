module.exports = function (app, nus) {
  var opts = app.get('opts')
    , http = require('http')
    , api = require('./api.js')(app, nus);

  // api routes
  app.use('/api/v1', api);

  // healthcheck route
  app.get('/healthcheck', function (req, res) {
    res.status(200).json({ status: 'OK' });
  });
  // index route
  app.route('/').all(function (req, res) {
        res.redirect(301,'https://alaatv.com');
  });
  app.route('/shortlink').all(function (req, res) {
    res.render('index');
  });

  app.route('/analytics').all(function (req, res) {
    nus.analytics("*",function(err,urls){
      if(err){
        res.status(500).json(err.toString);
        return;
      }
      res.render('analytics',{urls:urls});
    });
  });

  app.route('/analytics/:hash').all(function (req, res) {
    nus.analytics(req.params.hash,function(err,urls){
      if(err){
        res.status(500).json(err.toString);
        return;
      }
      res.render('analytics',{urls:urls});
    });
  });
  
  // shorten route
  app.get(/^\/([\w=]+)$/, function (req, res, next){
    nus.expand(req.params[0], function (err, reply) {
      if (err) {
        next();
      } else {
        res.redirect(301, reply.long_url);
      }
    }, true);
  });

    
  // catch 404 and forwarding to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log('Caught exception: ' + err + '\n' + err.stack);
      res.status(err.status || 500);
      if (/^\/api\/v1/.test(req.originalUrl)) {
        res.json({
          status_code: err.status || 500,
          status_txt: http.STATUS_CODES[err.status] || http.STATUS_CODES[500]
        });
      } else {
        res.render('error', {
          code: err.status || 500,
          message: err.message,
          error: err
        });
      }
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if (/^\/api\/v1/.test(req.originalUrl)) {
      res.json({
        status_code: err.status || 500,
        status_txt: http.STATUS_CODES[err.status] || ''
      });
    } else {
      res.render('error', {
        code: err.status || 500,
        message: err.message,
        error: false
      });
    }
  });
};
