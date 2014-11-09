require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	q = require('q'),
	db = require('local-database'),
	renderTimeline = require('./d3-timeline.js'),
	formTypes = require('form-types'),
	ActivityFilter = require('activity-filter'),
	CreateNewDialog = require('../create-new-dialog'),
	FormDialog = require('form-dialog'),
	sampleData = require('sample-data'),
	pageTemplate = require('./index.vash');


function ActivityPage(){
	var self = this,
		activityFilter = new ActivityFilter();

	activityFilter.on('predicate-change', function(){
		self.render();
	});

	self.$element = $(pageTemplate({}));
	self.$element.find('#select-container').append(activityFilter.$element);
	self.render = function(){
		db.getActivities()
			.then(function(activities){
				var isVisble = activityFilter.createPredicate();

				if (_.isEmpty(activities)){
					var data = _.first(sampleData, 15);
					var promises = data.map(function(d){
						return db.saveActivity(d);
					});

					q.all(promises)
						.then(function(){
							renderTimeline(activities.filter(isVisble));
						});
				} else {
					renderTimeline(activities.filter(isVisble));
				}
			});
	};

	window.addEventListener('orientationchange', function(){
		self.render();
	});

	$('body').on('click','.js-btn-add', function(){
			var newActivityDialog = new CreateNewDialog();

			newActivityDialog.on('new', function(data){
				console.log('new in activity-page');
				console.dir(data);

				db.saveActivity(data)
					.then(function(result){
						self.render();
					})
					.catch(function(err){
						console.error(err);
						window.alert('could not save :/');
					});
			});

			newActivityDialog.show();
		});

	// longClick(self.$element, '.activity[data-id]', function(){
	// 	self.$element
	// 		.find('.actvity[data-id]')
	// 		.removeClass('selected');

	// 	$(this).addClass('selected');
	// 	alert('aha');
	// });
	self.$element.on('click', '.activity[data-id]', function(){
		var id = $(this).data('id');
		db.getActivityById(id)
			.then(function(activity){
				// todo: fix this so that we search by key
				var type = _.find(formTypes, function(a){return a.name == activity.type;});
				type = type || formTypes[1]; // todo: fix this

				var m = new FormDialog(type, activity);

				m.show();
			})
			.catch(console.error.bind(console));
	});


	self.hide = self.$element.hide.bind(self.$element);
	self.show = function (){
		self.$element.show();
	};

	process.nextTick(function(){
		self.render();
	});
}

module.exports = ActivityPage;
