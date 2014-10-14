module.exports = [
	{key: 'working', name: 'Working', fields: require('./working.json') },
	{key: 'basic', name: 'Basic Activity', fields: require('./basic.json') },
	{key: 'sleeping', name: 'Sleeping', ctor: require('./sleeping/') },
];
