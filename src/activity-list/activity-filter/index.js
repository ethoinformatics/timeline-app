var $ = window.$,
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	template = require('./index.vash');

function createPredicate(){
	switch (this._activityState.toLowerCase){
		case 'current activities':
			return function(activity){ return !activity.endTimestamp; };

		case 'completed activities':
			return function(activity){ return !!activity.endTimestamp; };

		case 'all activities':
			return function(){ return true; };

		default:
			return Boolean;
	}
}

function ActivitySelector(){
	EventEmitter.call(this);
	var self = this;

	self._activityState = 'All Activities'
	self.createPredicate = createPredicate.bind(self);
	self.$element = $(template({
			activityStates: [
				'All Activities', 
				'Current Activities', 
				'Completed Activities'
			],
		}));

	self.$element
		.find('select')
		.on('change', function(){
			var $this = $(this);
			self._activityState = $this.val();

			self.emit('predicate-change', self.createPredicate());
		});
}

util.inherits(ActivitySelector, EventEmitter);
module.exports = ActivitySelector;
