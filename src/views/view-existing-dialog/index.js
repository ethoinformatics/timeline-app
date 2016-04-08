require('./index.less');

var Modal = require('modal'),
	moment = require('moment'),
_ = require('lodash'),
q = require('q'),
$ = require('jquery'),
formBuilder = require('form-builder'),
util = require('util'),
app = require('app')(),
Breadcrumb = require('breadcrumb'),
EventEmitter = require('events').EventEmitter,
template = require('./index.vash');

var geolocation = require('geolocation');

var CreateSelectMenu = require('../create-select-dialog');
var TabEdit = require('./tabs/edit/index.js'),
TabMap = require('./tabs/map/index.js'),
TabRemarks = require('./tabs/remarks/index.js'),
TabTimeline = require('./tabs/timeline/index.js');

//get device settings stored in db
function _getDeviceSettingsObject(){
	var settingsDomain = app.getDomain('_etho-settings');
	var entityManager = settingsDomain.getService('entity-manager');

	return entityManager.getAll()
		.then(function(entities){
			var mySettings = _.find(entities, function(entity){
				return entity.deviceId == device.uuid;
			});

			if (!mySettings) return { deviceId: device.uuid };

			return mySettings;
		});
}

function ViewExistingDialog(opts){
	var self = this,
		entity,
		descManagerCache = {},
		rootEntity = opts.rootEntity || opts.entity,
		crumbs = opts.crumbs,
		domain,
		descManager,
		myDomains;

	var tabOptions = {
		rootEntity: rootEntity,
	};
	
	console.log("ViewExistingDialog()");
	console.log(rootEntity);

	var tabEdit = new TabEdit(tabOptions),
		tabMap = new TabMap(tabOptions),
		tabRemarks = new TabRemarks(tabOptions),
		tabTimeline = new TabTimeline(tabOptions);

	var rootDomain = app.getDomain(rootEntity.domainName);
// test
	// var geoAware = rootDomain.getService('geo-aware');
	// if (geoAware){
	// 	_getDeviceSettingsObject()
	// 		.then(function(settings){
	// 			geolocation.watch(function(err, data){
	// 				if (err) return console.log('geo-aware watch error');
	//
	// 				geoAware.update(rootEntity, data, settings);
	// 			});
	// 		})
	// 		.catch(function(err){
	// 			console.log('error getting device settings');
	// 			console.error(err);
	// 		});
	// }
	// make this (self) an EventEmitter (?)
	EventEmitter.call(self);

	var $content = $(template({
		isNew: true,
			crumbs: crumbs,
		})),
		$tabContainer = $content.find('.js-tabcontainer');

	// load the current entity
	_changeEntity(opts.entity || opts.rootEntity);

	function _getColor(entity){
		var domain = app.getDomain(entity.domainName),
			service;

		if (domain)
			service = domain.getService('color');

		return service || 'pink';
	}

	crumbs = _.chain(crumbs)
		.toArray()
		.push({context: entity, label:_getLabel(entity), color: _getColor(entity)})
		.value();

	var breadcrumb = new Breadcrumb({crumbs: crumbs});

	breadcrumb.on('close', function(data){
		
		modal.remove();
	});

	breadcrumb.on('selection', function(data){
		if (!_changeEntity(data.context)) return;
		//
	// _doSave()
	// 	.then(function(info){
	// 		rootEntity._id = info.id;
	// 		rootEntity._rev = info.rev;
	// })
	// .catch(function(err){
	// 	console.error(err);
	// });
	//
	// 	if( data.context.domainName == 'diary' ){
	// 		self.show( false );
	// 	}
		_updateAddButton();
	});

	function _changeEntity(entityToLoad){
		if (entityToLoad == entity) return false;

		if (!entityToLoad.domainName) return window.alert('missing domainName property');
		var myDomain = app.getDomain(entityToLoad.domainName);
		if (!myDomain) return window.alert('cannot find domain for ' + entityToLoad.domainName);

		entity = entityToLoad;
		domain = myDomain;

		descManager = descManagerCache[entity.domainName] = descManagerCache[entity.domainName] || domain.getService('description-manager');

		myDomains = domain.getChildren();

		// load the description managers now because they are slow
		myDomains.forEach(function(myDomain){
			if (descManagerCache[myDomain.name]) return;

			descManagerCache[myDomain.name] = myDomain.getService('description-manager');
		});

		var ctx = createContext(entity);

		[tabEdit, tabRemarks, tabTimeline, tabMap]
			.forEach(function(tab){
				tab.setContext(ctx);
			});

		_updateAddButton();

		return true;
	}

	function _getLabel(myEntity){
		return descManager.getShortDescription(myEntity);
	}

	var modal;

	$tabContainer.css('height', (window.innerHeight-88)+'px');
	var $tabHeaderContainer = $content.find('.js-etho-tabs');
	
	[tabEdit, tabRemarks, tabTimeline, tabMap]
		.forEach(function(tab, i){
			var $header = $('<li></li>')
				.addClass('js-etho-tab')
				.attr('data-tabclass', tab.label)
				.text(tab.label);

			if (i === 0) {
				$header.addClass('selected');
				tab.$element.show();
			} else {
				tab.$element.hide();
			}

			$tabHeaderContainer.append($header);
			$tabContainer.append(tab.$element);

			$header.on('click', function(){
				_tabClick.call(this, arguments[0], tab);
			});
		});

	var previousTab;
	function _tabClick(ev, clickedTab){
		var $this = $(this);


		if (previousTab && _.isFunction(previousTab.loseFocus))
			previousTab.loseFocus();


		$this.siblings().removeClass('selected');
		$this.addClass('selected');
		$tabContainer.children().hide();

		// show the content of the clicked tab: map, remarks, timeline, etc
		if (_.isFunction(clickedTab.show)){
			clickedTab.show();
		} else {
			clickedTab.$element.show();
		}

		previousTab = clickedTab;
	}

	modal = new Modal({
			$header: breadcrumb.$element,
			$content: $content,
			hideOkay: true,
			backAction: opts.backAction,
		  	hideClose: true,
		});

	modal.on('closed', function(){
		self.emit('closed');
	});

	function descendContext(newEntity){
		_changeEntity(newEntity);

		tabMap.descend(newEntity);

		
		breadcrumb.add({
			context: newEntity, 
			label: _getLabel(newEntity), 
			color: _getColor(newEntity), 
		});
	}

	function createContext(entity){
		return {
			descend: descendContext,
			entity: entity,
			domain: domain,
			descManager: descManager,
			getChildren: function(myEntity){
				return _.chain(myEntity || entity)
					.values()
					.filter(_.isArray)
					.flatten()
					.filter(function(val){return val.domainName;})
					.value();
			},
			getShortDescription: function(entity){
				var descManager = descManagerCache[entity.domainName];
				if (!descManager) return entity._id || entity.id;
				return descManager.getShortDescription(entity);
			},
		};
	}

	function _updateAddButton(){
		
		// var $btnAddChild = $content.find('.js-child-add');
		// //$btnAddChild.text('Add');
		// console.log("_updateAddButton");
		// var popupChildDomains = myDomains.filter(function(d){return !d.inline;});
		//
		// // to do jrc: make sure this
		//
		// console.log("popupChildDomains");
		// console.log(popupChildDomains);
		//
		// if (_.size(popupChildDomains) == 1){
		// //	$btnAddChild.text('Add ' + popupChildDomains[0].label);
		// 	$btnAddChild.removeClass('disabled');
		// } else if (_.size(popupChildDomains) === 0){
		// 	$btnAddChild.addClass('disabled');
		// } else {
		// 	$btnAddChild.removeClass('disabled');
		// }
	}

	this.show = function( showAnimated ){
		console.log('show view existing dialogue!');
		_updateAddButton();

		var form = formBuilder.buildDataEntryForm(domain);


//		$('input').css('background-color', '#dddddd');

		var $btnSnapshot = $content.find('.js-snapshot'),
			$btnFollow = $content.find('.js-follow'),
			$btnAddChild = $content.find('.js-child-add'),
			$btnRemove = $content.find('.js-view-remove');

			
			// this means it's the contact button
			if( $btnAddChild.length == 1 ) {
				$btnAddChild.unbind( "click" ); // remove click in case it was added by the EditTab class
				$btnAddChild.attr('id', 'addContactBtn');
			}



		$btnRemove.click(function(){
			if (rootEntity!=entity) return window.alert('not implemeneted yet');

			console.log('removing');
			var entityManager = domain.getService('entity-manager');

			entityManager.remove(entity)
				.then(function(){
					self.emit('removed', entity);
					self.hide();
				});
		});

		$btnAddChild.click(function(ev){
			console.log('add contact button jrc');
			ev.preventDefault();

			if ($(this).hasClass('disabled')) return console.log('ignore click');

			var descMgr = domain.getService('description-manager');
			var title = 'Add a child to ' + descMgr.getShortDescription(entity);


			var m = new CreateSelectMenu({
				title: title,
				domains: myDomains.filter(function(d){return !d.inline;}),
				crumbs: _.chain(crumbs).clone().push({label: 'Add child'}).value(),
			});

			m.on('created', function(child){
				var childDomain = app.getDomain(child.domainName),
					entityManager = childDomain.getService('entity-manager');

				entityManager.addToParent(entity, child);

				_doSave()
					.then(function(info){
						rootEntity._id = info.id;
						rootEntity._rev = info.rev;

					_changeEntity(child);
					_updateAddButton();
					breadcrumb.add({context:child, label: _getLabel(child), color: _getColor(child)});
				})
				.catch(function(err){
					console.error(err);
				});

			});
			m.show(ev);
		});

	function _handleSave(keepOpen){
		debugger;
		return;
		var now = Date.now();

		var data = {
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

			var entityManager = domain.getService('entity-manager');

			return entityManager.save(data)
				.then(function(savedData){
					self.emit('new', data);

					console.log('saved data: ');
					console.dir(savedData);

					return data;
				});
		}

		function _createButtonClick(keepActivityRunning, ev){
			// this is the creation of a new contact
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

				})
				.catch(function(err){
					console.error(err);

					alert('error');
				})
				.finally(function(){
					$this.text(oldText);
					$this.parent()
						.find('input,button')
						.removeAttr('disabled');
				});
		}


		$btnSnapshot.click(_.partial(_createButtonClick, false));
		$btnFollow.click(_.partial(_createButtonClick, true));

		if(showAnimated) modal.show();
		else modal.showInstant();
	};

	this.hide = modal.hide.bind(modal);
	this.remove = modal.remove.bind(modal);

	function _doSave(){
		debugger;
		return;
		console.log('ved-_doSave');
		var rootDomain = app.getDomain(rootEntity.domainName),
			rootEntityManager = rootDomain.getService('entity-manager');

		return rootEntityManager.save(rootEntity)
			.then(function(info){
				rootEntity._id = info.id;
				rootEntity._rev = info.rev;

				return info;
			});
	}

	///////////
	
	var $showLeftMenu = $('#js-show-left-menu-modal-version'),
	isLeftMenuOpen = false;
	
	$showLeftMenu.click(function(ev){
		ev.stopPropagation();
		isLeftMenuOpen = !isLeftMenuOpen;
		modal.slideForSettings(isLeftMenuOpen);
	});
	
}


util.inherits(ViewExistingDialog, EventEmitter);
module.exports = ViewExistingDialog;
