# Multitenant Support Module

## Main Goals

Module implements base library and functions to work with Multitenant hosts.

## Code Examples

### Library initialization.

To initialize library you need to add initialization code to you main server.js file:

    /**
     * Loading Multitenant model
     *
     * @type {MultiTenant|exports|module.exports}
     */
    var MultiTenant = require('nodejs-multitenant').MultiTenant;
    MultiTenant.instance.setTenantsLoader(tenantsLoader);
    MultiTenant.instance.loadTenants(function(error, tenants) {
        if (error == null) {
            console.log('## Multitenant support initialized');
        } else {
            console.error('## Failed to initialize Multitenant support. ', error.message);
        }
    });
    
    // Initialize Host client to update Multitenant data between hosts
    MultiTenant.instance.initHostClient(function(error){
        ;
    });

### Initialize Master Host

Host controller should be initialized in the following way: 

    // Initializing Multitenant support
    var MultiTenant = require('nodejs-multitenant').MultiTenant;
    MultiTenant.instance.startHostController(function(error){
        console.log('#### Started HOST controller for Clients Synchronization');
    });
