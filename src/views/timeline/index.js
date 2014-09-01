require('./index.less');

var $ = window.$,
	_ = require('lodash'),
	d3 = require('d3'),
	d3Timeline = require('./d3-timeline')(d3),
	storage = require('jocal'),
	template = require('./index.vash');

function Timeline(){
	var self = this;
	self.$element = $(template({}));

	self.hide = self.$element.hide.bind(self.$element);
	self.show = function(){
		self.$element.show();
		self.$element.find('#timeline-container').empty();

		var activities = storage('activities') || [];
		activities = _.cloneDeep(activities);

		activities = activities.map(function(activity, i){
			activity.starting_time = new Date(activity.starting_time).valueOf();
			activity.ending_time = Date.now();


			return {
				label: activity.type + ' ' + i,
				times: [activity],
			};
		});
	// var activities = [
        // {label: "person a", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
        // {label: "person b", times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
        // {label: "person c", times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]},
      // ];

		var chart = d3.timeline()
			.stack()
			.margin({left:70, right:30, top:0, bottom:0});


		d3.select('#timeline-container')
			.append('svg')
			.attr('width', window.innerWidth)
			.datum(activities)
			.call(chart);
			
	};
}

module.exports = Timeline;
