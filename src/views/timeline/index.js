require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	ActivityFilter = require('activity-filter'),
	renderTimeline = require('./timeline.js'),
	storage = require('jocal'),
	template = require('./index.vash');


function Timeline(){
	var self = this,
		activityFilter = new ActivityFilter();


	self.$element = $(template({}));
	self.$element.find('#select-container').append(activityFilter.$element);

	activityFilter.on('predicate-change', function(pred){
		var activities = getViewModels();
			
		renderTimeline(activities.filter(pred));
	});

	// longClick(self.$element, 'rect', function(){
	// 	var $this = $(this);
	// 	if (!$this.attr('id')){
	// 		$this = $this.next();
	// 	}

	// 	var id = $this.attr('id').replace(/^.*_/, '');
	// 	actionList.show(id);
	// 	//self.show();
	// });

	process.nextTick(function(){


	});

	self.hide = function(){
		self.$element.hide();
	};


	function getViewModels(){
		return storage('activities') || [];
	}

	self.show = function(){
		self.$element.show();




		var activities = getViewModels();
			
		renderTimeline(activities);
		// self.$element.find('#timeline-container svg rect')
		// 	.each(function(){
				
		// 		var mc = new Hammer.Manager(this);
		// 		mc.add(new Hammer.Tap({event: 'doubletap', taps: 2}));
		// 		mc.add(new Hammer.Tap({event: 'singletap', taps: 1}));
		// 		mc.get('doubletap').recognizeWith('singletap');
		// 		mc.get('singletap').requireFailure('doubletap');

		// 		var getActivityIdFromEvent = function(ev){
		// 			var $el = $(ev.srcEvent.srcElement);
		// 			if (!$el.attr('id')){
		// 				$el = $el.next();
		// 			}

		// 			return $el.attr('id').replace(/^.*_/, '');
		// 		};

		// 		mc.on('singletap', function(ev){
		// 			window.alert('single tap: ' + getActivityIdFromEvent(ev));
		// 		});

		// 		mc.on('doubletap', function(ev){
		// 			ev.preventDefault();
		// 			actionList.show(getActivityIdFromEvent(ev));
		// 		});

		// 	});
	};
}

module.exports = Timeline;
