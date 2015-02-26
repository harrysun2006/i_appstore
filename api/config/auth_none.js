exports.login = function(req, res, next) {
  return res.status(400).send({error: 'Bad request!'});
};

exports.logout = function(req, res) {
  return res.status(400).send({error: 'Bad request!'});
};

exports.userIsAuthenticated = function(req, res, next) {
  return res.status(401).send({error: 'Not authenticated!'});
};

exports.userIsAutorized = function(req, res, next, userId) {
  return res.status(403).send({error: 'Forbidden!'});
}
