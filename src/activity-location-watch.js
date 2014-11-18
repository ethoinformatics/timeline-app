var geolocation = require('geolocation'),
	q = require('q'),
	app = require('app'),
	_ = require('lodash');

module.exports = function(){
	function onLocationUpdate(data){

		var savePromises = _.chain(app.getDomains('activity'))
			.map(function(domain){

				var activityService = domain.getService('activity');
				var entityManager = domain.getService('entity-manager');

				// todo: figure out how to query for this in a more sane way
				var savePromises = entityManager.getAll()
					.then(function(activities){
						return activities
							.filter(function(activity){
								return !activityService.getEndTime(activity);
							})
							.map(function(activity){
								activityService.locationUpdate(activity, data);
								return entityManager.save(activity);
							});
					});
				
				return savePromises;
			})
			.flatten()
			.value();

		q.all(savePromises)
			.then(function(results){
				console.log('location update success.');
				console.dir(results);
			})
			.catch(function(err){
				console.log('location update fail.');
				console.error(err);
			});
	}

	function onLocationError(err){
		console.log('location retrieve fail.');
		console.error(err);
	}

	geolocation.watch(onLocationUpdate, onLocationError);
};
