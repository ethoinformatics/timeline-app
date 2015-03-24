require('./index.less');

var _ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	util = require('util'),
	app = require('app')(),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8),
	template = require('./index.vash');

function getTemplate(){ return template; }

function EditExistingDialog(opt){
	var entity = opt.entity,
		domain = app.getDomain(entity.domainName);

	var self = this;
	EventEmitter.call(self);


	var form = formBuilder.buildDataEntryForm(domain, entity);

	var template = getTemplate(domain);
	self.$element = $(template({ }));
	self.$element.find('.js-form').append(form.$element);

	var $btnSave = self.$element.find('.js-save');

	function _handleSave(keepOpen){
		var now = Date.now(),
			d = q.defer();

		var data = {
				id: ezuuid(),
				color: randomColor().toHex(),
				domainName: domain.name,
				beginTime: now,
				endTime: keepOpen ? null : now,
			};

		data = _.extend(data, form.getData());

		var activityService = domain.getService('activity');
		if (activityService){
			activityService.start(data);
		}

		var eventService = domain.getService('event');
		if (eventService){
			eventService.create(data);
		}
		d.resolve(data);

		return d.promise;
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
				self.emit('edited', data);
			})
			.catch(function(err){
				console.dir('error in EditExistingDialog');
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
}


util.inherits(EditExistingDialog, EventEmitter);
module.exports = EditExistingDialog;
