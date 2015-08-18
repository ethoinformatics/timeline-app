require('./index.less');

var $ = require('jquery'),
	velocity = require('velocity-animate'),
	EditExistingForm = require('edit-existing-form'),
	tmpl = require('./index.vash'),
	inlineChildTmpl = require('./inline-child.vash'),
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

		self.$element
			.css('width', window.innerWidth)
			.css('height', window.innerHeight-(96+44));

		var scroll = new Scroll(self.$element[0], {
				mouseWheel: true,
				scrollbars: true,
			});


		scroll.refresh();

		self.$element.on('js-expand-toggle', function(ev){
			var $this = $(this);


		});
		self.$element.find('.js-inline-add')
			.on('click', function(){
				var $this = $(this),
					domainName = $this.data('domain'),
					domain = inlineDomains.filter(function(d){return d.name == domainName;})[0];

				var $containerLi = $('<li></li>')
					.addClass('item')
					.addClass('item-container')
					//.addClass('header')
					.append(inlineChildTmpl({domainLabel: domain.label || domain.name}));

				var childForm = new EditExistingForm({entity: {domainName: domain.name}});
				childForm.$element.addClass('js-fields');
				$containerLi.append(childForm.$element);
			
				$this.closest('ul')
					.append($containerLi);



				$containerLi.find('.js-expand-toggle')
					.on('click', function(){
						var DURATION = 200;
						var $this = $(this),
							$icon = $this.find('i'),
							$accordian = $this.closest('.accordian');

						var $allIcons = $accordian.find('i.js-expand-icon').not($icon);
						var $allItemContainers = $accordian
							.find('.item-container')
							.not($containerLi);

						$allItemContainers.find('.js-expand-toggle').data('collapsed', true);
						velocity($allItemContainers.find('.js-fields'), 'slideUp', {duration: DURATION});
						$allIcons.removeClass('ion-arrow-down-b').addClass('ion-arrow-right-b');

						var isCollapsed = $this.data('collapsed');
						if (isCollapsed) {
							velocity(childForm.$element, 'slideDown', {duration: DURATION});
							$icon.addClass('ion-arrow-down-b').removeClass('ion-arrow-right-b');
						} else {
							velocity(childForm.$element, 'slideUp', {duration: DURATION});
							$icon.removeClass('ion-arrow-down-b').addClass('ion-arrow-right-b');
						}

						$this.data('collapsed', !isCollapsed);
					});

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
