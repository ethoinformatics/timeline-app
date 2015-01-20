require('./index.less');

var Modal = require('modal'),
	_ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	util = require('util'),
	app = require('app'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8),
	template = require('./index.vash');

function getTemplate(){ return template; }

function EditExistingDialog(opt){
	var entity = opt.entity,
		domain = app.getDomain(entity.domainName);

	var self = this;
	EventEmitter.call(self);

	var modal, crumbs = [];

	this.setCrumbs = function(myCrumbs){
		crumbs = myCrumbs || [];
	};

	var title =  'Edit '+ domain.label;
	var form = formBuilder.buildDataEntryForm(domain, entity);

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


util.inherits(EditExistingDialog, EventEmitter);
module.exports = EditExistingDialog;
