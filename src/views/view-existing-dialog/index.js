require('./index.less');

var Modal = require('modal'),
	_ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	createTimeline = require('timeline'),
	util = require('util'),
	app = require('app'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8),
	EditExistingDialog = require('edit-existing-dialog'),
	template = require('./index.vash');

var CreateSelectMenu = require('../create-select-dialog');

function getTemplate(){ return template; }


function ViewExistingDialog(opts){
	var self = this,
		entity = opts.entity || opts.rootEntity,
		rootEntity = opts.rootEntity || opts.entity,
		crumbs = opts.crumbs,
		domain = app.getDomain(entity.domainName),
		descManager = domain.getService('description-manager');

	crumbs = _.chain(crumbs)
		.toArray()
		.push({label:_getLabel(entity),})
		.value();

	EventEmitter.call(self);

	function _hasChildDomains(domainName){
		var childDomain = app.getDomain(domainName);
		return !_.isEmpty(childDomain.getChildren());
	}

	function _getLabel(myEntity){
		return descManager.getShortDescription(myEntity);
	}

	var modal;
	var template = getTemplate(domain);
	var $content = $(template({
			isNew: true,
			crumbs: crumbs,
			domainLabel: domain.label,
		}));


	descManager.getLongDescription(entity)
		.then(function(description){
			$content.find('.js-long-description-container')
				.html(description);
		});

	var timeline = createTimeline({
		height: (window.innerHeight-100) /3,
	});

	var title = _getLabel(entity);
	modal = new Modal({
			title: title,
			$content: $content,
			hideOkay: true,
			backAction: opts.backAction,
		});

	modal.on('closed', function(){
		self.emit('closed');
	});

	timeline.on('activity-click', function(d){
		if (!_hasChildDomains(d.domainName)){
			var dialog = new EditExistingDialog({entity: d});
			dialog.show();
			return;
		}

		var m = new ViewExistingDialog({
			entity: d,
			rootEntity: rootEntity,
			crumbs: _.chain(crumbs).clone().value(),
		});

		m.on('updated', function(){
			m.hide();
			self.render();
		});
		// m.on('removed', function(){
		// 	m.hide();
		// 	setTimeout(function(){
		// 		timeline.remove(d);
		// 	}, 400);
		// });

		m.on('closed', function(){
			m.remove();
		});

		m.show();
	});

	$content.find('.js-framework-timeline-container')
		.append(timeline.element);

	
	function _getAllChildren(){
		return _.chain(entity)
			.values()
			.filter(_.isArray)
			.flatten()
			.filter(function(val){return val.domainName;})
			.value();
	}

	this.show = function(){
		var myDomains = domain.getChildren();
		var form = formBuilder.buildDataEntryForm(domain);

		var children = _getAllChildren();

		timeline.clear();
		timeline.add(children);


		var $btnSnapshot = $content.find('.js-snapshot'),
			$btnFollow = $content.find('.js-follow'),
			$btnAddChild = $content.find('.js-child-add'),
			$btnViewRaw = $content.find('.js-view-raw'),
			$btnEdit = $content.find('.js-view-edit'),
			$btnRemove = $content.find('.js-view-remove');

		if (_.size(myDomains) == 1){
			$btnAddChild.text('Add ' + myDomains[0].label);
		} else if (_.size(myDomains) === 0){
			$btnAddChild.hide();
		}

		$btnViewRaw.click(function(){
			var $pre = $('<pre></pre>').text(JSON.stringify(rootEntity, '\t', 4));
			var $div = $('<div></div>').append($pre);
			var m = new Modal({
				$content: $div,
				scroll: true,
			});

			m.show();
		});

		$btnEdit.click(function(){
			var dialog = new EditExistingDialog({entity: entity});
			
			dialog.on('edited', function(data){
				console.dir(data);
				dialog.remove();
			});
			dialog.show();
		});


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

				var rootDomain = app.getDomain(rootEntity.domainName),
					rootEntityManager = rootDomain.getService('entity-manager');

				rootEntityManager.save(rootEntity)
					.then(function(info){
						rootEntity._id = info.id;
						rootEntity._rev = info.rev;

						if (!_hasChildDomains(child.domainName)){
							m.hide();

							setTimeout(function(){
								timeline.add(child);
							}, 400);

							return;
						}
						timeline.add(child);

						var myCrumbs = _.chain(crumbs)
							.clone()
							.value();

						var viewExistingDialog = new ViewExistingDialog({
							entity: child,
							rootEntity: rootEntity,
							crumbs: myCrumbs,
						});

						viewExistingDialog.show();
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
					id: ezuuid(),
					color: randomColor().toHex(),
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
}


util.inherits(ViewExistingDialog, EventEmitter);
module.exports = ViewExistingDialog;
