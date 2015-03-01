appControllers.controller('AppletCtrl', ['$scope', '$http', '$q', 'ConfigService',
	function AppletCtrl($scope, $http, $q, config) {
    $scope.groups = [
      {id: 'MD', name: 'Market Data'},
      {id: 'Trd', name: 'Trading'},
      {id: 'AM', name: 'Asset Management'},
      {id: 'SA', name: 'Security Analysis'},
      {id: 'Op', name: 'Options'},
      {id: 'War', name: 'Warrants'},
      {id: 'MA', name: 'Market Analysis'},
      {id: 'Med', name: 'Media'},
      {id: 'Tic', name: 'Tickers'},
      {id: 'Com', name: 'Communication'},
      {id: 'Ast', name: 'Assistance'},
      {id: 'clr', name: 'Colour Widgets'},
      {id: 'Oth', name: 'Other'}
      ];
		$scope.applets = [];
		$scope.user = config.user();
		var genApplet = function() {
		  var randomNumber = Math.floor(Math.random()*500);
	    $scope.newApplet = {
	        runtimeGroupId: "MD",
	        displayName: "External Development Test " + randomNumber,
	        iconLocation: "https://au03-pli-pc1/ExternalTraderPlusWidget/Content/ires_logo.png",
	        sourceLocation: "https://au03-pli-pc1/ExternalTraderPlusWidgets2/AdvancedQuoteWidget.html",
	        description: "External Development Test " + randomNumber
	    };		  
		};
		genApplet();
		$scope.criteria = {};
		$scope.count = 0;
		$('.bootstrap-datetimepicker').datetimepicker(config.datePickerOption);
		$('.bootstrap-timepicker').datetimepicker(config.timePickerOption);
		var onInvalidDateTime = function(e) {
		  if (e && e.currentTarget) e.currentTarget.value = '';
		}
    $('.bootstrap-datetimepicker').on("dp.error", onInvalidDateTime);
    $('.bootstrap-timepicker').on("dp.error", onInvalidDateTime);
    var filter = function(applet) {
      var c = $scope.criteria;
      var text = (c.text || '').toLowerCase();
      var name = applet.name || '';
      var url = applet.url || '';
      var description = applet.description || '';
      if (name.toLowerCase().indexOf(text) >= 0
          || url.toLowerCase().indexOf(text)
          || description.toLowerCase().indexOf(text)) applet.visible = '';
      else applet.visible = 'hide';
    };
    var refresh = function(filtered) {
      if (filtered === undefined) filtered = true;
      for (var key in $scope.applets) {
        if (filtered) filter($scope.applets[key]);
        $scope.count ++;
      }
    };

    $scope.listApplet = function() {
      $http.get(config.baseUrl + 'applet', {withCredentials: false}).success(function(data, status) {
        $scope.applets = data;
        refresh(false);
      }).error(function(error, status) {
        config.error(error);
      });
    };

    $scope.searchApplet = function(criteria) {
      var c = $.extend(criteria, {
        text : $('#text').val(),
      });

      // Search applet
      $http.post(config.baseUrl + 'applet-search', c, {withCredentials: false}).success(function(results) {
        $scope.applets = results;
        refresh();
      }).error(function(error, status) {
        config.error(error);
      });
    };

    $scope.findApplet = function(applet) {
      var applets = $scope.applets;
      for (var i in applets) {
        if (applets[i]._id == applet._id) {
          return applets[i];
        }
      }
      return false;
    };

    $scope.addApplet = function() {
      var box = bootbox.dialog({
        // TODO: ng-model is not binded to this dynamic form
        message : $('#addAppletDiv').html(),
        className : 'small-dialog',
        buttons : {
          ok : {
            className: 'btn btn-primary pull-left',
            label : 'Save',
            callback : function(event) {
              return $scope.saveApplet(event);
            }
          },
          cancel : {
            className: 'btn btn-primary pull-left',
            label : 'Cancel'
          }
        },
        size : 'small'
      });
      $('.bootstrap-datetimepicker').datetimepicker(config.datePickerOption);
      $('.bootstrap-timepicker').datetimepicker(config.timePickerOption);
      // $('.bootstrap-datetimepicker').on("dp.error", onInvalidDateTime);
      // $('.bootstrap-timepicker').on("dp.error", onInvalidDateTime);
    };
    
    $scope.saveApplet = function(e) {
      var ne = $.extend($scope.newApplet, {
        displayName: $('.bootbox-body #addApplet #displayName').val(),
        iconLocation: $('.bootbox-body #addApplet #iconLocation').val(),
        sourceLocation: $('.bootbox-body #addApplet #sourceLocation').val(),
        runtimeGroupId: $('.bootbox-body #addApplet #runtimeGroupId').val(),
        runtimeIcon: $('.bootbox-body #addApplet #runtimeIcon').val(),
        description: $('.bootbox-body #addApplet #description').val()
      });
      console.log('saveApplet', ne);
      var error = $.validator.checkApplet(ne);
      if (error) {
        config.error(error);
        return false;
      }
      ne.datetimeFormat = config.dateTimeFormat;

      // Save applet
      $http.post(config.baseUrl + 'applet', ne, {withCredentials: true}).success(function(result) {
        $scope.applets.push(result);
        refresh();
      }).error(function(error, status) {
        config.error(error);
      });
      genApplet();
    };

    $scope.editApplet = function(applet) {
      var target = $scope.findApplet(applet);
      if (target) {
        target.editable = true;
        $('#ne_' + target._id + '_date').datetimepicker(config.datePickerOption);
        $('#ne_' + target._id + '_time').datetimepicker(config.timePickerOption);
      }
    };

    $scope.updateApplet = function(newApplet, applet) {
      // TODO: newApplet is undefined, ng defer??
      var target = $scope.findApplet(applet);
      if (!target) {
        config.error('Data not found!');
        return;
      }
      var ne = {
        _id: target._id,
        date: $('#ne_' + target._id + '_date').val(),
        time: $('#ne_' + target._id + '_time').val(),
        amount: $('#ne_' + target._id + '_amount').val(),
        description: $('#ne_' + target._id + '_description').val(),
      };
      ne.datetime = ne.date + ' ' + ne.time;
      ne.datetimeFormat = config.dateTimeFormat;
      $http.put(config.baseUrl + 'applet/' + applet._id, ne, {withCredentials: true}).success(function(result) {
        applet = $.extend(applet, result);
        applet.editable = false;
        refresh();
      }).error(function(error, status) {
        config.error(error);
      });
    };

    $scope.cancelUpdate = function(newApplet, applet) {
      applet.editable = false;
    };

    $scope.deleteApplet = function(applet) {
      $http.delete(config.baseUrl + 'applet/' + applet._id, {withCredentials: true}).success(function(data) {
        var applets = $scope.applets;
        for (var item in applets) {
          if (applets[item]._id == data._id) {
            $scope.applets.splice(item, 1);
            refresh();
            return ;
          }
        }
      }).error(function(error, status) {
        config.error(error);
      });
    };

    $scope.listApplet();

	}]);


	