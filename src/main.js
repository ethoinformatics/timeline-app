require('./main.less');
require('../node_modules/leaflet/dist/leaflet.css');

var $ = require('jquery'),
	GlobalAddButton = require('./controls/global-add-button/'),
	UploadDialog = require('./views/upload-dialog/'),
	CodeManager = require('./views/code-manager/'),
	Settings = require('./views/settings/'),
	SideMenu = require('./views/side-menu/'),
	ListView = require('./views/list-view/'),
	mainTemplate = require('./main.vash'),
	ready = require('dom-ready'),
	locationWatch = require('./activity-location-watch');

function keepAppAlive(){
	if (typeof cordova == 'undefined') return;

	try {
		cordova.plugins.backgroundMode.setDefaults({ 
			title: 'Ethoinformatics',
			text:'The app is in background mode.',
			ticker:'Ethoinformatics is still running.',
		});
		cordova.plugins.backgroundMode.enable();
	} catch (e){
	}
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
		listView = new ListView(),
		addButton = new GlobalAddButton();

	$body.append(sideMenu.$element);
	$body.find('.js-menu').append(addButton.$element);
	$body.find('#main-content').append(listView.$element);

	addButton.on('created', function(){ listView.refresh(); });
	sideMenu.on('click', function(moduleName){
		sideMenu.close();

		if (moduleName == 'code-manager') codeManager.show();
		if (moduleName == 'sync') uploadDialog.show();
		if (moduleName == 'settings') settings.show();
	});

	uploadDialog.on('closed', function(){
		//activityPage.render();
	});

	$content.click(function(){
		sideMenu.close();
	});

	locationWatch();

	keepAppAlive();
});



