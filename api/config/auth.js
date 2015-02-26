var crypto = require('crypto');
var passport = require('passport');
var db = require('./database');
var global = require('./global').settings;

passport.serializeUser(function(user, done) {
  // console.log('serializeUser, ', user);
  done(null, user.id);
  // done(null, user);
});

passport.deserializeUser(function(id, done) {
  // console.log('deserializeUser, ', user);
  db.userModel.findOne({_id: id}, function (err, user) { done(err, user); });
  // done(null, user);
});

var auth = null;
if (global.isFormAuth()) {
  auth = require('./auth_form');
  var LocalStrategy = require('passport-local').Strategy;
  passport.use(new LocalStrategy(function(username, password, done) {
    // console.log('passport-login: %s', username);
    db.userModel.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, {error: 'Unknown user ' + username}); }
      user.comparePassword(password, function(err, isMatch) {
        if (err) return done(err);
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {error: 'Invalid password!'});
        }
      });
    });
  }));
} else if (global.isTokenAuth()) {
  auth = require('./auth_token');
  var BearerStrategy = require('passport-http-bearer').Strategy;
  // use jwt for token authentication, not passport
  passport.use(new BearerStrategy({}, function(token, done) {
    console.log('passport-bearer: %s', token);
    db.userModel.findOne({ _id: token }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, {error: 'Invalid user token: ' + token}); }
      return done(null, user, { scope: '*' });
    });
  }));
} else {
  auth = require('./auth_none');
}

exports.login = auth.login;
exports.logout = auth.logout;
exports.userIsAuthenticated = auth.userIsAuthenticated;
exports.userIsAutorized = auth.userIsAutorized;
