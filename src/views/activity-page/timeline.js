var d3 = require('d3'),
	$ = require('jquery'),
	actionList = require('action-list'),
	storage = require('jocal');

var HEADER_HEIGHT = 44*2,
	h = window.innerHeight - HEADER_HEIGHT,
	w = +window.innerWidth,
	svg,
	timeAxis,
	timeScale,
	AXIS_HEIGHT = 35,
	CURRENT_ACTIVITY_MIN_WIDTH = 6,
	zoom,
	lastActivities = [];

function ensureTimeScale(activities){
	var minTime = d3.min(activities, function(d){ return d.beginTime; }),
		maxTime = d3.max(activities, function(d){ return d.endTime || Date.now(); });

	if (!timeScale) timeScale = d3.scale.linear();

	timeScale = timeScale
		.domain([minTime, maxTime])
		.range([0, w]);

	return timeScale;
}

function setBarPosition(selection){
	selection
		.attr('x', function(d){
			var x = timeScale(d.beginTime);
			return Math.min(x, w-CURRENT_ACTIVITY_MIN_WIDTH);
		})
		.attr('width', function(d){ 
			var w = timeScale(d.endTime || Date.now()) - timeScale(d.beginTime);
			return Math.max(CURRENT_ACTIVITY_MIN_WIDTH, w);
		});
}

function onZoom(){
	svg.select('.time-axis')
		.transition()
		.call(timeAxis);

	svg.selectAll('g.activity rect')
		.transition()
		.call(setBarPosition);


	$debug.html('&nbsp;scale: ' + zoom.scale());
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

	timeScale = ensureTimeScale(activities);

	if (!svg){
		zoom = d3.behavior.zoom()
			.x(timeScale)
			.scaleExtent([0.6,50])
			.on('zoom', onZoom);

		svg = d3.select('#timeline-container')
			.append('svg')
			.attr('width', w)
			.attr('height', h)
			.call(zoom);

		svg
			.append('rect')
			.style('opacity', 0)
			.attr('width', w)
			.attr('height', h);

		window.addEventListener('orientationchange', function(){
		});
	}



	var yScale = d3.scale.ordinal()
		.domain(d3.range(activities.length))
		.rangeRoundBands([0,(h-AXIS_HEIGHT)], 0.05);


	var rects = svg.selectAll('g.activity rect')
		.data(activities, function(d){ return d.id; });

	rects
		.transition()
		.attr('height', yScale.rangeBand())
		.attr('y', function(d, i){ return yScale(i); })
		.call(setBarPosition);
		
	var activityGroups = rects
		.enter()
		.append('g')
		.classed('activity', true)
		.attr('data-id', function(d){ return d.id; });

	activityGroups
		.append('rect')
		.on('click', function(d){
			d3.event.stopPropagation();
			actionList.show(d.id);
		})
		.attr('width', 0)
		.attr('height', yScale.rangeBand())
		.attr('x', 0)
		.attr('y', function(d, i){ return yScale(i); })
		.transition()
		.delay(function(d,i){ return i*50;})
		.attr('fill', function(d){ return d.color;})
		.call(setBarPosition);

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
			.scale(timeScale)
			.orient('bottom')
			.tickFormat(function(d){
				return f(new Date(d));
			});

		svg.append('g')
			.attr('class', 'time-axis')
			.attr('transform', 'translate(0, '+(h-AXIS_HEIGHT)+')')
			.call(timeAxis);

	} else {
		
		timeAxis.scale(timeScale);
		svg.select('.time-axis')
			.transition()
			.attr('transform', 'translate(0, '+(h-AXIS_HEIGHT)+')')
			.call(timeAxis);
	}
}

module.exports = render;
