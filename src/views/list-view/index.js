require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	Hammer = require('hammerjs'),
	q = require('q'),
	Scroll = require('iscroll'),
	app = require('app')(),
	ViewExistingDialog = require('../view-existing-dialog'),
	pageTemplate = require('./index.vash'),
	itemTemplate = require('./item.vash');


function _getTopLevelDomains(){
	var domains = app.getDomains()
		.filter(function(domain){
			return !domain.getService('code-domain') && !/^_/.test(domain.name);
		});

	return domains.filter(function(d){
		return !_.any(domains, function(otherDomain){
			return !!_.find(otherDomain.getChildren(), function(d2){
				return d2.name == d.name;
			});
		});
	});
}

function _getEntities(){
	return _.chain(_getTopLevelDomains())
		.map(function(domain){
			var entityManager = domain.getService('entity-manager');
			return entityManager.getAll();
		})
		.thru(q.all)
		.value()
		.then(function(results){
			return _.chain(results)
				.flatten()
				.sortBy(function(d){
					var domain = app.getDomain(d.domainName);
					var sortBy = domain ? domain.getService('sort-by') : false;

					if (!sortBy) return d._id || d.id;

					return d[sortBy];
				})
				.reverse()
				.value();
		});
}

function _createViewModel(entity){
	var domain = app.getDomain(entity.domainName),
		descManager = domain.getService('description-manager');

	return {
		label: descManager.getShortDescription(entity),
		domainName: entity.domainName,
		id: entity._id || entity.id,
	};
}
function ListPage(){
	var self = this;

	self.$element = $(pageTemplate({ }));
	var scroll = new Scroll(self.$element.find('.scroll-wrapper')[0], {
			mouseWheel: true,
			scrollbars: true,
		});

	self.refresh = function(){
		_getEntities()
			.then(function(entities){
				var $ul = self.$element.find('ul.list');
				$ul.empty();

				entities.forEach(function(entity){
					var $item = $(itemTemplate(_createViewModel(entity)));
					$ul.append($item);
					var hammer = new Hammer($item[0]);
					hammer.on('tap', _itemClick.bind(null, entity.domainName, entity._id));


				});

				scroll.refresh();
			});
	};

	function _itemClick(domainName, _id){
		console.log('opening: ' + domainName + ' ' + _id);
		var domain = app.getDomain(domainName),
			entityManager = domain.getService('entity-manager');


		entityManager.byId(_id)
			.then(function(entity){
				if (!entity) return window.alert('unable to find entity');
				var m = new ViewExistingDialog({ entity: entity, });
				m.show();
			})
			.catch(function(err){
				console.error(err);
			});
	}

	self.refresh();
}

module.exports = ListPage;
