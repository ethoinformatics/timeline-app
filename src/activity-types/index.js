module.exports = [
	{key: 'working', name: 'Working', fields: require('./working.json') },
	{key: 'studying', name: 'Studying', fields: require('./studying.json') },
	{key: 'sleeping', name: 'Sleeping', ctor: require('./sleeping/') },
];
