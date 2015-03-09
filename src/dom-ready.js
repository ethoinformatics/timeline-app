var q = require('q'),
	d = q.defer(),
	$ = require('jquery'),
	readyCallbacks = $.Callbacks();

module.exports = readyCallbacks.add.bind(readyCallbacks);
module.exports.promise = d.promise;

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
	readyCallbacks.fire();
	d.resolve();
}
