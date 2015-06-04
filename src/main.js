require('./main.less');

var $ = require('jquery'),
	ActivityPage = require('./views/timeline-page/'),
	UploadDialog = require('./views/upload-dialog/'),
	CodeManager = require('./views/code-manager/'),
	Settings = require('./views/settings/'),
	updateAppCheck = require('./update-app-check'),
	SideMenu = require('./views/side-menu/'),
	mainTemplate = require('./main.vash'),
	ready = require('dom-ready'),
	locationWatch = require('./activity-location-watch');


var $showLeftMenu, isLeftMenuOpen = false;

function keepAppAlive(){
	if (typeof cordova == 'undefined') return;

	cordova.plugins.backgroundMode.setDefaults({ 
		title: 'Ethoinformatics',
		text:'The app is in background mode.',
		ticker:'Ethoinformatics is still running.',
	});
	cordova.plugins.backgroundMode.enable();
}

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
		settings = new Settings(),
		activityPage = new ActivityPage();

	$body.append(sideMenu.$element);
	$body.find('#main-content').append(activityPage.$element);

	sideMenu.on('click', function(moduleName){
		sideMenu.close();

		if (moduleName == 'code-manager') codeManager.show();
		if (moduleName == 'sync') uploadDialog.show();
		if (moduleName == 'settings') settings.show();
	});

	uploadDialog.on('closed', function(){
		activityPage.render();
	});

	$content.click(function(){
		sideMenu.close();
	});

	updateAppCheck();
	locationWatch();

	keepAppAlive();
});



