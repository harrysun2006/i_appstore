'use strict';

var express = require('express')
  , http = require('http')
  , path = require('path')
  , morgan = require('morgan')
  , favicon = require('serve-favicon')
	, bodyParser = require('body-parser')
	, cookieParser = require('cookie-parser')
  , util = require('util')
	, db = require('./config/database')
	, redis = require('./config/redis')
	, global = require('./config/global').settings
	, auth = require('./config/auth');

var api = express();
// api configuration
api.set('port', process.env.port_api || global.portApi);
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));
// api.use(morgan('dev')); // combined
// api.use(cookieParser(global.secret));

if (global.isFormAuth()) {
  var session = require('express-session');
  var passport = require('passport');
  //api.use(session({secret: global.secret, resave: true, saveUninitialized: true}));
  api.use(session({secret: global.secret, resave: true, saveUninitialized: true, cookie: {maxAge: 1800000}})); // session timeout: in milli sec!
  api.use(passport.initialize());
  api.use(passport.session());
}

var userIsAuthenticated = auth.userIsAuthenticated;;
var userIsAutorized = auth.userIsAutorized;

api.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost:81');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  if ('OPTIONS' == req.method) return res.status(200).end();
  next();
});

//Route
var routes = {};
routes.user = require('./route/user.js');
routes.public = require('./route/public.js');
routes.applet = require('./route/applet.js');

api.post('/login', auth.login);
api.post('/register', routes.user.register);
api.put('/profile', userIsAuthenticated, routes.user.update);
api.get('/logout', userIsAuthenticated, auth.logout);
api.post('/about', routes.public.about);

api.get('/applet', userIsAuthenticated, routes.applet.list);
api.post('/applet-search', userIsAuthenticated, routes.applet.search);
api.post('/applet', userIsAuthenticated, routes.applet.create);
api.put('/applet/:id', userIsAuthenticated, routes.applet.update);
api.delete('/applet/:id', userIsAuthenticated, routes.applet.delete);

console.log('Starting Node.js servers for TraderPlus App Store ...');
// create api server, default on port 3000
http.createServer(api).listen(api.get('port'), function() {
  console.log('API server listening on port %d', api.get('port'));
});

var web = express();
// create web server, default on port 81
web.set('port', process.env.port_web || global.portWeb);
web.set('views', __dirname + '/../app');
web.set('view engine', 'html');
web.use(bodyParser.json());
web.use(bodyParser.urlencoded({extended: true}));
// web.use(morgan('dev')); // combined
web.use(favicon(__dirname + '/../app/favicon.ico'));
web.use(express.static(path.join(__dirname + '/..', 'app')));
http.createServer(web).listen(web.get('port'), function() {
  console.log('Web server listening on port %d', web.get('port'));
});
