var angular = require('angular'),
	velocity = require('velocity-animate'),
	$ = require('jquery'),
	q = require('q'),
	activityId,
	id = 0,
	EventEmitter = require('events').EventEmitter,
	eventEmitter = new EventEmitter(),
	template = require('./index.vash');

var mod = angular.module('ethoSideMenu', ['ionic']);

mod.controller('ethoSideMenuController', function($scope, $ionicSideMenuDelegate){
	$scope.toggleLeftSideMenu = function() {
		console.dir('hi');
		$ionicSideMenuDelegate.toggleLeft();
	};
});


function SideMenu(opt){
	var $content = $(opt.content);
	var self = new EventEmitter();

	self.$element = $(template({}));

	process.nextTick(function(){
		angular.bootstrap($('.js-side-menu')[0], ['ethoSideMenu']);
		self.emit('ready');
	});

	self.$element.on('click', '.js-upload', function(ev){
			self.emit('upload-click', ev);
		});

	self.$element.on('click', '.js-code-manager', function(ev){
			self.emit('code-manager-click', ev);
		});

	var $showLeftMenu = $('.js-show-left-menu'),
		isLeftMenuOpen = false;


	self.close = function(){
		if (!isLeftMenuOpen) return;
		openCloseLeftMenu();
	};

	function openCloseLeftMenu(){
		velocity($content, {left: isLeftMenuOpen? '0':'240'}, {
			duration:140,
			complete: function(){

			},
		});
		isLeftMenuOpen = !isLeftMenuOpen;
	}

	$showLeftMenu.click(function(ev){
		ev.stopPropagation();

		openCloseLeftMenu();
	});

	return self;
}

module.exports = SideMenu;
