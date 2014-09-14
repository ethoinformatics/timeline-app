/* global HockeyApp */

module.exports = function updateCheck(){
	if (typeof HockeyApp === 'undefined') return;

	HockeyApp.init(
		[ 'fce2c0e86b0cd9989fb9d6db7688cba3', true, true ],
		function() { console.log('hockeyapp loaded'); },
		function(msg) { window.alert(msg); }
	);
};
