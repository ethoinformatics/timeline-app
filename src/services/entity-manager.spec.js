var registrar = require('../registrar/');
var expect = require('chai').expect;


describe('entity manager', function(){
	it('should generate an id property for a new child', function(){
		// todo: get registrar out of here
		var p = registrar.createDomain({name: 'parent_domain'});
		var c = registrar.createDomain({name: 'child_domain'});
		p.register('myList', c);

		var parentEntity = {myList:[], };
		var childEntity = {message: 'hey there, i am a child entity.'};

		var registry = registrar.getRegistry();
		var childDomain = registry.getDomain('child_domain');
		var childEntityManager = childDomain.getService('entity-manager');

		childEntityManager.addToParent(parentEntity, childEntity);

		expect(childEntity.id).to.be.ok;
	});
});

