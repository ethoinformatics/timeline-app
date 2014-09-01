var $ = window.$,
	_ = require('lodash'),
	Timeline = require('./views/timeline/'),
	ActivityList = require('./views/activity-list/');

$(function(){
	var $body = $('body'),
		timeline = new Timeline(),
		activityList = new ActivityList();
		
		timeline.hide();

		$body.append(activityList.$element);
		$body.append(timeline.$element);

		$body.on('click', '.js-show-timeline', function(){
			activityList.hide();
			timeline.show();
		});

		$body.on('click', '.js-show-activity-list', function(){
			activityList.show();
			timeline.hide();
		});


});




