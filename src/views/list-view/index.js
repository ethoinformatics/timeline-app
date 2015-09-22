require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
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
					$ul.append(itemTemplate(_createViewModel(entity)));
				});

				scroll.refresh();
			});
	};

	self.$element.on('click', '.js-item', function(){
		var $this = $(this),
			_id = $this.data('id').toString(),
			domainName = $this.data('domain');

		var domain = app.getDomain(domainName),
			entityManager = domain.getService('entity-manager');

		console.log('opening: ' + domainName + ' ' + _id);

		entityManager.byId(_id)
			.then(function(entity){
				if (!entity) return window.alert('unable to find entity');
				var m = new ViewExistingDialog({ entity: entity, });
				m.show();
			})
			.catch(function(err){
				console.error(err);
			});
	});

	self.refresh();
}

module.exports = ListPage;
