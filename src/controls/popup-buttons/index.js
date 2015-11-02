require('./index.less');

var $ = require('jquery'),
	velocity = require('velocity-animate'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	//Hammer = require('util'),
	template = require('./index.vash');

function PopupButtons(opt){
	EventEmitter.call(this);
	opt = Object(opt);

	var self = this,
		items = opt.items || [];

	items.forEach(function(item){
		item.label = item.label || item.value;
		item.value = item.value || item.label;
		item['class'] = item['class'] || 'button-dark';
	});

	var $element = $(template({
			items: items,
		}));


	$('body').append($element);

	$element
		.find('.js-button')
		.on('click', function(){
			var $this = $(this);
			self.emit('click', $this.val() || 'unknown');
		});

	function _watchForOutsideClick(){
		setTimeout(function(){
			console.log('watching for click');
				$(window.document).one('click', function(){
					$element.hide();
					self.emit('closed');
				});
			},100);
	}

	function _showMenu(ev, delayClickWatch){
		$element
			.css('top', ev.pageY)
			.css('right', window.innerWidth - ev.pageX);

		velocity($element, 'fadeIn', {duration: 300});

		if (!delayClickWatch){
			_watchForOutsideClick();
		}
	}

	this.show = function(ev, wait){ _showMenu(ev, wait); };
	this.opened = _watchForOutsideClick;
	this.hide = function(){ $element.hide(); };
	this.remove = function(){ $element.remove(); };
}

util.inherits(PopupButtons, EventEmitter);
module.exports = PopupButtons;
