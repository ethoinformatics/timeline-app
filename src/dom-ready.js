var angular = require('angular'),
	q = require('q'),
	d = q.defer(),
	$ = require('jquery'),
	readyCallbacks = $.Callbacks();

angular.module('my-dom-ready', ['ionic'])
	.run(['$ionicPlatform', function($ionicPlatform){
		$ionicPlatform.ready(readyCallbacks.fire.bind(readyCallbacks));
		d.resolve();
	}]);

angular.bootstrap(window.document.body, ['my-dom-ready']);

module.exports = readyCallbacks.add.bind(readyCallbacks);
module.exports.promise = d.promise;
