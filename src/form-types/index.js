module.exports = [
	{
		key: 'observer-activity', 
		name: 'Observer Activity', 
		fields: require('./observer-activity.json')
	},
	{
		key: 'follow', 
		name: 'Follow', 
		fields: require('./follow.json')
	},
	{
		key: 'sighting', 
		name: 'Sighting', 
		fields: require('./sighting.json') 
	},
	{
		key: 'environment', 
		name: 'Environment', 
		fields: require('./environment.json')
	},
	{
		key: 'custom', 
		name: 'Custom Example', 
		ctor: require('./custom-form-example/') 
	},
];
