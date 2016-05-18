var q = require('q');
var $ = require('jquery');
var callbacks = $.Callbacks('unique');
var latestCoordinates;

var DEFAULTS = {
	enableHighAccuracy: true, 
	maximumAge        : 30000,
	frequency					: 30000,
	timeout           : 15000
};

var debugCount = 0;

$(function(){
	window.isCordova = false;

  if(document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
		window.isCordova = true;
	}

	if(window.isCordova) {
		setTimeout(function() {
			console.log("isCordova");
			document.addEventListener("deviceready", onDeviceReady, false);
		}, 10000);		
	 } else {
		setTimeout(function() {
			console.log("isNotCordova");
	 		onDeviceReady();		 	
		}, 10000);
	}
});

function onDeviceReady(){
	console.log("starting geolocation");
	
	// var bgGeo = window.BackgroundGeolocation;
	// bgGeo.on('location', success, error);
	// bgGeo.start();
	navigator
		.geolocation
		.watchPosition(success, error, DEFAULTS);

		console.log("cordova.plugins.backgroundMode", cordova.plugins.backgroundMode);
	cordova.plugins.backgroundMode.setDefaults({ text:'Ethoinformatics is still running'});
	cordova.plugins.backgroundMode.onactivate = function() {
		console.log("bg activated");
	};
	cordova.plugins.backgroundMode.ondeactivate = function() {
		console.log("bg deactivated");
	};	
	cordova.plugins.backgroundMode.onfailure = function(errorCode) {
		console.log("bg failed: " + errorCode);
	};
	cordova.plugins.backgroundMode.enable();
	
	setInterval(function() {
		console.log("ping.");		
	},10000);

}

var success = function(data){

	try {
		if (data){
			if(latestCoordinates) { // dedupe
				if(latestCoordinates.coords.latitude == data.coords.latitude && 
					latestCoordinates.coords.longitude == data.coords.longitude) {
						console.log("duplicate geolocation record ignored");
						return;
					}
			}
			
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
			
			console.log("success",new Date());
			console.log(latestCoordinates);
			debugCount += 1;
			console.log("debugCount", debugCount);
		}

	} catch (e){
		console.err("error: " + e);
	}


	fireFireFire();
};

var error = function(err){
	console.log('there was an error getting the position.');
	console.dir(err);
	
	callbacks.fire(err);
};

var fireFireFire = function(){ 
	console.log(callbacks);
	callbacks.fire(null, latestCoordinates);
};

exports.watch = function(fnSuccess){ 
	console.log("watch");
	console.log(fnSuccess);
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
	console.log("unwatch");
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
			
			console.log(data);
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

