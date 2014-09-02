var $ = window.$,
	_ = require('lodash'),
	Timeline = require('./views/timeline/'),
	ActivityPage = require('./views/activity-page/');

// todo: use device-ready
$(function(){
	var $body = $('body'),
		timeline = new Timeline(),
		activityPage = new ActivityPage();
		
		timeline.hide();

		$body.append(activityPage.$element);
		$body.append(timeline.$element);

		activityPage.show();
		timeline.hide();

		$body.on('click', '.js-show-timeline', function(){
			activityPage.hide();
			timeline.show();
		});

		$body.on('click', '.js-show-activity-list', function(){
			activityPage.show();
			timeline.hide();
		});
});




