
// Using STRICT mode for ES6 features
"use strict";

// Requiring core assert
var assert = require('assert');

/**
 * Requiring init script for main nodejs-lib
 *
 * @type {exports|module.exports}
 * @private
 */
var _init = require('./common/_init.js');

/**
 * Requiring path utils
 * @type {*}
 */
var path = require('path');

// Requiring main nodejs-core lib
var DioscouriCore = require('dioscouri-core');

describe('Models', function () {
    // Requiring core library
    var modelsMath = path.dirname(__dirname) + '/app/models';
    DioscouriCore.ApplicationFacade.instance.loadModels(modelsMath);

    var clientModel = DioscouriCore.ApplicationFacade.instance.registry.load('clientModel');

    // Describing initial multitenant tests
    describe('initialization', function () {
        // Model initialization test
        it('Models must be initialized', function (done) {
            done();
        });
    });

    // Client Model tests
    describe('Client Database requests', function () {
        // Model initialization test
        it('Load tenants', function (done) {
            clientModel.loadTenants(function(error, tenants) {
                assert.equal(error, null);
                assert.notEqual(tenants, null);
                assert(tenants.length > 0);

                done();
            });
        });
    });

});
