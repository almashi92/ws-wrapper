"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws = require("ws");
var events_1 = require("events");
var WebSocket = /** @class */ (function () {
    function WebSocket(data) {
        this.eventEmitter = null;
        this.ws = null;
        this.isServer = null;
        this.eventEmitter = new events_1.EventEmitter();
        this.isServer = !!data.isServer;
        if (data.isServer) {
            this.ws = new ws.Server(__assign({}, data.config));
            this.initializeServer();
        }
        else {
            this.ws = new ws(data.url, data.opts || {});
            this.initializeClient();
        }
    }
    WebSocket.getInstance = function (config) {
        if (!this.instance) {
            this.instance = new this(config);
        }
        return this.instance;
    };
    WebSocket.prototype.onConnect = function (callback) {
        var _this = this;
        if (this.isServer) {
            this.eventEmitter.on('connection', function (client) {
                client.emitter = new events_1.EventEmitter();
                client.on('message', function (data) {
                    var message = JSON.parse(data);
                    client.emitter.emit(message.type, message.data);
                });
                client.on('close', function () {
                    _this.eventEmitter.emit('close', client);
                });
                callback(client);
            });
        }
        else {
            this.eventEmitter.on('connection', function () {
                callback();
            });
        }
    };
    WebSocket.prototype.emit = function (type, data, recipient) {
        var _this = this;
        if (recipient === void 0) { recipient = null; }
        var message = JSON.stringify({ type: type, data: data });
        if (this.isServer && recipient) {
            if (recipient === typeof Array) {
                recipient.map(function (client) {
                    _this.sendToClient(message, client);
                });
            }
            else {
                this.sendToClient(message, recipient);
            }
        }
        else {
            this.sendToServer(message);
        }
    };
    WebSocket.prototype.sendToClient = function (message, client) {
        client.send(message);
    };
    WebSocket.prototype.sendToServer = function (message) {
        this.ws.send(message);
    };
    WebSocket.prototype.onDisconnect = function (callback) {
        if (this.isServer) {
            this.eventEmitter.on('close', function (client) {
                callback(client);
            });
        }
        else {
            this.eventEmitter.on('close', function () {
                callback();
            });
        }
    };
    WebSocket.prototype.on = function (event, callback) {
        this.eventEmitter.on(event, callback);
    };
    WebSocket.prototype.initializeClient = function () {
        var _this = this;
        this.ws.on('open', function () {
            _this.eventEmitter.emit('connection');
        });
        this.ws.on('close', function () {
            _this.eventEmitter.emit('close');
        });
        this.ws.on('message', function (data) {
            var message = JSON.parse(data);
            if (message && message.type && message.type !== 'connection' && message.type !== 'close') {
                _this.eventEmitter.emit(message.type, message.data);
            }
        });
    };
    WebSocket.prototype.initializeServer = function () {
        var _this = this;
        this.ws.on('connection', function (client) {
            _this.eventEmitter.emit('connection', client);
        });
    };
    WebSocket.instance = null;
    return WebSocket;
}());
exports.default = WebSocket;
