
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring Core Library
 *
 * WARNING: Core modules MUST be included from TOP Level Module.
 * All dependencies for core module must be excluded from the package.json
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');

/**
 * Loader class for the model
 *
 * @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class Loader extends DioscouriCore.AppBootstrap {
    /**
     * Model loader constructor
     */
    constructor () {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        /**
         * Module name/version
         *
         * @type {null}
         * @private
         */
        this._moduleName = 'Multitenant Architecture Module';
        this._moduleVersion = '0.0.2';
    }

    /**
     * Initializing module configuration
     */
    init () {
        super.init();

        Loader.Controllers = {
            Admin: {
                Clients: require('./app/controllers/admin/clients.js')
            }
        };

        // Loading module routes
        this.applicationFacade.server.loadRoutes('/app/routes', __dirname);

        // Loading models
        this.applicationFacade.loadModels(__dirname + '/app/models');

        // Initializing Library Exports
        this.applicationFacade.registry.push('MultiTenant', Loader.MultiTenant);
        this.applicationFacade.registry.push('MultiTenant.Controllers.Admin.Clients', Loader.Controllers.Admin.Clients);
        this.applicationFacade.registry.push('MultiTenant.Models.Base', Loader.Models.Base);
        this.applicationFacade.registry.push('MultiTenant.Models.Client', Loader.Models.Client);
        this.applicationFacade.registry.push('MultiTenant.Models.Tenant.Base', Loader.Models.Tenant.Base);
        this.applicationFacade.registry.push('MultiTenant.Models.Tenant.Template', Loader.Models.Tenant.Template);

        // Checking Symbolic links
        var fs = require('fs');
        try {
            if (!fs.existsSync(DioscouriCore.ApplicationFacade.instance.basePath + '/public/multitenant')) {
                fs.symlinkSync(DioscouriCore.ApplicationFacade.instance.basePath + '/public/multitenant', __dirname + '/public', 'dir');
            }
        } catch (error) {
            console.error('ERROR: Failed to create symbolic links for ', this._moduleName);
            console.error(error.message);
        }
    }

    /**
     * Bootstrapping module
     *
     * MongoDB is available on this stage
     */
    bootstrap () {
        super.bootstrap();

        // Initializing multitenant support
        this.navigation.create({name: 'Clients', icon: 'fa-bank', order: 85});
        this.navigation.create({name: 'Accounts', icon: 'fa-bank', url: '/admin/clients', parent: 'Clients'});
    };

    /**
     * Run module based on configuration settings
     */
    run () {
        super.run();

        this.navigation = this.applicationFacade.registry.load('Admin.Models.Navigation');
    };
}

/**
 * Set multitenant object as export entity
 *
 * @type {MultiTenant|exports|module.exports}
 */
Loader.MultiTenant = require('./lib/multitenant.js');
Loader.Models = {
    Base: require('./app/models/basemodel.js'),
    Client: require('./app/models/client.js'),
    Tenant: {
        Base: require('./app/models/tenant/basemodel.js'),
        Template: require('./app/models/tenant/template.js')
    }
}
Loader.DioscouriCore = DioscouriCore;

/**
 * Exporting module classes and methods
 */
module.exports = Loader;
