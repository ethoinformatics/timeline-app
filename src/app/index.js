import bootstrapper from './bootstrapper';

// Temporary Stub
const registry = {};

function App() {
  const settings = Object.create(null);

  // Register a service through registry
  // This is currently a noop
  /* this.register = (serviceName, ...args) => {
    registry.setGlobalService(serviceName, args);
  }; */

  this.createDomain = (opts) => {
    const options = (typeof opts === 'string') ? { name: opts } : opts;

    const domain = registry.createDomain(options);

    return {
      _isEthoinfoDomain: true,
      name: domain.name,
      register: (serviceName, service, relationshipOpts) => {
        const relationshipOptions = Object.assign({}, relationshipOpts);

        // eslint-disable-next-line no-underscore-dangle
        if (serviceName && serviceName._isEthoinfoDomain) {
          registry.setChildDomain(options.name, 'children', serviceName);

        // eslint-disable-next-line no-underscore-dangle
        } else if (service._isEthoinfoDomain) {
          registry.setChildDomain(options.name, serviceName, service, relationshipOptions);
        } else {
          registry.setDomainService(options.name, serviceName, service);
        }
      }
    };
  };


  this.setting = (settingName, value) => {
    if (value !== undefined) {
      settings[settingName] = value;
    }

    return settings[settingName];
  };


  this.getRegistry = () => {
    registry.setting = self.setting.bind(self);
    return registry;
  };

  this.run = () => {
    // Bootstrap UI ->
    // Instantiate components and build up DOM
    console.log(bootstrapper);
    bootstrapper.bootstrap();
    // instantiate the app, with the registry of services
    // require('../app.js')(self.getRegistry());
    // build the DOM elements, and load Objects
    // require('../main.js');
  };
}

module.exports = App;
