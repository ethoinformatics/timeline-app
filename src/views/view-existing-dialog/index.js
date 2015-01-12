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
	template = require('./index.vash');

var CreateSelectDialog = require('../create-select-dialog');

function getTemplate(){ return template; }


function ViewExistingDialog(opts){
	var self = this,
		entity = opts.entity,
		crumbs = opts.crumbs,
		domain = app.getDomain(entity.domainName);

	crumbs = _.chain(crumbs)
		.toArray()
		.push({label:_getLabel(entity)})
		.value();

	EventEmitter.call(self);

	function _getLabel(myEntity){
		return domain.getService('description-manager')
			.getShortDescription(myEntity);
	}

	var modal;
	var template = getTemplate(domain);
	var $content = $(template({
			isNew: true,
			crumbs: crumbs,
			domainLabel: domain.label,
		}));

	var timeline = createTimeline({
		height: window.innerHeight *0.72,
	});

	var title = _getLabel(entity);
	modal = new Modal({
			title: title,
			$content: $content,
			hideOkay: true,
			backAction: opts.backAction,
		});


	timeline.on('activity-click', function(d){
		debugger
		var domain = app.getDomain(d.domainName),
			entityManager = domain.getService('entity-manager');

		var m = new ViewExistingDialog({
			entity: d,
			backAction: function(){
				m.hide();
				self.show();
			}
		});

		m.on('updated', function(){
			m.hide();
			self.render();

		});
		m.show();
		// m.on('save', function(entity){
		// 	entityManager.save(entity)
		// 		.then(function(){

		// 			m.hide();
		// 			timeline.update();
		// 		}).done();
		// });
	});

	$content.find('.js-framework-timeline-container')
		.append(timeline.element);

	this.show = function(){
		var myDomains = domain.getChildren();
		var form = formBuilder.buildDataEntryForm(domain);

		debugger
		var children = entity.children || [];
		timeline.clear();
		timeline.add(children);


		var $btnSnapshot = $content.find('.js-snapshot');
		var $btnFollow = $content.find('.js-follow');
		var $btnAddChild = $content.find('.js-child-add');
		var $btnRemove = $content.find('.js-view-remove');

		if (_.size(myDomains) == 1){
			$btnAddChild.text('Add ' + myDomains[0].label);
		}

		$btnRemove.click(function(){
			console.log('removing');
			var entityManager = domain.getService('entity-manager');
			entityManager.remove(entity)
				.then(function(){
					self.emit('updated');
					self.hide();
				});
		});

		$btnAddChild.click(function(ev){
			ev.preventDefault();

			var descMgr = domain.getService('description-manager');
			var title = 'Add a child to ' + descMgr.getShortDescription(entity);

			var m = new CreateSelectDialog({
				title: title,
				backAction: self.show.bind(self),
				domains: myDomains,
				crumbs: _.chain(crumbs).clone().push({label: 'Add child'}).value(),
			});

			m.on('created', function(child){

				debugger
				entity.children = _.chain(entity.children)
					.toArray()
					.push(child)
					.value();

				var entityManager = domain.getService('entity-manager');

				entityManager.save(entity)
					.then(function(info){
						entity._id = info.id;
						entity._rev = info.rev;

						var childDomain = app.getDomain(child.domainName);
						if (_.isEmpty(childDomain.getChildren())){
							m.hide();
							self.show();
							return;
						}
						var myCrumbs = _.chain(crumbs)
							.clone()
							.value();

						var viewExistingDialog = new ViewExistingDialog({
							entity: child,
							crumbs: myCrumbs,
							backAction: function(){self.show();},
						});
						viewExistingDialog.show();
					})
					.catch(function(err){
						console.error(err);
					});
			});
			m.show();
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

	this.hide = function(){
		modal.hide();
	};

	// modal.on('closed', function(){
	// 	self.emit('closed');
	// });
}


util.inherits(ViewExistingDialog, EventEmitter);
module.exports = ViewExistingDialog;
