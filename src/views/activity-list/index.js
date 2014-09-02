var $ = window.$,
	_ = require('lodash'),
	vash =  require('vash-runtime'),
	moment =  require('moment'),
	storage = require('jocal'),
	longClick = require('long-click'),
	ActivityFilter = require('./activity-filter'),
	NewActivityDialog = require('./new-activity-dialog'),
	itemTemplate = require('./list-item.vash'),
	pageTemplate = require('./index.vash'),
	actionList = require('./action-list.js');


var tmp_MenuLoaded = false;

vash.helpers.relativeTime = function(date){
	return moment(date).fromNow();
};


function getActivities(){
	return storage('activities') || [];
}

function ActivityList(){
	var self = this,
	activityFilter = new ActivityFilter();

	self.$element = $(pageTemplate({
		items: getActivities()
	}));


	self.$element.find('#select-container').append(activityFilter.$element);
	self.$element.find('.js-btn-add')
		.on('click', function(){

			var newActivityDialog = new NewActivityDialog();
			newActivityDialog.on('new', function(data){
				var activities = getActivities();
				activities.push(data);
				storage('activities', activities);

				var $item = $(itemTemplate(data));
				self.$element.find('#list-container')
					.append($item);
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
	

	

	function updateTimes(){
		self.$element
			.find('span[data-starting-time]')
			.each(function(){
				var $this = $(this),
					date = $this.data('starting-time');

				$this.text('Started ' + moment(date).fromNow());
			});

		self.$element
			.find('span[data-ending-time]')
			.each(function(){
				var $this = $(this),
					date = $this.data('ending-time');

				$this.text('Ended ' + moment(date).fromNow());
			});

		setTimeout(updateTimes, 1000);
	}
	updateTimes();
}

module.exports = ActivityList;
