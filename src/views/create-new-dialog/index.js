require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	Modal = require('modal'),
	template = require('./index.vash'),
	app = require('app'),
	FormDialog = require('form-dialog');

function NewEntityDialog(opt){
	var self = this;
	EventEmitter.call(self);
	opt = Object(opt);

	var title =  opt.title || 'Create';
	var formDomains = opt.domains || app.getDomains('form-fields');
	var $element = $(template({
			activityTypes: formDomains,
		})),
		selectTypeModal = new Modal({
			title: title,
			$content: $element,
			hideOkay: true,
			backAction: opt.backAction,
		}),
		formModal;

	$element
		.find('.js-new-activity')
		.on('click', function(){
			var $this = $(this),
				domainName = $this.val(),
				domain = app.getDomain(domainName);

			formModal = new FormDialog(domain);

			if (opt.backAction)
				formModal.setBackAction(opt.backAction);

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

util.inherits(NewEntityDialog, EventEmitter);
module.exports = NewEntityDialog;
