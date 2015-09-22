require('./index.less');

var Modal = require('modal'),
	geolocation = require('geolocation'),
	_ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	deviceSettings = require('device-settings'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	util = require('util'),
	app = require('app')(),
	EventEmitter = require('events').EventEmitter,
	template = require('./index.vash');

function getTemplate(){ return template; }

function CreateNewDialog(opt){
	var domain = opt.domain;

	var self = this;
	EventEmitter.call(self);

	var modal, crumbs = [];

	this.setCrumbs = function(myCrumbs){
		crumbs = myCrumbs || [];
	};

	var title =  'Create '+ domain.label;

	var form = formBuilder.buildDataEntryForm(domain);

	var template = getTemplate(domain);
	var $content = $(template({
			isNew: true,
			crumbs: crumbs,
		}));

	$content.find('.js-form').append(form.$element);

	var $btnSave = $content.find('.js-save');

	modal = new Modal({
			title: title,
			$content: $content,
			hideOkay: true,
			backAction: opt.backAction,
		});

	function _handleSave(keepOpen){
		var now = Date.now();

		var entity = {
				domainName: domain.name,
				beginTime: now,
				endTime: keepOpen ? null : now,
				geo: {},
			};

		entity = _.extend(entity, form.getData());

		var activityService = domain.getService('activity');
		if (activityService){
			activityService.start(entity);
		}

		var eventService = domain.getService('event');
		if (eventService){
			eventService.create(entity);
		}

		return q.all([
				deviceSettings(),
				geolocation.once(),
			])
			.spread(function(settings, locationData){
				entity.observerId = settings.user;
				entity.geo.create = {
					type: 'Point',
					coordinates: [
						locationData.coords.longitude,
						locationData.coords.latitude,
						locationData.coords.altitude,
					],
					properties: {
						timestamp: Date.now(),
					},
				};
				return entity;
			});
	}

	function _createButtonClick(keepActivityRunning, ev){
		console.log('gotta click');

		var $this = $(this),
			oldText = $this.text();

		$this.parent()
			.find('input,button')
			.attr('disabled', 'disabled');

		$this.text('Please wait...');

		ev.preventDefault();
		return _handleSave(keepActivityRunning)
			.then(function(data){
				console.dir('emiting created');
				console.dir(data);
				self.emit('created', data);
			})
			.catch(function(err){
				console.dir('error in CreateNewDialog');
				console.error(err);
			})
			.finally(function(){
				$this.text(oldText);
				$this.parent()
					.find('input,button')
					.removeAttr('disabled');
			});
	}

	$btnSave.click(_.partial(_createButtonClick, true));
	modal.on('closed', function(){
		self.emit('closed');
	});

	this.show = function(){
		modal.show();
	};

	this.hide = function(){
		modal.hide();
	};
	this.remove = function(){
		modal.remove();
	};
}


util.inherits(CreateNewDialog, EventEmitter);
module.exports = CreateNewDialog;
