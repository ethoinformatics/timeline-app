require('./index.less');
var tmpl = require('./index.vash'),
	CreateNewDialog = require('create-new-dialog'),
	Scroll = require('iscroll'),
	_ = require('lodash'),
	$ = require('jquery'),
	Modal = require('modal'),
	listItemTemplate = require('./list-item-template.vash'),
	app = require('app');

function CodeManager(){
	var self = this,
		codeDomains = app.getDomains('code-domain');

	var $element = $(tmpl({
		domains: codeDomains,
	}));

	var $domainSelect = $element.find('.js-select-domain'),
		$codeList = $element.find('.js-codes');

	$domainSelect.on('change', function(){
		_load();
	});

	// var scroll = new Scroll($element.find('.scroll-wrapper')[0], {
	// 		mouseWheel: true,
	// 		scrollbars: true,
	// 	});
	$codeList.on('click', '.js-delete', function(){
		if (!window.confirm('Are you sure?')) return;

		var $this = $(this),
			$item = $this.closest('.item'),
			_id = $item.data('_id'),
			_rev = $item.data('_rev');

		self.entityManager.remove({_id: _id, _rev: _rev})
			.then(function(){
				$item.fadeOut(function(){
					$item.remove();
				});
			})
			.catch(function(err){
				console.error(err);
			});
	});

	$element.find('.js-btn-add')
		.click(function(ev){
			ev.preventDefault();

			var createNewDialog = new CreateNewDialog({
					domain: self.currentDomain,
				});

			createNewDialog.on('created', function(data){
				createNewDialog.hide();
				modal.show();

				self.entityManager.save(data)
					.then(function(){
						_load();
					})
					.catch(function(err){
						console.error(err);
					});
			});

			createNewDialog.on('closed', function(){
				self.show();
			});

			createNewDialog.show();
		});

	var modal = new Modal({
		title: 'Coded field manager',
		$content: $element,
		hideOkay: true,
	});

	self.show = function(){ 
		modal.show();
		_load();
	};

	Object.defineProperty(self, 'currentDomain', {
			get: function(){ 
				if (!$domainSelect) return null;

				var selectedDomainName = $domainSelect.val();
				return _.find(codeDomains, function(d){ return d.name == selectedDomainName; });
			},
		});

	Object.defineProperty(self, 'entityManager', {
			get: function(){ 
				if (!self.currentDomain) return null;

				return self.currentDomain.getService('entity-manager');
			},
		});

	Object.defineProperty(self, 'descriptionManager', {
			get: function(){ 
				if (!self.currentDomain) return null;

				return self.currentDomain.getService('description-manager');
			},
		});

	function _createListItemElement(entity){
		return listItemTemplate({
			_id: entity._id,
			_rev: entity._rev,
			label: self.descriptionManager.getShortDescription(entity) || 'fuck'
		});
	}

	function _load(){
		$codeList.empty()
			.append('Loading...');

		return self.entityManager.getAll()
			.then(function(entities){
				$codeList.empty();
				if (_.isEmpty(entities)){
					$codeList.append('There are no ' + self.currentDomain.label.toLowerCase() + ' codes.');
				}
				entities
					.map(_createListItemElement)
					.forEach(function(el){
						$codeList.append(el);
					});

				setTimeout(function(){
//					scroll.refresh();
				},0);
			})
			.done();
	}
}


module.exports = CodeManager;
