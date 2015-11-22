
// Using STRICT mode for ES6 features
"use strict";

module.exports = function () {
    var routes = {
        // Client management routes
        'get|/admin/clients': 'admin/clients.js',
        'get,post|/admin/clients/:action': 'admin/clients.js',
        'get,post|/admin/clients/:id/:action': 'admin/clients.js'
    };

    return routes;
};
