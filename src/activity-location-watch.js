var geolocation = require('geolocation'),
	q = require('q'),
	app = require('app')(),
	_ = require('lodash');

function _getDeviceSettingsObject(){
	var settingsDomain = app.getDomain('_etho-settings');
	var entityManager = settingsDomain.getService('entity-manager');

	return entityManager.getAll()
		.then(function(entities){
			var mySettings = _.find(entities, function(entity){
				return entity.deviceId == device.uuid;
			});

			if (!mySettings) return { deviceId: device.uuid };

			return mySettings;
		});
}

module.exports = function(){
	function onLocationUpdate(data){

		_getDeviceSettingsObject()
			.then(function(settings){
				var savePromises = _.chain(app.getDomains('location-aware'))
					.map(function(domain){

						var locationService = domain.getService('location-aware');
						var entityManager = domain.getService('entity-manager');

						// todo: figure out how to query for this in a more sane way
						var savePromises = entityManager.getAll()
							.then(function(entities){
								return entities
									.map(function(entity){
										locationService.update(entity, data, settings);
										return entityManager.save(entity);
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
			});
	}

	function onLocationError(err){
		console.log('location retrieve fail.');
		console.error(err);
	}

	geolocation.watch(onLocationUpdate, onLocationError);
};
