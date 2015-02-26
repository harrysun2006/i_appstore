appControllers.controller('UserLoginCtrl', [ '$scope', '$http', 'ConfigService', 
	function UserLoginCtrl($scope, $http, config) {
		$scope.login = function(user) {
		  var u = $.extend({}, user);
      if (u.username === undefined || u.password === undefined) return;
		  u.password = $.md5.hex(u.password);
			$http.post(config.baseUrl + 'login', u, {
				withCredentials : true
			}).success(function(data) {
				config.login(data);
				$scope.error = null;
			}).error(function(error, status) {
        config.logout();
				$scope.error = error.error;
			});
		};
	} ]);

appControllers.controller('UserRegisterCtrl', [ '$scope', '$http', '$q', 'ConfigService', 
  function UserRegisterCtrl($scope, $http, $q, config) {
		$scope.register = function(user) {
		  $scope.error = $.validator.checkUser(user);
			if ($scope.error) return;
			$http.post(config.baseUrl + 'register', user, {
				withCredentials : true
			}).success(function(data) {
				$scope.error = null;
				config.info('User ' + data.username + ' has been created! Will redirect to login!', null, 0, function() {
				  config.logout();
				});
				// TODO:
			}).error(function(error, status) {
				$scope.error = error.error;
			});
		};
	} ]);

appControllers.controller('UserLogoutCtrl', [ '$scope', '$http', '$q', 'ConfigService', 
	function UserLogoutCtrl($scope, $http, $q, config) {
    $http.get(config.baseUrl + 'logout', {
			withCredentials : true
		}).success(function(data) {
		  config.logout();
		}).error(function(error, status) {
		  config.logout();
		});

	} ]);

appControllers.controller('UserProfileCtrl', [ '$scope', '$http', '$q', 'ConfigService', 
  function UserProfileCtrl($scope, $http, $q, config) {
    var u = $.extend({}, config.user());
    u.password = '';
    $scope.user = u;
    $scope.update = function(user) {
      var u = $.extend({}, user);
      u.password = $.md5.hex(u.password);
      $scope.error = $.validator.checkUser(user);
      if ($scope.error) return;
      $http.put(config.baseUrl + 'profile', u, {
        withCredentials : true
      }).success(function(data) {
        $scope.error = null;
        config.info('User ' + u.username + ' has been updated!', null, 0, function() {
          config.login(data);
        });
      }).error(function(error, status) {
        $scope.error = error.error;
      });
    };
  } ]);
