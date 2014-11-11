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
		modal = new Modal('Create New', $element, {hideOkay:true});

	$element
		.find('.js-new-activity')
		.on('click', function(){
			var $this = $(this),
				domainName = $this.val();

			var domain = app.getDomain(domainName);
			var formService = domain.getService('form-fields');

			var m = new FormDialog(domain, formService);
			m.on('new', function(data){
				self.emit('new', data);
			});
			m.show();

		});

	this.show = function(){
		modal.show();
	};
}

util.inherits(NewActivityDialog, EventEmitter);
module.exports = NewActivityDialog;
