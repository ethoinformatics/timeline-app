var fs = require('fs'),
	mkdirp = require('mkdirp'),
	browserify = require('browserify'),
	lessify = require('node-lessify'),
	brfs = require('brfs'),
	vashify = require('vashify');

mkdirp.sync(__dirname + '/public/bundles');

var b = browserify();
b.transform(brfs); // inlines file contents.  used for reactive template strings
b.transform(lessify); // builds and applies css from .less files
b.transform(vashify); // compiles .vash files in to js template functions

b.add('./src/main.js');
b.bundle().pipe(fs.createWriteStream(__dirname + '/public/bundles/main.js'));
