var Modal = require('modal'),
	_ = require('lodash'),
	ezuuid = require('ezuuid'),
	activityTypes = require('activity-types'),
	formBuilder = require('form-builder'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8);

function Details(type, activity){
	var self = this;
	EventEmitter.call(self);
	//var type = _.find(activityTypes, function(a){return a.name == activity.type;});

	this.show = function(){
		if (_.isFunction(type.ctor)){

			var objForm = new type.ctor();

			var m = new Modal('Create activity', objForm.$element);
			m.on('ok', function(){
				var data = {
					id: ezuuid(),
					color: randomColor().toHex(),
					data: objForm.getData(),
					type: type.name,
					beginTime: Date.now(),
				};

				self.emit('new', data);
			});
			m.show();
		} else if (_.isObject(type.fields)){
			var form = formBuilder(type.fields);

			var m = new Modal('Create activity', form.$element);
			m.on('ok', function(){
				var data = {
					id: ezuuid(),
					color: randomColor().toHex(),
					data: form.getData(),
					type: type.name,
					beginTime: Date.now(),
				};

				self.emit('new', data);
			});
			m.show();
		} else {
			return window.alert('bad activity type: ' + key);
		}
	};
	this.hide = function(){
	};
}


util.inherits(Details, EventEmitter);
module.exports = Details;
