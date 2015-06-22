var _ = require('lodash'),
	fakeDeviceId = require('jocal').bind(null, 'fake_device_id');

function _getDeviceId(){
	var id;

	// when not running on a real device, just invent a deviceId and put it in local storage
	if (!window.device){
		id = fakeDeviceId();
		if (!id){
			id = Date.now(); // okay for now
			fakeDeviceId(id);
		}

		return id;
	}

	return window.device.uuid;
}

function _getSettingsObject(){
	var app = require('app')();
	var settingsDomain = app.getDomain('_etho-settings');
	var entityManager = settingsDomain.getService('entity-manager');

	return entityManager.getAll()
		.then(function(entities){
			var deviceId = _getDeviceId();

			var mySettings = _.find(entities, function(entity){
				return entity.deviceId == deviceId;
			});

			if (!mySettings) return { deviceId: deviceId };

			return mySettings;
		});
}

function _setSettingsObject(settings){
	var app = require('app')();
	var settingsDomain = app.getDomain('_etho-settings');
	var entityManager = settingsDomain.getService('entity-manager');

	return entityManager.save(settings);
}


module.exports = function(settings){
	if (settings === undefined){
		return _getSettingsObject();
	}

	return _getSettingsObject()
		.then(function(oldSettings){
			settings = _.extend({}, oldSettings, settings);
			return _setSettingsObject(settings);
		});
};

