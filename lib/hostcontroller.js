
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
 * Require socket server
 *
 * @type {*|exports|module.exports}
 */
var SocketServer = require('socket.io');

/**
 * Socket client
 *
 * @type {*|exports|module.exports}
 */
var SocketClient = require('socket.io-client');

/**
 *  Multi-Tenant handler
 *
 *  @author Eugene A. Kalosha <ekalosha@dioscouri.com>
 */
class MultiTenantsHostController extends events.EventEmitter {

    /**
     * Multi-Tenant constructor
     */
    constructor (tenantConfig) {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        /**
         * Requiring system logger
         *
         * @type {Logger|exports|module.exports}
         * @private
         */
        this._logger = console;
    }

    /**
     * Server Socket
     *
     * @returns {*}
     */
    get serverSocket () {
        return this._serverSocket;
    }

    /**
     * Client Socket
     *
     * @returns {*}
     */
    get clientSocket () {
        return this._clientSocket;
    }

    /**
     * Start host controller for Multiple Tenants
     *
     * @param hostController
     * @param callback
     */
    startHostController (hostController, callback) {
        var $this = this;
        console.log('$$$$ Initializing Multitenants Host Controller.');
        this._io = new SocketServer();
        this._io.on('connection', function(socket){
            // socket.to('others').emit('an event', { some: 'data' });
            console.log('$$$$ Initialized Socket server for Multitenants Host Controller.');
            $this._serverSocket = socket;

            callback(null, $this._serverSocket);
        });

        // Listening port
        var port = 8080;
        if (hostController != null) {
            var urlParts = hostController.split(':');
            if (urlParts.length > 0) {
                port = urlParts[1];
            }
        }
        this._io.listen(port);
    }

    /**
     * Send host event to all clients
     *
     * @param event
     * @param data
     */
    sendHostEvent (event, data) {
        if (this._serverSocket != null) {
            this._logger.log('## Sending socket event ', event);
            this._serverSocket.emit(event, data);
        } else {
            this._logger.warn('## WARN: Server socket is not initialized.');
        }
    }

    /**
     * Init client Host
     *
     * @param hostController
     * @param callback
     */
    initHostClient (hostController, callback) {
        var socketHost = hostController ? hostController : '127.0.0.1:8080';
        this._clientSocket = SocketClient('http://' + socketHost);
        this._clientSocket.on('connect', function(){
            console.log('$$$$ Successfully connected to Host Controller');
        });
        this._clientSocket.on('disconnect', function(){
            console.log('$$$$ Disconnected from Host Controller');
        });
    }
}

/**
 * Exporting MultiTenant
 *
 * @type {Function}
 */
exports = module.exports = MultiTenantsHostController;
