var redis = require('redis');
var global = require('./global').settings;

var host = global.redisHost || 'localhost';
var port = global.redisPort || 6379;
var option = global.redisOption || {};

var redisClient = redis.createClient(port, host, option);

redisClient.on('error', function (err) {
  console.log('Cannot connect redis: ' + err, host, port);
});

redisClient.on('connect', function () {
  console.log('Successfully connected to redis://' + host + ':' + port);
});

var ready = function() {
  return redisClient.connected && redisClient.ready;
};

// exports.redis = redisClient;
exports.ready = ready;
exports.del = function(key, callback) {
  if (ready()) return redisClient.del(key, callback);
};
exports.get = function(key, callback) {
  if (ready()) redisClient.get(key, callback);
};
exports.set = function(key, value) {
  if (ready()) return redisClient.set(key, value);
};
exports.setex = function(key, seconds, value) {
  if (ready()) return redisClient.setex(key, seconds, value);
};
