
// Using STRICT mode for ES6 features
"use strict";

/**
 *  Default tenant template loader
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class TemplateLoader {

    /**
     * Default Loader constructor
     */
    constructor () {
    }

    /**
     * Loading list of templates from some source
     *
     * @param callback
     */
    loadTemplates (callback) {
        var templates = [
            {
                "path": "/front/examples/tenant-string.swig",
                "content": "Default Tenant Template [TENANT-001]\n{% include \"./include-001.swig\" %}"
            },
            {
                "path": "/front/examples/include-001.swig",
                "content": "<br /> \nInclude 001. TENANT - 001"
            }
        ];

        callback(null, templates);
    }

    /**
     * Loading template by ID
     *
     * @param templateId
     * @param callback
     */
    loadTemplate (templateId, callback) {
        callback(null, null);
    }
}

/**
 * Exporting TemplateLoader
 *
 * @type {Function}
 */
exports = module.exports = TemplateLoader;
