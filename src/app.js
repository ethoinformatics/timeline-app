/////////////////////////////////
//
// ethoinfo-framework/src/app.js
//
// Manages app singleton
//
/////////////////////////////////


var myApp;

// This is required once at launch and called with an object (from 
// ethoinfo-framework/src/registrar/index.js). This initializes
// the myApp variable. Subsequent calls don't pass an argument
// and return the same object.
//
// Note that this does return a function when required that 
// must be called (with no params, except for the first time).
// e.g.: 
//   var app = require('app')();
//
// The actual app object is defined in ethoinfo-framework/src/registrar/index.js
module.exports = function(app){
	if (app === undefined) return myApp;

	myApp = app;
	return myApp;
};

