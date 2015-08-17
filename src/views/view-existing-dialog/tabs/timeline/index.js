var $ = require('jquery'),
	util = require('util'),
	createTimeline = require('timeline'),
	EventEmitter = require('events').EventEmitter,
	tmpl = require('./index.vash');

function TimelineTab(){
	var self = this,
		_context;

	self.label = 'Timeline';

	EventEmitter.call(self);
	self.$element = $(tmpl({}));

	var timeline = createTimeline({
		height: (window.innerHeight-175),
	});

	timeline.on('activity-click', function(d){
		_context.descend(d);
	});

	self.$element.find('.js-framework-timeline-container')
		.append(timeline.element);

	function _renderTimeline(){
		var children = _context.getChildren();

		timeline.clear();
		timeline.add(children);
	}
	function _setTitleContent(){
		self.$element.find('.js-long-description-container')
			.html('<h1 class="loading-message">Loading...</h1>');

		_context.descManager.getLongDescription(_context.entity)
			.then(function(description){
				self.$element.find('.js-long-description-container').html(description);
			})
			.catch(function(err){
				console.error(err);
			});
	}

	self.setContext = function(ctx){
		_context = ctx;

		_setTitleContent();
		_renderTimeline();
	};

}

util.inherits(TimelineTab, EventEmitter);
module.exports = TimelineTab;
