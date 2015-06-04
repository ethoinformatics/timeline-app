var q = require('q'),
	$ = require('jquery'),
	successCallbacks = $.Callbacks('unique'),
	errorCallbacks = $.Callbacks('unique');

navigator
	.geolocation
	.watchPosition(
			success,
			failure,
			{
				enableHighAccuracy: true,
				maximumAge        : 30000,
				timeout           : 27000,
			}
		);


var lastResult;
function success(data){
	lastResult = data;
	successCallbacks.fire(data);
}

function failure(data){
	alert('gps error');
	alert(JSON.stringify(data));
	errorCallbacks.fire(data);
}

exports.watch = function(fnSuccess, fnError){ 
	successCallbacks.add(fnSuccess);
	errorCallbacks.add(fnError);

	// a bit of a workaround for use in a web browser
	if (lastResult){
		fnSuccess(lastResult);
	}
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

