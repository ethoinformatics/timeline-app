var Modal = require('modal'),
	_ = require('lodash'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8);

function Details(domain, entity){
	var self = this;
	EventEmitter.call(self);


	this.show = function(){
		var title = entity ? 'Edit ' : 'Create ';
		title += domain.label;

		var form = formBuilder(domain.getService('form-fields'));
		if (entity){
			form.setData(entity);
		}

		var m = new Modal({
				title: title, 
				$content: form.$element,
			});

		m.on('ok', function(){
			var data = {
						id: ezuuid(),
						color: randomColor().toHex(),
						data: form.getData(),
						domainName: domain.name,
						beginTime: Date.now(),
					};

			data = _.extend(data, form.getData());

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
	};
	this.hide = function(){
	};
}


util.inherits(Details, EventEmitter);
module.exports = Details;
