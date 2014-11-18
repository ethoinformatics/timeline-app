var $ = require('jquery'),
	ActivityPage = require('./views/timeline-page/'),
	UploadDialog = require('./views/upload-dialog/'),
	updateAppCheck = require('./update-app-check'),
	SideMenu = require('./side-menu.js'),
	ready = require('dom-ready'),
	activityLocationWatch = require('./activity-location-watch');


ready(function appLoad(){
	var app = require('app');
	console.dir(app);

	var $body = $('body'),
		sideMenu = new SideMenu(),
		uploadDialog = new UploadDialog(),
		activityPage = new ActivityPage();

	$body.append(sideMenu.$element);

	sideMenu.on('ready', function(){
		$body.find('#main-content').append(activityPage.$element);
	});

	sideMenu.on('upload-click', function(){
		uploadDialog.show();
	});

	updateAppCheck();
	activityLocationWatch();

});



