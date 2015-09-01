
var $ = require('jquery'),
	_ = require('lodash'),
	q = require('q'),
	app = require('app')(),
	CreateSelectMenu = require('../../views/create-select-dialog'),
	ViewExistingDialog = require('../../views/view-existing-dialog'),
	//FormDialog = require('form-dialog'),
	//sampleData = require('sample-data'),
	tmpl = require('./index.vash');

var EventEmitter = require('events').EventEmitter,
	util = require('util');



function _getTopLevelDomains(){
	var domains = app.getDomains()
		.filter(function(domain){
			return !domain.getService('code-domain') && !/^_/.test(domain.name);
		});

	return domains.filter(function(d){
		return !_.any(domains, function(otherDomain){
			return !!_.find(otherDomain.getChildren(), function(d2){
				return d2.name == d.name;
			});
		});
	});
}

function GlobalAddButton(){
	EventEmitter.call(this);
	var self = this;

	var createSelectMenu = new CreateSelectMenu({
			domains: _getTopLevelDomains(),
		});

	self.$element = $(tmpl({}));

	self.$element.on('click', function(ev){
			createSelectMenu.on('created', function(entity){
				var domain = app.getDomain(entity.domainName);
				var entityManager = domain.getService('entity-manager');

				self.emit('created', entity);
				entityManager.save(entity)
					.then(function(info){
						entity._id = info.id;
						entity._rev = info.rev;

						var dialog = new ViewExistingDialog({
							entity: entity,
						});

						dialog.show();
					})
					.catch(function(err){
						console.error(err);
					});
			});

			createSelectMenu.show(ev);
		});
}

util.inherits(GlobalAddButton, EventEmitter);
module.exports = GlobalAddButton;
