require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	q = require('q'),
	app = require('app'),
	renderTimeline = require('d3-timeline'),
	ActivityFilter = require('activity-filter'),
	CreateNewDialog = require('../create-new-dialog'),
	FormDialog = require('form-dialog'),
	//sampleData = require('sample-data'),
	pageTemplate = require('./index.vash');


function TimelinePage(){
	var self = this,
		activityFilter = new ActivityFilter();

	activityFilter.on('predicate-change', function(){
		self.render();
	});

	self.$element = $(pageTemplate({}));
	self.$element.find('#select-container').append(activityFilter.$element);
	self.render = function(){
		var isVisble = activityFilter.createPredicate();
		var fetchPromises = app.getDomains('activity')
			.concat(app.getDomains('event'))
			.map(function(domain){
				var entityManager = domain.getService('entity-manager');
				return entityManager.getAll();
			});

		q.all(fetchPromises)
			.then(function(results){
				var entities = _.flatten(results)
					.filter(isVisble);

				renderTimeline(entities);
			});
	};

	window.addEventListener('orientationchange', function(){
		self.render();
	});

	$('body').on('click','.js-btn-add', function(){
			var newActivityDialog = new CreateNewDialog();

			newActivityDialog.on('new', function(data){
				var entityManager = app.getService(data.domainName, 'entity-manager');

				entityManager.save(data)
					.then(function(){
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
				// var type = _.find(formTypes, function(a){return a.name == activity.type;});
				// type = type || formTypes[1]; // todo: fix this

				// var m = new FormDialog(type, activity);

				// m.show();
				//
				alert('hello');
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

module.exports = TimelinePage;
