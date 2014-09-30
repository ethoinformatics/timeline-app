var angular = require('angular'),
	$ = require('jquery'),
	activityId,
	id = 0,
	EventEmitter = require('events').EventEmitter,
	eventEmitter = new EventEmitter();
var template = require('./side-menu.vash');

var mod = angular.module('ethoSideMenu', ['ionic']);

mod.controller('ethoSideMenuController', function($scope, $ionicSideMenuDelegate){
	debugger
		 $scope.toggleLeftSideMenu = function() {
			 alert('hi');
			     $ionicSideMenuDelegate.toggleLeft();
		};
});

module.exports = function(){
	var $el = $(template({}));

	process.nextTick(function(){
		angular.bootstrap($el[0], ['ethoSideMenu']);
	});

	return $el;
};
