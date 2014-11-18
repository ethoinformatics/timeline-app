require('./index.less');

var $ = require('jquery'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	template = require('./index.vash');

var ALL_TEXT = 'All',
	CURRENT_TEXT = 'Current',
	COMPLETED_TEXT = 'Completed';

function createPredicate(){
	switch (this._activityState.toLowerCase()){
		case CURRENT_TEXT.toLowerCase():
			return function(activity){ return !activity.endTime; };

		case COMPLETED_TEXT.toLowerCase():
			return function(activity){ return !!activity.endTime; };

		case ALL_TEXT.toLowerCase():
			return function(){ return true; };

		default:
			return Boolean;
	}
}

function ActivitySelector(){
	EventEmitter.call(this);
	var self = this;

	self._activityState = 'All Activities';
	self.createPredicate = createPredicate.bind(self);
	self.$element = $(template({
			activityStates: [ ALL_TEXT, CURRENT_TEXT, COMPLETED_TEXT ],
		}));

	self.$element
		.on('change', 'select', function(){
			var $this = $(this);
			self._activityState = $this.val();

			self.emit('predicate-change', self.createPredicate());
		});
}

util.inherits(ActivitySelector, EventEmitter);
module.exports = ActivitySelector;
