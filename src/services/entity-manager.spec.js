var registrar = require('../registrar/');
var expect = require('chai').expect;


describe('entity manager', function(){
	it('should generate an id property for a new child', function(){
		// todo: get registrar out of here
		var PARENT_DOMAIN_NAME = Date.now()+'parent';
		var CHILD_DOMAIN_NAME = Date.now()+'child';
		var p = registrar.createDomain({name: PARENT_DOMAIN_NAME});
		var c = registrar.createDomain({name: CHILD_DOMAIN_NAME});
		p.register('myList', c);

		var parentEntity = {myList:[], };
		var childEntity = {message: 'hey there, i am a child entity.'};

		var registry = registrar.getRegistry();
		var childDomain = registry.getDomain(CHILD_DOMAIN_NAME);
		var childEntityManager = childDomain.getService('entity-manager');

		childEntityManager.addToParent(parentEntity, childEntity);

		expect(childEntity.id).to.be.ok;
	});
});

