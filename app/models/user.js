
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
 * Requiring base Model
 */
var BaseModel = require('./basemodel.js');

/**
 * Require async library
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 *  Client User model
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class ClientUserModel extends BaseModel {
    /**
     * Model constructor
     */
    constructor (listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);

        // Updating user schema
        this.updateSchema();
    }

    /**
     * Update Schema
     *
     * @override
     */
    updateSchema() {

        var $this = this;

        // Updating schema for user
        this.schema.add({
            "client": {type: this.mongoose.Schema.Types.ObjectId, ref: 'client'}
        });
        this._model = this.mongoose.model('user', this.schema);
        // this.schema.path("client", {type: this.mongoose.Schema.Types.ObjectId, ref: 'client'});
        // console.log(this.schema);

        // Enqueue user Update
        this.schema.post('save', function (document) {
            // If current user is a tenant user, we should update it also
            if (document.client != null || (document._doc != null && document._doc.client != null)) {
                $this.logger.log('#### SCHEDULE a job to UPDATE tenant user: %s, %s, %s', document.id, document.email, document._doc.client);
                $this.enqueueUpdateTenantUserJob(document);
            }
        });

        // Enqueue user Remove
        this.schema.post('remove', function (document) {
            // If current user is a tenant user, we should update it also
            if (document.client != null || (document._doc != null && document._doc.client != null)) {
                $this.logger.log('#### SCHEDULE a job to REMOVE tenant user: %s, %s', document.id, document.email);
                $this.enqueueDeleteTenantUserJob(document);
            }
        });
    }

    /**
     * Define Schema
     *
     * @override
     */
    defineSchema() {

        var $this = this;
        var Types = this.mongoose.Schema.Types;

        /**
         * Creating DBO Schema
         */
        var UserDBOSchema = null;
        try {
            UserDBOSchema = this.model.schema;
        } catch (err) {

            if ('OverwriteModelError' === err.name) {
                this._logger.error('Model %s is already defined', this._list);

                return;
            }

            if ('MissingSchemaError' !== err.name) {
                throw err;
            }

            /**
             * Creating DBO Schema
             */
            // Client Schema Object
            // User Schema Object
            var schemaObject = {
                "token": String,
                "password": String,
                "email": String,
                "isAdmin" : Boolean,
                "createdAt" : {type: Date, 'default': Date.now},
                "modifiedAt" : {type: Date, 'default': Date.now},
                "isVerified" : Boolean,
                "confirmationCode": {type: String, unique: true, required: false},
                "name": {
                    "last": String,
                    "first": String
                },
                notifications: []
            };

            // Registering schema and initializing model
            this.registerSchema(schemaObject);
        }
    }

    /**
     * Enqueue Create or Update User Job
     *
     * @param userDetails
     */
    enqueueUpdateTenantUserJob (userDetails) {
        var jobObject = {
            workerName: 'tenant',
            commandName: 'updateUser',
            params: {
                userDetails: userDetails._doc
            },
            delay: new Date(new Date().getTime() + 20000),
            priority: 1
        };

        // Enqueue new job
        if (DioscouriCore.ApplicationFacade.instance.queue != null) {
            DioscouriCore.ApplicationFacade.instance.queue.enqueue(jobObject);
        }
    }

    /**
     * Enqueue Delete User Job
     *
     * @param userDetails
     */
    enqueueDeleteTenantUserJob (userDetails) {
        var jobObject = {
            workerName: 'tenant',
            commandName: 'removeUser',
            params: {
                userDetails: userDetails._doc
            },
            delay: new Date(new Date().getTime() + 20000),
            priority: 1
        };

        // Enqueue new job
        if (DioscouriCore.ApplicationFacade.instance.queue != null) {
            DioscouriCore.ApplicationFacade.instance.queue.enqueue(jobObject);
        }
    }
}

/**
 * Creating instance of the model
 */
var modelInstance = new ClientUserModel('user');

/**
 * Exporting Model
 *
 * @type {Function}
 */
exports = module.exports = modelInstance;
