var $ = require('jquery'),
	ActivityPage = require('./views/activity-page/'),
	UploadDialog = require('./views/upload-dialog/'),
	updateAppCheck = require('./update-app-check'),
	ready = require('dom-ready');

var SideMenu = require('./side-menu.js');
ready(function appLoad(){
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
});

