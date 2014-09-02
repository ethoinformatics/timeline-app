require('./index.less');

var $ = window.$,
	_ = require('lodash'),
	d3 = require('d3'),
	moment = require('moment'),
	d3Timeline = require('./d3-timeline')(d3),
	storage = require('jocal'),
	template = require('./index.vash');


var height = window.innerHeight -100,
	widht = window.innerWidth;


function getTimelineStart(activities){
	var firstStartTime = _.chain(activities)
		.map(function(a){
			return new Date(a.starting_time).valueOf();
		})
		.min()
		.value();

	var startOfHour = moment().startOf('hour').valueOf();
	return Math.min(firstStartTime, startOfHour);
}


function Timeline(){
	var self = this;
	self.$element = $(template({}));


	var refresher;
	self.hide = function(){
		self.$element.hide();
		if (refresher){
			clearTimeout(refresher);
			refresher = null;
		}
	};

	self.show = function(){
		self.$element.show();
		self.$element.find('#timeline-container').empty();

		var activities = storage('activities') || [];
		var timelineStart = getTimelineStart(activities);
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
			.beginning(timelineStart)
			.ending(Date.now())
			.showToday()
			.stack()
			//.rotateTicks(45)
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
			
		
		refresher = setTimeout(self.show.bind(self), 1000);
	};
}

module.exports = Timeline;
