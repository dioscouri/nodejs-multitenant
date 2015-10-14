
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

describe('Bootstrap', function () {

    before(function(done){
        // Set max timeout to 5 sec. As it may take more then 2 secs to run host server
        this.timeout(5000);

        _init.startServer(function () {
            done();
        })
    });

    // Describing initial loading
    describe('init', function () {

        var BootstrapLoader;
        var loader;

        // Controllers initialization test
        it('Initializing loader', function (done) {
            BootstrapLoader = require('../index.js');
            loader = new BootstrapLoader();
            loader.init();
            loader.run();
            loader.bootstrap();

            console.log('\n\n');

            done();
        });

        // Controllers initialization test
        it('Controllers must be initialized', function (done) {
            assert.notEqual(BootstrapLoader.MultiTenant.Controllers.Admin.Clients, null);

            done();
        });

        // Models initialization test
        it('Models must be initialized', function (done) {
            assert.notEqual(BootstrapLoader.MultiTenant.Models.Base, null);
            assert.notEqual(BootstrapLoader.MultiTenant.Models.Client, null);
            assert.notEqual(BootstrapLoader.MultiTenant.Models.Tenant.Base, null);
            assert.notEqual(BootstrapLoader.MultiTenant.Models.Tenant.Template, null);

            done();
        });


        // Controllers initialization test
        it('Controllers must be exported to Registry', function (done) {
            assert.notEqual(DioscouriCore.ApplicationFacade.instance.registry.load('MultiTenant.Controllers.Admin.Clients'), null);

            done();
        });

        // Models initialization test
        it('Models must be initialized', function (done) {
            assert.notEqual(DioscouriCore.ApplicationFacade.instance.registry.load('MultiTenant.Models.Base'), null);
            assert.notEqual(DioscouriCore.ApplicationFacade.instance.registry.load('MultiTenant.Models.Client'), null);
            assert.notEqual(DioscouriCore.ApplicationFacade.instance.registry.load('MultiTenant.Models.Tenant.Base'), null);
            assert.notEqual(DioscouriCore.ApplicationFacade.instance.registry.load('MultiTenant.Models.Tenant.Template'), null);

            done();
        });

    });
});
