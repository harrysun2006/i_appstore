var _ = require('lodash');
var jwt = require('jsonwebtoken');
var db = require('./database');
var global = require('./global').settings;
var redis = require('./redis');

exports.login = function(req, res, next) {
  if (req.body.username === undefined || req.body.password === undefined) {
    return res.status(400).send({error: 'Invalid value!'});
  }
  var username = req.body.username;
  var password = req.body.password;
  db.userModel.findOne({ username: username }, function(err, user) {
    if (err) {
      return res.status(500).send(err);
    } else if (!user) { 
      return res.status(404).send('Unknown user ' + username);
    } else if (user.password != password) {
      return res.status(400).send('Invalid password!');
    } else {
      // the user object returned by mangoose is wrapped by other fields!
      // use simple raw object here to make token getting changed every time!
      var r = {
          _id: user._id,
          username: user.username,
          password: user.password,
          fullname: user.fullname,
          setting: user.setting
      };
      var options = global.tokenOption || {};
      var token = jwt.sign(_.clone(r), global.privKey, options);
      _.extend(r, {"_token": token});
      var secs = (options.expiresInMinutes || 10) * 60;
      // redis.set(token, true);
      redis.setex(token, secs, true);
      return res.json(r);
    }
  });
};

exports.logout = function(req, res) {
  var user = req.user;
  if (req.session) req.session.destroy();
  req.logout();
  if (user && user._token) {
    redis.del(user._token, function(err) {});
  }
  res.status(200).send(user);
};

// Middleware to check if user is authenticated
exports.userIsAuthenticated = function(req, res, next) {
  var token;

  if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
    var hasAuthInAccessControl = !!~req.headers['access-control-request-headers'].split(',').map(
        function (header) {
          return header.trim();
        }).indexOf('authorization');

    if (hasAuthInAccessControl) {
      return next();
    }
  }

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.status(401).send({error: 'credentials_bad_format'});
    }
  } else if (global.credentialsRequired === false) {
    return next();
  } else {
    return res.status(401).send({error: 'credentials_required'});
  }

  var pass = function(data, token) {
    req.user = _.extend({}, data, {"_token": token});
    return next();
  };
  jwt.verify(token, global.pubKey, global.tokenOption, function(err, decoded) {
    if (err) {
      // return next(new UnauthorizedError('invalid_token', err));
      var name = (err && err.name) || null;
      var message = (err && err.message) || null;
      if (name == 'TokenExpiredError') {
        return res.status(401).send({error: 'token_expired'});
      } else if (name == 'JsonWebTokenError') {
        return res.status(401).send({error: 'token_error'});
      } else if (typeof message === 'string') {
        return res.status(401).send({error: message});
      } else {
        return res.status(401).send({error: err});
      }
    }
    if (redis.ready()) {
      redis.get(token, function(err, value) {
        if (!err && !value) {
          return res.status(401).send({error: 'credentials_required'});
        } else {
          return pass(decoded, token);
        }
      });
    } else {
      return pass(decoded, token);
    }
  });
  // return res.status(401).send({error: 'Not authenticated!'});
};

// Middleware to check if user is autorized
exports.userIsAutorized = function(req, res, next, userId) {
  // console.log('userIsAutorized: %s, %s', req.user._id, userId);
  if (req.user && req.user._id == userId) {return next();}
  return res.status(403).send({error: 'Forbidden!'});
};