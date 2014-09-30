require('./index.less');

var $ = require('jquery'),
	d3 = require('d3'),
	_ = require('lodash'),
	moment =  require('moment'),
	storage = require('jocal'),
	renderTimeline = require('./timeline.js'),
	ActivityFilter = require('activity-filter'),
	NewActivityDialog = require('./new-activity-dialog'),
	pageTemplate = require('./index.vash'),
	actionList = require('action-list');

function relativeTime(date){
	return moment(date).fromNow();
}

function getActivities(){
	return storage('activities') || [];
}

function ActivityPage(){
	var self = this,
		activityFilter = new ActivityFilter(),
		vis;

	activityFilter.on('predicate-change', function(){
		self.render();
	});

	self.$element = $(pageTemplate({}));
	self.$element.find('#select-container').append(activityFilter.$element);
	self.render = function(){
		var activities = getActivities();
		var isVisble = activityFilter.createPredicate();
		renderTimeline(activities.filter(isVisble));

	};

	window.addEventListener('orientationchange', function(){
		self.render();
	});
	self.$element.find('.js-btn-add')
		.on('click', function(){

			var newActivityDialog = new NewActivityDialog();
			newActivityDialog.on('new', function(data){
				var activities = getActivities();
				activities.push(data);
				storage('activities', activities);

				self.render();
			});
			newActivityDialog.show();
		});

	self.$element.on('click', '.item[data-id]', function(){
		var id = $(this).data('id');
		actionList.show(id);
	});


	self.hide = self.$element.hide.bind(self.$element);
	self.show = function (){
		self.$element.show();
	};

	function loadMenu(){
		var menu = actionList.load();

		menu.on('stop-activity', function(id){
			var activities = storage('activities') || [];
			var activity = _.find(activities, function(a){ return a.id == id; });

			activity.endTime = Date.now();
			storage('activities', activities);

			self.render();
		});

		menu.on('edit-activity', function(id){
			alert(id);
		});

		menu.on('delete-activity', function(id){
			var activities = storage('activities') || [];
			_.remove(activities, function(a){ return a.id == id; });
			storage('activities', activities);

			self.render();
		});
	}


	process.nextTick(function(){
		self.render();
		loadMenu();
	});
}

module.exports = ActivityPage;
