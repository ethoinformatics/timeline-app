var angular = require('angular'),
	$ = require('jquery'),
	q = require('q'),
	activityId,
	id = 0,
	EventEmitter = require('events').EventEmitter,
	eventEmitter = new EventEmitter();

var template = require('./side-menu.vash');

var mod = angular.module('ethoSideMenu', ['ionic']);

mod.controller('ethoSideMenuController', function($scope, $ionicSideMenuDelegate){
	$scope.toggleLeftSideMenu = function() {
		console.dir('hi');
		$ionicSideMenuDelegate.toggleLeft();
	};
});


function SideMenu(){
	var self = new EventEmitter();

	self.$element = $(template({}));

	process.nextTick(function(){
		angular.bootstrap($('.js-side-menu')[0], ['ethoSideMenu']);
		self.emit('ready');
	});

	self.$element.on('click', '.js-upload', function(ev){
			self.emit('upload-click', ev);
		});

	return self;
}

module.exports = SideMenu;
