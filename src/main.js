var $ = require('jquery'),
	ActivityPage = require('./views/activity-page/'),
	updateAppCheck = require('./update-app-check'),
	storage = require('jocal'),
	sampleData = require('./sample-data.json'),
	_ = require('lodash'),
	ready = require('dom-ready');

var sideMenu = require('./side-menu.js');
ready(function appLoad(){
	var $body = $('body'),
		activityPage = new ActivityPage();

	$body.append(sideMenu());

	$body.find('#main-content').append(activityPage.$element);
	//activityPage.show();

	updateAppCheck();


	if (window.confirm('Load the sample data?')){
		storage('activities', _.first(sampleData, 15));
	}
});

