var passport = require('passport');
var db = require('./database');

exports.login = function(req, res, next) {
  passport.authenticate('local', function(dump, user, error) {
    // console.log('passport.authenticate...', user, error);
    if (!user) return res.status(400).send(error);
    req.login(user, function(err) {
      if (err) { return next(err); }
      return res.status(200).send(user);
    });
    // console.log('...passport.authenticate');
  })(req, res, next);
};

exports.logout = function(req, res) {
  var user = req.user;
  req.session.destroy();
  req.logout();
  res.status(200).send(user);
};

// Middleware to check if user is authenticated
exports.userIsAuthenticated = function(req, res, next) {
  // console.log('userIsAuthenticated: ', req.user);
  if (req.user) {return next();}
  return res.status(401).send({error: 'Not authenticated!'});
};

// Middleware to check if user is autorized
exports.userIsAutorized = function(req, res, next, userId) {
  // console.log('userIsAutorized: %s, %s', req.user._id, userId);
  if (req.user._id == userId) {return next();}
  return res.status(403).send({error: 'Forbidden!'});
};