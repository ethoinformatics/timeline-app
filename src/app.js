var myApp;

module.exports = function(app){
	if (app === undefined) return myApp;

	myApp = app;
	return myApp;
};

