
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring core Events module
 */
var events = require('events');

/**
 * Requiring Async library
 *
 * @type {async|exports|module.exports}
 */
var async = require('async');

/**
 * Requiring Core Library
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');
/**
 *  Importing Application Facade singleton.
 */
var applicationFacade = DioscouriCore.ApplicationFacade.instance;

/**
 * Tenant Model
 * @type {*}
 */
var TenantModel = require('./tenantmodel.js');

/**
 * Tenant View
 * @type {*}
 */
var TenantView = require('./tenantview.js');

/**
 *  Multi-Tenant handler
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class Tenant extends events.EventEmitter {

    /**
     * Tenant constructor
     */
    constructor (tenantConfig, multitenantHost) {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        /**
         * Requiring system logger
         *
         * @type {Logger|exports|module.exports}
         * @private
         */
        this._logger = console;

        /**
         * Tenant configuration
         */
        this._tenantConfig = tenantConfig;

        /**
         * Current multitenant instance
         */
        this.multitenant = multitenantHost;

        /**
         * Define URL helper
         *
         * @type {TenantUrl|exports|module.exports}
         */
        var TenantUrl = require('./url.js');
        this._url = new TenantUrl(this._tenantConfig);
    }

    /**
     * Return Tenants Config
     *
     * @returns {*}
     */
    get tenantConfig () {
        return this._tenantConfig;
    }

    /**
     * Return Tenants Config
     *
     * @param {*} value
     */
    set tenantConfig (value) {
        this._tenantConfig = value;

        this._url.tenantConfig = value;
    }

    /**
     * Return Tenant Id
     *
     * @returns {String}
     */
    get tenantId () {
        return (this._tenantConfig != null) ? this._tenantConfig.tenantId : null;
    }

    /**
     * Tenant Url utils
     *
     * @returns {TenantUrl|exports|module.exports|*}
     */
    get url () {
        return this._url;
    }

    /**
     * Set loader for tenant templates from some data source.
     * Loader is a function which run callback with parameters (error, templates).
     *
     * @param loader
     */
    setTemplatesLoader (loader) {
        this._templateLoader = loader;
    }

    /**
     * Return Tenant Model
     *
     * @returns {TenantModel}
     */
    get model () {
        return this._model;
    }

    /**
     * Return Tenant View
     *
     * @returns {TenantView}
     */
    get view () {
        return this._view;
    }

    /**
     * Return Tenant Map
     *
     * @returns {{}}
     */
    get templates () {
        return this._templates;
    }

    /**
     * Initialize Tenant
     *
     * @param callback
     */
    init (callback) {
        async.series ([
            // Initializing Tenant Database Model
            function (asyncCallback) {
                this._logger.info('## Initializing tenant model for ', this.tenantConfig.tenantId);
                this._model = new TenantModel(this.tenantConfig, this);
                this._model.connect(function(error){
                    asyncCallback(error);
                }.bind(this));
            }.bind(this),

            // Initialize templates list
            function (asyncCallback) {
                this.loadUITemplates(asyncCallback);
            }.bind(this),

            // Initialize View
            function (asyncCallback) {
                // Initializing View
                this._logger.log('## Initialized view for tenant: %s', this.tenantConfig.tenantId);
                this._view = new TenantView(this);
                asyncCallback();
            }.bind(this)
        ], function (error) {
            if (error) {
                this._logger.error(error.message);
            }

            callback(error);
        }.bind(this));
    }

    /**
     * Initialization of security subsystem of client-saas for a tenant.
     * Synchronization of default roles, protected resources and actions, assignment default permissions for created resources are described in tenant_acl_schema.json.
     * TODO: this method is placed here temporary, it related to security subsystem of client-saas thus the subsystem should be moved in a better place. may be in a separated lib.
     * @param callback
     */
    initSecurity(callback) {
        this._logger.info('#### Initializing security subsystem for tenant: %s', this.tenantConfig.tenantId);
        var aclPermissionsModel = this.model.collection("acl_permissions")
        var userModel = this.model.collection("user");

        var $this = this;
        async.series([
            $this.syncDefaultRoles.bind($this),
            $this.syncResourcesAndActions.bind($this),
                function(asyncCallback) {
                    $this._logger.info('#### Initializing passport for tenant: %s', $this.tenantConfig.tenantId);
                    // var PassportClass = require('passport').Passport;
                    // $this.passport = new PassportClass();
                    // userModel.registerPassportHandlers($this.passport);
                    applicationFacade.server.initPassport(userModel);
                    $this._logger.info('#### Initializing ACL for tenant: %s', $this.tenantConfig.tenantId);
                    applicationFacade.server.initAcl(aclPermissionsModel);
                    asyncCallback();
                }
            ]
            , function(error){
                if(error) {
                    $this._logger.warn('## Failed to initialize security subsystem for tenant: %s [%s]', $this.tenantConfig.tenantId, err.message);
                } else {
                    // $this._logger.info('#### Security subsystem has been initialized for tenant: %s', $this.tenantConfig.tenantId);
                }
                if(callback)
                    callback();
        });
    }

    /**
     * Synchronization of default roles are described in tenant_acl_schema.json
     * TODO: this method is placed here temporary, it related to security subsystem of client-saas thus the subsystem should be moved in a better place. may be in a separated lib.
     * @param asyncCallback
     */
    syncDefaultRoles(asyncCallback) {
        var aclRolesModel = this.model.collection("acl_roles");
        var $this = this;
        var defaultRoles = applicationFacade.tenant_acl_schema["default.roles"];
        async.forEach(defaultRoles, function (roleName, foreachCallback) {
                var itemDetails = {name: roleName, isBuiltin: 1};
                aclRolesModel.findOne(itemDetails, function(err, existedItem){
                    if (err != null) {
                        $this._logger.log('## Failed to synchronize %s role for tenant: %s', roleName, $this.tenantConfig.tenantId);
                        return foreachCallback(err);
                    }

                    if(existedItem == null) {
                        aclRolesModel.insert(itemDetails, function (error, item) {
                            if (error != null) {
                                $this._logger.warn('## Failed to synchronize %s role for tenant: %s [%s]', itemDetails.name, $this.tenantConfig.tenantId, err.message);
                                return foreachCallback(err);
                            } else {
                                // $this._logger.log('## %s role has been registered for tenant: %s', roleName, $this.tenantConfig.tenantId);
                                foreachCallback();
                            }
                        });
                    } else {
                        foreachCallback();
                    }
                });
            }.bind($this)
        , function (error) {
            if(error) {
                $this._logger.warn('## Failed to synchronize default roles for tenant: %s [%s]', $this.tenantConfig.tenantId, err.message);
            } else {
                $this._logger.info('#### Default roles have been synchronized for tenant: %s', $this.tenantConfig.tenantId);
            }
            asyncCallback(error);
        });
    }

    /**
     * Synchronization of protected resources and actions are described in tenant_acl_schema.json
     * TODO: this method is placed here temporary, it related to security subsystem of client-saas thus the subsystem should be moved in a better place. may be in a separated lib.
     * @param asyncCallback
     */
    syncResourcesAndActions(asyncCallback) {
        var aclResourcesModel = this.model.collection("acl_resources");
        var $this = this;

        var aclResources = applicationFacade.tenant_acl_schema.resources;
        async.forEach(Object.keys(aclResources), function (key, foreachCallback) {
                let resource = aclResources[key];
                let itemDetails = {
                    name: resource.name,
                    actions: resource.actions
                };
                aclResourcesModel.findOne({name: itemDetails.name}, function (err, existedItem) {
                    if (err) {
                        $this._logger.warn('## Failed to synchronize %s resource for tenant: %s [%s]', itemDetails.name, $this.tenantConfig.tenantId, err.message);
                        return foreachCallback(err);
                    }

                    if (existedItem == null) {
                        aclResourcesModel.insert(itemDetails, function (error, item) {
                            if (error != null) {
                                $this._logger.warn('## Failed to synchronize %s resource for tenant: %s [%s]', itemDetails.name, $this.tenantConfig.tenantId, err.message);
                                return foreachCallback(err);
                            } else {
                                $this._logger.log('## %s resource has been registered for tenant: %s', item.name, $this.tenantConfig.tenantId);
                                $this.setPermissionsForResource(item, resource["default.permissions"], foreachCallback);
                            }
                        });
                    } else {
                        // check, should we create new actions ?
                        var newActions = [];
                        for(var j = 0; j < itemDetails.actions.length; j++) {
                            var isNewAction = 1;
                            for(var i = 0; i < existedItem.actions.length; i++) {
                                if(existedItem.actions[i].toLowerCase() == itemDetails.actions[j].toLowerCase()) {
                                    isNewAction = 0;
                                    break;
                                }
                            }
                            if(isNewAction == 1)
                                newActions.push(itemDetails.actions[j]);
                        }
                        if(newActions.length > 0) {
                            for(var i = 0; i < newActions.length; i++) {
                                existedItem.actions.push(newActions[i]);
                            }
                            existedItem.save(function (error, item) {
                                foreachCallback(error);
                            });
                        } else {
                            foreachCallback();
                        }
                    }
                });
            }
            , function (error) {
                if(error) {
                    $this._logger.warn('## Failed to synchronize resources and actions for tenant: %s [%s]', $this.tenantConfig.tenantId, err.message);
                } else {
                    // $this._logger.info('#### Resources and actions roles have been synchronized for tenant: %s', $this.tenantConfig.tenantId);
                }
                asyncCallback(error);
        });
    }

    /**
     * Assignment of default permissions for created resources are described in tenant_acl_schema.json.
     * TODO: this method is placed here temporary, it related to security subsystem of client-saas thus the subsystem should be moved in a better place. may be in a separated lib.
     * @param resource - created resource
     * @param permissions - set of default permissions
     * @param callback
     */
    setPermissionsForResource(resource, permissions, callback) {
        this._logger.info('#### Processing permissions to "%s" resource for tenant: %s', resource.name, this.tenantConfig.tenantId);

        var aclRolesModel = this.model.collection("acl_roles");
        var aclPermissionsModel = this.model.collection("acl_permissions");
        var $this = this;
        var resourceActionsMap = {};
        for(var i = 0; i < resource.actions.length; i++) {
            resourceActionsMap[resource.actions[i].toLowerCase()] =  resource.actions[i];
        }

        var rolesMap = {};
        async.series([
            function(asyncCallback) {
                aclRolesModel.model.find({}, function(err, items) {
                    for(var i = 0; i < items.length; i++) {
                        rolesMap[items[i].name.toLowerCase()] = items[i];
                    }
                    asyncCallback();
                });
            }, function(asyncCallback) {
                var permissionDetailsArr = [];
                async.forEach(permissions, function (permissionDescriptor, foreachCallback) {
                    permissionDetailsArr.length = 0;
                    let actions = permissionDescriptor.actions;
                    let roles = permissionDescriptor.roles;
                    for(var i = 0; i < actions.length; i++) {
                        if(resourceActionsMap[actions[i].toLowerCase()] == null) {
                            continue;
                        }
                        for(var j = 0; j < roles.length; j++) {
                            if(rolesMap[roles[j].toLowerCase()] == null) {
                                continue;
                            }
                            permissionDetailsArr.push({
                                aclRole: rolesMap[roles[j].toLowerCase()],
                                aclResource: resource,
                                actionName: resourceActionsMap[actions[i].toLowerCase()]
                            });
                        }
                    }
                    async.forEach(permissionDetailsArr, function(permissionDetails, internalForeachCallback){
                            $this._logger.info('#### Assigning permissions to "%s" action of "%s" resource for "%s" role', permissionDetails.actionName , resource.name, permissionDetails.aclRole.name);
                            aclPermissionsModel.insert(permissionDetails, function (error, item) {
                                internalForeachCallback(error);
                            });
                        }
                        ,function (error) {
                            foreachCallback(error);
                    });
                }, function (error) {
                    asyncCallback(error);
                });
            }
            ], function(error){
                if(error) {
                    $this._logger.warn('## Failed to synchronize default permissions for created resources for tenant: %s [%s]', $this.tenantConfig.tenantId, err.message);
                } else {
                    // $this._logger.info('#### Default permissions for created resources have been synchronized for tenant: %s', $this.tenantConfig.tenantId);
                }
                callback(error);
        });
    }

    /**
     * Destroy Tenant
     *
     * @param callback
     */
    destroy (callback) {
        async.series ([
            // Initializing Tenant Database Model
            function (asyncCallback) {
                this._logger.info('## Disconnecting tenant model for ', this.tenantConfig.tenantId);
                this._model.disconnect(function(error){
                    asyncCallback(error);
                }.bind(this));
            }.bind(this)
        ], function (error) {
            if (error) {
                this._logger.error(error.message);
            }

            callback(error);
        }.bind(this));
    }

    /**
     * Initialize List of UI Templates
     *
     * @param callback
     */
    loadUITemplates (callback) {
        var $this = this;
        if (this._templateLoader == null) {
            this._templateLoader = this.model.collection('template');
        }

        this._templateLoader.loadTemplates(function (error, templates) {
            if (error != null) {
                console.warn('Failed to load UI Templates for tenant: %s', $this.tenantConfig.tenantId);
                callback(error);
            } else {
                console.warn('## Successfully loaded UI Templates for tenant: %s, count: %s', $this.tenantConfig.tenantId, templates.length);
                $this._templates = {};
                for (var i = 0; i < templates.length; i++) {
                    $this._templates[templates[i].path] = templates[i];
                }

                callback(null, templates);
            }
        });
    }

    /**
     * Returns Template by path
     *
     * @param basepath
     */
    getTemplateByPath (basepath) {
        var templatePath = basepath.replace(/[\\,\/]+/g, '\/');
        if (templatePath.length == 0 || templatePath[0] != '/') {
            templatePath = '/' + templatePath;
            this._logger.log('Validating template path: %s', templatePath);
        }

        return this.templates[templatePath];
    }
}

/**
 * Exporting MultiTenant
 *
 * @type {Function}
 */
exports = module.exports = Tenant;
