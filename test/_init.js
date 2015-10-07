
// Using STRICT mode for ES6 features
"use strict";

global.DEFAULT_CONFIG_PATH = '.env-test';

var DioscouriCore = require('dioscouri-core');

/**
 *  Importing Application Facade and run the Application.
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
var applicationFacade = DioscouriCore.ApplicationFacade.instance;
