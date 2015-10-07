// Using STRICT mode for ES6 features
"use strict";

/**
 * Module dependencies.
 */
var bcrypt = require('bcrypt-nodejs');

/**
 * Requiring Core Library
 */
var DioscouriCore = require('dioscouri-core');

/**
 * Requiring base Model
 */
var BaseModel = require('./basemodel.js');

/**
 * Require Multitenant Library
 *
 * @type {MultiTenant|exports|module.exports}
 */
var MultiTenant = require('../../libs/multitenant/multitenant.js');

/**
 * Require async library
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 *  Client model class
 *
 *  @author Sanel Deljkic <dsanel@dioscouri.com>
 */
class ClientModel extends BaseModel {
    /**
     * Model constructor
     */
    constructor(listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);
    }

    /**
     * Define Schema
     *
     * @override
     */
    defineSchema() {

        var Types = this.mongoose.Schema.Types;

        // Client Schema Object
        var schemaObject = {
            name: {type: String, unique: true, required: true},
            tenantId: {type: String, unique: true, required: true},
            subdomain: {type: String, index: true, required: true},
            hostname: {type: String, index: true, required: false},
            aliases: [String],
            isEnabled: Boolean,
            theme: String,
            owner: {type: Types.ObjectId, ref: 'user'},
            createdAt : {type: Date, 'default': Date.now},
            modifiedAt : {type: Date, 'default': Date.now},
            description: String
        };

        /**
         * Creating DBO Schema
         */
        var ClientDBOSchema = this.createSchema(schemaObject);

        /**
         * Returns primary hostname for client
         */
        ClientDBOSchema.methods.getPrimaryHostUrl = function () {
            var result = null;

            if (this.hostname != null && this.hostname != '') {
                result = 'http://' + this.hostname;
            } else if (this.subdomain != null && this.subdomain != '') {
                result = 'http://' + this.subdomain + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
            } else if (this.tenantId != null && this.tenantId != '') {
                result = 'http://' + this.tenantId + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
            }

            return result;
        };

        /**
         * Returns subdomain hostname for client
         */
        ClientDBOSchema.methods.getSubdomainHostUrl = function () {
            var result = null;

            if (this.subdomain != null && this.subdomain != '') {
                result = 'http://' + this.subdomain + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
            } else if (this.tenantId != null && this.tenantId != '') {
                result = 'http://' + this.tenantId + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
            }

            return result;
        };

        /**
         * Pre-save Hook for Client entity
         */
        ClientDBOSchema.pre('save', function (next) {
            this.wasNew = this.isNew;
            this.modifiedAt = new Date();

            next();
        });

        /**
         * Post-save Hook for Client entity
         */
        ClientDBOSchema.post('save', function (next) {
            if (this.wasNew) {
                /**
                 * Create pkgcloud container
                 */
                // TODO Revalidate PKG Cloud provider for Client
                var client = new DioscouriCore.PkgClient();
                client.client.createContainer({name: 'client_' + this._id}, function (err) {
                    if (err) {
                        return console.log(err.stack);
                    }
                });
            }

            var tenant = this;

            // Updating Tenant in the system. If it is registered.
            MultiTenant.instance.updateMasterTenant(tenant);

            if (typeof next == "function") {
                next();
            }
        });

        /**
         * Pre-remove Hook for Client entity
         */
        ClientDBOSchema.pre('remove', function () {
            var tenant = this;

            // Removing Tenant from the system. If it is registered.
            MultiTenant.instance.removeTenant(tenant, function () {
                ;
            });
        });

        // Registering schema and initializing model
        this.registerSchema(ClientDBOSchema);
    }

    /**
     * Load tenants configuration file
     *
     * @param callback
     */
    loadTenantsConfig (callback) {
        this.model.find({}, function (error, tenants) {
            callback(error, tenants);
        });
    }

    /**
     * Validating item before save
     *
     * @param item
     * @returns {array}
     */
    validate(item, validationCallback) {
        var validationMessages = [];

        if (item.name == '') {
            validationMessages.push('Name cannot be empty');
        }
        if (item.tenantId == '') {
            validationMessages.push('Tenant Id cannot be empty');
        }

        if (validationMessages.length == 0) {
            var searchPattern = item.id != null ? {"$and": [{tenantId: item.tenantId}, {_id: {"$ne": item.id.toString()}}]} : {tenantId: item.tenantId};

            this.model.findOne(searchPattern, function (error, document) {
                if (error != null) {
                    validationMessages.push(error.message);
                    return validationCallback(DioscouriCore.ValidationError.create(validationMessages));
                }

                if (document != null && (item.id == null || item.id.toString() != document.id.toString())) {
                    validationMessages.push('Client with the same Tenant Id already exists in the database');
                }

                return validationCallback(DioscouriCore.ValidationError.create(validationMessages));
            });
        } else {
            validationCallback(DioscouriCore.ValidationError.create(validationMessages));
        }
    }

    /**
     * Find tenant config by its Hostname
     */
    findTenantByHostname (hostname, callback) {
        var hostnameLower = hostname.toLowerCase();
        var subdomain = null;
        var domainParts = hostnameLower.split('.');
        if (domainParts.length > 2 && domainParts[0] != 'www') {
            subdomain = domainParts[0];
        } else if (domainParts.length > 3 && domainParts[0] == 'www') {
            subdomain = domainParts[1];
        }

        var $this = this;
        async.series([
            function (asyncCallback) {
                $this.model.findOne({hostname: hostnameLower}, function (error, item) {
                    if (error == null && item != null) {
                        callback(null, item);
                    } else {
                        asyncCallback(error);
                    }
                });
            },
            function (asyncCallback) {
                $this.model.findOne({subdomain: subdomain}, function (error, item) {
                    if (error == null && item != null) {
                        callback(null, item);
                    } else {
                        asyncCallback(error);
                    }
                });
            },
            function (asyncCallback) {
                $this.model.findOne({tenantId: subdomain}, function (error, item) {
                    if (error == null && item != null) {
                        callback(null, item);
                    } else {
                        asyncCallback(error);
                    }
                });
            }
        ], function(error) {
            callback(error, null);
        });
    }
}

/**
 * Creating instance of the model
 */
var modelInstance = new ClientModel('client');

/**
 * Exporting Model
 *
 * @type {Function}
 */
exports = module.exports = modelInstance;
