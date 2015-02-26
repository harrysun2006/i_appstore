exports.about = function(req, res, next) {
	res.status(200).send({author: 'Paul Li, Leon Oh, Harry Sun', version: '0.1.0'});
};
