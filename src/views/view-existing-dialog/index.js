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

	this.show = function(){
		var title = _getLabel(entity);


		var form = formBuilder.buildDataEntryForm(domain);

		var template = getTemplate(domain);
		var $content = $(template({
				isNew: true,
				crumbs: crumbs,
				domainLabel: domain.label,
			}));
		var $tmp = $('<div>hi</div>');
		var timeline = createTimeline({
			height: window.innerHeight *0.72,
		});
		var children = entity.children || [];
		timeline.add(children);

		$content.find('.js-form').append($tmp);
			//.append(form.$element);
		$content.find('.js-framework-timeline-container')
			.append(timeline.element);

		var $btnSnapshot = $content.find('.js-snapshot');
		var $btnFollow = $content.find('.js-follow');
		// var $btnDelete = $content.find('.js-delete');
		// var $btnStop = $content.find('.js-stop');
		var $btnAddChild = $content.find('.js-child-add');
		// var childrenDomains = domain.getService('child-domains');
		// if (!childrenDomains){
		// 	$btnAddChild.hide();
		// }

		$btnAddChild.click(function(ev){
			ev.preventDefault();

			var descMgr = domain.getService('description-manager');
			var title = 'Add a child to ' + descMgr.getShortDescription(entity);

			debugger
			var myDomains = domain.getChildren();
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

				var myCrumbs = _.chain(crumbs)
					.clone()
					.value();

				var viewExistingDialog = new ViewExistingDialog({
					entity: child,
					crumbs: myCrumbs,
					backAction: function(){self.show();},
				});
				viewExistingDialog.show();
				timeline.add(entity);

				// var childDomain = app.getDomain(entity.domainName);
				// var entityManager = childDomain.getService('entity-manager');

				// entityManager.save(entity)
				// 	.then(function(){


				// 		var viewExistingDialog = new ViewExistingDialog({
				// 			entity: entity,
				// 		});
				// 		viewExistingDialog.show();
				// 		timeline.add(entity);
				// 	})
				// 	.catch(function(err){
				// 		console.dir(err);
				// 	})
				// 	.finally(function(){
				// 		console.log('ok');
				// 	});
			//	self.show();
				// entityManager.save(entity)
				// 	.then(function(){

				// 		m.hide();
				// 		timeline.update();
				// 	}).done();
			});
			m.show();
		});


		modal = new Modal({
				title: title,
				$content: $content,
				hideOkay: true,
				backAction: opts.backAction,
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
}


util.inherits(ViewExistingDialog, EventEmitter);
module.exports = ViewExistingDialog;
