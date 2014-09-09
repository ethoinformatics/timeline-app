/* global HockeyApp */
var $ = window.$,
	_ = require('lodash'),
	Timeline = require('./views/timeline/'),
	ActivityPage = require('./views/activity-page/');

// todo: use device-ready
$(function(){
	var $body = $('body'),
		timeline = new Timeline(),
		activityPage = new ActivityPage();
		
		timeline.hide();

		$body.append(activityPage.$element);
		$body.append(timeline.$element);

		activityPage.show();
		timeline.hide();

		$body.on('click', '.js-show-timeline', function(){
			activityPage.hide();
			timeline.show();
		});

		$body.on('click', '.js-show-activity-list', function(){
			activityPage.show();
			timeline.hide();
		});

		initHockeyApp();
});

function initHockeyApp(){
		if (!HockeyApp){
			return console.log('skipping hockeyapp.  this should be desktop browsers only.');
		}

		HockeyApp.init(
			[ 'fce2c0e86b0cd9989fb9d6db7688cba3', true, true ],
			function() { window.alert('hockeyapp initialised'); },
			function(msg) { window.alert(msg); }
		);
}
