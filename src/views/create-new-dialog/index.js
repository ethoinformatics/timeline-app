require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	Modal = require('modal'),
	template = require('./index.vash'),
	app = require('app'),
	FormDialog = require('form-dialog');

function NewActivityDialog(){
	var self = this;
	EventEmitter.call(self);

	var formDomains = app.getDomains('form-fields');
	var $element = $(template({
			activityTypes: formDomains,
		})),
		selectTypeModal = new Modal({
			title: 'Create New',
			$content: $element,
			hideOkay: true
		}),
		formModal;

	$element
		.find('.js-new-activity')
		.on('click', function(){
			var $this = $(this),
				domainName = $this.val(),
				domain = app.getDomain(domainName);

			formModal = new FormDialog(domain);
			formModal.on('save', function(data){
				self.emit('new', data);
			});

			formModal.show();

		});

	this.show = selectTypeModal.show.bind(selectTypeModal);
	this.hide = function(){
		if (selectTypeModal) selectTypeModal.hide();
		if (formModal) formModal.hide();
	};
}

util.inherits(NewActivityDialog, EventEmitter);
module.exports = NewActivityDialog;
