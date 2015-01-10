require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	backdropTemplate = require('./backdrop.vash'),
	_ = require('lodash'),
	util = require('util'),
	modalTemplate = require('./modal.vash'),
	$backdrop;


var DEFAULTS = {
	hideOkay: false,
};

function Modal(options){
	var self = this, $modal;

	options = _.extend({}, DEFAULTS, options);

	options = Object(options);
	EventEmitter.call(self);

	if (!$backdrop) {
		$backdrop = $(backdropTemplate({}));
		$('body').append($backdrop);
	}

	this.hide = this.close = function(){
		if (!$modal) return;
		//$modal.find('.js-close').click();
		$modal.hide();
	};
	this.remove = this.close = function(){
		if (!$modal) return;
		//$modal.find('.js-close').click();
		$modal.remove();
	};

	this.show = function(){
		var myTitle = myTitle || options.title,
			$myContent = $myContent || options.$content;

		if ($modal){
			$backdrop.removeClass('hide');
			$backdrop.addClass('active');
			return $modal.fadeIn();
		}

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

				$backdrop.removeClass('active');
				$modal.fadeOut('fast', function(){
					$modal.hide();
					$backdrop.addClass('hide');
					self.emit('closed');
				});
			});

		$modal.find('.js-ok')
			.on('click', function(ev){
				ev.preventDefault();

				self.emit('ok');
				$backdrop.removeClass('active');
				$modal.fadeOut('fast', function(){
					$modal.remove();
					$backdrop.addClass('hide');
				});
			});

		$backdrop
			.removeClass('hide')
			.addClass('active');

		$backdrop.find('.js-container')
			//.empty()
			.append($modal);

		if (options.hideOkay){
			$modal.find('.js-button-bar').hide();
		} else {
			$modal.find('.js-button-bar').show();
		}

		$modal.fadeIn();
	};
}

util.inherits(Modal, EventEmitter);
module.exports = Modal;
