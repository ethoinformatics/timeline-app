require('./index.less');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var template = require('./index.vash'),
	crumbTemplate = require('./crumb.vash'),
	_ = require('lodash'),
	$ = require('jquery'),
	velocity = require('velocity-animate');


function Breadcrumb(opt){
	function toElement(crumb){
		crumb.label = crumb.label || 'missing label ';
		var $el = $(crumbTemplate(crumb));

		$el.on('click', function(){
			var clickedElement = this;
			var remove = false, found = false;

			$cntr.find('.js-crumb-container')
				.toArray()
				.reverse()
				.forEach(function(el){
					if (el == clickedElement) found = true;
					var $el = $(el);

					if (found) {
						velocity($el, 'stop');
						$el.css('opacity', '1')
							.removeClass('js-faded');
					} else {
						$el.addClass('js-faded');
						velocity($el, {opacity: 0.2}, {
							duration: 450,
							complete: function(){

							},
						});
					}

				});

			self.emit('selection', {context: crumb.context});
		});

		return $el;
	}

	var self = this;

	EventEmitter.call(this);

	self.$element = $(template({crumbs: opt.crumbs}));
	var $cntr = self.$element.find('.js-crumbs');

	self.add = function(crumb){
		var el = toElement(crumb);
		$cntr.append(el);
//		$cntr.append('<span style="color:#ff0000;">d00d</span>');

		$cntr.find('.js-crumb-container.js-faded').remove();
	};
	self.$element.find('.js-breadcrumb-close')
		.on('click', function(){self.emit('close');});

	opt.crumbs.forEach(function(crumb){self.add(crumb);});
}

util.inherits(Breadcrumb, EventEmitter);
module.exports = Breadcrumb;
