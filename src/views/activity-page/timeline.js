var d3 = require('d3'),
	_ = require('lodash'),
	$ = require('jquery'),
	actionList = require('action-list'),
	Hammer = require('hammerjs'),
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

function updateModels(activities){
	activities.forEach(function(a){
		a.time = (a.endTime || Date.now()) - a.beginTime;
	});

	return activities;
}


function adjustZoom(myZoom, easing, duration){
	myZoom = myZoom || 1;
	duration = duration || 250;
	easing = easing || 'linear';

	var per = pan/w;
	var oldPan = pan;
	w = +window.innerWidth* (zoom*myZoom);
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
	//timeAxis.ticks(3*zoom);
	svg.select('.time-axis')
		.transition()
		.duration(duration)
		.ease(easing)
		.attr('transform', 'translate('+pan+', '+(h-AXIS_HEIGHT)+')')
		.call(timeAxis);
}

function listenForPinch(){
	var el = $('#timeline-container').closest('div.pane')[0],
		options = { },
		hammertime = new Hammer(el, options);

	var myZoom = 1, zooming = false;
	hammertime.get('pinch').set({enable:true});

	hammertime.on('pinchstart', function(ev){
		myZoom = 1;
		zooming = true;
	});

	hammertime.on('pinchin pinchout', function(ev){
		if (!zooming || isListMode) return;
		if (ev.scale*zoom<0.8) {
			snapBack = 1;

			$debug.css('color', 'red').text('MAX ZOOM');
		}

		myZoom = ev.scale;
		adjustZoom(myZoom);
	});

	hammertime.on('pinchend pinchcancel', function(){
		if (!zooming || isListMode) return;

		$debug.css('color', 'purple').text('zoomed');
		zoom *= myZoom;
		myZoom = 1;
		zooming = false;
		if (snapBack!==false){
			$debug.css('color', 'red').text('snapback: ' + snapBack);
			zoom = snapBack;
			snapBack = false;
			pan = 0;
			adjustZoom(1, 'elastic', 600);
		}
	});


	var myPan = 0, panning = false, isListMode = false;
	var MAX_PERCENT = 0.02;

	hammertime.on('panstart', function(){
		panning = true;
	});

	hammertime.on('panleft', function(ev){
		if (!panning || isListMode) return;

		var maxPan = w-(VISIBLE_WIDTH*(1-MAX_PERCENT));

		if (Math.abs(pan-ev.distance)>maxPan){
			myPan = logScale(ev.distance);
			snapBack = maxPan*-1;
			$debug.css('color', 'red').text('MAX PANLEFT');
		} else {
			myPan = ev.distance;
		}

		myPan *= -1;
		handlePan();
	});

	var snapBack = false, showList = false;
	var maxPan = window.innerWidth*MAX_PERCENT;
	var logScale = d3.scale.log()
		.clamp(true)
		.domain([maxPan, VISIBLE_WIDTH])
		.range([maxPan, VISIBLE_WIDTH/8]);

	hammertime.on('panright', function(ev){
		if (!panning || isListMode) return;

		var totalPan = myPan + pan;

		if (snapBack){
			myPan = logScale(ev.distance);
		} else {
			myPan = ev.distance;
		}

		if (totalPan>=maxPan){
			snapBack = maxPan;

			
			// $debug.css('color', 'cyan')
			// 	.text(totalPan-maxPan + ' vs ' + (VISIBLE_WIDTH/8)*.9);

			if ((totalPan-maxPan) >= (VISIBLE_WIDTH/8)*.92){
				svg.selectAll('g.activity')
					.attr('transform', 'translate(0,0)')
					.attr('x', null)
					.attr('y', null);

				var COLOR_STRIPE_WIDTH = 6;

				svg
					.attr('width', VISIBLE_WIDTH)
					.selectAll('rect')
					.transition()
					.duration(1000)
					.attr('transform', 'translate(0,0)')
					.attr('width', COLOR_STRIPE_WIDTH)
					.attr('x', VISIBLE_WIDTH-COLOR_STRIPE_WIDTH)

				svg.selectAll('.time-axis')
					.style('display', 'none');

				isListMode = true;
				return;
			}

		}

		handlePan();
	});

	hammertime.on('panend pancancel', function(){
		if (!panning || isListMode) return;

		panning = false;
		pan += myPan;
		myPan = 0;
		$debug.css('color', 'purple').text('panned');

		if (snapBack!==false){
			$debug.css('color', 'red').text('snapback: ' + snapBack);
			pan = snapBack;
			snapBack = false;
			handlePan('elastic', 600);

			svg.selectAll('g.activity')
				.transition()
				.style('opacity', 1);
		}
	});

	function handlePan(easing, duration){
		if (isListMode) return;
		duration = duration || 250;
		easing = easing || 'linear';

		$pan
			.css('color', 'orange')
			.html('&nbsp;pan: '+Math.round(pan+myPan));

		svg.selectAll('rect')
			.transition()
			.duration(duration)
			.ease(easing)
			.attr('transform', 'translate('+(pan+myPan)+', 0)');

		svg.select('.time-axis')
			.transition()
			.duration(duration)
			.ease(easing)
			.attr('transform', 'translate('+(pan+myPan)+', '+(h-AXIS_HEIGHT)+')');
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
			h = window.innerHeight - HEADER_HEIGHT;
			w = +window.innerWidth* zoom;

			svg.attr('width', w)
				.attr('height', h);

			// svg.selectAll('g.activity')
			// 	.transition()
			// 	.ease('linear')
			// 	.attr('x', function(d){ 
			// 		var x = scale(d.beginTime);
			// 		return Math.min(x, w-CURRENT_ACTIVITY_MIN_WIDTH);
			// 	})
			// 	.attr('width', function(d){ 
			// 		var w = scale(d.endTime || Date.now()) - scale(d.beginTime);
			// 		return Math.max(CURRENT_ACTIVITY_MIN_WIDTH, w);
			// 	});
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
