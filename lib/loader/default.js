
// Using STRICT mode for ES6 features
"use strict";

/**
 *  Default tenant loader
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class DefaultLoader {

    /**
     * Default Loader constructor
     */
    constructor (tenantConfig) {
    }

    /**
     * Loading list of tenants from some source
     *
     * @param callback
     */
    loadTenants (callback) {
        var tenants = [
            {
                name: "Tenant 001",
                tenantId: "tenant-001",
                hostname: "127.0.0.35",
                aliases: [
                    "127.0.0.35", "127.0.0.40", "127.0.0.41"
                ],
                theme: "default"
            },
            {
                name: "Tenant 002",
                tenantId: "tenant-002",
                hostname: "127.0.0.36",
                aliases: [
                    "127.0.0.36", "127.0.0.50", "127.0.0.51"
                ],
                theme: "default"
            }
        ];

        callback(null, tenants);
    }


    /**
     * Loading tenant by hostname
     *
     * @param hostname
     * @param callback
     */
    loadTenantByHost (hostname, callback) {
        callback(null, null);
    }
}

/**
 * Exporting DefaultLoader
 *
 * @type {Function}
 */
exports = module.exports = DefaultLoader;
