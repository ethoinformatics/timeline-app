require('./index.less');

var _ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	formBuilder = require('form-builder'),
	util = require('util'),
	app = require('app')(),
	EventEmitter = require('events').EventEmitter,
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

	self.updateFields = function(){
		_.extend(entity, form.getData());
		return entity;
	};

	function _onCreateButtonClick(keepActivityRunning, ev){
		var $this = $(this),
			oldText = $this.text();

		$this.parent()
			.find('input,button')
			.attr('disabled', 'disabled');

		$this.text('Please wait...');

		ev.preventDefault();

		_updateFields();
		self.emit('edited', entity);

		$this.text(oldText);
		$this.parent()
			.find('input,button')
			.removeAttr('disabled');
	}

	$btnSave.click(_.partial(_onCreateButtonClick, true));
}


util.inherits(EditExistingDialog, EventEmitter);
module.exports = EditExistingDialog;
