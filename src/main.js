var $ = require('jquery'),
	ActivityPage = require('./views/activity-page/'),
	updateAppCheck = require('./update-app-check'),
	storage = require('jocal'),
	//sampleData = require('./sample-data.json'),
	_ = require('lodash'),
	ready = require('dom-ready');

var SideMenu = require('./side-menu.js');
ready(function appLoad(){
	var $body = $('body'),
		sideMenu = new SideMenu(),
		activityPage = new ActivityPage();

	$body.append(sideMenu.$element);

	sideMenu.on('ready', function(){
		console.dir('got ready');
		$body.find('#main-content').append(activityPage.$element);
	});

	sideMenu.on('upload-click', function(){
		alert('clicked upload');
	});
	//activityPage.show();

	updateAppCheck();


	// if (window.confirm('Load the sample data?')){
	// 	storage('activities', _.first(sampleData, 15));
	// }
});

