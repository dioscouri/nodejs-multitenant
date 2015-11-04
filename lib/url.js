
// Using STRICT mode for ES6 features
"use strict";

/**
 * Requiring Core Library
 */
var DioscouriCore = process.mainModule.require('dioscouri-core');

/**
 * Requiring basic url features
 *
 * @type {*}
 */
var url = require('url');

/**
 *  URL Utils Helper
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class TenantUrl {

    /**
     * Url Utils constructor
     */
    constructor (tenantConfig) {
        /**
         * Requiring system logger
         *
         * @type {Logger|exports|module.exports}
         * @private
         */
        this._logger = DioscouriCore.Logger;

        /**
         * Set tenant configuration
         */
        this.tenantConfig = tenantConfig;

        /**
         * Base url
         */
        // this._baseUrl = DioscouriCore.ApplicationFacade.instance.config.env.BASE_URL;

        /**
         * SSL Allowed
         */
        this._isSSLAllowed = (DioscouriCore.ApplicationFacade.instance.config.env.SSL_ALLOWED == 'true');
    }

    /**
     * Tenant config setter
     *
     * @param value
     */
    set tenantConfig (value) {
        this._tenantConfig = value;
    }

    /**
     * Tenant config getter
     *
     * @returns {*}
     */
    get tenantConfig () {
        return this._tenantConfig;
    }

    /**
     * Hostname of the tenant
     *
     * @returns {*}
     */
    get hostname () {
        var urlDetails = this.primaryHost.split(':');

        var result = urlDetails[0];

        return result;
    }

    /**
     * Subdomain hostname of the tenant
     *
     * @returns {*}
     */
    get subdomain () {
        return this.subdomainHostname;
    }

    /**
     * Returns primary hostname for client
     */
    get primaryHost() {
        var result = null;

        if (this.tenantConfig.hostname != null && this.tenantConfig.hostname != '') {
            result = this.tenantConfig.hostname;
        } else if (this.tenantConfig.subdomain != null && this.tenantConfig.subdomain != '') {
            result = this.tenantConfig.subdomain + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
        } else if (this.tenantConfig.tenantId != null && this.tenantConfig.tenantId != '') {
            result = this.tenantConfig.tenantId + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
        }

        return result;
    }

    /**
     * Returns subdomain hostname for client
     */
    get subdomainHost() {
        var result = null;

        if (this.tenantConfig.subdomain != null && this.tenantConfig.subdomain != '') {
            result = this.tenantConfig.subdomain + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
        } else if (this.tenantConfig.tenantId != null && this.tenantConfig.tenantId != '') {
            result = this.tenantConfig.tenantId + '.' + DioscouriCore.ApplicationFacade.instance.config.env.BASE_CLIENTS_DOMAIN;
        }

        return result;
    }

    /**
     * Returns Full url for specified path
     *
     * @param urlPath
     * @param isSSL
     * @param parameters
     */
    getUrl (urlPath, isSSL, parameters) {
        var baseUrl = this.primaryHost;

        if (urlPath.charAt(0) != '/' && baseUrl.charAt(baseUrl.length - 1) != '/') {
            urlPath = '/' + urlPath;
        }

        var httpPrefix = isSSL === true && this._isSSLAllowed ? 'https' : 'http';

        var parametersString = "";
        if (parameters != null && typeof parameters == "object") {
            parametersString = (urlPath.indexOf('?') != -1) ? "&" : "?";
            var values = [];
            for (var key in parameters) {
                if (typeof parameters[key] == "string") {
                    values.push(key + "=" + parameters[key]);
                }
            }
            parametersString = parametersString + values.join('&');
        }

        return httpPrefix + '://' + baseUrl + urlPath + parametersString;
    }
}

/**
 * Exporting URL Utils
 *
 * @type {Function}
 */
exports = module.exports = TenantUrl;
