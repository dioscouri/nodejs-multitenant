
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

        /**
         * Requiring system logger
         *
         * @type {Logger|exports|module.exports}
         * @private
         */
        this._logger = DioscouriCore.Logger;

        // Defining current schema
        this.defineSchema();
    }

    /**
     * Define Schema. Must be overriden in descendants.
     *
     * @abstract
     */
    defineSchema () {
        ;
    }
}

/**
 * Exporting Model
 *
 * @type {Function}
 */
exports = module.exports = BaseModel;
