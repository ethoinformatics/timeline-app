require('./index.less');

var $ = require('jquery'),
	velocity = require('velocity-animate'),
	Hammer = require('hammerjs'),
	_ = require('lodash'),
	EditExistingForm = require('edit-existing-form'),
	tmpl = require('./index.vash'),
	inlineChildTmpl = require('./inline-child.vash'),
	PopupButtons = require('popup-buttons'),
	scrollTmpl = require('./scroll.vash'),
	Scroll = require('iscroll');

var EventEmitter = require('events').EventEmitter;
var util = require('util');


function _createChildCollectionData(parentDomain, childDomains){
	var lookup = _.chain(childDomains)
		.map(function(d){
			// sorry, cheap hack todo: hide this somewhere
			var parentPropertyName = d.getService('parent-'+parentDomain.name);

			return {
				collectionName: parentPropertyName,
				domain: d,
			};
		})
		.groupBy(function(d){return d.collectionName;})
		.value();

	return _.keys(lookup)
		.map(function(collectionName){
			return {
				collectionName: collectionName,
				domainNames:_.map(lookup[collectionName], function(d){return d.domain.name;}).join(','),
			};
		});
}

function EditTab(){
	EventEmitter.call(this);

	var self = this, editForm;
	var _context; 
	self.label = 'Data';
	self.$element = $(scrollTmpl({}));


	self.setContext = function(ctx){
		_context = ctx;
		editForm = new EditExistingForm({entity: ctx.entity});
		editForm.updateFields();

		var childDomains = ctx.domain.getChildren();

		var inlineChildDomains = childDomains.filter(function(d){return d.inline;});
		var inlineChildren = _createChildCollectionData(ctx.domain, inlineChildDomains);

		var standardChildDomains = childDomains.filter(function(d){return !d.inline;});
		var standardChildren = _createChildCollectionData(ctx.domain, standardChildDomains);

		standardChildren.forEach(function(item){
				item.entities = (ctx.entity[item.collectionName] || [])
					.map(function(child){
						return {
							_id: child._id || child.id,
							domainLabel: child.domainName,
							entityLabel: ctx.getShortDescription(child),
						};
					});
			});

		self.$element
			.find('.scroller')
			.empty()
			.append(tmpl({
				childData: inlineChildren,
				standardChildren: standardChildren,
				label: ctx.domain.label,
			}));
			
		self.$element
			.find('.iScrollVerticalScrollbar').remove();

		self.$element
			.find('.edit-form')
			.empty()
			.append(editForm.$element);

		self.$element
			.css('width', window.innerWidth)
			.css('height', window.innerHeight-(96+44));

		self.$element
			.find('.float-right')
			.css('float', 'right');


			
		// give the browser a chance to reflow the new elements
		setTimeout(function() {
			var scroll = new Scroll(self.$element[0], {
					mouseWheel: true,
					scrollbars: true,
					tap:true
				});
		
				console.log(scroll);				
		},100);


		function _collapseChildren(collectionName){
			var $accordians = self.$element.find('.js-collection-'+ collectionName);

			var $icons = $accordians.find('i.js-expand-icon');
			var $itemContainers = $accordians.find('.item-container');

			$itemContainers.find('.js-expand-toggle').data('collapsed', true);
			velocity($itemContainers.find('.js-fields'), 'slideUp', {duration: 300});
			$icons.removeClass('ion-arrow-down-b').addClass('ion-arrow-right-b');
		}

		function _addInlineChild(collectionName, domainName){
			_collapseChildren(collectionName);
			var domain = _.find(childDomains, function(d){return d.name == domainName;}),
				$containerLi = $('<li></li>')
				.addClass('item')
				.addClass('item-container')
				//.addClass('header')
				.append(inlineChildTmpl({domainLabel: domain.label || domain.name}));

			var childForm = new EditExistingForm({entity: {domainName: domain.name}});
			childForm.$element.addClass('js-fields');
			$containerLi.append(childForm.$element);
		
			var $ul = self.$element.find('.js-collection-'+ collectionName);
			$ul.closest('ul')
				.append($containerLi);

			var $header = $containerLi.find('.js-expand-toggle');

			var headerHammer = new Hammer($header[0]);
			headerHammer.on('press', function(ev){
				headerHammer.on('pressup', function(){
					setTimeout(function(){
						popupButtons.opened();
					}, 10);
				});

				var popupButtons = new PopupButtons({
					items: [{ value: 'remove', label: 'Remove', 'class': 'button-assertive'}],
				});

				popupButtons.on('click', function(key){
					if (key == 'remove')
						velocity($header.closest('.item-container'), 'fadeOut', {duration:400});

					popupButtons.remove();
				});

				popupButtons.show(ev.pointers[0], true);
			});

			headerHammer
				.on('tap', function(){
					var DURATION = 200;
					var $this = $header,
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

			setTimeout(function(){
				scroll.refresh();
			}, 100);
		}

		self.$element.find('.js-inline-add')
			.on('click', function(ev){
				var $this = $(this),
					collectionName = $this.data('collection'),
					domainNames = $this.data('domains').split(','),
					domains = childDomains.filter(function(d){return _.contains(domainNames, d.name);});

				var popupButtons = new PopupButtons({
					items: domains.map(function(d){ return {value: d.name, label: d.label};}),
				});

				popupButtons.on('click', function(domainName){
					_addInlineChild(collectionName, domainName);
					popupButtons.remove();
				});

				popupButtons.show(ev);
			});

	};

	self.$element.on('tap', '.js-child-link', function(){
		var $this = $(this),
			collectionName = $this.data('collection'),
			_id = $this.data('id');

		var child = _.find(_context.entity[collectionName], function(c){
			return (c._id || c.id) == _id;
		});
		_context.descend(child);
	});

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

util.inherits(EditTab, EventEmitter);
module.exports = EditTab;
