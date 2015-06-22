require('./index.less');
var tmpl = require('./index.vash'),
	deviceSettings = require('device-settings'),
	q = require('q'),
	_ = require('lodash'),
	$ = require('jquery'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	Modal = require('modal'),
	app = require('app')();

function CodeManager(){
	EventEmitter.call(this);
	var self = this,
		settingLookupDomains = _.chain(app.getDomains('setting-lookup'))
			.sortBy('label')
			.value();

	var $element = $(tmpl({
		settings: settingLookupDomains.map(function(domain){
			return {
				name: domain.name,
				label: domain.label,
			};
		}),
	}));

	function loadSettings(){
		var loadedSelects = settingLookupDomains.map(function(domain){
			var descManager = domain.getService('description-manager');
			return domain.getService('entity-manager').getAll()
				.then(function(entities){
					var $select = $element.find('#'+domain.name);
					entities.forEach(function(entity){
						var $opt = $('<option></option>');
						$opt.val(entity._id);
						$opt.text(descManager.getShortDescription(entity));

						$select.append($opt);
					});

					return $select;
				});
		});

		q.all(loadedSelects)
			.then(function(selects){
				debugger
				deviceSettings()
					.then(function(settings){
						debugger
						Object.keys(settings)
							.forEach(function(key){
								var $select = _.find(selects, function($select){ return $select.attr('id') == key;});

								if ($select) 
									$select.val(settings[key]);
							});
					});

			});
	}

	$element.find('.scroll-wrapper')
		.css('width', window.innerWidth)
		.css('height', window.innerHeight-(96+44));

	var modal = new Modal({
		title: 'Settings',
		$content: $element,
		hideOkay: true,
	});

	modal.on('closed', function(){
		self.emit('closed');
	});

	self.show = function(){ 
		loadSettings();
		modal.show();
	};

	$element.find('#btn-save-settings').click(function(){
		deviceSettings()
			.then(function(settings){
				debugger

				$element.find('select').each(function(){
					var $select = $(this);
					settings[$select.attr('id')] = $select.val();
				});

				deviceSettings(settings)
					.then(function(res){
						console.dir(res);
						modal.hide();
					});

			});
	});
}

util.inherits(CodeManager, EventEmitter);
module.exports = CodeManager;
