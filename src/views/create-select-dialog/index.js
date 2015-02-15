require('./index.less');

var $ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	util = require('util'),
	template = require('./index.vash'),
	app = require('app'),
	CreateNewDialog = require('create-new-dialog');

function CreateSelectDialog(opt){
	var self = this;
	EventEmitter.call(self);
	opt = Object(opt);

	var formDomains = opt.domains || app.getDomains('form-fields');

	var crumbs = opt.crumbs || [];
	var $element = $(template({
			activityTypes: formDomains,
		})),
		createNewDialog;
	
	$('body').append($element);

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
			createNewDialog.remove();
			self.emit('created', data);
		});

		createNewDialog.on('closed', function(){
			createNewDialog.remove();
			console.log('removed it');
		});

		createNewDialog.show();
	}

	function _showMenu(ev){
		$element
			.css('top', ev.pageY)
			.css('right', window.innerWidth - ev.pageX)
			.show();

		setTimeout(function(){
				$('body').one('click', function(){
					$element.hide();
					self.emit('closed');
				});
			},0);
	}

	this.show = function(ev){
		if (_.size(formDomains) === 1){
			_showCreateForm(formDomains[0]);
		} else {
			_showMenu(ev);
		}
	};

	this.hide = function(){
		$element.hide();
		if (createNewDialog) createNewDialog.hide();
	};
	this.remove = function(){
		$element.remove();
		if (createNewDialog) createNewDialog.remove();
	};
}

util.inherits(CreateSelectDialog, EventEmitter);
module.exports = CreateSelectDialog;
