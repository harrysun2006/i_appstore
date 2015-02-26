appControllers.controller('AboutCtrl', [ '$scope', '$http', '$location', '$q', 'ConfigService', 
  function AboutCtrl($scope, $http, $location, $q, config) {
    $http.post(config.baseUrl + 'about', {
      withCredentials : true
    }).success(function(data) {
      $scope.data = data;
    });
    
    var f1 = function(num) {
      console.log("success: " + num + ", " + Math.random());
      return ++num;
    };
    var f2 = function(num) {
      console.log("error: " + num + ", " + Math.random());
      return ++num;
    };

    $scope.test01 = function() {
      var defer = $q.defer();
      var promise = defer.promise;
      promise.then(f1,f2).then(f1,f2);
      defer.reject(1);
      // 1@f2
      // 2@f1
    };

    $scope.test02 = function() {
      var defer = $q.defer();
      var promise = defer.promise;
      promise.then(f1,f2);
      promise.then(f1,f2);
      defer.reject(1);
      // 1@f2
      // 1@f2
    };

    $scope.test03 = function() {
      var defer = $q.defer();
      var promise = defer.promise;
      promise.then(f1,f2).then(f1,f2);
      promise.catch(f2);
      promise.finally(f2);
      defer.reject(1);
      // 1@f2
      // 1@f2
      // undefined@f2
      // 2@f1
    };

    $scope.test04 = function() {
      var defer = $q.defer();
      var promise = defer.promise;
      promise.finally(f2).then(f1,f2);
      defer.reject(1);
      // undefined@f2
      // 1@f2
    };
    
    var defer, promise;
    var f3 = function() {
      defer = $q.defer();
      promise = defer.promise;
      promise.then(function(data) {
        return $q.reject("success@1" + "[data: " + data + "]");
      }, function(data) {
        return $q.reject("error@1" + "[reason: " + data + "]");
      }).then(function(info) {
        console.log(Math.random() + "-success@2: " + info);
      }, function(info) {
        console.log(Math.random() + "-error@2: " + info);
      });
    };

    $scope.test05 = function() {
      f3();
      defer.reject(1);
    };
    
    $scope.test06 = function() {
      f3();
      defer.resolve(1);
    };

    var defer1, defer2, promise1, promise2, promise3;
    var f4 = function() {
      defer1 = $q.defer();
      promise1 = defer1.promise;
      promise1.then(function(num) {
        console.log("success@1:" + num++);
      }, function(num) {
        console.log("error@1:" + num++);
      });
      defer2 = $q.defer();
      promise2 = defer2.promise;
      promise2.then(function(num) {
        console.log("success@2:" + num++);
      }, function(num) {
        console.log("error@2:" + num++);
      });
      promise3 = $q.all([promise1, promise2]);
      promise3.then(function(num) {
        console.log("sunccess@all:" + num++);
      }, function(num) {
        console.log("error@all:" + num++);
      });
    };

    $scope.test07 = function() {
      f4();
      defer1.resolve(100);
      defer2.resolve(200);
    };

    $scope.test08 = function() {
      f4();
      defer1.resolve(100);
      defer2.reject(200);
    };
    
    $scope.test09 = function() {
      var defer = $q.defer();
      var promise = defer.promise;
      var promise1 = $q.when(66, function(num) {
        console.log("success@1:" + num);
      }, function(num) {
        console.log("error@1:" + num);
      });
      var promise2 = $q.when(promise, function(num) {
        console.log("success@2:" + num);
      }, function(num) {
        console.log("error@2:" + num);
      });
      defer.reject(99);
    };
  } ]);