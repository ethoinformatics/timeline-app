var $ = require('jquery'),
	ActivityPage = require('./views/timeline-page/'),
	UploadDialog = require('./views/upload-dialog/'),
	CodeManager = require('./views/code-manager/'),
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
		codeManager = new CodeManager(),
		activityPage = new ActivityPage();

	$body.append(sideMenu.$element);

	sideMenu.on('ready', function(){
		$body.find('#main-content').append(activityPage.$element);
	});

	sideMenu.on('upload-click', function(){
		uploadDialog.show();
	});
	sideMenu.on('code-manager-click', function(){
		codeManager.show();
	});

	uploadDialog.on('closed', function(){
		activityPage.render();
	});

	updateAppCheck();
	activityLocationWatch();

});



