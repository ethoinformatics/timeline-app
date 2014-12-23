require('./index.less');

var Modal = require('modal'),
	_ = require('lodash'),
	q = require('q'),
	$ = require('jquery'),
	ezuuid = require('ezuuid'),
	formBuilder = require('form-builder'),
	geolocation = require('geolocation'),
	util = require('util'),
	app = require('app'),
	EventEmitter = require('events').EventEmitter,
	randomColor = require('rgba-generate')(0.8),
	template = require('./index.vash');

function getTemplate(){ return template; }

function CreateNewDialog(domain){
	var self = this;
	EventEmitter.call(self);

	var modal, crumbs = [];

	this.setCrumbs = function(myCrumbs){
		crumbs = myCrumbs || [];
	};

	this.show = function(){
		var title =  'Create '+ domain.label;

		var form = formBuilder.buildDataEntryForm(domain);

		var template = getTemplate(domain);
		var $content = $(template({
				isNew: true,
				crumbs: crumbs,
			}));

		$content.find('.js-form')
			.append(form.$element);

		var $btnSnapshot = $content.find('.js-snapshot');
		var $btnFollow = $content.find('.js-follow');

		modal = new Modal({
				title: title,
				$content: $content,
				hideOkay: true,
			  	backAction: _backAction,
			});

		function _handleSave(keepOpen){
			var now = Date.now(),
				d = q.defer();

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
			d.resolve(data);

			return d.promise;
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
					console.dir('emiting created');
					console.dir(data);
					self.emit('created', data);
				})
				.catch(function(err){
					console.dir('error in CreateNewDialog');
					console.error(err);
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

		modal.show();
	};

	var _backAction;
	this.setBackAction = function(){

	};
	this.hide = function(){
		modal.hide();
	};
}


util.inherits(CreateNewDialog, EventEmitter);
module.exports = CreateNewDialog;
