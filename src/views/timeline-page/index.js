require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	q = require('q'),
	app = require('app'),
	createTimeline = require('timeline'),
	ActivityFilter = require('activity-filter'),
	CreateNewDialog = require('../create-select-dialog'),
	ViewExistingDialog = require('../view-existing-dialog'),
	//FormDialog = require('form-dialog'),
	//sampleData = require('sample-data'),
	pageTemplate = require('./index.vash');


function _getTopLevelDomains(){
	var domains = app.getDomains()
		.filter(function(domain){
			return !domain.getService('code-domain');
		});

	return domains.filter(function(d){
		return !_.any(domains, function(otherDomain){
			return !!_.find(otherDomain.getChildren(), function(d2){
				return d2.name == d.name;
			});
		});
	});
}

function TimelinePage(){
	var self = this,
		activityFilter = new ActivityFilter();

	activityFilter.on('predicate-change', function(){
		self.render();
	});

	var timeline = createTimeline({
	});

	self.$element = $(pageTemplate({}));
	self.$element.find('#select-container').append(activityFilter.$element);
	self.$element.find('#timeline-container').append(timeline.element);

	self.render = function(){
		console.log('timeline - render');
		timeline.clear();

		var isVisble = activityFilter.createPredicate();
		var fetchPromises = app.getDomains('activity')
			.map(function(domain){
				var entityManager = domain.getService('entity-manager');
				return entityManager.getAll();
			});

		return q.all(fetchPromises)
			.then(function(results){
				var entities = _.flatten(results)
					.filter(isVisble);

				timeline.add(entities);
				
				return entities;
			})
			.done();
	};

	window.addEventListener('orientationchange', function(){
		self.render();
	});


	$('body').on('click','.js-btn-top-level-add', function(){
			var newActivityDialog = new CreateNewDialog({
					domains: _getTopLevelDomains(),
				});

			newActivityDialog.on('created', function(entity){
				var domain = app.getDomain(entity.domainName);
				var entityManager = domain.getService('entity-manager');

				entityManager.save(entity)
					.then(function(){

						console.log('wtf:!!!saved data: ');

						var viewExistingDialog = new ViewExistingDialog({
							entity: entity,
						});
						viewExistingDialog.show();
						timeline.add(entity);
					})
					.catch(function(err){
						console.dir(err);
					})
					.finally(function(){
						console.log('ok');
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
			entityManager = domain.getService('entity-manager');

		var m = new ViewExistingDialog({
			entity: d,
		});

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
					timeline.remove(entity);
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
