/*
 *Environment config
 */

var express = require('express');
var path = require('path');
var passport = require('passport');
var flash = require('connect-flash');

var config = require('./index').app;
var middlewares = require('../controllers/middlewares');

module.exports = function(app) {
  app.configure(function() {
    app.set('port', config.port);
    app.use(express.logger('dev')); //Logs http requests in console
    app.use(express.compress());
    //app.use(express.favicon());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.cookieSession({ secret: 'we track money', cookie: { maxAge: 60*60*1000 } }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(express.static(path.join(__dirname, '../dist')));
    //app.use(express.csrf());
    app.use(middlewares.Render.user);
    app.use(middlewares.Render.flash);
    app.use(app.router);
    app.use(middlewares.Errors.log);
    app.use(middlewares.Errors.clientHandler);
    app.use(middlewares.Errors.errorHandler);
    app.use(middlewares.Prototypes);
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, '../views'));
  });

  app.configure('development', function() {
    console.log('Running on development environment');
    app.use(express.errorHandler());
  });

  app.configure('production', function() {
    console.log('Running on prodution environment');
  });
};