var moment = require('moment');
var fs = require('fs');
var path = require('path');
var db = require('../config/database.js');
var validator = require('../config/validator.js');
var dateFormat = 'DD/MM/YYYY';

exports.list = function(req, res) {
	db.appletModel.find({user_id: req.user._id}, function(err, results) {
		if (err) {
			return res.status(500).send({error:err});
		}
		return res.status(200).send(results);
	});
};

exports.search = function(req, res) {
	var c = req.body;
	var options = {sort: {date: 1}};
	var q = db.appletModel.find({user_id: req.user._id});
	// console.log(c);
	if (c.text) {
	  q.or({name: {$regex: '.*'+c.name+'.*', $options: 'i' }});
		q.or({description: {$regex: '.*'+c.description+'.*', $options: 'i' }});
	}
	q.exec(function(err, results) {
		if (err) {
			return res.status(500).send({error:err});
		}
		return res.status(200).send(results);
	});
};

var writeInfo = function(applet, user) {
  var store = '\\\\AU03-PLI-PC1\\TraderPlus$\\';
  // write to Info.json file
  var info = {
      id: applet._id,
      version: '1.0.0.0',
      providerName: user.fullname,
      defaultLocale: 'en-US',
      runtimeGroupId: applet.group,
      displayName: applet.name,
      runtimeIcon: applet.icon,
      description: applet.description,
      fullDescription: applet.fullDescription,
      sourceLocation: applet.url,
      iconLocation: applet.iconUrl
  };
  var text = JSON.stringify(info, null, 4);
  var name = applet.name.replace(/ /g, '');
  var dir = path.join(store + '/AppStore/Apps/', name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  var fd = fs.openSync(path.join(dir, 'Info.json'), 'w', 0666);
  fs.writeSync(fd, text, 0);
  fs.closeSync(fd);
}

exports.create = function(req, res) {
	var data = req.body;
	var error = validator.checkApplet(data);
	// console.log(data);
	if (error) {
		return res.status(400).send({error:'Bad Request'});
	}

	var model = new db.appletModel();
	model.user_id = req.user._id;
	model.group = data.group;
	model.name = data.name;
	model.icon = data.icon;
	model.url = data.url;
	model.iconUrl = data.iconUrl;
	model.description = data.description;
	// console.log(model);
	
	model.save(function(err) {
		if (err) {
		  // console.log(err);
			return res.status(500).send({error:err});
		}
		writeInfo(model, req.user);
		return res.status(200).send(model);
	});
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

	db.appletModel.findOneAndUpdate(
		{_id: id, user_id: req.user._id}, 
		data, {},
		function(err, result) {
			if (err) {
				return res.status(500).send({error:err});
			}
			if (result == null) {
				return res.status(404).send({error:'Data is not found!'});
			}
			return res.status(200).send(result);
		});
};

exports.delete = function(req, res) {
	if (req.params.id === undefined) {
		return res.status(400).send({error:'Bad Request'});
	}
	var id = req.params.id;
	db.appletModel.findOne({_id: id, user_id: req.user._id}, function(err, result) {
		if (err) {
			return res.status(500).send({error:err});
		}
		if (result == null) {
			return res.status(404).send({error:'Data is not found!'});
		}
		result.remove();
		return res.status(200).send(result);
	});
};