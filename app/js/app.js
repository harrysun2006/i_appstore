'use strict';

var app = angular.module('app', [ 'ngRoute', 'ngCookies', 'appControllers']);
var appControllers = angular.module('appControllers', []);

app.factory('ConfigService', [ '$rootScope', '$location', '$window', '$cookieStore', function($rootScope, $location, $window, $cookieStore) {
  function _safe_string(obj, path, def) {
    var r = def || null;
    if (typeof obj === 'string') return obj;
    if (obj === undefined || obj == null) return r;
    if (path === undefined || path == null || typeof path != 'string') path = '';
    var ps = path.split('.');
    var i;
    for (i = 0; i < ps.length; i++) {
      if (obj.hasOwnProperty(ps[i])) obj = obj[ps[i]];
      else break;
    }
    if (typeof obj === 'string') return obj;
    else return r;
  };
  function _safe_parse(str, def) {
    var r = def || null;
    try {
      r = JSON.parse(str);
    } catch (e) {
    }
    return r;
  };
  var _store = $window.sessionStorage;
  var _s = _store.user;
  // if (_s == null) _s = $window.localStorage.user;
  // if (_s == null) _s = $cookieStore.get('user');
  // if (_s == null) _s = $window.sessionStorage.user;
  var _user = (_s != null && _s != undefined) ? JSON.parse(_s) : null;
  var _token = (_user != null) ? _user._token : null;
  // console.log(_user, _token);
  var config = {
    baseUrl : 'http://au03-hsun-pc1:3000/',
    dateFormat : 'DD/MM/YYYY',
    timeFormat : 'hh:mm:ss A',
    dateTimeFormat : 'DD/MM/YYYY hh:mm:ss A',
    parseFormat : 'YYYY-MM-DDTHH:mm:ssZ',
    datePickerOption : { // datepicker(jQuery UI), datetimepicker(bootstrap)
      pickTime: false,
      useCurrent: false,
      useStrict: true,
      format: 'DD/MM/YYYY',
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-arrow-up",
        down: "fa fa-arrow-down"
      }
    },
    timePickerOption : {
      pickDate: false,
      useCurrent: false,
      useStrict: true,
      useSeconds: true,
      format: 'hh:mm:ss A',
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-arrow-up",
        down: "fa fa-arrow-down"
      }
    },
    isLogged : (_user != null),
    token: function() {
      return _token;
    },
    user : function() {
      return _user;
    },
    username : function() {
      return (_user != null && _user != undefined) ? _user.username : null;
    },
    login : function(u, url) {
      // _store = u._token ? $window.localStorage : $window.sessionStorage;
      _user = u;
      _user.setting = _safe_parse(_user.setting, {});
      _store.user = JSON.stringify(u);
      _token = u._token;
      this.isLogged = true;
      if (url === undefined) url = '/applet';
      if (url != null) {
        // console.log(url);
        $location.path(url);
        // in bootbox's callback $location.path does not work???
        window.location = '#' + url;
      }
    },
    logout : function(url) {
      console.log('logout');
      if (_store && _store.user) {
        delete _store.user;
      }
      _user = null;
      _token = null;
      this.isLogged = false;
      if (url === undefined) url = '/login';
      if (url != null) {
        console.log('redirect: ' + url);
        $location.path(url);
        // in bootbox's callback $location.path does not work???
        window.location = '#' + url;
      }
    },
    info : function(message, label, timeout, next) {
      var box = bootbox.alert({
        message : message,
        label : label || 'OK',
        callback : next
      });
      if (timeout > 0 || timeout === undefined || timeout == null) setTimeout(function() {box.modal('hide');}, timeout || 2000);
    },
    error : function(error, label, next) {
      if (!error) return;
      var message = _safe_string(error, 'error.message', 'ERROR');
      var box = bootbox.alert({
        message : message,
        label : label || 'OK',
        callback : next
      });
    }
  };
  $rootScope.config = config;
  return config;
} ]);

