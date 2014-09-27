var Hammer = require('hammerjs'),
	d3 = require('d3'),
	EventEmitter = require('events').EventEmitter;

var SCREEN_WIDTH = +window.innerWidth,
	OVER_PAN_PERCENT = 0.05,
	OVER_PAN_WIDTH = SCREEN_WIDTH * OVER_PAN_PERCENT;

function listen(el){
	var ee = new EventEmitter();

	var hammer = new Hammer(el),
		isZooming,
		zoom = 1,
		zoomDelta,
		isPanning,
		pan = 0,
		panDelta,
		snapBack = false;

	var logScale = d3.scale.log()
		.clamp(true)
		.domain([OVER_PAN_WIDTH, SCREEN_WIDTH])
		.range([OVER_PAN_WIDTH, SCREEN_WIDTH/8]);

	hammer.get('pinch').set({enable:true});

	hammer.on('pinchstart', function(){
		zoomDelta = 1;
		isZooming = true;
	});

	hammer.on('pinchin pinchout', function(ev){
		if (!isZooming) return;

		if (ev.scale*zoom<0.8) {
			snapBack = 1;
		}

		zoomDelta = ev.scale;
		ee.emit('zoom-change', {zoom: zoom*zoomDelta});
	});

	hammer.on('pinchend pinchcancel', function(){
		if (!isZooming) return;

		zoom *= zoomDelta;
		zoomDelta = 1;
		isZooming = false;

		if (snapBack === false) return;

		zoom = snapBack;
		snapBack = false;
		ee.emit('zoom-snap', {zoom: zoom*zoomDelta});
	});

	hammer.on('panstart', function(){
		isPanning = true;
	});

	hammer.on('panleft', function(ev){
		if (!isPanning) return;

		var maxPan = (SCREEN_WIDTH*zoom) - (SCREEN_WIDTH*(1-OVER_PAN_PERCENT));

		if (Math.abs(pan-ev.distance)>maxPan){
			panDelta = logScale(ev.distance);
			snapBack = maxPan*-1;
		} else {
			panDelta = ev.distance;
		}

		panDelta *= -1;
		ee.emit('pan-change', {pan: pan+panDelta});
	});

	hammer.on('panright', function(ev){
		if (!isPanning) return;
		
		if (pan+panDelta>=OVER_PAN_WIDTH){
			panDelta = logScale(ev.distance);
			snapBack = OVER_PAN_WIDTH;
		} else {
			panDelta = ev.distance;
		}


		// if (totalPan>=maxPan){
		// 	snapBack = maxPan;

			
		// 	// $debug.css('color', 'cyan')
		// 	// 	.text(totalPan-maxPan + ' vs ' + (VISIBLE_WIDTH/8)*.9);

		// 	if ((totalPan-maxPan) >= (VISIBLE_WIDTH/8)*0.92){
		// 		svg.selectAll('g.activity')
		// 			.attr('transform', 'translate(0,0)')
		// 			.attr('x', null)
		// 			.attr('y', null);

		// 		var COLOR_STRIPE_WIDTH = 6;

		// 		svg
		// 			.attr('width', VISIBLE_WIDTH)
		// 			.selectAll('rect')
		// 			.transition()
		// 			.duration(1000)
		// 			.attr('transform', 'translate(0,0)')
		// 			.attr('width', COLOR_STRIPE_WIDTH)
		// 			.attr('x', VISIBLE_WIDTH-COLOR_STRIPE_WIDTH);

		// 		svg.selectAll('.time-axis')
		// 			.style('display', 'none');

		// 		isListMode = true;
		// 		return;
		// 	}

		// }

		ee.emit('pan-change', {pan: pan+panDelta});
	});

	hammer.on('panend pancancel', function(){
		if (!isPanning) return;

		isPanning = false;
		pan += panDelta;
		panDelta = 0;

		if (snapBack === false) return;

		pan = snapBack;
		snapBack = false;

		ee.emit('pan-snap', {pan: pan+panDelta});
	});

	return ee;
}


module.exports = listen;
