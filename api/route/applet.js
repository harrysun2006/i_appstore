var moment = require('moment');
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var _ = require('underscore');
var validator = require('../config/validator.js');
var dateFormat = 'DD/MM/YYYY';
var store = '\\\\AU03-PLI-PC1\\TraderPlus$\\';
var appStore = path.join(store, '/AppStore/Apps/');
var allApplets = {};
var count = 0;

function readAllApplets() {
  allApplets = {};
  var dirs = fs.readdirSync(appStore);
  var file, info, applet;
  _.each(dirs, function(dir) {
    if (dir == '.' || dir == '..') return;
    file = path.join(appStore, dir + '/Info.json');
    if (!fs.existsSync(file)) return;
    info = fs.readFileSync(file, {encoding:'UTF-8'});
    try {
      applet = JSON.parse(info);
      allApplets[applet.appName] = applet;
      count++;
    } catch (e) {}
  });
}

exports.list = function(req, res) {
  readAllApplets();
  var applets = [];
  for (var k in allApplets) {
    if (allApplets[k] === false) continue;
    applets.push(allApplets[k]);
  }
  res.status(200).send(applets);
};

exports.search = function(req, res) {
  var c = req.body;
  readAllApplets();
  var matchText = function(applet, text) {
    if (text === undefined || text === null) return true;
    var t = text.toLowerCase();
    return applet.appName.toLowerCase().indexOf(t) >= 0
      || applet.displayName.toLowerCase().indexOf(t) >= 0
      || applet.discription.toLowerCase().indexOf(t) >= 0;
  };
  var matchGroupId = function(applet, groupId) {
    if (groupId === undefined || groupId === null) return true;
    return applet.runtimeGroupId == groupId;
  };
  var matchUserId = function(applet, developerId) {
    if (developerId === undefined || developerId === null) return true;
    return applet.developerId == developerId;
  };
  var applets = [];
  for (var k in allApplets) {
    if (allApplets[k] === false) continue;
    var applet = allApplets[k];
    if (matchText(applet, c.text) 
        && matchGroupId(applet, c.groupId) 
        && matchUserId(applet, c.userId)) applets.push(applet);
  }
  res.status(200).send(applets);
};

exports.create = function(req, res) {
	var data = req.body;
	var error = validator.checkApplet(data);
	// console.log(data);
	if (error) {
		return res.status(400).send({error:'Bad Request'});
	}

	data.appName = data.appName || data.displayName.replace(/ /g, '');

  // write to Info.json file
  var applet = {
      id: uuid.v4(),
      version: '1.0.0.0',
      defaultLocale: 'en-US',
      providerName: req.user.fullname,
      appName: data.appName,
      displayName: data.displayName,
      description: data.description,
      iconLocation: data.iconLocation,
      sourceLocation: data.sourceLocation,
      // tags: data.tags.split(','),
      runtimeGroupId: data.runtimeGroupId,
      runtimeIcon: data.runtimeIcon,
      developerId: req.user._id
  };
  var text = JSON.stringify(applet, null, 2);
  var dir = path.join(appStore, data.appName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    return res.status(500).send({error: 'Widget ' + data.appName + ' already exists!'});
  }
  var fd = fs.openSync(path.join(dir, 'Info.json'), 'w', 0666);
  fs.writeSync(fd, text, 0);
  fs.closeSync(fd);
  allApplets[applet.id] = applet;
  count++;
	return res.status(200).send(applet);
};

exports.update = function(req, res) {
	if (req.params.id === undefined) {
		return res.status(400).send({error:'Bad Request'});
	}
	var id = req.params.id;
	var data = req.body;
	var error = validator.checkApplet(data);
	if (error) {
		return res.status(400).send({error:'Bad Request'});
	}
	if (count <= 0) readAllApplets();
	if (!allApplets.hasOwnProperty(id)) {
	  return res.status(404).send({error:'Widget ' + id + ' is not found!'});
	}
	var applet = allApplets[id];
	if (applet.appName != data.appName) { // rename folder
	  fs.renameSync(path.join(appStore, applet.appName), path.join(appStore, data.appName));
	}
	_.extend(applet, data);
	var text = JSON.stringify(applet, null, 2);
	var dir = path.join(appStore, applet.appName);
  var fd = fs.openSync(path.join(dir, 'Info.json'), 'w', 0666);
  fs.writeSync(fd, text, 0);
  fs.closeSync(fd);
	return res.status(200).send(applet);
};

exports.delete = function(req, res) {
	if (req.params.id === undefined) {
		return res.status(400).send({error:'Bad Request'});
	}
	var id = req.params.id;
	var data = req.body;
	if (count <= 0) readAllApplets();
	if (!allApplets.hasOwnProperty(id)) {
    return res.status(404).send({error:'Widget ' + id + ' is not found!'});
	}
	var applet = allApplets[id];
	var dir = path.join(appStore, applet.appName);
	fs.unlinkSync(dir);
	allApplets[id] = false;
	count--;
	return res.status(200).send(applet);
};