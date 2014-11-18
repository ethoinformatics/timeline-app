var q = require('q'),
	$ = require('jquery'),
	successCallbacks = $.Callbacks('unique'),
	errorCallbacks = $.Callbacks('unique');

navigator
	.geolocation
	.watchPosition(
			successCallbacks.fire.bind(successCallbacks),
			errorCallbacks.fire.bind(errorCallbacks),
			{
				enableHighAccuracy: true,
				maximumAge        : 30000,
				timeout           : 27000,
			}
		);

exports.watch = function(fnSuccess, fnError){ 
	successCallbacks.add(fnSuccess);
	errorCallbacks.add(fnError);
};

exports.unwatch = function(fnSuccess, fnError){ 
	successCallbacks.remove(fnSuccess);
	errorCallbacks.remove(fnError);
};

exports.once = function(){
	var d = q.defer();

	navigator
		.geolocation
		.getCurrentPosition(
			d.resolve.bind(d),
			d.reject.bind(d),
			{
				enableHighAccuracy: false,
			}
		);

	return d.promise;
};

