
// Using STRICT mode for ES6 features
"use strict";

var DioscouriCore = require('dioscouri-core');

/**
 *  Importing Application Facade and run the Application.
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
var applicationFacade = DioscouriCore.ApplicationFacade.instance;

/**
 * Requiring Async operations helper
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 * Loading clients model
 *
 * @type {ClientModel|exports|module.exports}
 */
var clientModel = require('../../app/models/client.js');

/**
 * Initializing/Deinitialize Database
 */
before(function(done) {
    applicationFacade.on(DioscouriCore.ApplicationEvent.MONGO_CONNECTED, function (event) {
        var locals = {};
        console.log('Checking initial data for MultiTenant system');
        async.series([
                function (asyncCallback){
                    console.log('Checking are there any tenants already set in the database.');
                    clientModel.loadTenants(function (error, tenants) {
                        if (tenants != null && tenants.length > 0) {
                            locals.tenants = tenants;

                            console.log('Found %s tenants in the database.', tenants.length);
                        } else {
                            console.log('There are no any tenants found in the database.');
                        }

                        asyncCallback(error);
                    });
                },
                function (asyncCallback){
                    if (locals.tenants == null || locals.tenants.length == 0) {

                        var tenants = [
                            { name: "Tenant 001 (test)", tenantId: "test-tenant-001", subdomain: 'test-tenant-001', hostname: "127.0.0.101", isEnabled: true },
                            { name: "Tenant 002 (test)", tenantId: "test-tenant-002", subdomain: 'test-tenant-002', hostname: "127.0.0.102", isEnabled: true }
                        ];
                        locals.tenants = [];
                        async.forEach(tenants, function (item, forEachCallback) {
                            clientModel.insert(item, function (error, newTenant) {
                                if (error != null) {
                                    return forEachCallback(error);
                                }

                                if (newTenant != null) locals.tenants.push(newTenant);

                                forEachCallback();
                            })
                        }, function (error) {
                            if (locals.tenants.length > 0) {
                                console.log('Initialized test tenants list.');
                            } else {
                                console.error('Failed to initialize test tenants list.');
                            }
                            asyncCallback(error);
                        });
                    } else {
                        asyncCallback()
                    }
                }
            ],
            function (error) {
                if (error != null) {
                    console.error('ERROR. Failed to initialize multitenant tests. ', error.message);
                }
                done();
            });

    }.bind(applicationFacade));

    // Initializing all modules
    applicationFacade.init();
    // applicationFacade.loadModels('app/models/common');
    applicationFacade.run();
});

// Global after handler
after(function(done) {
    console.log('Clean test data');
    async.series([
        function (asyncCallback){
            clientModel.model.remove({tenantId: "test-tenant-001"}, function (error) {
                asyncCallback(error);
            });
        },
        function (asyncCallback){
            clientModel.model.remove({tenantId: "test-tenant-002"}, function (error) {
                asyncCallback(error);
            });
        }
    ],
    function (error) {
        if (error != null) {
            console.error('ERROR. Failed to clean multitenant tests. ', error.message);
        }
        done();
    });
});
