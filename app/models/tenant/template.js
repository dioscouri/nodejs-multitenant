
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring Core Library
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');

/**
 * Requiring base Model
 */
var BaseModel = require('./basemodel.js');

/**
 *  UI Templates model
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class TemplateModel extends BaseModel {
    /**
     * Model constructor
     */
    constructor (listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);
    }

    /**
     * Initialize Model Schema
     */
    initSchema () {
        // User Schema Object
        var schemaObject = {
            "path": {type: String, unique: true, required: true},
            "content": String,
            "isActive" : Boolean,
            "createdAt" : {type: Date, 'default': Date.now},
            "modifiedAt" : {type: Date, 'default': Date.now}
        };

        this._schema = this.createSchema(schemaObject);
        this._schema.pre('save', function (next) {
            this.modifiedAt = new Date();

            next();
        });
    }

    /**
     * Validate item
     *
     * @param item
     * @param callback
     */
    validate(item, validationCallback){
        var validationMessages = [];

        validationCallback(DioscouriCore.ValidationError.create(validationMessages));
    };

    /**
     * Loading templates from mongo and returning it into callback
     *
     * @param callback
     */
    loadTemplates (callback) {
        this.model.find({}, function(error, items){
            callback(error, items);
        });
    }
}

/**
 * Exporting Model
 *
 * @type {Function}
 */
exports = module.exports = TemplateModel;
