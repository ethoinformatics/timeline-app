/* global HockeyApp */

module.exports = function updateCheck(){
	if (!HockeyApp){
		return console.log('skipping hockeyapp.  this should be desktop browsers only.');
	}

	HockeyApp.init(
		[ 'fce2c0e86b0cd9989fb9d6db7688cba3', true, true ],
		function() { console.log('hockeyapp loaded'); },
		function(msg) { window.alert(msg); }
	);
};
