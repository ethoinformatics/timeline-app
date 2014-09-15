var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	backdropTemplate = require('./backdrop.vash'),
	util = require('util'),
	modalTemplate = require('./modal.vash'),
	$backdrop;


function Modal(title, $content){
	var self = this;
	EventEmitter.call(self);

	if (!$backdrop) {
		$backdrop = $(backdropTemplate({}));
		$('body').append($backdrop);
	}

	this.show = function(myTitle, $myContent){
		myTitle = myTitle || title;
		$myContent = $myContent || $content;
		var $modal = $(modalTemplate({title: myTitle}));
		$modal.find('.modal-body')
			.empty()
			.append($myContent);

		$modal.find('.js-close')
			.on('click', function(ev){
				ev.preventDefault();

				$backdrop.removeClass('active');
				$modal.fadeOut('fast', function(){
					$modal.remove();
					$backdrop.addClass('hide');
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
			.empty()
			.append($modal);

		$modal.fadeIn();
	};
}

util.inherits(Modal, EventEmitter);
module.exports = Modal;
