require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	Modal = require('modal'),
	template = require('./index.vash'),
	app = require('app'),
	CreateNewDialog = require('create-new-dialog');

function CreateSelectDialog(opt){
	var self = this;
	EventEmitter.call(self);
	opt = Object(opt);

	var title =  opt.title || 'Create';
	var formDomains = opt.domains || app.getDomains('form-fields');

	var crumbs = opt.crumbs || [];
	var $element = $(template({
			activityTypes: formDomains,
			crumbs: crumbs,
		})),
		selectTypeModal = new Modal({
			title: title,
			$content: $element,
			hideOkay: true,
			backAction: opt.backAction,
		}),
		createNewDialog;

	$element
		.find('.js-new-activity')
		.on('click', function(){
			var $this = $(this),
				domainName = $this.val(),
				domain = app.getDomain(domainName);

			_showCreateForm(domain);
		});

	function _showCreateForm(domain){
		createNewDialog = new CreateNewDialog({
				domain: domain,
				backAction: opt.backAction,
			});

		var myCrumbs = _.chain(crumbs)
			.clone()
			.value();

		createNewDialog.setCrumbs(myCrumbs);

		createNewDialog.on('created', function(data){
			self.emit('created', data);
		});

		createNewDialog.show();
	}

	this.show = function(){
		if (_.size(formDomains) === 1){
			_showCreateForm(formDomains[0]);
		} else {
			selectTypeModal.show();
		}
	};

	this.hide = function(){
		if (selectTypeModal) selectTypeModal.hide();
		if (createNewDialog) createNewDialog.hide();
	};
}

util.inherits(CreateSelectDialog, EventEmitter);
module.exports = CreateSelectDialog;
