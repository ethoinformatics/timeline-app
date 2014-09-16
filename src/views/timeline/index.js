require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	Hammer = require('hammerjs'),
	dateMath = require('date-math'),
	d3 = require('d3'),
	ActivityFilter = require('activity-filter'),
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
	var self = this,
		activityFilter = new ActivityFilter();


	self.$element = $(template({}));
	self.$element.find('#select-container').append(activityFilter.$element);

	process.nextTick(function(){
		var el = $('#timeline-container').closest('div.pane')[0];
		var options = {
			};
		var hammertime = new Hammer(el, options);
		hammertime.get('pinch').set({enable:true});
		hammertime.on('pinchin', function(ev){

			console.dir(ev);
			alert('got a pinch');
		});
	});

	self.hide = function(){
		self.$element.hide();
	};


	function getViewModels(){
		return _.chain(storage('activities'))
			.toArray()
			.cloneDeep()
			.map(function(activity, i){
				activity.starting_time = new Date(activity.starting_time).valueOf();

				if (activity.ending_time){
					activity.ending_time = new Date(activity.ending_time).valueOf();
				} else {
					activity.ending_time = Date.now();
				}

				return {
					id: activity.id,
					label: activity.type + ' ' + i,
					times: [activity],
				};
			})
			.value();
	}

	self.show = function(){
		self.$element.show();
		self.$element.find('#timeline-container').empty();


		var vis = d3.select('#timeline-container')
				.append('svg')
				.attr('width', window.innerWidth);

		var chart = d3.timeline()
			.stack()
			.showToday()
			.background('rgb(248, 248, 248)')
			.scroll(function (x, scale) {
			})
			.tickFormat({
				format: d3.time.format("%I:%M %p"),
				tickTime: d3.time.hours,
				tickInterval: 1,
				tickSize: 4
			})
			.width(5000)
			.margin({left:0, right:0, top:0, bottom:0})


		var activities = getViewModels();
		vis.datum(activities, function(a){
			return a.id;
		})
		.call(chart);
			
		
		//refresher = setTimeout(self.show.bind(self), 1000);
	};
}

module.exports = Timeline;
