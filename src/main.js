var $ = require('jquery'),
	ActivityPage = require('./views/activity-page/'),
	updateAppCheck = require('./update-app-check'),
	ready = require('dom-ready');

var sideMenu = require('./side-menu.js');
ready(function appLoad(){
	var $body = $('body'),
		activityPage = new ActivityPage();

	$body.append(sideMenu());

	$body.find('#main-content').append(activityPage.$element);
	//activityPage.show();

	updateAppCheck();
});

