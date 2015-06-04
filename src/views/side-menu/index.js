var velocity = require('velocity-animate'),
	$ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	template = require('./index.vash');

function SideMenu(opt){
	var $content = $(opt.content);
	var self = new EventEmitter();

	self.$element = $(template({}));

	self.$element.on('click', '.js-upload', function(){
			self.emit('click', 'sync');
		});

	self.$element.on('click', '.js-code-manager', function(){
			self.emit('click', 'code-manager');
		});

	self.$element.on('click', '.js-settings', function(){
			self.emit('click', 'settings');
		});

	var $showLeftMenu = $('.js-show-left-menu'),
		isLeftMenuOpen = false;


	self.close = function(){
		if (!isLeftMenuOpen) return;
		openCloseLeftMenu();
	};

	function openCloseLeftMenu(){
		velocity($content, {left: isLeftMenuOpen? '0':'240'}, {
			duration:140,
			complete: function(){

			},
		});
		isLeftMenuOpen = !isLeftMenuOpen;
	}

	$showLeftMenu.click(function(ev){
		ev.stopPropagation();

		openCloseLeftMenu();
	});

	return self;
}

module.exports = SideMenu;
