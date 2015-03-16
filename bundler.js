var fs = require('fs'),
	mkdirp = require('mkdirp'),
	browserify = require('browserify'),
	lessify = require('node-lessify'),
	vashify = require('vashify');

	mkdirp.sync(__dirname + '/ionic/www/bundles');

	var b = browserify();
	b.transform(lessify); // builds and applies css from .less files
	b.transform(vashify); // compiles .vash files in to js template functions

	b.add('./src/main.js');
	b.exclude('app');

	b.on('error', function(err){
		console.error(err);
	});
	var bundle = b.bundle();
	bundle.on('error', function(err){
		console.error(err);
	});

	bundle.pipe(fs.createWriteStream(__dirname + '/ionic/www/bundles/framework.js'));
