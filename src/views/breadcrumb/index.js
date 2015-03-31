require('./index.less');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var template = require('./index.vash'),
	crumbTemplate = require('./crumb.vash'),
	_ = require('lodash'),
	$ = require('jquery');


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
					if (found) return;

					var $el = $(el);
					$el.fadeOut('fast', function(){
						$el.remove();
					});

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
	};
	self.$element.find('.js-breadcrumb-close')
		.on('click', function(){self.emit('close');});

	opt.crumbs.forEach(function(crumb){self.add(crumb);});
}

util.inherits(Breadcrumb, EventEmitter);
module.exports = Breadcrumb;
