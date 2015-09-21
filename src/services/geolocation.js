var q = require('q');
var $ = require('jquery');
var callbacks = $.Callbacks('unique');
var latestCoordinates;

var DEFAULTS = {
	enableHighAccuracy: true, 
	maximumAge        : 30000, 
	timeout           : 27000
};

$(function(){
	window.isCordova = false;

    if(document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
		window.isCordova = true;
	}

	if(window.isCordova) {
		document.addEventListener("deviceready", onDeviceReady, false);
	 } else {
		onDeviceReady();
	}
});

function onDeviceReady(){
	navigator
		.geolocation
		.watchPosition(success, error, DEFAULTS);
}

var success = function(data){

	try {
		if (data){
			latestCoordinates = {
				coords: {
					speed: data.coords.speed,
					heading: data.coords.heading,
					altitudeAccuracy: data.coords.altitudeAccuracy,
					accuracy: data.coords.accuracy,
					altitude: data.coords.altitude,
					longitude: data.coords.longitude,
					latitude: data.coords.latitude,
				},
				timestamp: data.timestamp,
			};
		}

	} catch (e){
		
	}


	fireFireFire();
};

var error = function(err){
	console.log('there was an error getting the position');
	console.dir(err);
	callbacks.fire(err);
};

var fireFireFire = function(){ callbacks.fire(null, latestCoordinates); };

exports.watch = function(fnSuccess){ 
	var myCoords = latestCoordinates;
	if (myCoords){
		process.nextTick(function(){
			fnSuccess(null, myCoords);
			callbacks.add(fnSuccess);
		});
	} else {
		callbacks.add(fnSuccess);
	}
};

exports.unwatch = function(fnSuccess){ 
	callbacks.remove(fnSuccess);
};

var ONCE_DEFAULTS = {
	enableHighAccuracy: false,
	maximumAge: 0, 
	timeout: 2000,
};

exports.once = function(){
	var d = q.defer();
	
	var fnSuccess = function(data){
		d.resolve({
				coords: {
					speed: data.coords.speed,
					heading: data.coords.heading,
					altitudeAccuracy: data.coords.altitudeAccuracy,
					accuracy: data.coords.accuracy,
					altitude: data.coords.altitude,
					longitude: data.coords.longitude,
					latitude: data.coords.latitude,
				},
				source: 'current',
				timestamp: data.timestamp,
			});
	};

	var fnError = function(err){
		if (!latestCoordinates) return d.reject(err);

		return d.resolve({
				coords: latestCoordinates.coords,
				timestamp: latestCoordinates.timestamp,
				source: 'stale',
			});
	};

	var time = 1000*60*12;
	if (latestCoordinates){
		var locationAge = ((Date.now() -latestCoordinates.timestamp)/1000)/60;
		console.log('geolocaiton data is ' + Math.round(locationAge) + ' minutes old');
	}

	if (latestCoordinates && latestCoordinates.timestamp >= (Date.now()-time)){
		console.dir('using last location');
		d.resolve({
				coords: latestCoordinates.coords,
				source: 'stale',
		});
	} else {
		navigator
			.geolocation
			.getCurrentPosition(fnSuccess, fnError, ONCE_DEFAULTS);
	}

	return d.promise;
};

