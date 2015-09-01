require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	template = require('./index.vash'),
	searchPopupTemplate = require('./search-popup.vash'),
	createPopupTemplate = require('./create-popup.vash'),
	app = require('app')(),
	Scroll = require('iscroll'),
	vash = require('vash-runtime'),
	templates = {
		text: require('./fields/text.vash'),
		date: require('./fields/date.vash'),
		select: require('./fields/select.vash'),
		lookup: require('./fields/select.vash'),
		textarea: require('./fields/textarea.vash'),
	};

vash.helpers.field = function(fieldName, field, data){
	var t = templates[field.type] || templates.text,
		features = field.features || [];

	features = features.map(function(str){return str.toLowerCase();});

	var items = _.chain(field.items)
		.toArray()
		.map(function(item){
			return {
				value: item.value || item.label,
				label: item.label || item.value,
			};
		})
		.value();

	return t({
		name: fieldName,
		domain: field.domain,
		label: field.label || fieldName,
		items: items,
		value: data ? data[fieldName] : undefined,
		isInlineCreate: _.contains(features, 'inline-create'),
	});
};

function _buildDataEntryForm(domain, data, fieldFilter){
	if (!fieldFilter && _.isFunction(data)){
		fieldFilter = data;
		data = undefined;
	}

	var metadata = domain.getService('form-fields');
	var isNew = !data;

	// we allow two formats.
	// an array of tabs, or just an object of fields.
	if (!_.isArray(metadata)){
		metadata = [
				{ fields: metadata, }
			];
	}
	if (fieldFilter){
		metadata = metadata.map(function(tab){
			var filteredTab = _.cloneDeep(tab),
				keys = Object.keys(filteredTab.fields);

			keys.forEach(function(key){
				if (!fieldFilter(filteredTab.fields[key])){
					delete filteredTab.fields[key];
				}
			});

			return filteredTab;
		});
	}

	data = Object(data);

	var $root = $(template({
		tabs: metadata,
		entity: data,
	}));

	// find the coded fields, fetch their values, and finally populate the select elements.
	_.chain(metadata)
		.pluck('fields')
		.map(function(o){ return _.pairs(o); })
		.flatten()
		.map(function(pair){
			return _.extend({}, {name: pair[0]}, pair[1]);
		})
		.filter(function(field){ 
			return /^lookup$/i.test(field.type); })
		.value()
		.forEach(function(field){
			var $select = $root.find('select[data-name='+field.name+']'),
				codeDomain = app.getDomain(field.domain),
				descManager = codeDomain.getService('description-manager');

			codeDomain
				.getService('entity-manager')
				.getAll()
				.then(function(codeValues){
					_.chain(codeValues)
						.map(function(codeValue){
							return {
									_id: codeValue._id,
									text: descManager.getShortDescription(codeValue),
								};
						})
						.sortBy('text')
						.value()
						.forEach(function(codeValue){
							var $opt = $('<option></option>')
								.attr('value', codeValue._id)
								.text(codeValue.text);

							if (data && data[field.name] == codeValue._id){
								$opt.prop('selected', true);
							}

							$select.append($opt);
						});
				})
				.catch(function(err){
					console.log('error loading codes for '+field.name);
					console.error(err);
				});
		});

	var $btnInlineCreate = $root.find('.js-inline-create');
	var $tabButtons = $root.find('.js-tabs *[data-index]');
	var $tabs = $root.find('.js-tab-container *[data-index]');

	$tabButtons.click(function(){
		var $this = $(this);

		$tabButtons.removeClass('active');
		$this.addClass('active');
		$tabs.hide();
		$($tabs[$this.data('index')]).show();
	});

	$btnInlineCreate.click(function(ev){
		ev.preventDefault();

		var $this = $(this),
			$container = $this.closest('li'),
			domainName = $container.data('domain-name'),
			inlineDomain = app.getDomain(domainName),
			inlineSearchForm = _buildDataEntryForm(inlineDomain, function(field){
					return field.type=='lookup';
				}),
			$searchPopup = $(searchPopupTemplate({
				label: inlineDomain.label,
			})),
			scroll = new Scroll($searchPopup.find('.result-scroll-wrapper')[0], {
				mouseWheel: true,
			});

		function _showCreatePopup(){
			var $createPopup = $(createPopupTemplate({
					label: inlineDomain.label,
				})),
				inlineCreateForm = _buildDataEntryForm(inlineDomain, inlineSearchForm.getData())
				;

			_setPopupSize($createPopup);
			$createPopup
				.find('.js-form-container')
				.append(inlineCreateForm.$element);

			$createPopup.find('.js-close')
				.click(function(){
					$createPopup.remove();
				});

			$createPopup.find('.js-inline-save')
				.click(function(){
					var entityManager = inlineDomain.getService('entity-manager'),
						descManager = inlineDomain.getService('description-manager'),
						entity = inlineCreateForm.getData();

					entityManager.save(entity)
						.then(function(result){
							$createPopup.remove();
							
							var $newOption = $('<option></option>')
								.text(descManager.getShortDescription(entity))
								.attr('value', result.id);

							$container
								.find('select')
								.append($newOption)
								.val(result.id);
						})
						.catch(function(err){
							console.error(err);
						});
					
			});

			$('body').append($createPopup);
		}

		function _setPopupSize($el){
			$el
				.css('right', window.innerWidth-ev.pageX)
				.css('top', ev.pageY)
				.css('max-height', window.innerHeight-(ev.pageY+24))
				.show();
		}
		$searchPopup
			.find('.js-create-new')
			.click(function(){

			});
		$searchPopup
			.find('.js-search-clear')
			.click(function(){
				inlineSearchForm.$element
					.find('select')
					.val('select one'); //todo: don't hardcode this

				_doSearch();
			});

		function _doSearch(){
			var criteria = inlineSearchForm.getData();
			var inlineEntityManager = inlineDomain.getService('entity-manager'),
				inlineDescManager = inlineDomain.getService('description-manager');

			inlineEntityManager.getAll()
				.then(function(entities){
					var fieldPairs = _.pairs(criteria)
						.filter(function(pair){
							var value = pair[1];

							return !!value;
						});

					return _.chain(entities)
						.toArray()
						.filter(function(entity){
							var isPass = true;
							fieldPairs.forEach(function(fieldPair){
									var name = fieldPair[0],
										value = fieldPair[1];

									if (entity[name] != value)
										isPass = false;
								});

							return isPass;
						})
						.value();
				})
				.then(function(entities){

					var $resultContainer = $searchPopup
						.find('.js-result-container');
					
					$resultContainer
						.find('.js-search-result')
						.remove();

					if (_.isEmpty(entities)){
						$resultContainer.append(
							$('<li></li>')
								.text('No matches...')
								.addClass('js-search-result search-result item')
							);
					}

					_.chain(entities)
						.sortBy(function(entity){
							return (inlineDescManager.getShortDescription(entity) || '').toLowerCase();
						})
						.value()
						.forEach(function(entity){
							var $item = $('<li></li>')
								.text(inlineDescManager.getShortDescription(entity))
								.addClass('js-search-result search-result item');

							$item.click(function(){
								$container.find('select').val(entity._id);
								$searchPopup.remove();
							});

							$resultContainer.append($item);
						});
				})
				.then(function(){
					scroll.refresh();
				});
		}

		_doSearch();

		inlineSearchForm.$element
			.find('select')
			.on('change', function(){
				_doSearch();
			});

		_setPopupSize($searchPopup);
		$searchPopup
			.find('.js-form-container')
			.append(inlineSearchForm.$element);

		$searchPopup.find('.js-close')
			.click(function(){
				$searchPopup.remove();
			});

		$searchPopup.find('.js-create-new')
			.click(function(){
				$searchPopup.remove();
				_showCreatePopup();
			});

		$('body').append($searchPopup);
	});

	if (isNew || _.isEmpty(domain.getService('child-domains'))){
		$tabButtons.filter('.js-children-tab-item').hide();
	}

	return {
		setData: function(formData){
			$root
				.find('*[data-name]')
				.each(function(){
					var $this = $(this),
						name = $this.data('name'),
						value = formData[name];

						$this.val(value);
				});
		},
		getData: function(){
			var formData = {
				domainName: domain.name,
			};
			$root
				.find('*[data-name]')
				.each(function(){
					var $this = $(this),
						name = $this.data('name'),
						value = $this.val();

					formData[name] = value;
				});

			return _.extend({}, data, formData);
		},
		$element: $root,
	};
}

module.exports.buildDataEntryForm = _buildDataEntryForm;

