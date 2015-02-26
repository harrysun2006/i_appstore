var crypto = require('crypto');
var util = require('util');
var db = require('../config/database');
var validator = require('../config/validator.js');

exports.register = function(req, res) {
  var u = req.body;
  if (req.user) { // logout first ???
  }
  db.userModel.findOne({ username: u.username }, function(err, result) {
    if (result) {
      return res.status(400).send({error: util.format('User %s already exists!', u.username)});
    } else {
      var error = validator.checkUser(u);
      if (error) return res.status(400).send({error: error});

      var user = new db.userModel();
      user.username = u.username;
      user.password = u.password1;
      user.fullname = u.fullname;
      u.setting = {};
      try {
        user.setting = JSON.stringify(u.setting);
      } catch (e) {
        user.setting = '{}';
      }

      user.save(function(err) {
        if (err) return res.status(500).send({error: err});
        else return res.status(200).send(user);
      });
    }
  });

};

exports.update = function(req, res) {
  var u = req.body;
  var error = validator.checkUser(u);
  if (error) return res.status(400).send({error: error});
  if (!req.user || !req.user._id) return res.status(401).send({error: 'Not authenticated!'});

  var md5 = crypto.createHash('md5');
  var user = {
    username: u.username,
    fullname: u.fullname,
    password: md5.update(u.password1).digest('hex')
  };
  try {
    user.setting = JSON.stringify(u.setting);
  } catch (e) {
    user.setting = '{}';
  }
  console.log(req.user._id, u);
  db.userModel.findOneAndUpdate(
    {_id: req.user._id, username: u.username, password: u.password}, 
    user, {},
    function(err, result) {
      if (err) return res.status(500).send({error: err});
      if (!result) return res.status(404).send({error: util.format('User %s is not found or incorrect password!', u.username)});
      return res.status(200).send(result);
    });

};
