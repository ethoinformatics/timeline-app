var $ = require('jquery'),
	Timeline = require('./views/timeline/'),
	ActivityPage = require('./views/activity-page/'),
	updateAppCheck = require('./update-app-check'),
	ready = require('dom-ready');

ready(function appLoad(){
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

	updateAppCheck();
});


