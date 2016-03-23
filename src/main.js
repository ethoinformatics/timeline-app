require('./main.less');
require('../node_modules/leaflet/dist/leaflet.css');

var $ = require('jquery'),
	// bring in UI elements
	GlobalAddButton = require('./controls/global-add-button/'),
	UploadDialog = require('./views/upload-dialog/'),
	CodeManager = require('./views/code-manager/'),
	Settings = require('./views/settings/'),
	GeolocationViewer = require('./views/geolocation-viewer/'),
	SideMenu = require('./views/side-menu/'),
	ListView = require('./views/list-view/'),
	mainTemplate = require('./main.vash'),
	ready = require('dom-ready');
	locationWatch = require('./activity-location-watch');

// function keepAppAlive(){
// 	if (typeof cordova == 'undefined') return;

// 	try {
// 		cordova.plugins.backgroundMode.setDefaults({ 
// 			title: 'Ethoinformatics',
// 			text:'The app is in background mode.',
// 			ticker:'Ethoinformatics is still running.',
// 		});
// 		cordova.plugins.backgroundMode.enable();
// 	} catch (e){
// 	}
// }

ready(function appLoad(){
	var app = require('app');

	var $body = $('body');
	var $mainContainer = $(mainTemplate({}))
		.css('height', window.innerHeight-44);

	var $content = $mainContainer.find('#main-content');
	// add main content
	$body.append($mainContainer);

	var sideMenu = new SideMenu({content: $mainContainer}),
		uploadDialog = new UploadDialog(),
		codeManager = new CodeManager(),
		settings = new Settings(),
		listView = new ListView(),
		addButton = new GlobalAddButton(),
		geolocationViewer = new GeolocationViewer();

	// append side menu
	$body.append(sideMenu.$element);
	// append add button
	$body.find('.js-menu').append(addButton.$element);
	// append list view
	$body.find('#main-content').append(listView.$element);
	// create listeners
	addButton.on('created', function(){ listView.refresh(); });
	sideMenu.on('click', function(moduleName){
		sideMenu.close();

		if (moduleName == 'code-manager') codeManager.show();
		if (moduleName == 'sync') uploadDialog.show();
		if (moduleName == 'settings') settings.show();
		if (moduleName == 'geolocation-viewer') geolocationViewer.show();
	});

	uploadDialog.on('closed', function(){
		//activityPage.render();
	});
	// close side menu when main area is clicked
	$content.click(function(){
		sideMenu.close();
	});

	locationWatch();
	//keepAppAlive();
});