app.directive('checkUser', [
  '$rootScope',
  '$location',
  'ConfigService',
  function($root, $location, config) {
    return {
      restrict : 'A',
      link : function(scope, elem, attrs, ctrl) {
        $root.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
          // console.log(config.user);
          /* after refresh config.isLogged = false!
          console.log(config.isLogged);
          if (nextRoute.access.requiredLogin && !config.isLogged) {
            $location.path('/login');
          }
          */
        });
      }
    }
  } ]);

app.factory('sessionInjector', function ($rootScope, $q, $SessionService) {
  return {
    request: function(config) {
      console.log($SessionService);
      if (!$SessionService.isAnonymus) {
        config.headers['x-session-token'] = $SessionService.token;
      }
      return config;
    }
  };
});

app.factory('authInterceptor', ['$rootScope', '$q', '$location', 'ConfigService', function ($rootScope, $q, $location, config) {
  return {
    request: function (request) {
      request.headers = request.headers || {};
      var token = config.token();
      if (token) {
        request.headers.Authorization = 'Bearer ' + token;
      }
      return request;
    },
    response: function (response) {
      if (response != null && response.status == 200 && !config.isLogged) {
        console.log('auto login via token???');
      }
      return response || $q.when(response);
    },
    responseError: function(response) {
      // response: { data: {error: {...}}, status: 401, headers: Uc/<(), config: Object, statusText: "Unauthorized" }
      var data = response && response.data ? response.data : null;
      var error = data && data.error ? data.error : null;
      var name = error && error.name ? error.name : null;
      var message = null;
      if (response.status === 401) { // Unauthorized
      } else if (response.status === 403) { // Forbidden
        $location.path('/about');
      } else if (response.status === 419 || response.status === 440) { // sessionTimeout
        /*
        var SessionService = $injector.get('SessionService');
        var $http = $injector.get('$http');
        var deferred = $q.defer();

        // Create a new session (recover the session)
        // We use login method that logs the user in using the current credentials and
        // returns a promise
        SessionService.login().then(deferred.resolve, deferred.reject);

        // When the session recovered, make the same backend call again and chain the request
        return deferred.promise.then(function() {
          return $http(response.config);
        });
        */
      }
      if (error == 'credentials_bad_format') {
        message = 'Authentication format is : Bearer [token]!';
      } else if (error == 'credentials_required') {
        message = 'No Authorization header was found!';
      } else if (error == 'token_expired') {
        message = 'Token is expired, please login again!';
      }
      if (message == null) {
        if (typeof error === 'string') message = error;
        // message = 'Session timed out, please login again!';
      }
      if (message) {
        bootbox.alert({
          message : message,
          callback : function() {config.logout();}
        });
        return $q.reject({});
      } else {
        return $q.reject(response);
      }
    }
  };
}]);

app.factory('errorInterceptor', function ($rootScope, $q, $injector, $location) {
  return {
    responseError: function(response) {
      if (response.status === 400) { // Bad Request
        
      } else if (response.status === 404) { // Not Found
        
      }
      return $q.reject(response);
    }
  };
});

app.config([ '$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
  $httpProvider.interceptors.push('errorInterceptor');
  // $httpProvider.interceptors.push('sessionInjector');
}]);

app.config([ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl : 'partials/login.html',
    controller : 'UserLoginCtrl',
    access : { requiredLogin : false }
  }).when('/register', {
    templateUrl : 'partials/register.html',
    controller : 'UserRegisterCtrl',
    access : { requiredLogin : false }
  }).when('/profile', {
    templateUrl : 'partials/profile.html',
    controller : 'UserProfileCtrl',
    access : { requiredLogin : true }
  }).when('/logout', {
    templateUrl : 'partials/login.html',
    controller : 'UserLogoutCtrl',
    access : { requiredLogin : true }
  }).when('/about', {
    templateUrl : 'partials/about.html',
    controller : 'AboutCtrl',
    access : { requiredLogin : false }
  }).when('/applet', {
    templateUrl : 'partials/applet-list.html',
    controller : 'AppletCtrl',
    access : { requiredLogin : false }
  }).otherwise({
    redirectTo : '/login',
    access : { requiredLogin : false }
  });
} ]);
