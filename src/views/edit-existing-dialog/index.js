var Modal = require('modal'),
	EditExistingForm = require('edit-existing-form'),
	util = require('util'),
	q = require('q'),
	app = require('app')(),
	$ = require('jquery'),
	EventEmitter = require('events').EventEmitter;

function EditExistingDialog(opt){
	
	
	var entity = opt.entity,
		form = new EditExistingForm(opt),
		domain = app.getDomain(entity.domainName);

	var self = this;
	EventEmitter.call(self);

	var modal, crumbs = [];

	this.setCrumbs = function(myCrumbs){
		crumbs = myCrumbs || [];
	};

	var title =  'Edit '+ domain.label;

	modal = new Modal({
			title: title,
			$content: form.$element,
			hideOkay: true,
			backAction: opt.backAction,
		});

	form.on('edited', function(data){
		self.emit('edited', data);
	});

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
