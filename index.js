
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

        // Loading module routes
        this.applicationFacade.server.loadRoutes('/app/routes', __dirname);

        // Loading models
        this.applicationFacade.loadModels(__dirname + '/app/models');

        // Checking Symbolic links
        var fs = require('fs');
        try {
            if (!fs.existsSync(DioscouriCore.ApplicationFacade.instance.basePath + '/public/multitenant')) {
                fs.symlinkSync(DioscouriCore.ApplicationFacade.instance.basePath + '/public/multitenant', __dirname + '/app/public', 'dir');
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
    };

    /**
     * Run module based on configuration settings
     */
    run () {
        super.run();
    };
}

/**
 * Set multitenant object as export entity
 *
 * @type {MultiTenant|exports|module.exports}
 */
Loader.MultiTenant = require('./lib/multitenant.js')

/**
 * Exporting module classes and methods
 */
module.exports = Loader;
