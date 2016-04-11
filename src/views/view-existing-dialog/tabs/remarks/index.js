var insertAtCaret = require('insert-at-caret'),
	tmpl = require('./index.vash'),
	$ = require('jquery'),
	moment = require('moment');


function Remarks(opts){
	var	rootEntity = opts.rootEntity || opts.entity;
	var self = this,
		_entity;

	self.$element = $(tmpl({}));
	self.label = 'Remarks';

	var $remarks = self.$element.find('textarea');
		
	$remarks.css('height', (window.innerHeight-(88+49))+'px'); //sorry

	self.$element.find('.js-timestamp').click(function(){
		// 
		insertAtCaret($remarks[0], moment().format('MMM DD, YYYY @ HH:mm:ss '));	
		
//		insertAtCaret($remarks[0], moment().format(' HH:mm '));	
	});

	self.setContext = function(ctx){
		_entity = ctx.entity;
		self.$element.find('textarea').val(_entity.remarks);
	};

	self.loseFocus = function(){
		_entity.remarks = self.$element.find('textarea').val();
		
		// TODO: This should be DRY'ed somewhere!!!
	var rootDomain = app.getDomain(rootEntity.domainName),
		rootEntityManager = rootDomain.getService('entity-manager');

		console.log("DO SAVE");
		console.log("Root entity:");
		console.log(rootEntity);

		// rootEntityManager.getDiary(rootEntity).then(function(diary) {
		rootEntityManager.save(rootEntity) // was diary
			.then(function(info){
				console.log("Save success");
				// diary._id = info.id;
				// diary._rev = info.rev;

				return info;
			}).catch(function(err) {
				console.error(err);
			});			
		// _doSave()
		// 	.then(function(){
		// 		_update(true);
		// 	})
		// 	.catch(function(err){
		// 		console.error(err);
		// 	});
	};
}

module.exports = Remarks;
