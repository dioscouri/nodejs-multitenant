
// Using STRICT mode for ES6 features
"use strict";

global.DEFAULT_CONFIG_PATH = '.env-test';

var DioscouriCore = require('dioscouri-core');

/**
 * Requiring Async operations helper
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 *  Importing Application Facade and run the Application.
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
var applicationFacade = DioscouriCore.ApplicationFacade.instance;

// Redefine default application environment
if (process.env.APPLICATION_ENV == null) {
    process.env.APPLICATION_ENV = 'test';
}

var clientModel = require('../../app/models/client.js');
DioscouriCore.ApplicationFacade.instance.registry.push('clientModel', clientModel);
