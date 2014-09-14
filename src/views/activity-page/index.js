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

var tmp_MenuLoaded = false;

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

	activityFilter.on('predicate-change', function(pred){
		self.render(getActivities().filter(pred));
	});

	self.$element = $(pageTemplate({}));
	self.$element.find('#select-container').append(activityFilter.$element);
	self.render = function(activities){
		activities = activities || getActivities();

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
		// console.dir(this);
		// window.alert('long click.');
	});


	self.hide = self.$element.hide.bind(self.$element);
	self.show = function (){
		loadMenu();
		self.$element.show();
	};


	function loadMenu(){
		if (tmp_MenuLoaded) return;
		tmp_MenuLoaded = true;
		var menu = actionList.load();

		menu.on('stop-activity', function(id){
			var activities = storage('activities') || [];
			var activity = _.find(activities, function(a){ return a.id == id; });

			activity.ending_time = new Date();
			storage('activities', activities);

			self.$element.find('*[data-id="'+id + '"]')
				.replaceWith(itemTemplate(activity));
		});

		menu.on('edit-activity', function(id){
			alert(id);
		});

		menu.on('delete-activity', function(id){
			var activities = storage('activities') || [];
			_.remove(activities, function(a){ return a.id == id; });
			storage('activities', activities);
			var $item = self.$element.find('*[data-id="'+id + '"]');
			$item.fadeOut('fast');
		});
	}


	process.nextTick(function(){
		self.render();


		(function reDraw(){
			setTimeout(function render(){
				self.render();
				reDraw();
			}, 5000);
		})();
	});


}

module.exports = ActivityList;
