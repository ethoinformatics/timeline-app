require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	Hammer = require('hammerjs'),
	longClick = require('long-click'),
	dateMath = require('date-math'),
	d3 = require('d3'),
	ActivityFilter = require('activity-filter'),
	moment = require('moment'),
	d3Timeline = require('./d3-timeline')(d3),
	actionList = require('action-list'),
	storage = require('jocal'),
	template = require('./index.vash');


var height = window.innerHeight -100,
	width = +window.innerWidth;


function Timeline(){
	var self = this,
		activityFilter = new ActivityFilter();

	var timeLineWidth = 2000;

	self.$element = $(template({}));
	self.$element.find('#select-container').append(activityFilter.$element);

	longClick(self.$element, '.row-green-bar', function(){
		var id = $(this).next().attr('id').replace(/^.*_/, '');
		actionList.show(id);
		//self.show();
	});

	process.nextTick(function(){
		var el = $('#timeline-container').closest('div.pane')[0],
			options = { },
			hammertime = new Hammer(el, options),
			show = _.throttle(self.show.bind(self), 100);

		hammertime.get('pinch').set({enable:true});
		hammertime.on('pinchin', function(ev){
			if (timeLineWidth<10000)
				timeLineWidth += ev.distance;

			show();
		});

		hammertime.on('pinchout', function(ev){
			if (timeLineWidth>=width)
				timeLineWidth -= ev.distance;

			if (timeLineWidth<width)
				timeLineWidth = width;

			show();
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

		$('#debug-container').text(timeLineWidth);

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
			.width(timeLineWidth)
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
