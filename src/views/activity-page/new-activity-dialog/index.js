var $ = window.$,
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	ezuuid = require('ezuuid'),
	Modal = require('modal'),
	formBuilder = require('form-builder'),
	template = require('index.vash'),
	activityTypes = require('activity-types');

function NewActivityDialog(){
	var self = this;
	EventEmitter.call(self);

	var $element = $(template({
			activityTypes: activityTypes,
		})),
		modal = new Modal('New Activity', $element),
		objForm,
		type;

	
	modal.on('ok', function(){
		var data;

		if (objForm) 
			data = objForm.getData();
		else
			data = {};

		data = {
			id: ezuuid(),
			data: data,
			type: type.name,
			starting_time: new Date(),
		};

		self.emit('new', data);
	});

	$element
		.find('.js-type-select')
		.on('change', function(){
			var $this = $(this),
				key = $this.val();

			objForm = null;

			type = _.find(activityTypes, function(a){return a.key == key;});

			if (_.isFunction(type.ctor)){

				objForm = new type.ctor();

				$element.find('.js-form-container')
					.empty()
					.append(objForm.$element);

			} else if (_.isObject(type.fields)){
				var form = formBuilder(type.fields);

				$element.find('.js-form-container')
					.empty()
					.append(form.$element);
			} else {
				window.alert('bad activity type: ' + key);
			}
		});

	this.show = function(){
		modal.show();
	};
}

util.inherits(NewActivityDialog, EventEmitter);
module.exports = NewActivityDialog;
