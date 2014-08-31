var $ = window.$,
	storage = require('jocal'),
	ActivityFilter = require('./activity-filter'),
	NewActivityDialog = require('./new-activity-dialog'),
	template = require('./index.vash');

function ActivityList(){
	var activityFilter = new ActivityFilter();
	this.$element = $(template({}));
	this.$element.find('#select-container').append(activityFilter.$element);
	this.$element.find('.js-btn-add')
		.on('click', function(){

			var newActivityDialog = new NewActivityDialog();
			newActivityDialog.on('new', function(data){
				var activities = storage('activities') || [];
				activities.push(data);
				storage('activities', activities);
			});
			newActivityDialog.show();
		});

	this.hide = this.$element.hide.bind(this.$element);
	this.show = this.$element.show.bind(this.$element);
}

module.exports = ActivityList;
