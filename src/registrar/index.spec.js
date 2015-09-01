var registrar = require('./index.js');
var expect = require('chai').expect;

describe('the registrar', function(){
	it('should be able to create a domain', function(){
		var domain = registrar.createDomain({name: 'test_domain'});

		expect(domain).to.be.ok;
		expect(domain.name).to.be.equal('test_domain');
		expect(domain.register).to.be.a('function');
	});

	it('should be able to register a child domain', function(){
		var p = registrar.createDomain({name: 'parent_domain'});
		var c = registrar.createDomain({name: 'child_domain'});
		p.register('myList', c);

		var registry = registrar.getRegistry();
		var children = registry.getDomain('parent_domain').getChildren();

		expect(children).to.be.ok;
		console.dir(children);
		expect(children).to.be.have.length(1);
		expect(children[0]).to.be.ok;
		expect(children[0].name).to.be.equal('child_domain');
	});
});
