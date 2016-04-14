require('./index.less');

var $ = require('jquery'),
	velocity = require('velocity-animate'),
	Scroll = require('iscroll'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	modalTemplate = require('./modal.vash');


var ANIMATION_DURATION=400;
var DEFAULTS = {
	hideOkay: false,
};

function Modal(options){
	var self = this, $modal;
	var $header;

	if (options.title){
		$header = $('<h1 class="title"></h1>').text(options.title);
	} else {
		$header = options.$header;
	}

	options = _.extend({}, DEFAULTS, options);

	options = Object(options);
	EventEmitter.call(self);

	var $myContent = $myContent || options.$content;

	$modal = $(modalTemplate({
		showBackButton: !!options.backAction,
		hideClose: !!options.hideClose,
	}));

	$modal.find('.js-header-placeholder').replaceWith($header);

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

		velocity($modal, {top:window.innerHeight}, {
			duration:ANIMATION_DURATION,
			complete: function(){
				$modal.hide();
				self.emit('closed');
			},
		});
	};

	this.remove = this.close = function(){
		if (!$modal) return;

		velocity($modal, {top:window.innerHeight+1}, {
			duration:ANIMATION_DURATION,
			complete: function(){
				$modal.remove();
			},
		});
	};

	this.peekBehindModal = function( peekBehind ){
		velocity($modal, {left: peekBehind ? '240':'0'}, {
			duration:140,
			complete: function(){

			},
		});
		velocity($('#main-container'), {left: peekBehind ? '240':'0'}, {
			duration:140,
			complete: function(){

			},
		});
		var mask = $('.mask');
		console.log(mask, $modal);
		if(peekBehind) {
			mask.fadeIn(140);
		} else {
			mask.fadeOut(140);
		}
	};
	
	this.showInstant = function(){
		$modal
			.css('height', window.innerHeight+1)
			.css('top', 0)
			.show();

	

		// velocity($modal, {top:0}, {
		// 	duration:ANIMATION_DURATION,
		// 	complete: function(){
		// 		if (options.scroll){
		// 			var $content = $modal.find('.content');
		// 			$content
		// 				.css('height', window.innerHeight-44);
		//
		// 			var scroll = new Scroll($content[0], {
		// 				mouseWheel: true,
		// 				scrollbars: true,
		// 			});
		// 		}
		// 	},
		// });
	};
	
	this.show = function(){
		$modal
			.css('height', window.innerHeight+1)
			.css('top', window.innerHeight)
			.show();

	

		velocity($modal, {top:0}, {
			duration:ANIMATION_DURATION,
			complete: function(){
				if (options.scroll){
					var $content = $modal.find('.content');
					$content
						.css('height', window.innerHeight-44);

					var scroll = new Scroll($content[0], {
						mouseWheel: true,
						scrollbars: true,
					});
				}
			},
		});
	};
	
	this.modalElement = $modal;
}

util.inherits(Modal, EventEmitter);
module.exports = Modal;
