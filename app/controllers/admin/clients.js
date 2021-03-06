
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
 * Requiring base Controller
 */
var AdminBaseCrudController = DioscouriCore.ApplicationFacade.instance.registry.load('Admin.Controllers.BaseCRUD');

// Requiring global path utils
var path = require('path');

/**
 * Requiring Asyns operations helper
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 *  Admin Clients controller
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class AdminClients extends AdminBaseCrudController {

    /**
     * Controller constructor
     */
    constructor (request, response) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response);

        /**
         * Current CRUD model instance
         *
         * @type {MongooseModel}
         * @private
         */
        this._model = require('../../models/client.js');

        /**
         * Context of the controller
         *
         * @type {string}
         * @private
         */
        this._baseUrl = '/admin/clients';

        /**
         * Path to controller views
         *
         * @type {string}
         * @private
         */
        this._viewsPath = 'client';

        /**
         * Path to UI templates
         *
         * @type {string}
         * @private
         */
        this._baseViewsDir = path.join(__dirname, '../..', 'views', 'admin', '');

        /**
         * Owner user account
         *
         * @type {string}
         * @private
         */
        this._modelPopulateFields = 'owner';
    }

    /**
     * Initialize data and event handlers
     */
    init(callback) {
        this.data.baseDomain = '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
        this.data.cancelUrl = this.getActionUrl('list');

        super.init(callback);
    }

    /**
     * Loading item for edit actions
     *
     * @param readyCallback
     */
    preLoad(readyCallback) {
        // Loading client data and user data
        async.series([
            asyncCallback => {
                super.preLoad(asyncCallback);
            },
            asyncCallback => {
                if (this.item) {
                    this.data.userItem = this.item.owner;
                }

                asyncCallback();
            }
        ],
        (error) => {
            readyCallback(error);
        });
    }

    /**
     * Extract item from request
     *
     * @param item
     * @returns {{}}
     */
    getItemFromRequest (item) {
        var result = super.getItemFromRequest(item);

        result.subdomain = this.request.body.subdomain;
        if (result.tenantId != null  && !result.subdomain) {
            result.subdomain = result.tenantId;
        }
        result.name = this.request.body.name;
        result.description = this.request.body.description;
        result.isEnabled = this.request.body.isEnabled && this.request.body.isEnabled == 'on' ? true : false;
        if (this.request.body.aliases != null && this.request.body.aliases != '') {
            result.aliases = this.request.body.aliases.split(/\s*,\s*/);
        }

        return result;
    }

    /**
     * Initialize create view
     *
     * @param readyCallback
     */
    create (readyCallback) {
        this.data.canEditTenant = true;

        // Loading parent edit() method
        super.create(readyCallback);
    }

    /**
     * Run after create client item
     *
     * @param readyCallback
     */
    onAfterCreate (readyCallback) {
        this.model.updateClientOwner(this.itemDetails, this.request.body.userDetails, readyCallback);
    }

    /**
     * Initialize edit view
     *
     * @param readyCallback
     */
    edit (readyCallback) {
        this.data.canEditTenant = (!this.item.tenantId) ? true : false;

        if (this.item.aliases != null) {
            this.item.aliasesString = this.item.aliases.join(', ');
        }

        // Loading parent edit() method
        super.edit(readyCallback);
    }

    /**
     * Run after update client item
     *
     * @param readyCallback
     */
    onAfterEdit (readyCallback) {
        this.model.updateClientOwner(this.itemDetails, this.request.body.userDetails, readyCallback);
    }

};

/**
 * Exporting Controller
 *
 * @type {Function}
 */
exports = module.exports = AdminClients;
