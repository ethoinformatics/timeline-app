require('./index.less');

var $ = require('jquery'),
	d3 = require('d3'),
	_ = require('lodash'),
	moment =  require('moment'),
	storage = require('jocal'),
	longClick = require('long-click'),
	ActivityFilter = require('./activity-filter'),
	NewActivityDialog = require('./new-activity-dialog'),
	pageTemplate = require('./index.vash'),
	actionList = require('./action-list.js');

function relativeTime(date){
	return moment(date).fromNow();
}

function getActivities(){
	return storage('activities') || [];
}

function ActivityList(){
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

		if (!vis){
			vis = d3.select('#list-container');
		}

		var activityElements = vis.selectAll('div')
			.data(activities, function(a){ return a.id; });

		// create new elements
		var newActivityElements = activityElements
			.enter()
			.append('div')
			.attr('data-id', function(a){return a.id;});

		newActivityElements
			.append('span')
			.text(function(a){ return a.type; });

		newActivityElements
			.append('span')
			.attr('class', 'item-note');

		newActivityElements
			.append('i')
			.style('background-color', function(a) {return a.color; })
			.attr('class', 'icon color-box');


		// all elements
		activityElements
			.select('.item-note')
			.text(function(a){
				if (a.ending_time){
					return 'Ended ' + relativeTime(a.ending_time);
				}

				return 'Started ' + relativeTime(a.starting_time);
			});

		activityElements
			.attr('class', function(a){
				var classes = ['item', 'item-icon-right', 'activity'];

				classes.push(a.ending_time ? 'activity-completed' : 'activity-current');

				return classes.join(' ');
			});

		activityElements
			.style('display', function(a){
				if (isVisble(a)) return '';
				return 'none';
			});
	};

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

	longClick(self.$element, '.item[data-id]', function(){
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

			activity.ending_time = new Date();
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

module.exports = ActivityList;
