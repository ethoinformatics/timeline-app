var angular = require('angular'),
	$ = require('jquery'),
	readyCallbacks = $.Callbacks();

angular.module('my-dom-ready', ['ionic'])
	.run(['$ionicPlatform', function($ionicPlatform){
		$ionicPlatform.ready(readyCallbacks.fire.bind(readyCallbacks));
	}]);

angular.bootstrap(window.document.body, ['my-dom-ready']);

module.exports = readyCallbacks.add.bind(readyCallbacks);
