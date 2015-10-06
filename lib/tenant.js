
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
 * Tenant Model
 * @type {*}
 */
var TenantModel = require('./tenantmodel.js');

/**
 * Tenant View
 * @type {*}
 */
var TenantView = require('./tenantview.js');

/**
 *  Multi-Tenant handler
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class Tenant extends events.EventEmitter {

    /**
     * Multi-Tenant constructor
     */
    constructor (tenantConfig) {
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
         * Tenant configuration
         */
        this._tenantConfig = tenantConfig;
    }

    /**
     * Return Tenants Config
     *
     * @returns {*}
     */
    get tenantConfig () {
        return this._tenantConfig;
    }

    /**
     * Return Tenants Config
     *
     * @param {*} value
     */
    set tenantConfig (value) {
        this._tenantConfig = value;
    }

    /**
     * Return Tenant Model
     *
     * @returns {TenantModel}
     */
    get model () {
        return this._model;
    }

    /**
     * Return Tenant View
     *
     * @returns {TenantView}
     */
    get view () {
        return this._view;
    }

    /**
     * Return Tenant Map
     *
     * @returns {{}}
     */
    get templates () {
        return this._templates;
    }

    /**
     * Initialize Tenant
     *
     * @param callback
     */
    init (callback) {
        async.series ([
            // Initializing Tenant Database Model
            function (asyncCallback) {
                this._logger.info('## Initializing tenant model for ', this.tenantConfig.tenantId);
                this._model = new TenantModel(this.tenantConfig, this);
                this._model.connect(function(error){
                    asyncCallback(error);
                }.bind(this));
            }.bind(this),

            // Initialize templates list
            function (asyncCallback) {
                this.loadUITemplates(asyncCallback);
            }.bind(this),

            // Initialize View
            function (asyncCallback) {
                // Initializing View
                this._logger.log('## Initialized view for tenant: %s', this.tenantConfig.tenantId);
                this._view = new TenantView(this);
                asyncCallback();
            }.bind(this)
        ], function (error) {
            if (error) {
                this._logger.error(error.message);
            }

            callback(error);
        }.bind(this));
    }

    /**
     * Destroy Tenant
     *
     * @param callback
     */
    destroy (callback) {
        async.series ([
            // Initializing Tenant Database Model
            function (asyncCallback) {
                this._logger.info('## Disconnecting tenant model for ', this.tenantConfig.tenantId);
                this._model.disconnect(function(error){
                    asyncCallback(error);
                }.bind(this));
            }.bind(this)
        ], function (error) {
            if (error) {
                this._logger.error(error.message);
            }

            callback(error);
        }.bind(this));
    }

    /**
     * Initialize List of UI Templates
     *
     * @param callback
     */
    loadUITemplates (callback) {
        // TODO define appropriate loader for UI templates
        var collection = this.model.collection('template');
        collection.model.find({}, function(error, items){
            if (error != null) {
                console.warn('Failed to load UI Templates for tenant: %s', this.tenantConfig.tenantId);
                callback(error);
            } else {
                console.warn('## Successfully loaded UI Templates for tenant: %s, count: %s', this.tenantConfig.tenantId, items.length);
                this._templates = {};
                for (var i = 0; i < items.length; i++) {
                    this._templates[items[i].path] = items[i];
                }

                callback(null, items);
            }
        }.bind(this));
    }

    /**
     * Returns Template by path
     *
     * @param basepath
     */
    getTemplateByPath (basepath) {
        var templatePath = basepath.replace(/[\\,\/]+/g, '\/');
        if (templatePath.length == 0 || templatePath[0] != '/') {
            templatePath = '/' + templatePath;
            this._logger.debug('Validating template path: %s', templatePath);
        }

        return this.templates[templatePath];
    }
}

/**
 * Exporting MultiTenant
 *
 * @type {Function}
 */
exports = module.exports = Tenant;
