var Modal = require('modal'),
	_ = require('lodash'),
	$ = require('jquery'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8),
	formTemplates = {
			event: require('./event.vash'),
			activity: require('./activity.vash'),
			generic: require('./generic.vash'),
		};


function getTemplate(domain){
	if (domain.getService('event')) return formTemplates.event;
	if (domain.getService('activity')) return formTemplates.activity;

	return formTemplates.generic;
}

function Details(domain, entity){
	var self = this;
	EventEmitter.call(self);

	var modal;
	this.show = function(){
		var title = entity ? 'Edit ' : 'Create ';
		title += domain.label;

		var form = formBuilder(domain.getService('form-fields'));
		if (entity){
			form.setData(entity);
		}

		var $btnSave = $('<button class="button button-balanced button-block">Save</button>');
		var $buttonBar = $('<div class="button-bar"></div>');
		var $btnDelete = $('<button class="button button-assertive">Delete</button>');
		if (entity){
			$buttonBar.append($btnDelete);
		} else {
		}

		var template = getTemplate(domain);
		var $content = $(template({
				isNew: !entity,
				entity: entity,
			}));

		$content.find('.js-form')
			.append(form.$element);

		$btnDelete.click(function(ev){
			ev.preventDefault();
			self.emit('delete', entity);
		});


		if (domain.getService('event')){

		} else if (domain.getService('activity')){

			if (entity){
				var $btnStop = $('<button class="button">Stop</button>');
				$buttonBar.append($btnStop);
				$btnStop.click(function(ev){
					ev.preventDefault();

				});
			}
		}

		modal = new Modal({
				title: title, 
				$content: $content,
				hideOkay: true,
			});

		$btnSave.click(function(ev){
			ev.preventDefault();

			var data = entity || {
						id: ezuuid(),
						color: randomColor().toHex(),
						domainName: domain.name,
						beginTime: Date.now(),
					};

			data = _.extend(data, form.getData());

			var activityService = domain.getService('activity');
			if (activityService){
				if (!entity){
					activityService.start(data);
				}
				return self.emit('save', data);
			}

			var eventService = domain.getService('activity');
			if (eventService){
				return geolocation.once(function(loc){
					if (!entity){
						eventService.create(data);
					}
					eventService.locationUpdate(data, loc);
					self.emit('save', data);
				});
			}
		});

		modal.show();
	};
	this.hide = function(){
		modal.hide();
	};
}


util.inherits(Details, EventEmitter);
module.exports = Details;
