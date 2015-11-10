
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring Core Library
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');

/**
 *  Base model
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class BaseModel extends DioscouriCore.MongooseModel {
    /**
     * Model constructor
     */
    constructor (listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);
    }

    /**
     * Get Mongoose instance
     *
     * @returns {mongoose}
     */
    get mongoose () {
        return this._mongoose;
    }

    /**
     * Get Mongoose instance
     *
     * @param {mongoose} value
     */
    set mongoose (value) {
        this._mongoose = value;
    }

    /**
     * Get current tenant instance
     *
     * @returns {Tenant}
     */
    get tenant () {
        return this._tenant;
    }

    /**
     * Get current tenant instance
     *
     * @param {Tenant} value
     */
    set tenant (value) {
        this._tenant = value;
    }

    /**
     * Simple schema registration
     *
     * @param schemaObjectDef
     */
    createSchema (schemaObjectDef) {
        /**
         * Valid mongoose schema
         */
        this._schemaObjectDef = schemaObjectDef;

        /**
         * Creating Schema within mongoose.
         *
         * IMPORTANT. This MUST be Schema constructor compatible with the current Mongoose
         *
         * @type {*|{mongo}}
         * @private
         */
        this._schema = this.mongoose.Schema(this._schemaObjectDef);

        return this._schema;
    }

    /**
     * Initialize current schema
     */
    initSchema () {
        ;
    }

    /**
     * Initialize current model and schema. Should be overriden.
     */
    init () {
        // Initializing current Schema
        this.initSchema();

        // If list name is set - create a model
        if (this._list != null && this._schema != null) {
            this._model = this.mongoose.model(this._list, this._schema);
        }
    }
}

/**
 * Exporting Model
 *
 * @type {Function}
 */
exports = module.exports = BaseModel;
