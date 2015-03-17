require('./main.less');

var $ = require('jquery'),
	ActivityPage = require('./views/timeline-page/'),
	UploadDialog = require('./views/upload-dialog/'),
	CodeManager = require('./views/code-manager/'),
	updateAppCheck = require('./update-app-check'),
	SideMenu = require('./views/side-menu/'),
	mainTemplate = require('./main.vash'),
	ready = require('dom-ready');
	//activityLocationWatch = require('./activity-location-watch');


var $showLeftMenu, isLeftMenuOpen = false;

ready(function appLoad(){
	var app = require('app');

	var $body = $('body');
	var $mainContainer = $(mainTemplate({}))
		.css('height', window.innerHeight-44);

	var $content = $mainContainer.find('#main-content');
	$body.append($mainContainer);

	var sideMenu = new SideMenu({content: $mainContainer}),
		uploadDialog = new UploadDialog(),
		codeManager = new CodeManager(),
		activityPage = new ActivityPage();

	$body.append(sideMenu.$element);
	$body.find('#main-content').append(activityPage.$element);

	sideMenu.on('upload-click', function(){
		sideMenu.close();
		uploadDialog.show();
	});

	sideMenu.on('code-manager-click', function(){
		sideMenu.close();
		codeManager.show();
	});

	uploadDialog.on('closed', function(){
		activityPage.render();
	});

	$content.click(function(){
		sideMenu.close();
	});

	updateAppCheck();

});



