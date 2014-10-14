require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	Modal = require('modal'),
	template = require('index.vash'),
	activityTypes = require('activity-types'),
	ActivityDetailsModal = require('activity-details');

function NewActivityDialog(){
	var self = this;
	EventEmitter.call(self);

	var $element = $(template({
			activityTypes: activityTypes,
		})),
		modal = new Modal('New Activity', $element, {hideOkay:true});

	$element
		.find('.js-new-activity')
		.on('click', function(){
			var $this = $(this),
				key = $this.val();

			var type = _.find(activityTypes, function(a){return a.key == key;});
			var m = new ActivityDetailsModal(type);
			m.on('new', function(data){
				self.emit('new', data);
			});
			m.show();

		});

	this.show = function(){
		modal.show();
	};
}

util.inherits(NewActivityDialog, EventEmitter);
module.exports = NewActivityDialog;
