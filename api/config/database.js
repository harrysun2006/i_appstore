'use strict';

var crypto = require('crypto');
var mongoose = require('mongoose');
var uuid = require('uuid');
var global = require('./global').settings;

var mongoOptions = global.mongoOptions || { };
var mongoUrl = global.mongoUrl || 'mongodb://localhost/appstore';

mongoose.connect(mongoUrl, mongoOptions, function (err, res) {
  if (err) { 
    console.log('ERROR connecting to ' + mongoUrl + '. ' + err);
  } else {
    console.log('Successfully connected to ' + mongoUrl);
  }
});

var Schema = mongoose.Schema;

// User schema
var User = new Schema({
  _id: { type: String, default: function genUUID () { return uuid.v4(); } },
  fullname: { type: String, required: true},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  setting: {type: String, required: true}
});

var Applet = new Schema({
  _id: { type: String, default: function genUUID () { return uuid.v4(); } },
  user_id: { type: String, ref: 'User', required: true },
  group: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String, required: true },
  fullDescription: { type: String },
  url: { type: String, required: true },
  iconUrl: { type: String },
  active: { type: Boolean, default: true },
  price: { type: Number, required: true, default: 0 },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

// crypto middleware on UserSchema
// see: http://mongoosejs.com/docs/middleware.html
User.pre('save', function(next) {
  var user = this;
  if(!user.isModified('password')) return next();
  var md5 = crypto.createHash('md5');
  user.password = md5.update(user.password).digest('hex');
  next();
});

// Password verification
User.methods.comparePassword = function(candidatePassword, cb) {
  /*
  var md5 = crypto.createHash('md5');
  var password = md5.update(candidatePassword).digest('hex');
  return cb(null, (this.password == password));
  */
  return cb(null, (this.password == candidatePassword));
};

var userModel = mongoose.model('User', User);
var appletModel = mongoose.model('Applet', Applet);

// Export Models
exports.userModel = userModel;
exports.appletModel = appletModel;
