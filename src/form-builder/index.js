require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	template = require('./index.vash'),
	app = require('app'),
	vash = require('vash-runtime'),
	templates = {
		text: require('./text-field.vash'),
		select: require('./select.vash'),
		lookup: require('./select.vash'),
		textarea: require('./textarea-field.vash'),
	};

vash.helpers.field = function(fieldName, field, data){
	var t = templates[field.type] || templates.text;

	return t({
		name: fieldName,
		label: field.label || fieldName,
		items: field.type === 'select' ? field.items || [] : [],
		value: data ? data[fieldName] : undefined,
	});
};



module.exports.buildDataEntryForm = function(domain, data){
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

	var $tabButtons = $root.find('.js-tabs *[data-index]');
	var $tabs = $root.find('.js-tab-container *[data-index]');
	$tabButtons.click(function(){
		var $this = $(this);

		$tabButtons.removeClass('active');
		$this.addClass('active');
		$tabs.hide();
		$($tabs[$this.data('index')]).show();
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
			var formData = {};
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
};

