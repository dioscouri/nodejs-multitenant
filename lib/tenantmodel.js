
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring core Events module
 */
var events = require('events');

/**
 * Requiring core Path module
 */
var path = require('path');

/**
 * Requiring core FS module
 */
var fs = require('fs');

/**
 * Requiring Core Library
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');

/**
 * Requiring Mongoose library
 *
 * @type {*|Object}
 */
// var mongoose = process.mainModule.require('mongoose');
var mongoose = DioscouriCore.ApplicationFacade.instance.mongoose;

/**
 *  Tenant Model
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class TenantModel extends events.EventEmitter {

    /**
     * Model constructor
     */
    constructor (tenantConfig, tenant) {
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
        if (tenant.multitenant.config != null) {
            this._tenantConfig.mongodbUrl = 'mongodb://' + tenant.multitenant.config.MONGODB_TENANTS_HOST + ':' + tenant.multitenant.config.MONGODB_TENANTS_PORT + '/' + 'tenant_' + this._tenantConfig.tenantId;
        }

        /**
         * Tenant instance
         */
        this._tenant = tenant;

        /**
         * Collections Map
         *
         * @type {{}}
         * @private
         */
        this._collections = {};

        /**
         * Base path for models
         *
         * @type {string}
         */
        this.modelsPath = path.dirname(process.mainModule.filename) + '/app/models/tenant/';
    }

    /**
     * Returns Mongoose Instance
     *
     * @returns {*|mongoose|module.exports|*}
     */
    get mongoose (){
        return this._mongoose;
    }

    /**
     * Tenant Instance
     *
     * @returns {Tenant}
     */
    get tenant (){
        return this._tenant;
    }
    /**
     * Tenant Instance
     *
     * @param {Tenant} value
     */
    set tenant (value){
        this._tenant = value;
    }

    /**
     * Return Tenants Config
     *
     * @returns {*|TenantModel.tenantConfig}
     */
    get tenantConfig (){
        return this._tenantConfig;
    }

    /**
     * Initialize Mongoose connection
     */
    connect (callback) {
        // Initializing mongoose
        this._mongoose = mongoose.createConnection(this.tenantConfig.mongodbUrl);

        // Workaround for missing Schema Object in Mongoose Client
        this._mongoose.Schema = mongoose.Schema;
        this._mongoose.SchemaTypes = mongoose.SchemaTypes;
        this._mongoose.Types = mongoose.SchemaTypes;

        // Handling connect event
        this._mongoose.on('connected', function(){
            this._logger.info('#### Tenant Successfully connected to MongoDB server. %s', this.tenantConfig.mongodbUrl);
            this.emit('connected');
            if (callback != null) callback();
        }.bind(this));

        // Handling error event
        this._mongoose.on('error', function(){
            this._logger.error('#### Tenant Failed to connect to MongoDB server. %s, %s', this.tenantConfig.tenantId, this.tenantConfig.mongodbUrl);
            // this.emit('error');
        }.bind(this));

        // Handling disconnect event
        this._mongoose.on('disconnected', function(){
            this._logger.warn('#### WARNING: Tenant disconnected from the MongoDB server. %s', this.tenantConfig.mongodbUrl);
            this.emit('disconnected');
        }.bind(this));

        // If the Node process ends, close the Mongoose connection
        process.setMaxListeners(256);
        process.on('SIGINT', function() {
            this.mongoose.close(function () {
                console.error('#### Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        }.bind(this));
    }

    /**
     * Close Mongoose connection
     */
    disconnect (callback) {
        // Handling connect event
        this._mongoose.close(function(){
            this._logger.info('#### Tenant Successfully Disconnected from MongoDB server. %s', this.tenantConfig.mongodbUrl);
            if (callback != null) callback();
        }.bind(this));
    }

    /**
     * Returns collection instance
     *
     * @param collectionName
     */
    collection (collectionName, collectionFile) {
        // Check collection
        if (this._collections[collectionName] == null) {
            var CollectionClass = this.getModelClassDefinition(collectionName, collectionFile);

            /**
             * Initializing model instance
             */
            var collectionInstance = new CollectionClass(collectionName);
            collectionInstance.mongoose = this.mongoose;
            collectionInstance.tenant = this.tenant;
            collectionInstance.init();

            // Set instance of the model
            this._collections[collectionName] = collectionInstance;
        }

        return this._collections[collectionName];
    }

    /**
     * Returns definition for specified model
     *
     * @param collectionName
     * @param collectionFile
     */
    getModelClassDefinition (collectionName, collectionFile) {
        // Check collection
        var fileName = collectionFile != null ? collectionFile : collectionName + '.js';

        // Trying to find in parent models dir
        var modelPath = path.normalize(this.modelsPath + fileName);
        this._logger.log('## Trying to initialize model: %s', modelPath);

        // Trying to find in parent models dir
        if (!fs.existsSync(modelPath)) {
            var modelPath = path.normalize(path.join(this.modelsPath, "client", fileName));
            this._logger.log('## Trying to initialize model: %s', modelPath);
        }

        if (!fs.existsSync(modelPath)) {
            // Trying local tenant dir
            modelPath = path.normalize(path.dirname(__dirname) + '/app/models/tenant/' + fileName)
            this._logger.log('## Model file not found, trying another one: %s', modelPath);

            // Trying local models dir
            if (!fs.existsSync(modelPath)) {
                modelPath = path.normalize(path.dirname(__dirname) + '/app/models/' + fileName)
                this._logger.log('## Model file not found, trying another one: %s', modelPath);
            }
        }

        var CollectionClass = require(modelPath);

        return CollectionClass;
    }
}

/**
 * Exporting MultiTenant
 *
 * @type {Function}
 */
exports = module.exports = TenantModel;
