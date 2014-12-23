require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	template = require('./index.vash'),
	vash = require('vash-runtime'),
	templates = {
		text: require('./text-field.vash'),
		select: require('./select.vash'),
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

