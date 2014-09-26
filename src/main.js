var $ = require('jquery'),
	ActivityPage = require('./views/activity-page/'),
	updateAppCheck = require('./update-app-check'),
	ready = require('dom-ready');

ready(function appLoad(){
	var $body = $('body'),
		activityPage = new ActivityPage();

	$body.append(activityPage.$element);

	activityPage.show();

	updateAppCheck();
});

