require('./index.less');

var $ = require('jquery'),
	EditExistingForm = require('edit-existing-form'),
	tmpl = require('./index.vash'),
	scrollTmpl = require('./scroll.vash'),
	Scroll = require('iscroll');

function EditTab(){

	var self = this, editForm;

	self.label = 'Edit';
	self.$element = $(scrollTmpl({}));


	self.setContext = function(ctx){
		editForm = new EditExistingForm({entity: ctx.entity});
		editForm.updateFields();

		var inlineDomains = ctx.domain.getChildren()
			.filter(function(d){return d.inline;});

		self.$element
			.find('.scroller')
			.empty()
			.append(tmpl({
				inlineDomains: inlineDomains,
				domainName: ctx.domain.label,
			}));

		self.$element
			.find('.edit-form')
			.empty()
			.append(editForm.$element);

		var scroll = new Scroll(self.$element.find('.scroll-wrapper')[0], {
				mouseWheel: true,
				scrollbars: true,
			});

		self.$element.find('.scroll-wrapper')
			.css('width', window.innerWidth)
			.css('height', window.innerHeight-(96+44));

		scroll.refresh();

		self.$element.find('.js-inline-add')
			.on('click', function(){
				var $this = $(this),
					domainName = $this.data('domain'),
					domain = inlineDomains.filter(function(d){return d.name == domainName;})[0];

				// var $headerLi = $('<li></li>')
				// 	.addClass('item')
				// 	.addClass('header')
				// 	.text(domain.label);


				var $li = $('<li></li>');
				var childForm = new EditExistingForm({entity: {domainName: domain.name}});
				$li.append(childForm.$element);
			
				$this.closest('ul')
//					.append($headerLi)
					.append($li);

				scroll.refresh();
			});
	};

	self.loseFocus = function(){
		editForm.updateFields();

		// _doSave()
		// 	.then(function(){
		// 		_update(true);
		// 	})
		// 	.catch(function(err){
		// 		console.error(err);
		// 	});
	};

}

module.exports = EditTab;
