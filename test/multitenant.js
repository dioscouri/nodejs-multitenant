
// Using STRICT mode for ES6 features
"use strict";

// Requiring core assert
var assert = require('assert');

// Requiring main nodejs-core lib
var DioscouriCore = require('dioscouri-core');

describe('MultiTenant', function () {
    // Requiring core library
    var MultiTenant = require('../index.js').MultiTenant;

    var _init_database = require('./common/_init_database.js');
    before(function(done){
        _init_database.initTenantsDatabase(function (error) {
            done();
        })
    });
    after(function(done){
        _init_database.clearTenantsDatabase(function (error) {
            done();
        })
    });

    // Describing initial multitenant tests
    describe('initialization', function () {
        // Initialization test
        it('MultiTenant singleton must be initialized', function (done) {
            assert.notEqual(MultiTenant.instance, null);

            done();
        });

        // Initialize config
        it('MultiTenant configuration initialization', function (done) {
            MultiTenant.instance.setConfig(DioscouriCore.ApplicationFacade.instance.config.env);
            assert.notEqual(MultiTenant.instance._config, null);
            assert.notEqual(MultiTenant.instance._config.MULTITENANT_HOST_CONTROLLER, null);

            done();
        });
    });

    // Describing Host Controller part
    describe('startHostController', function () {

        /**
         * Initializing host client
         */
        before(function() {
            MultiTenant.instance.initHostClient(function (error) {
            });
        });

        /**
         * De-initializing the test
         */
        after(function() {
            MultiTenant.instance.stopHostController(function (error) {
            });
        });

        // Starting Host Client
        it('MultiTenant starting Host Controller', function (done) {
            // Set max timeout to 5 sec. As it may take more then 2 secs to run host server
            this.timeout(5000);

            MultiTenant.instance.startHostController(function (error) {
                console.log('#### Started HOST controller for Clients Synchronization');

                assert.equal(error, null);
                done();
            });
        });

        // Loading Tenants from Bulk Loader
        it('MultiTenant loading Bulk Tenants Config', function (done) {
            var TenantsLoder = require('../lib/loader/default.js');

            MultiTenant.instance.setTenantsLoader(new TenantsLoder());
            MultiTenant.instance.loadTenantsConfig(function (error, tenants) {
                assert.equal(error, null);
                assert.notEqual(tenants, null);
                assert(tenants.length > 0);

                done();
            });
        });

        // Loading Tenants from Database Loader
        it('MultiTenant loading Mongo Tenants and Initialize Tenant Servers', function (done) {
            var tenantsLoder = DioscouriCore.ApplicationFacade.instance.registry.load('clientModel');
            MultiTenant.instance.setConfig(DioscouriCore.ApplicationFacade.instance.config.env);
            MultiTenant.instance.setTenantsLoader(tenantsLoder);
            MultiTenant.instance.loadTenants(function (error, tenants) {
                assert.equal(error, null);
                assert.notEqual(tenants, null);
                assert(tenants.length > 0);

                done();
            });
        });
    });

});