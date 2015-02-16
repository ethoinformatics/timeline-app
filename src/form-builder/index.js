require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	template = require('./index.vash'),
	inlineFormTemplate = require('./inline-create.vash'),
	app = require('app'),
	vash = require('vash-runtime'),
	templates = {
		text: require('./text-field.vash'),
		select: require('./select.vash'),
		lookup: require('./select.vash'),
		textarea: require('./textarea-field.vash'),
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



function _buildDataEntryForm(domain, data){
	var metadata = domain.getService('form-fields');
	var isNew = !data;
	data = Object(data);

	var $root = $(template({
		tabs: metadata,
		entity: data,
	}));

	// find the coded fields, fetch their values, and finally populate the select elements.
	_.chain(metadata)
		.pluck('fields')
		.map(function(o){ return _.pairs(o); })
		.flatten(true)
		.map(function(pair){
			return _.extend({}, {name: pair[0]}, pair[1]);
		})
		.filter(function(field){ return /^lookup$/i.test(field.type); })
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
			inlineForm = _buildDataEntryForm(inlineDomain),
			$inlineContainer = $(inlineFormTemplate({
				label: inlineDomain.label,
			}));

		$inlineContainer
			.css('right', window.innerWidth-ev.pageX)
			.css('top', ev.pageY)
			.show()
			.find('.js-form-container')
			.append(inlineForm.$element);

		$inlineContainer.find('.js-close')
			.click(function(){
				$inlineContainer.remove();
			});

		$inlineContainer.find('.js-inline-save')
			.click(function(){
				var entityManager = inlineDomain.getService('entity-manager'),
					descManager = inlineDomain.getService('description-manager'),
					entity = inlineForm.getData();

				entityManager.save(entity)
					.then(function(result){
						$inlineContainer.remove();
						
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

		$('body').append($inlineContainer);
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

