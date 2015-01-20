require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	modalTemplate = require('./modal.vash');


var DEFAULTS = {
	hideOkay: false,
};

function Modal(options){
	var self = this, $modal;

	options = _.extend({}, DEFAULTS, options);

	options = Object(options);
	EventEmitter.call(self);

	var myTitle = myTitle || options.title,
		$myContent = $myContent || options.$content;

	$modal = $(modalTemplate({
		title: myTitle,
		showBackButton: !!options.backAction,
	}));

	$modal.find('.modal-body')
		.empty()
		.append($myContent);

	$modal.find('.js-back')
		.on('click', function(ev){
			ev.preventDefault();
			if (_.isFunction(options.backAction))
				options.backAction();
		});

	$modal.find('.js-close')
		.on('click', function(ev){
			ev.preventDefault();

			self.hide();
		});

	$modal.find('.js-ok')
		.on('click', function(ev){
			ev.preventDefault();

			self.emit('ok');
			$modal.slideUp('fast', function(){
				$modal.remove();
			});
		});

	if (options.hideOkay){
		$modal.find('.js-button-bar').hide();
	} else {
		$modal.find('.js-button-bar').show();
	}

	$('body').append($modal);

	this.hide = this.close = function(){
		if (!$modal) return;

		$modal.animate({top:window.innerHeight}, 300, function(){
			$modal.hide();
			self.emit('closed');
		});
	};

	this.remove = this.close = function(){
		if (!$modal) return;

		$modal.animate({top:window.innerHeight}, 300, function(){
			$modal.remove();
		});
	};

	this.show = function(){
		$modal
			.css('height', window.innerHeight)
			.css('top', window.innerHeight)
			.show()
			.animate({top:0}, 300);
	};
}

util.inherits(Modal, EventEmitter);
module.exports = Modal;
