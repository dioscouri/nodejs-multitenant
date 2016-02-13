
// Using STRICT mode for ES6 features
"use strict";

// Redefine default application environment
if (process.env.APPLICATION_ENV == null) {
    process.env.APPLICATION_ENV = 'test';
}

// Requiring core assert
var assert = require('assert');

// Requiring main nodejs-core lib
var DioscouriCore = require('dioscouri-core');


describe('MultiTenant', function () {
    // Requiring core library
    var MultiTenant = require('../index.js').MultiTenant;

    // Describing initial multitenant tests
    describe('initialization', function () {
        // Initialization test
        it('MultiTenant singleton must be initialized', function (done) {
            assert.notEqual(MultiTenant.instance, null);

            done();
        });
    });

    // Describing Host Controller part
    describe('Load Tenants Part', function () {
        it('MultiTenant Load Tenant by ID (SUCCESS)', function (done) {
            MultiTenant.instance.loadTenant('tenant-001', (error, tenantInstance) => {
                assert.notEqual(tenantInstance, null);
                done();
            });
        });
        it('MultiTenant Load Tenant by ID (INVALID)', function (done) {
            MultiTenant.instance.loadTenant('test-tenant-INVALID', (error, tenantInstance) => {
                assert.notEqual(error, null);
                assert.equal(tenantInstance, null);
                done();
            });
        });
    });

});
