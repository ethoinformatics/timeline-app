var Modal = require('modal'),
	_ = require('lodash'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8);

function Details(domain, fields, entity){
	var self = this;
	EventEmitter.call(self);


	this.show = function(){
		var title = entity ? 'Edit ' : 'Create ';
		title += domain.label;

		// if (_.isFunction(type.ctor)){

		// 	var objForm = new type.ctor();

		// 	var m = new Modal(title, objForm.$element);
		// 	m.on('ok', function(){
		// 		var data = {
		// 			id: ezuuid(),
		// 			color: randomColor().toHex(),
		// 			data: objForm.getData(),
		// 			type: type.name,
		// 			beginTime: Date.now(),
		// 		};

		// 		self.emit('new', data);
		// 	});
		// 	m.show();
		// } else if (_.isObject(type.fields)){
			var form = formBuilder(fields);
			if (entity){
				form.setData(entity);
			}

			var m = new Modal(title, form.$element);
			m.on('ok', function(){
				var data = {
					id: ezuuid(),
					color: randomColor().toHex(),
					data: form.getData(),
					domainName: domain.name,
					beginTime: Date.now(),
				};

				var activityService = domain.getService('activity');
				if (activityService){
					activityService.start(data);
					return self.emit('new', data);
				}

				var eventService = domain.getService('activity');
				if (eventService){
					return geolocation.once(function(loc){
						eventService.create(data);
						eventService.locationUpdate(data, loc);
						self.emit('new', data);
					});
				}
			});

			m.show();
		// } else {
		// 	return window.alert('bad activity type: ' + key);
		// }
	};
	this.hide = function(){
	};
}


util.inherits(Details, EventEmitter);
module.exports = Details;