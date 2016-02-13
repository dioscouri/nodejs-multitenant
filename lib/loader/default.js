
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
        this.tenants = [
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
    }

    /**
     * Loading list of tenants from some source
     *
     * @param callback
     */
    loadTenants (callback) {
        callback(null, this.tenants);
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

    /**
     * Loading tenant by uid. May use hostname, subdomain, _id.
     *
     * @param tenantUID
     * @param callback
     */
    loadTenant (tenantUID, callback) {
        for (var i = 0; i < this.tenants.length; i++) {
            var tenantDetails = this.tenants[i];

            if (tenantDetails.tenantId == tenantUID || tenantDetails.hostname == tenantUID) {
                return callback(null, tenantDetails);
            }
        }

        callback();
    }

}

/**
 * Exporting DefaultLoader
 *
 * @type {Function}
 */
exports = module.exports = DefaultLoader;
