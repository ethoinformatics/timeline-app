require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	q = require('q'),
	app = require('app'),
	createTimeline = require('d3-timeline'),
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

	var timeline = createTimeline({
		getBegin: function(d){
			var domain = app.getDomain(d.domainName);
			var service = domain.getService('activity');

			return service.getBeginTime(d);
		},
		getEnd: function(d){
			var domain = app.getDomain(d.domainName);
			var service = domain.getService('activity');

			return service.getEndTime(d);
		},
		getLabel: function(d){
			var domain = app.getDomain(d.domainName);
			var service = domain.getService('description-manager');

			return service ? service.getShortDescription(d) : 'no label';
		},
	});

	self.$element = $(pageTemplate({}));
	self.$element.find('#select-container').append(activityFilter.$element);
	self.$element.find('#timeline-container').append(timeline.element);

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

				timeline.add(entities);
			})
			.done();
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
						timeline.activities.add(data);
						newActivityDialog.hide();
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
	timeline.on('activity-click', function(d){
		var domain = app.getDomain(d.domainName),
			entityManager = domain.getService('entity-manager'),
			m = new FormDialog(domain, d);

		m.on('save', function(entity){
			entityManager.save(entity)
				.then(function(){

					m.hide();
					timeline.update();
				}).done();
		});

		m.on('delete', function(entity){
			if (!confirm('Are you sure?')) return;

			entityManager.remove(entity)
				.then(function(){
					m.hide();
					timeline.activities.remove(entity);
				}).done();
		});

		m.show();
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
