
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring core Events module
 */
var events = require('events');

/**
 * Requiring Core Library
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');

/**
 * Requiring File System modules
 * @type {*}
 */
var fs = require('fs');
var path = require('path');

/**
 * Requiring swig template Engine
 *
 * @type {*|exports|module.exports}
 */
var swig  = require('swig');

/**
 *  Tenant Model
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class TenantView extends events.EventEmitter {

    /**
     * Model constructor
     */
    constructor (tenant) {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        /**
         * Requiring system logger
         *
         * @type {Logger|exports|module.exports}
         * @private
         */
        this._logger = DioscouriCore.Logger;

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
        this.basePath = path.dirname(process.mainModule.filename);
        this.viewPath = path.normalize(this.basePath + '/app/views/client');

        // Creating separate SWIG Engine for Template parser
        var swigDefaults = {
            loader: this.getSwigTemplateLoader()
        };

        // TODO Revalidate cache setteings for SWIG templates
        swigDefaults.cache = false;

        this._swigEngine = new swig.Swig(swigDefaults);
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
     * Load templates from database
     */
    loadTemplates (callback) {
        this._templates = {};
    }

    /**
     * Creates HTML View for specified parameters
     *
     * @param template
     * @param data
     * @param error
     * @returns {View}
     */
    htmlView (template, data, error) {
        var viewInstance = new DioscouriCore.View(DioscouriCore.ViewType.HTML, data, template, error);

        // Set Separate SWIG Engine for each Tenant
        // This will prevent us from issues with separate file loaders
        viewInstance.swigEngine = this._swigEngine;

        return viewInstance;
    }

    /**
     * Creates JSON View for specified data
     *
     * @param data
     * @param error
     * @returns {View}
     */
    jsonView (data, error) {
        var viewInstance = new DioscouriCore.View(DioscouriCore.ViewType.JSON, data, null, error);

        return viewInstance;
    }

    /**
     * Returns template loader for SWIG Templates
     */
    getSwigTemplateLoader () {
        if (this._swigTemplateLoader == null) {
            /**
             * Create SWIG Template loader
             *
             * @param basepath
             * @param encoding
             * @returns {{}}
             * @private
             */
            this._swigTemplateLoader = function (basepath, encoding) {
                var templateLoader = {};
                var $this = this;

                encoding = encoding || 'utf8';
                basepath = (basepath) ? path.normalize(basepath) : null;

                /**
                 * Resolves <var>to</var> to an absolute path or unique identifier. This is used for building correct, normalized, and absolute paths to a given template.
                 * @alias resolve
                 * @param  {string} to        Non-absolute identifier or pathname to a file.
                 * @param  {string} [from]    If given, should attempt to find the <var>to</var> path in relation to this given, known path.
                 * @return {string}
                 */
                templateLoader.resolve = function (to, from) {
                    if (basepath) {
                        from = basepath;
                    } else {
                        from = (from) ? path.dirname(from) : $this.viewPath;
                    }

                    var fullPath = path.resolve(from, to);
                    // console.log('Full path: ' + fullPath);

                    return fullPath;
                };

                /**
                 * Loads a single template. Given a unique <var>identifier</var> found by the <var>resolve</var> method this should return the given template.
                 * @alias load
                 * @param  {string}   identifier  Unique identifier of a template (possibly an absolute path).
                 * @param  {function} [callback]        Asynchronous callback function. If not provided, this method should run synchronously.
                 * @return {string}               Template source string.
                 */
                templateLoader.load = function (identifier, callback) {
                    if (!fs || (callback && !fs.readFile) || !fs.readFileSync) {
                        throw new Error('Unable to find file ' + identifier + ' because there is no filesystem to read from.');
                    }

                    identifier = templateLoader.resolve(identifier);

                    var templatePath = identifier.replace($this.viewPath, '');
                    console.log('Resolved template for tenant: %s', templatePath);
                    var templateDetails = $this.tenant.getTemplateByPath(templatePath);
                    if (templateDetails != null) {
                        if (callback) {
                            callback(null, templateDetails.content);

                            return;
                        } else {
                            return templateDetails.content;
                        }
                    } else {
                        if (callback) {
                            fs.readFile(identifier, encoding, callback);

                            return;
                        } else {
                            // Read file in synchronous mode
                            return fs.readFileSync(identifier, encoding);
                        }
                    }
                };

                return templateLoader;
            }.bind(this);
        };

        // Returning Template loader based on SWIG
        return this._swigTemplateLoader();
    }
}

/**
 * Exporting MultiTenant
 *
 * @type {Function}
 */
exports = module.exports = TenantView;
