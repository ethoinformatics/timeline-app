require('./index.less');
var tmpl = require('./index.vash'),
	CreateNewDialog = require('create-new-dialog'),
	_ = require('lodash'),
	$ = require('jquery'),
	Modal = require('modal'),
	app = require('app');



function CodeManager(){
	var self = this,
		codeDomains = app.getDomains('code-domain');

	console.dir('--- code domains ---');
	console.dir(codeDomains);

	var $element = $(tmpl({
		domains: codeDomains,
	}));

	var $domainSelect = $element.find('.js-select-domain');
	$element.find('.js-btn-add')
		.click(function(ev){
			ev.preventDefault();

			var currentDomain = _getCurrentDomain();

			var createNewDialog = new CreateNewDialog({
					domain: currentDomain,
				});

			createNewDialog.on('created', function(data){
				createNewDialog.hide();
				self.show();
				_refresh();
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

	self.show = function(){ modal.show(); };

	function _getCurrentDomain(){
		if (!$domainSelect) return null;

		var selectedDomainName = $domainSelect.val();
		return _.find(codeDomains, function(d){ return d.name == selectedDomainName; });
	}

	function _refresh(){
		var currentDomain = _getCurrentDomain();
		var entityManager = currentDomain.getService('entity-manager');
		entityManager.getAll()
			.then(function(entities){
				debugger
			})
			.done();


	}
}


module.exports = CodeManager;