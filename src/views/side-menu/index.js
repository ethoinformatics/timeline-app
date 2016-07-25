var velocity = require('velocity-animate'),
	$ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	template = require('./index.vash'),
	deviceSettings = require('device-settings'),
	app = require('app')();
	

function SideMenu(opt){
	//var $body = $('body');
	var $content = $(opt.content);
	var $mask = $('.mask');
	var self = new EventEmitter();


	console.log('app');

	
	self.$element = $(template({})); //username:''
	
	self.displayUser = function(){
		deviceSettings()
			.then(function(settings){			
				if( settings['user'] ){
					$('#left-title').text(settings['user']);
			}
		});	
	}
	self.displayUser();	

	self.$element.on('click', '.js-upload', function(){
			self.emit('click', 'sync');
		});

	self.$element.on('click', '.js-code-manager', function(){
			self.emit('click', 'code-manager');
		});

	self.$element.on('click', '.js-settings', function(){
			self.emit('click', 'settings');
		});

	self.$element.on('click', '.js-geolocation-viewer', function(){
			self.emit('click', 'geolocation-viewer');
		});

	var $showLeftMenu = $('.js-show-left-menu'),
		isLeftMenuOpen = false;


	self.close = function(){
		if (!isLeftMenuOpen) return;
		openCloseLeftMenu();
	};

	function openCloseLeftMenu(){
		console.log("oCLM");
		
		var leftEdgeMainContent = parseInt( $( window ).width() ).toString();
		velocity($content, {left: isLeftMenuOpen? '0': leftEdgeMainContent }, {
			duration:140,
			complete: function(){

			},
		});
		isLeftMenuOpen = !isLeftMenuOpen;
		if(isLeftMenuOpen) {
			$mask.fadeIn(140);
		} else {
			$mask.fadeOut(140);
		}
	}

	$showLeftMenu.click(function(ev){
		ev.stopPropagation();

		openCloseLeftMenu();
		
	//	$(this).hide();
		if( isLeftMenuOpen ) {

			$(this).removeClass('ion-navicon');
			$(this).addClass('ion-close');	
			$(this).css('left', '-60px');		
		}else{

			$(this).addClass('ion-navicon');
			$(this).removeClass('ion-close');			
			$(this).css('left', '0px');		

		}
		
	});

	return self;
}

module.exports = SideMenu;
