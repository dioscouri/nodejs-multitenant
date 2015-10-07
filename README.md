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

## Testing

### Configure tests

To run tests on the system you should configure default environment config first.
 
1. Please create file .env-test inside root directory.

2. In file .env-test please specify environment name. For example:


    APPLICATION_ENV=test-yourenv

    
3. In config folder config/env create file: test-yourenv. As example please use config/env/test

Configuration finished. Now you can run the tests.


### Initialize dependencies and run tests

To initialize testing library you need to do the following

1. Install Dev dependencies:


    npm install --save-dev


2. Install mocha globally (this is optional)


    npm install -g mocha


3. Run tests using mocha cli:


    mocha

