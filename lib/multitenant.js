
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring core Events module
 */
var events = require('events');

/**
 * Requiring Async library
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 * Tenant
 * @type {*}
 */
var Tenant = require('./tenant.js');

/**
 * Multi Tenants Host Controller
 * @type {*}
 */
var MultiTenantsHostController = require('./hostcontroller.js');

/**
 * Multitenant event
 *
 * @type {{TENANT_ADDED: string}}
 */
var MultiTenantEvents = {
    TENANT_ADDED: 'TENANT_ADDED'
}

/**
 *  Multi-Tenant handler
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class MultiTenant extends events.EventEmitter {

    /**
     * Multi-Tenant constructor
     */
    constructor () {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        /**
         * Requiring system logger
         *
         * @type {Logger|exports|module.exports}
         * @private
         */
        this._logger = console;

        /**
         * Checking that current instance is not initialized yet
         */
        if (MultiTenant._instance != null) {
            throw new Error('Could not reinitialize Multi Tenant Handler.');
        }

        // Set default loader
        var DefaultLoader = require('./loader/default.js');
        this._loader = new DefaultLoader();

        // We will use templates.js model by default.
        this._templateLoader = null;

        // Set Client Admin Tenants Locator
        this._adminTenants = {};
        this._hostnameLocator = {};

        /**
         * Initializing Host controller
         *
         * @type {*}
         * @private
         */
        this._hostController = new MultiTenantsHostController();

        // Initializing local values
        this._tenants = {};
    }

    /**
     * Static singleton instance of MultiTenant
     *
     * @return MultiTenant
     */
    static get instance () {
        if (MultiTenant._instance == null) {
            MultiTenant._instance = new MultiTenant();
        }

        return MultiTenant._instance;
    }

    /**
     * Set multitenant configuration
     */
    setConfig (value) {
        this._config = value;
    }

    /**
     * System configuration
     *
     * @returns {*}
     */
    get config () {
        return this._config;
    }

    /**
     * Set system logger
     */
    setLogger (logger) {
        this._logger = logger;
    }

    /**
     * Getter for Host Controller
     *
     * @returns {*}
     */
    get hostController () {
        return this._hostController;
    }

    /**
     * Getter for tenants map
     *
     * @returns {{}|*}
     */
    get tenantsMap () {
        return this._tenants;
    }

    /**
     * Search tenant by request and return tenant instance
     *
     * @param request
     */
    tenant (request) {
        var tenantId = request.session.tenantId;
        var tenantIdString = tenantId;
        if (tenantId == null) {
            var hostHeader = request.headers.host;
            var headerInfo = hostHeader.split(':');
            var hostname = headerInfo[0];

            tenantId = this.findTenant(hostname);

            request.session.tenantId = tenantId;
        }

        return this.getTenantById(tenantId);
    }

    /**
     * Search tenant by request and return tenant instance only in case it is enabled
     *
     * @param request
     */
    getEnabledTenantByRequest(request) {
        var tenantInstance = this.tenant(request);
        if (!tenantInstance.tenantConfig.isEnabled) {
            this._logger.log('## Tenant is not enabled: "%s". SKIPPING ', tenantInstance.tenantConfig.name);
            throw new Error('Tenant is not enabled: ' + tenantInstance.tenantConfig.name, 1038);
        }
        return tenantInstance;
    }

    /**
     * Search tenant by tenantId and return tenant instance
     *
     * @param tenantId
     */
    getTenantById(tenantId) {
        // Getting tenant
        if (this._tenants[tenantId] != null) {
            return this._tenants[tenantId];
        } else {
            this._logger.error('@@ Failed to find tenant %s', tenantId);
            throw new Error('Customer is not available. Please contact support.');
        }
    }

    /**
     * Loading tenants config
     *
     * @param callback
     */
    loadTenants (callback) {
        var locals = {};
        async.series([
            function (asyncCallback) {
                this.loadTenantsConfig(function (error, tenants){
                    if (error != null) {
                        return asyncCallback(error);
                    }

                    // TODO handle errors
                    locals.tenants = tenants;
                    asyncCallback();
                });
            }.bind(this),
            // Initializing tenants
            function (asyncCallback) {
                MultiTenant.tenantConfigs = [];
                MultiTenant.tenantsLocator = {};
                this._tenants = {};

                async.forEach(locals.tenants, function (item, foreachCallback){
                    this.addTenant(item, function (error) {
                        foreachCallback();
                    });
                }.bind(this), function (error) {
                    asyncCallback(error, MultiTenant.tenantConfigs);
                });
            }.bind(this)
        ], function (error) {
            if (callback != null) {
                callback(error, MultiTenant.tenantConfigs);
            }
        });
    }

    /**
     * Add tenant config and initialize tenant
     *
     * @param tenantConfig
     * @param callback
     */
    addTenant (tenantConfig, callback) {
        if (!tenantConfig.tenantId) {
            this._logger.warn('## WARNING. Tenant ID is not defined for "%s". SKIPPING', tenantConfig.name);

            return callback(new Error('Tenant ID is not defined', 1037));
        }

        MultiTenant.tenantsLocator[tenantConfig.tenantId] = tenantConfig;
        MultiTenant.tenantConfigs.push(tenantConfig);

        /**
         * Creating Tenant Instance
         * @type {*}
         */
        this._tenants[tenantConfig.tenantId] = new Tenant(tenantConfig, this);
        this._tenants[tenantConfig.tenantId].setTemplatesLoader(this._templateLoader);
        this._tenants[tenantConfig.tenantId].init(function (){
            // Initialization finished
            callback();
        });

        /**
         * Emiting event when creating new tenant
         */
        this.emit(MultiTenantEvents.TENANT_ADDED, {tenant: this._tenants[tenantConfig.tenantId]});
    }

    /**
     * Delete Tenant from multitenant
     *
     * @param tenantConfig
     * @param callback
     */
    removeTenant (tenantConfig, callback) {
        // If tenant not exists just skipping it
        if (MultiTenant.tenantsLocator[tenantConfig.tenantId] == null && this._tenants[tenantConfig.tenantId] == null) {
            if (callback != null) {
                return callback();
            } else {
                return;
            }
        }

        async.series([
            function (asyncCallback) {
                this._logger.log('## Deinitializing tenant Instance: ', tenantConfig.tenantId);
                delete MultiTenant.tenantsLocator[tenantConfig.tenantId];
                for (var i = 0; i < MultiTenant.tenantConfigs.length; i++) {
                    if (MultiTenant.tenantConfigs[i].tenantId == tenantConfig.tenantId) {
                        MultiTenant.tenantConfigs.splice(i, 1);
                        break;
                    }
                }

                asyncCallback();
            }.bind(this),
            // Remove Tenant Instance
            function (asyncCallback) {
                if (this._tenants[tenantConfig.tenantId] != null) {
                    this._tenants[tenantConfig.tenantId].destroy(function (error) {
                        delete this._tenants[tenantConfig.tenantId];
                        asyncCallback();
                    }.bind(this));
                } else {
                    asyncCallback();
                }
            }.bind(this)
        ], function (error) {
            if (callback != null) {
                callback(error, MultiTenant.tenantConfigs);
            }
        });
    }

    /**
     * Update Master Tenant in multitenant
     *
     * @param tenantConfig
     * @param callback
     */
    updateMasterTenant (tenantConfig, callback) {
        this.hostController.sendHostEvent('updateTenant', {tenantDetails: tenantConfig});

        this.updateTenant(tenantConfig, callback);
    }

    /**
     * Update Tenant in multitenant
     *
     * @param tenantConfig
     * @param callback
     */
    updateTenant (tenantConfig, callback) {
        async.series([
            // Remove old tenant instance
            function (asyncCallback) {
                this.removeTenant(tenantConfig, asyncCallback);
            }.bind(this),
            // Add new Tenant Instance
            function (asyncCallback) {
                this.addTenant(tenantConfig, asyncCallback);
            }.bind(this)
        ], function (error) {
            if (callback != null) {
                callback(error, MultiTenant.tenantConfigs);
            }
        });
    }

    /**
     * Set loader for tenants from some data source.
     * Loader is a function which run callback with parameters (error, tenants).
     *
     * @param loader
     */
    setTenantsLoader (loader) {
        this._loader = loader;
    }

    /**
     * Set loader for tenant templates from some data source.
     * Loader is a function which run callback with parameters (error, templates).
     *
     * @param loader
     */
    setTemplatesLoader (loader) {
        this._templateLoader = loader;
    }

    /**
     * Loads tenants config
     *
     * @param callback
     */
    loadTenantsConfig (callback) {
        this._loader.loadTenants(function (error, tenants) {
            callback(error, tenants);
        });
    }

    /**
     * Trying to find Tenant by its hostname
     *
     * @param hostname
     * @todo Apply robust logic to find tenant
     */
    findTenant (hostname) {
        var hostnameLower = hostname.toLowerCase();
        var subdomain = null;
        var domainParts = hostnameLower.split('.');
        if (domainParts.length > 2 && domainParts[0] != 'www') {
            subdomain = domainParts[0];
        } else if (domainParts.length > 3 && domainParts[0] == 'www') {
            subdomain = domainParts[1];
        }

        if (subdomain) {
            this._logger.log('## Checking subdomain: ', subdomain);
        }

        for (var i = 0; i < MultiTenant.tenantConfigs.length; i++) {
            var tenantConfig = MultiTenant.tenantConfigs[i];

            // Check hostname
            if (tenantConfig.hostname.toLowerCase() == hostnameLower) {
                return tenantConfig.tenantId;
            }

            // Check subdomain
            if ((tenantConfig.subdomain != null && tenantConfig.subdomain == subdomain) || tenantConfig.tenantId == subdomain) {
                return tenantConfig.tenantId;
            }

            // Find in aliases
            if (tenantConfig.aliases != null) {
                for (var j = 0; j < tenantConfig.aliases.length; j++) {
                    if (tenantConfig.aliases[j].toLowerCase() == hostnameLower) {
                        return tenantConfig.tenantId;
                    }
                }
            }
        }
    }

    /**
     * Starts Host controller Server
     *
     * @param callback
     */
    startHostController (callback) {
        this.hostController.startHostController(this._config.MULTITENANT_HOST_CONTROLLER, callback);
    }

    /**
     * Stops Host controller Server
     *
     * @param callback
     */
    stopHostController (callback) {
        this.hostController.stopHostController(callback);
    }

    /**
     * Initialize Host Client
     *
     * @param callback
     */
    initHostClient (callback) {
        this.hostController.initHostClient(this._config.MULTITENANT_HOST_CONTROLLER, callback);

        var $this = this;
        this.hostController.clientSocket.on('updateTenant', function(data){
            $this._logger.log('$$$$ Received event updateTenant from the Host Controller');
            if (data != null && data.tenantDetails != null) {
                $this.updateTenant(data.tenantDetails);
            }
        });
    }
}

/**
 * Tenants locator map
 * @type {{}}
 */
MultiTenant.tenantsLocator = {};
MultiTenant.tenantConfigs = [];

MultiTenant.MultiTenantEvents = MultiTenantEvents;

/**
 * Exporting MultiTenant
 *
 * @type {Function}
 */
exports = module.exports = MultiTenant;
