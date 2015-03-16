var theApp;

module.exports = function(a){
	if (a === undefined) return theApp;

	theApp=a;
	return theApp;
};

