var d3 = require('d3'),
	$ = require('jquery'),
	actionList = require('action-list'),
	Hammer = require('hammerjs'),
	storage = require('jocal');

var HEADER_HEIGHT = 44*3,
	h = window.innerHeight - HEADER_HEIGHT,
	w = +window.innerWidth,
	c = w/2,
	svg,
	timeAxis,
	AXIS_HEIGHT = 35,
	CURRENT_ACTIVITY_MIN_WIDTH = 6,
	minTime,
	maxTime,
	lastActivities = [],
	zoom = 1;

function updateModels(activities){
	activities.forEach(function(a){
		a.time = (a.endTime || Date.now()) - a.beginTime;
	});

	return activities;
}


function adjustZoom(myZoom){
	w = +window.innerWidth* (zoom*myZoom);
	var scale = d3.scale.linear()
		.domain([minTime, Date.now()])
		.range([0, w]);
	svg.selectAll('rect')
		.transition()
		.ease('linear')
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
		.ease('linear')
		.call(timeAxis);
}

function getUnit(){
	var c = maxTime - minTime;

	var seconds = c/1000;
	if (seconds<60)
		return seconds;

	var minutes = seconds/60;
	if (minutes<60)
		return 'minutes';

	var hours = minutes/60;
	if (hours<48)
		return 'hours';

	return 'days';
}
function listenForPinch(){
	var el = $('#timeline-container').closest('div.pane')[0],
		options = { },
		hammertime = new Hammer(el, options);
	var $debug = $('#debug-container');

	var myZoom = 1, zooming = false;
	hammertime.get('pinch').set({enable:true});

	hammertime.on('pinchstart', function(ev){
		myZoom = 1;
		zooming = true;
		$debug.css('color', 'green');
	});

	hammertime.on('pinchin pinchout', function(ev){
		if (!zooming) return;

		myZoom = ev.scale;
		adjustZoom(myZoom);
	});

	hammertime.on('pinchend pinchcancel', function(){
		if (!zooming) return;

		$debug.css('color', 'red').text(myZoom);
		zoom *= myZoom;
		myZoom = 1;
		zooming = false;
	});


	options = {
		dragLockToAxis: true,
		dragBlockHorizontal: true
	};
	hammertime = new Hammer(el, options);
	hammertime.on("dragleft dragright swipeleft swiperight", function(ev){
		window.alert('gota drag');
	});
}

function render(activities){
	if (activities){
		lastActivities = activities;
	} else {
		activities = lastActivities || storage('activities') || [];
	}

	if (!svg){
		svg = d3.select('#timeline-container')
			.append('svg')
			.attr('width', w)
			.attr('height', h)
			.attr('transform', 'translate(0,500)');

		listenForPinch();
		window.addEventListener('orientationchange', function(){
			h = window.innerHeight - HEADER_HEIGHT;
			w = +window.innerWidth* zoom;

			svg.attr('width', w)
				.attr('height', h)
				.attr('transform', 'translate(0,100)');

			svg.selectAll('rect')
				.transition()
				.ease('linear')
				.attr('x', function(d){ 
					var x = scale(d.beginTime);
					return Math.min(x, w-CURRENT_ACTIVITY_MIN_WIDTH);
				})
				.attr('width', function(d){ 
					var w = scale(d.endTime || Date.now()) - scale(d.beginTime);
					return Math.max(CURRENT_ACTIVITY_MIN_WIDTH, w);
				});
			//render();
		});
	}


	h = window.innerHeight - HEADER_HEIGHT;
	w = +window.innerWidth* zoom;


	activities = updateModels(activities);

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
		.attr('data-id', function(d){ return d.id; });

	activityGroups
		.append('rect')
		.on('click', function(d){
			//zoomIn();
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
			.ticks(3)
			.tickFormat(function(d){
				return f(new Date(d));
			});

		svg.append('g')
			.attr('class', 'time-axis')
			.attr('transform', 'translate(0, '+(h-AXIS_HEIGHT)+')')
			.call(timeAxis);

	} else {
		
		timeAxis.scale(scale);
		svg.select('.time-axis')
			.transition()
			.attr('transform', 'translate(0, '+(h-AXIS_HEIGHT)+')')
			.call(timeAxis);
	}
}

module.exports = render;
