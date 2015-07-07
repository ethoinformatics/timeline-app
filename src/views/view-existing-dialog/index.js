require('./index.less');

var Modal = require('modal'),
	MapView = require('map'),
	_ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	formBuilder = require('form-builder'),
	createTimeline = require('timeline'),
	util = require('util'),
	app = require('app')(),
	Breadcrumb = require('breadcrumb'),
	EventEmitter = require('events').EventEmitter,
	EditExistingForm = require('edit-existing-form'),
	template = require('./index.vash');

var CreateSelectMenu = require('../create-select-dialog');

function getTemplate(){ return template; }

function ViewExistingDialog(opts){
	var self = this,
		entity,
		descManagerCache = {},
		rootEntity = opts.rootEntity || opts.entity,
		crumbs = opts.crumbs,
		domain,
		descManager,
		myDomains,
		editForm;

	_changeEntity(opts.entity || opts.rootEntity);

	function _getColor(entity){
		var color = app.getDomain(entity.domainName).getService('color');
		return color;
	}

	EventEmitter.call(self);
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

		_update();
	});

	function _changeEntity(entityToLoad){
		console.log('start _changeEntity');
		if (entityToLoad == entity) return false;

		entity = entityToLoad;
		domain = app.getDomain(entity.domainName);
		descManagerCache[entity.domainName] = descManagerCache[entity.domainName] || domain.getService('description-manager');
		descManager = descManagerCache[entity.domainName];

		myDomains = domain.getChildren();

		// load the description managers now because they are slow
		myDomains.forEach(function(myDomain){
			if (descManagerCache[myDomain.name]) return;

			descManagerCache[myDomain.name] = myDomain.getService('description-manager');
		});

		console.log('end _changeEntity');
		return true;
	}

	function _getLabel(myEntity){
		return descManager.getShortDescription(myEntity);
	}

	function _loadEditForm(){
		editForm = new EditExistingForm({entity: entity});
		$tabContainer.find('.tab-edit').empty().append(editForm.$element);
	}

	var modal;
	var template = getTemplate(domain);
	var $content = $(template({
			isNew: true,
			crumbs: crumbs,
			domainLabel: domain.label,
		})),
		$tabContainer = $content.find('.js-tabcontainer');
	
	var map = new MapView();
	map.showGeoJson(entity.footprint);
	$tabContainer.find('.tab-map').append(map.$element);


	var currentTab = 'tab-timeline';
	$content.find('.js-etho-tab').click(function(){
		var $this = $(this),
			tabClass = $this.data('tabclass');

		if (currentTab == 'tab-edit'){
			editForm.updateFields();

			_doSave()
				.then(function(){
					_update(true);
				})
				.catch(function(err){
					console.error(err);
				});
		}	

		$this.siblings().removeClass('selected');
		$this.addClass('selected');
		$tabContainer.children().hide();
		$tabContainer.find('.'+tabClass).show();

		currentTab = tabClass;

		if (currentTab == 'tab-map'){
			map.showGeoJson(entity.footprint);
		}
	});


	var timeline = createTimeline({
		height: (window.innerHeight-100) /3,
	});

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

	timeline.on('activity-click', function(d){
		console.log('start activity-click');
		_changeEntity(d);
		breadcrumb.add({context:d, label: _getLabel(d), color: _getColor(d)});

		_update();
		console.log('end activity-click');
	});

	$content.find('.js-framework-timeline-container')
		.append(timeline.element);

	function _renderTimeline(){
		console.log('_renderTimeline');
		var children = _getAllChildren();

		console.dir('loading ' + children.length);

		timeline.clear();
		timeline.add(children);
	}

	function _setTitleContent(){
		$content.find('.js-long-description-container')
			.html('<h1 class="loading-message">Loading...</h1>');

		descManager.getLongDescription(entity)
			.then(function(description){
				console.log('done loading form');
				$content.find('.js-long-description-container')
					.html(description);
			})
			.catch(function(err){
				console.error(err);
			});
	}
	function _getAllChildren(){
		return _.chain(entity)
			.values()
			.filter(_.isArray)
			.flatten()
			.filter(function(val){return val.domainName;})
			.value();
	}

	function _update(skipTimeline){

		var $btnAddChild = $content.find('.js-child-add');
		if (_.size(myDomains) == 1){
			$btnAddChild.text('Add ' + myDomains[0].label);
		} else if (_.size(myDomains) === 0){
			$btnAddChild.hide();
		} else {
			$btnAddChild.text('Add');
		}

		_loadEditForm();
		_setTitleContent();

		if (!skipTimeline){
			_renderTimeline();
		}
	}

	this.show = function(){
		_update();

		var form = formBuilder.buildDataEntryForm(domain);

		var $btnSnapshot = $content.find('.js-snapshot'),
			$btnFollow = $content.find('.js-follow'),
			$btnAddChild = $content.find('.js-child-add'),
			$btnRemove = $content.find('.js-view-remove');


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
			ev.preventDefault();

			var descMgr = domain.getService('description-manager');
			var title = 'Add a child to ' + descMgr.getShortDescription(entity);

			var m = new CreateSelectMenu({
				title: title,
				domains: myDomains,
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
						_update();
						breadcrumb.add({context:child, label: _getLabel(child), color: _getColor(child)});
					})
					.catch(function(err){
						console.error(err);
					});

			});
				m.show(ev);
		});

		function _handleSave(keepOpen){
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
		$btnAddChild.click(function(){
		});

		modal.show();
	};

	this.hide = modal.hide.bind(modal);
	this.remove = modal.remove.bind(modal);

	function _doSave(){
		var rootDomain = app.getDomain(rootEntity.domainName),
			rootEntityManager = rootDomain.getService('entity-manager');

		return rootEntityManager.save(rootEntity)
			.then(function(info){
				rootEntity._id = info.id;
				rootEntity._rev = info.rev;

				return info;
			});
	}
}


util.inherits(ViewExistingDialog, EventEmitter);
module.exports = ViewExistingDialog;
