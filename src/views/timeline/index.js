require('./index.less');

var $ = window.$,
	_ = require('lodash'),
	d3 = require('d3'),
	d3Timeline = require('./d3-timeline')(d3),
	storage = require('jocal'),
	template = require('./index.vash');


var height = window.innerHeight -100,
	widht = window.innerWidth;

function Timeline(){
	var self = this;
	self.$element = $(template({}));

	self.hide = self.$element.hide.bind(self.$element);
	self.show = function(){
		self.$element.show();
		self.$element.find('#timeline-container').empty();

		var activities = storage('activities') || [];
		activities = _.cloneDeep(activities);

		console.dir(activities);
		activities = activities.map(function(activity, i){
			activity.starting_time = new Date(activity.starting_time).valueOf();

			if (activity.ending_time){
				activity.ending_time = new Date(activity.ending_time).valueOf();
			} else {
				activity.ending_time = Date.now();
			}

			return {
				label: activity.type + ' ' + i,
				times: [activity],
			};
		});

		var chart = d3.timeline()
			.showToday()
			.stack()
			.margin({left:90, right:30, top:0, bottom:0})
			.tickFormat({
				format: d3.time.format("%I:%M %p"),
				tickTime: d3.time.minutes,
				tickInterval: 15,
				tickSize: 6
			});

		d3.select('#timeline-container')
			.append('svg')
			.attr('width', window.innerWidth)
			.datum(activities)
			.call(chart);
			
	};
}

module.exports = Timeline;
