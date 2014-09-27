var d3 = require('d3'),
	_ = require('lodash'),
	$ = require('jquery'),
	actionList = require('action-list'),
	gestures = require('./gestures.js'),
	storage = require('jocal');

var HEADER_HEIGHT = 44*2,
	h = window.innerHeight - HEADER_HEIGHT,
	w = +window.innerWidth,
	c = w/2,
	svg,
	timeAxis,
	AXIS_HEIGHT = 35,
	VISIBLE_WIDTH = window.innerWidth,
	CURRENT_ACTIVITY_MIN_WIDTH = 6,
	minTime,
	maxTime,
	lastActivities = [],
	zoom = 1,
	pan = 0;

function adjustZoom(easing, duration){
	duration = duration || 250;
	easing = easing || 'linear';

	var per = pan/w;
	w = +window.innerWidth* (zoom);
	c = (w/2)*-1;

	pan = per*w;
	$w.html('&nbsp;width: '+Math.round(w));
	var scale = d3.scale.linear()
		.domain([minTime, Date.now()])
		.range([0, w]);

	svg.selectAll('rect')
		.transition()
		.duration(duration)
		.ease(easing)
		.attr('transform', 'translate('+pan+', 0)')
		.attr('x', function(d){
			var x = scale(d.beginTime);
			return Math.min(x, w-CURRENT_ACTIVITY_MIN_WIDTH);
		})
		.attr('width', function(d){ 
			var w = scale(d.endTime || Date.now()) - scale(d.beginTime);
			return Math.max(CURRENT_ACTIVITY_MIN_WIDTH, w);
		});

	timeAxis.scale(scale);

	svg.select('.time-axis')
		.transition()
		.duration(duration)
		.ease(easing)
		.attr('transform', 'translate('+pan+', '+(h-AXIS_HEIGHT)+')')
		.call(timeAxis);
}

function listenForPinch(){
	var el = $('#timeline-container').closest('div.pane')[0];
	var ee = gestures(el);

	ee.on('zoom-change', function(ev){
		zoom = ev.zoom;
		adjustZoom();
	});

	ee.on('zoom-snap', function(ev){
		pan = 0;
		zoom = ev.zoom;
		adjustZoom('elastic', 600);
	});

	ee.on('pan-change', function(ev){
		pan = ev.pan;
		handlePan();
	});

	ee.on('pan-snap', function(ev){
		pan = ev.pan;
		handlePan('elastic', 600);
	});

	ee.on('pan-rip', function(ev){
		pan = ev.pan;
		handlePan();
	});

	var isListMode = false;

	function handlePan(easing, duration){
		if (isListMode) return;
		duration = duration || 250;
		easing = easing || 'linear';


		svg.selectAll('rect')
			.transition()
			.duration(duration)
			.ease(easing)
			.attr('transform', 'translate('+(pan)+', 0)');

		svg.select('.time-axis')
			.transition()
			.duration(duration)
			.ease(easing)
			.attr('transform', 'translate('+(pan)+', '+(h-AXIS_HEIGHT)+')');
	}
}

var $debug, $pan, $w;
function render(activities){
	$debug = $('#debug-container');
	$pan = $('#pan-container');
	$w = $('#w-container');

	if (activities){
		lastActivities = activities;
	} else {
		activities = lastActivities || storage('activities') || [];
	}

	if (!svg){
		svg = d3.select('#timeline-container')
			.append('svg')
			.attr('width', w)
			.attr('height', h);

		listenForPinch();
		window.addEventListener('orientationchange', function(){
		});
	}

	h = window.innerHeight - HEADER_HEIGHT;
	w = +window.innerWidth;

	if (!minTime){
		minTime = d3.min(activities, function(d){ return d.beginTime; });
	}
	
	if (!maxTime){
		maxTime = Date.now();
	}

	var scale = d3.scale.linear()
		.domain([minTime, Date.now()])
		.range([0, w]);

	var yScale = d3.scale.ordinal()
		.domain(d3.range(activities.length))
		.rangeRoundBands([0,(h-AXIS_HEIGHT)], 0.05);


	var rects = svg.selectAll('rect')
		.data(activities, function(d){ return d.id; });

	rects
		.transition()
		.attr('height', yScale.rangeBand())
		.attr('transform', 'translate('+pan+', 0)')
		.attr('y', function(d, i){ return yScale(i); })
		.attr('x', function(d){ 
			var x = scale(d.beginTime);
			return Math.min(x, w-CURRENT_ACTIVITY_MIN_WIDTH);
		})
		.attr('width', function(d){ 
			var w = scale(d.endTime || Date.now()) - scale(d.beginTime);
			return Math.max(CURRENT_ACTIVITY_MIN_WIDTH, w);
		});

		
	var activityGroups = rects
		.enter()
		.append('g')
		.classed('activity', true)
		.attr('data-id', function(d){ return d.id; });

	activityGroups
		.append('rect')
		.on('click', function(d){
			actionList.show(d.id);
		})
		.attr('width', 0)
		.attr('height', yScale.rangeBand())
		.attr('x', 0)
		.attr('y', function(d, i){ return yScale(i); })
		.transition()
		.delay(function(d,i){ return i*50;})
		.attr('fill', function(d){ return d.color;})
		.attr('x', function(d){ 
			var x = scale(d.beginTime);
			return Math.min(x, w-CURRENT_ACTIVITY_MIN_WIDTH);
		})
		.attr('width', function(d){ 
			var w = scale(d.endTime || Date.now()) - scale(d.beginTime);
			return Math.max(CURRENT_ACTIVITY_MIN_WIDTH, w);
		});
	
	rects
		.exit()
		.transition()
		.attr('width',0)
		.attr('height',0)
		.style('opacity',0)
		.remove();

	if (!timeAxis){
		var f = d3.time.format('%a %I:%M %p');
		timeAxis = d3.svg.axis()
			.scale(scale)
			.orient('bottom')
			.tickFormat(function(d){
				return f(new Date(d));
			});

		svg.append('g')
			.attr('class', 'time-axis')
			.attr('transform', 'translate('+pan+', '+(h-AXIS_HEIGHT)+')')
			.call(timeAxis);

	} else {
		
		timeAxis.scale(scale);
		svg.select('.time-axis')
			.transition()
			.attr('transform', 'translate('+pan+', '+(h-AXIS_HEIGHT)+')')
			.call(timeAxis);
	}
}

module.exports = render;
