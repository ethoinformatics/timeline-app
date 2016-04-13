require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	Hammer = require('hammerjs'),
	q = require('q'),
	//Scroll = require('iscroll'),
	app = require('app')(),
	ViewExistingDialog = require('../view-existing-dialog'),
	pageTemplate = require('./index.vash'),
	itemTemplate = require('./item.vash');


function _getTopLevelDomains(){
	// get all domains except "code-domain" and those that start with an underscore
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

function _getEntities(){
	// get all the entities from the entity-manager service:
	return _.chain(_getTopLevelDomains())
		.map(function(domain){
			var entityManager = domain.getService('entity-manager');
			// this is connected to PouchDB, essentially getting all the records
			// for this domain:
			return entityManager.getAll();
		})
		.thru(q.all)
		// return their value when they're all registered:
		.value()
		// chain them as a chain of promise events:
		.then(function(results){
			return _.chain(results)
				// flatten them (presumably into an array?) and sort them:
				.flatten()
				.sortBy(function(d){
					var domain = app.getDomain(d.domainName);
					var sortBy = domain ? domain.getService('sort-by') : false;

					if (!sortBy) return d._id || d.id;
					// return the sorted array of entities:
					return d[sortBy];
				})
				// reverse the sort, and return the final value of that reversal:
				.reverse()
				.value();
		});
}

// create an object for the domain that includes label, name, and id
function _createViewModel(entity){
	var domain = app.getDomain(entity.domainName),
		descManager = domain.getService('description-manager');

	return {
		label: descManager.getShortDescription(entity),
		domainName: entity.domainName,
		id: entity._id || entity.id,
	};
}

function ListView(){
	var self = this;

	self.$element = $(pageTemplate({ }));
	/*var scroll = new Scroll(self.$element.find('.scroll-wrapper')[0], {
			mouseWheel: true,
			scrollbars: true,
		});*/

	self.refresh = function(){
		_getEntities()
			// populate li tags with records fetched
			.then(function(entities){
				var $ul = self.$element.find('ul.list');
				$ul.empty();
				entities.forEach(function(entity){
					var $item = $(itemTemplate(_createViewModel(entity)));
					$ul.append($item);
					var hammer = new Hammer($item[0]);
					hammer.on('tap', _itemClick.bind(null, entity.domainName, entity._id));


				});

				//scroll.refresh();
			});
	};

	// makes it possible to move the dialog modal away back over the settings pane
	self.viewExistingDialog = null;
	self.dialogPushedOver = false;
	self.restoreExistingDialog = function(){
		if (self.dialogPushedOver && self.viewExistingDialog != null){
			self.dialogPushedOver = false;
			self.viewExistingDialog.peekBehindDialog( self.dialogPushedOver );
		}
	}
	
	function _itemClick(domainName, _id){
		console.log('opening: ' + domainName + ' ' + _id);
		var domain = app.getDomain(domainName),
			entityManager = domain.getService('entity-manager');

		// get the item clicked
		entityManager.byId(_id)
			.then(function(entity){
				if (!entity) return window.alert('unable to find entity');
				// load page (with tabs) for this record 
				console.log('loaded entity');
				var m = new ViewExistingDialog({ entity: entity, });
				m.show( true );
				self.viewExistingDialog = m;
				var $showLeftMenu = $('#js-show-left-menu-modal-version');
				$showLeftMenu.click(function(ev){
					console.log('showLeftMenu:click');
					ev.stopPropagation();
					self.dialogPushedOver = !self.dialogPushedOver;					
					m.peekBehindDialog( self.dialogPushedOver );
				});
				
			})
			.catch(function(err){
				console.error(err);
			});
	}

	self.refresh();
}

module.exports = ListView;
