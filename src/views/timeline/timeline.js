var d3 = require('d3'),
	$ = require('jquery'),
	actionList = require('action-list'),
	Hammer = require('hammerjs'),
	storage = require('jocal');

var h = window.innerHeight - (44*4), // we have 4 bars that aren't part of the svg
	w = +window.innerWidth,
	svg,
	timeAxis,
	AXIS_HEIGHT = 35,
	CURRENT_ACTIVITY_MIN_WIDTH = 6,
	minTime,
	maxTime,
	lastActivities = [];

function updateModels(activities){
	activities.forEach(function(a){
		a.time = (a.endTime || Date.now()) - a.beginTime;
	});

	return activities;
}


function zoomIn(){
	minTime += getDelta();
	render();
}
function zoomOut(){
	minTime -= getDelta();

	render();
}
function getDelta(){
	var c = maxTime - minTime;

	return c * 0.05;
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

	hammertime.get('pinch').set({enable:true});
	hammertime.on('pinchin', function(ev){
		zoomOut();
	});

	hammertime.on('pinchout', function(ev){
		zoomIn();
	});
	options = {
		  dragLockToAxis: true,
		    dragBlockHorizontal: true
	};
	hammertime = new Hammer(el, options);
	hammertime.on("dragleft dragright swipeleft swiperight", function(ev){

		alert('gota drag');
	});
}

function render(activities){
	if (activities){
		lastActivities = activities;
	} else {
		activities = lastActivities;
	}

	if (!svg){
		svg = d3.select('#timeline-container')
			.append('svg')
			.attr('width', w)
			.attr('height', h);

		listenForPinch();
		window.addEventListener('orientationchange', function(){
			h = window.innerHeight - (44*4);
			w = +window.innerWidth;

			svg.attr('width', w)
				.attr('height', h);

			render();
		});
	}

	activities = updateModels(activities);

	if (!minTime){
		minTime = d3.min(activities, function(d){ return d.beginTime; });
	}
	
	if (!maxTime){
		maxTime = Date.now();
	}

	var scale = d3.scale.linear()
		.domain([minTime, maxTime])
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

	rects
		.enter()
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
