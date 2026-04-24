module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1776008460243, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRealtime = void 0;
var websocket_client_1 = require("./websocket-client");
var common_1 = require("./common");
var hook = {
    target: 'database',
    entity: function () {
        var _a = this.platform, adapter = _a.adapter, runtime = _a.runtime;
        (0, common_1.setWsClass)(adapter.wsClass);
        (0, common_1.setRuntime)(runtime);
    },
};
var component = {
    name: 'realtime',
    IIFE: true,
    entity: function () {
        this.prototype.wsClientClass = websocket_client_1.RealtimeWebSocketClient;
    },
};
try {
    cloudbase.registerComponent(component);
    cloudbase.registerHook(hook);
}
catch (e) { }
function registerRealtime(app) {
    try {
        app.registerComponent(component);
        app.registerHook(hook);
    }
    catch (e) {
        console.warn(e);
    }
}
exports.registerRealtime = registerRealtime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdURBQTREO0FBQzVELG1DQUFpRDtBQUtqRCxJQUFNLElBQUksR0FBbUI7SUFDM0IsTUFBTSxFQUFFLFVBQVU7SUFDbEIsTUFBTTtRQUNFLElBQUEsS0FBdUIsSUFBSSxDQUFDLFFBQVEsRUFBbEMsT0FBTyxhQUFBLEVBQUUsT0FBTyxhQUFrQixDQUFBO1FBQzFDLElBQUEsbUJBQVUsRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDM0IsSUFBQSxtQkFBVSxFQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3JCLENBQUM7Q0FDRixDQUFBO0FBRUQsSUFBTSxTQUFTLEdBQXdCO0lBQ3JDLElBQUksRUFBRSxVQUFVO0lBQ2hCLElBQUksRUFBRSxJQUFJO0lBQ1YsTUFBTTtRQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLDBDQUF1QixDQUFBO0lBQ3hELENBQUM7Q0FDRixDQUFBO0FBRUQsSUFBSTtJQUNGLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUN0QyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0NBQzdCO0FBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRTtBQUVkLFNBQWdCLGdCQUFnQixDQUFDLEdBQXlEO0lBQ3hGLElBQUk7UUFDRixHQUFHLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDaEMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN2QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNoQjtBQUNILENBQUM7QUFQRCw0Q0FPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElDbG91ZGJhc2UgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzJ1xuaW1wb3J0IHsgUmVhbHRpbWVXZWJTb2NrZXRDbGllbnQgfSBmcm9tICcuL3dlYnNvY2tldC1jbGllbnQnXG5pbXBvcnQgeyBzZXRXc0NsYXNzLCBzZXRSdW50aW1lIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBJQ2xvdWRiYXNlQ29tcG9uZW50LCBJQ2xvdWRiYXNlSG9vayB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvY29tcG9uZW50J1xuXG5kZWNsYXJlIGNvbnN0IGNsb3VkYmFzZTogSUNsb3VkYmFzZVxuXG5jb25zdCBob29rOiBJQ2xvdWRiYXNlSG9vayA9IHtcbiAgdGFyZ2V0OiAnZGF0YWJhc2UnLFxuICBlbnRpdHkoKSB7XG4gICAgY29uc3QgeyBhZGFwdGVyLCBydW50aW1lIH0gPSB0aGlzLnBsYXRmb3JtXG4gICAgc2V0V3NDbGFzcyhhZGFwdGVyLndzQ2xhc3MpXG4gICAgc2V0UnVudGltZShydW50aW1lKVxuICB9LFxufVxuXG5jb25zdCBjb21wb25lbnQ6IElDbG91ZGJhc2VDb21wb25lbnQgPSB7XG4gIG5hbWU6ICdyZWFsdGltZScsXG4gIElJRkU6IHRydWUsXG4gIGVudGl0eSgpIHtcbiAgICB0aGlzLnByb3RvdHlwZS53c0NsaWVudENsYXNzID0gUmVhbHRpbWVXZWJTb2NrZXRDbGllbnRcbiAgfSxcbn1cblxudHJ5IHtcbiAgY2xvdWRiYXNlLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudClcbiAgY2xvdWRiYXNlLnJlZ2lzdGVySG9vayhob29rKVxufSBjYXRjaCAoZSkge31cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUmVhbHRpbWUoYXBwOiBQaWNrPElDbG91ZGJhc2UsICdyZWdpc3RlckNvbXBvbmVudCd8J3JlZ2lzdGVySG9vayc+KSB7XG4gIHRyeSB7XG4gICAgYXBwLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudClcbiAgICBhcHAucmVnaXN0ZXJIb29rKGhvb2spXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oZSlcbiAgfVxufVxuIl19
}, function(modId) {var map = {"./websocket-client":1776008460244,"./common":1776008460252}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460244, function(require, module, exports) {

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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeWebSocketClient = void 0;
var virtual_websocket_client_1 = require("./virtual-websocket-client");
var message_1 = require("./message");
var ws_event_1 = require("./ws-event");
var error_1 = require("./error");
var common_1 = require("./common");
var utils_1 = require("./utils");
var WS_READY_STATE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
};
var MAX_RTT_OBSERVED = 3;
var DEFAULT_EXPECTED_EVENT_WAIT_TIME = 5000;
var DEFAULT_UNTRUSTED_RTT_THRESHOLD = 10000;
var DEFAULT_MAX_RECONNECT = 5;
var DEFAULT_WS_RECONNECT_INTERVAL = 10000;
var DEFAULT_PING_FAIL_TOLERANCE = 2;
var DEFAULT_PONG_MISS_TOLERANCE = 2;
var DEFAULT_LOGIN_TIMEOUT = 5000;
var RealtimeWebSocketClient = (function () {
    function RealtimeWebSocketClient(options) {
        var _this = this;
        this.virtualWSClient = new Set();
        this.queryIdClientMap = new Map();
        this.watchIdClientMap = new Map();
        this.pingFailed = 0;
        this.pongMissed = 0;
        this.logins = new Map();
        this.wsReadySubsribers = [];
        this.wsResponseWait = new Map();
        this.rttObserved = [];
        this.send = function (opts) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (_resolve, _reject) {
                        void (function () { return __awaiter(_this, void 0, void 0, function () {
                            var timeoutId, hasResolved, hasRejected, resolve, reject, respWaitSpec, err_1, e_1;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        hasResolved = false;
                                        hasRejected = false;
                                        resolve = function (value) {
                                            hasResolved = true;
                                            timeoutId && clearTimeout(timeoutId);
                                            _resolve(value);
                                        };
                                        reject = function (error) {
                                            hasRejected = true;
                                            timeoutId && clearTimeout(timeoutId);
                                            _reject(error);
                                        };
                                        if (opts.timeout) {
                                            timeoutId = setTimeout(function () {
                                                (function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!(!hasResolved || !hasRejected)) return [3, 2];
                                                                return [4, (0, utils_1.sleep)(0)];
                                                            case 1:
                                                                _a.sent();
                                                                if (!hasResolved || !hasRejected) {
                                                                    reject(new error_1.TimeoutError('wsclient.send timedout'));
                                                                }
                                                                _a.label = 2;
                                                            case 2: return [2];
                                                        }
                                                    });
                                                }); })();
                                            }, opts.timeout);
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 8, , 9]);
                                        if (!(this.wsInitPromise !== undefined || this.wsInitPromise !== null)) return [3, 3];
                                        return [4, this.wsInitPromise];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        if (!this.ws) {
                                            reject(new Error('invalid state: ws connection not exists, can not send message'));
                                            return [2];
                                        }
                                        if (this.ws.readyState !== WS_READY_STATE.OPEN) {
                                            reject(new Error("ws readyState invalid: ".concat(this.ws.readyState, ", can not send message")));
                                            return [2];
                                        }
                                        if (opts.waitResponse) {
                                            respWaitSpec = {
                                                resolve: resolve,
                                                reject: reject,
                                                skipOnMessage: opts.skipOnMessage,
                                            };
                                            this.wsResponseWait.set(opts.msg.requestId, respWaitSpec);
                                        }
                                        _a.label = 4;
                                    case 4:
                                        _a.trys.push([4, 6, , 7]);
                                        return [4, this.ws.send(JSON.stringify(opts.msg))];
                                    case 5:
                                        _a.sent();
                                        if (!opts.waitResponse) {
                                            resolve(void 0);
                                        }
                                        return [3, 7];
                                    case 6:
                                        err_1 = _a.sent();
                                        if (err_1) {
                                            reject(err_1);
                                            if (opts.waitResponse) {
                                                this.wsResponseWait.delete(opts.msg.requestId);
                                            }
                                        }
                                        return [3, 7];
                                    case 7: return [3, 9];
                                    case 8:
                                        e_1 = _a.sent();
                                        reject(e_1);
                                        return [3, 9];
                                    case 9: return [2];
                                }
                            });
                        }); })();
                    })];
            });
        }); };
        this.closeAllClients = function (error) {
            _this.virtualWSClient.forEach(function (client) {
                client.closeWithError(error);
            });
        };
        this.pauseClients = function (clients) {
            (clients || _this.virtualWSClient).forEach(function (client) {
                client.pause();
            });
        };
        this.resumeClients = function (clients) {
            (clients || _this.virtualWSClient).forEach(function (client) {
                client.resume();
            });
        };
        this.initWebSocketConnection = function (reconnect, availableRetries) {
            if (availableRetries === void 0) { availableRetries = _this.maxReconnect; }
            return __awaiter(_this, void 0, void 0, function () {
                var e_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (reconnect && this.reconnectState) {
                                return [2];
                            }
                            if (reconnect) {
                                this.reconnectState = true;
                            }
                            if (this.wsInitPromise !== undefined && this.wsInitPromise !== null) {
                                return [2, this.wsInitPromise];
                            }
                            if (reconnect) {
                                this.pauseClients();
                            }
                            this.close(ws_event_1.CloseEventCode.ReconnectWebSocket);
                            this.wsInitPromise = new Promise(function (resolve, reject) {
                                (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var wsSign_1, e_3, isConnected;
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 6, , 11]);
                                                return [4, this.getWsSign()];
                                            case 1:
                                                wsSign_1 = _a.sent();
                                                return [4, new Promise(function (success) {
                                                        var url = wsSign_1.wsUrl || 'wss://tcb-ws.tencentcloudapi.com';
                                                        var wsClass = (0, common_1.getWsClass)();
                                                        _this.ws = wsClass ? new wsClass(url) : new WebSocket(url);
                                                        success(void 0);
                                                    })];
                                            case 2:
                                                _a.sent();
                                                if (!this.ws.connect) return [3, 4];
                                                return [4, this.ws.connect()];
                                            case 3:
                                                _a.sent();
                                                _a.label = 4;
                                            case 4: return [4, this.initWebSocketEvent()];
                                            case 5:
                                                _a.sent();
                                                resolve();
                                                if (reconnect) {
                                                    this.resumeClients();
                                                    this.reconnectState = false;
                                                }
                                                return [3, 11];
                                            case 6:
                                                e_3 = _a.sent();
                                                console.error('[realtime] initWebSocketConnection connect fail', e_3);
                                                if (!(availableRetries > 0)) return [3, 9];
                                                isConnected = true;
                                                this.wsInitPromise = undefined;
                                                if (!isConnected) return [3, 8];
                                                return [4, (0, utils_1.sleep)(this.reconnectInterval)];
                                            case 7:
                                                _a.sent();
                                                if (reconnect) {
                                                    this.reconnectState = false;
                                                }
                                                _a.label = 8;
                                            case 8:
                                                resolve(this.initWebSocketConnection(reconnect, availableRetries - 1));
                                                return [3, 10];
                                            case 9:
                                                reject(e_3);
                                                if (reconnect) {
                                                    this.closeAllClients(new error_1.CloudSDKError({
                                                        errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_RECONNECT_WATCH_FAIL,
                                                        errMsg: e_3,
                                                    }));
                                                }
                                                _a.label = 10;
                                            case 10: return [3, 11];
                                            case 11: return [2];
                                        }
                                    });
                                }); })();
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4, this.wsInitPromise];
                        case 2:
                            _a.sent();
                            this.wsReadySubsribers.forEach(function (_a) {
                                var resolve = _a.resolve;
                                return resolve();
                            });
                            return [3, 5];
                        case 3:
                            e_2 = _a.sent();
                            this.wsReadySubsribers.forEach(function (_a) {
                                var reject = _a.reject;
                                return reject();
                            });
                            return [3, 5];
                        case 4:
                            this.wsInitPromise = undefined;
                            this.wsReadySubsribers = [];
                            return [7];
                        case 5: return [2];
                    }
                });
            });
        };
        this.initWebSocketEvent = function () { return new Promise(function (resolve, reject) {
            if (!_this.ws) {
                throw new Error('can not initWebSocketEvent, ws not exists');
            }
            var wsOpened = false;
            _this.ws.onopen = function (event) {
                console.warn('[realtime] ws event: open', event);
                wsOpened = true;
                resolve();
            };
            _this.ws.onerror = function (event) {
                _this.logins = new Map();
                if (!wsOpened) {
                    console.error('[realtime] ws open failed with ws event: error', event);
                    reject(event);
                }
                else {
                    console.error('[realtime] ws event: error', event);
                    _this.clearHeartbeat();
                    _this.virtualWSClient.forEach(function (client) { return client.closeWithError(new error_1.CloudSDKError({
                        errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_WEBSOCKET_CONNECTION_ERROR,
                        errMsg: event,
                    })); });
                }
            };
            _this.ws.onclose = function (closeEvent) {
                console.warn('[realtime] ws event: close', closeEvent);
                _this.logins = new Map();
                _this.clearHeartbeat();
                switch (closeEvent.code) {
                    case ws_event_1.CloseEventCode.ReconnectWebSocket: {
                        break;
                    }
                    case ws_event_1.CloseEventCode.NoRealtimeListeners: {
                        break;
                    }
                    case ws_event_1.CloseEventCode.HeartbeatPingError:
                    case ws_event_1.CloseEventCode.HeartbeatPongTimeoutError:
                    case ws_event_1.CloseEventCode.NormalClosure:
                    case ws_event_1.CloseEventCode.AbnormalClosure: {
                        if (_this.maxReconnect > 0) {
                            _this.initWebSocketConnection(true, _this.maxReconnect);
                        }
                        else {
                            _this.closeAllClients((0, ws_event_1.getWSCloseError)(closeEvent.code));
                        }
                        break;
                    }
                    case ws_event_1.CloseEventCode.NoAuthentication: {
                        _this.closeAllClients((0, ws_event_1.getWSCloseError)(closeEvent.code, closeEvent.reason));
                        break;
                    }
                    default: {
                        if (_this.maxReconnect > 0) {
                            _this.initWebSocketConnection(true, _this.maxReconnect);
                        }
                        else {
                            _this.closeAllClients((0, ws_event_1.getWSCloseError)(closeEvent.code));
                        }
                    }
                }
            };
            _this.ws.onmessage = function (res) {
                var _a;
                var rawMsg = ((_a = res.data) === null || _a === void 0 ? void 0 : _a.data) || res.data;
                _this.heartbeat();
                var msg;
                try {
                    msg = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
                }
                catch (e) {
                    throw new Error("[realtime] onMessage parse res.data error: ".concat(e));
                }
                if (msg.msgType === 'ERROR') {
                    var virtualWatch_1 = null;
                    _this.virtualWSClient.forEach(function (item) {
                        if (item.watchId === msg.watchId) {
                            virtualWatch_1 = item;
                        }
                    });
                    if (virtualWatch_1) {
                        virtualWatch_1.listener.onError(msg);
                    }
                }
                var responseWaitSpec = _this.wsResponseWait.get(msg.requestId);
                if (responseWaitSpec) {
                    try {
                        if (msg.msgType === 'ERROR') {
                            responseWaitSpec.reject(new error_1.RealtimeErrorMessageError(msg));
                        }
                        else {
                            responseWaitSpec.resolve(msg);
                        }
                    }
                    catch (e) {
                        console.error('ws onMessage responseWaitSpec.resolve(msg) errored:', e);
                    }
                    finally {
                        _this.wsResponseWait.delete(msg.requestId);
                    }
                    if (responseWaitSpec.skipOnMessage) {
                        return;
                    }
                }
                if (msg.msgType === 'PONG') {
                    if (_this.lastPingSendTS) {
                        var rtt = Date.now() - _this.lastPingSendTS;
                        if (rtt > DEFAULT_UNTRUSTED_RTT_THRESHOLD) {
                            console.warn("[realtime] untrusted rtt observed: ".concat(rtt));
                            return;
                        }
                        if (_this.rttObserved.length >= MAX_RTT_OBSERVED) {
                            _this.rttObserved.splice(0, _this.rttObserved.length - MAX_RTT_OBSERVED + 1);
                        }
                        _this.rttObserved.push(rtt);
                    }
                    return;
                }
                var client = msg.watchId && _this.watchIdClientMap.get(msg.watchId);
                if (client) {
                    client.onMessage(msg);
                }
                else {
                    console.error("[realtime] no realtime listener found responsible for watchId ".concat(msg.watchId, ": "), msg);
                    switch (msg.msgType) {
                        case 'INIT_EVENT':
                        case 'NEXT_EVENT':
                        case 'CHECK_EVENT': {
                            client = _this.queryIdClientMap.get(msg.msgData.queryID);
                            if (client) {
                                client.onMessage(msg);
                            }
                            break;
                        }
                        default: {
                            for (var _i = 0, _b = Array.from(_this.watchIdClientMap.entries()); _i < _b.length; _i++) {
                                var _c = _b[_i], client_1 = _c[1];
                                client_1.onMessage(msg);
                                break;
                            }
                        }
                    }
                }
            };
            _this.heartbeat();
        }); };
        this.isWSConnected = function () { return Boolean(_this.ws && _this.ws.readyState === WS_READY_STATE.OPEN); };
        this.onceWSConnected = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isWSConnected()) {
                    return [2];
                }
                if (this.wsInitPromise !== null && this.wsInitPromise !== undefined) {
                    return [2, this.wsInitPromise];
                }
                return [2, new Promise(function (resolve, reject) {
                        _this.wsReadySubsribers.push({
                            resolve: resolve,
                            reject: reject,
                        });
                    })];
            });
        }); };
        this.webLogin = function (envId, refresh) { return __awaiter(_this, void 0, void 0, function () {
            var loginInfo_1, emptyEnvLoginInfo, promise, loginInfo, loginStartTS, loginResult, curLoginInfo, e_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!refresh) {
                            if (envId) {
                                loginInfo_1 = this.logins.get(envId);
                                if (loginInfo_1) {
                                    if (loginInfo_1.loggedIn && loginInfo_1.loginResult) {
                                        return [2, loginInfo_1.loginResult];
                                    }
                                    if (loginInfo_1.loggingInPromise !== null && loginInfo_1.loggingInPromise !== undefined) {
                                        return [2, loginInfo_1.loggingInPromise];
                                    }
                                }
                            }
                            else {
                                emptyEnvLoginInfo = this.logins.get('');
                                if ((emptyEnvLoginInfo === null || emptyEnvLoginInfo === void 0 ? void 0 : emptyEnvLoginInfo.loggingInPromise) !== null && (emptyEnvLoginInfo === null || emptyEnvLoginInfo === void 0 ? void 0 : emptyEnvLoginInfo.loggingInPromise) !== undefined) {
                                    return [2, emptyEnvLoginInfo.loggingInPromise];
                                }
                            }
                        }
                        promise = new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var wsSign, msgData, loginMsg, loginResMsg, e_5;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            return [4, this.getWsSign()];
                                        case 1:
                                            wsSign = _a.sent();
                                            msgData = {
                                                envId: wsSign.envId || '',
                                                accessToken: '',
                                                referrer: 'web',
                                                sdkVersion: '',
                                                dataVersion: '',
                                            };
                                            loginMsg = {
                                                watchId: undefined,
                                                requestId: (0, message_1.genRequestId)(),
                                                msgType: 'LOGIN',
                                                msgData: msgData,
                                                exMsgData: {
                                                    runtime: (0, common_1.getRuntime)(),
                                                    signStr: wsSign.signStr,
                                                    secretVersion: wsSign.secretVersion,
                                                },
                                            };
                                            return [4, this.send({
                                                    msg: loginMsg,
                                                    waitResponse: true,
                                                    skipOnMessage: true,
                                                    timeout: DEFAULT_LOGIN_TIMEOUT,
                                                })];
                                        case 2:
                                            loginResMsg = _a.sent();
                                            if (!loginResMsg.msgData.code) {
                                                resolve({
                                                    envId: wsSign.envId,
                                                });
                                            }
                                            else {
                                                reject(new Error("".concat(loginResMsg.msgData.code, " ").concat(loginResMsg.msgData.message)));
                                            }
                                            return [3, 4];
                                        case 3:
                                            e_5 = _a.sent();
                                            reject(e_5);
                                            return [3, 4];
                                        case 4: return [2];
                                    }
                                });
                            }); })();
                        });
                        loginInfo = envId && this.logins.get(envId);
                        loginStartTS = Date.now();
                        if (loginInfo) {
                            loginInfo.loggedIn = false;
                            loginInfo.loggingInPromise = promise;
                            loginInfo.loginStartTS = loginStartTS;
                        }
                        else {
                            loginInfo = {
                                loggedIn: false,
                                loggingInPromise: promise,
                                loginStartTS: loginStartTS,
                            };
                            this.logins.set(envId || '', loginInfo);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, promise];
                    case 2:
                        loginResult = _a.sent();
                        curLoginInfo = envId && this.logins.get(envId);
                        if (curLoginInfo
                            && curLoginInfo === loginInfo
                            && curLoginInfo.loginStartTS === loginStartTS) {
                            loginInfo.loggedIn = true;
                            loginInfo.loggingInPromise = undefined;
                            loginInfo.loginStartTS = undefined;
                            loginInfo.loginResult = loginResult;
                            return [2, loginResult];
                        }
                        if (curLoginInfo) {
                            if (curLoginInfo.loggedIn && curLoginInfo.loginResult) {
                                return [2, curLoginInfo.loginResult];
                            }
                            if (curLoginInfo.loggingInPromise !== null && curLoginInfo.loggingInPromise !== undefined) {
                                return [2, curLoginInfo.loggingInPromise];
                            }
                            throw new Error('ws unexpected login info');
                        }
                        else {
                            throw new Error('ws login info reset');
                        }
                        return [3, 4];
                    case 3:
                        e_4 = _a.sent();
                        loginInfo.loggedIn = false;
                        loginInfo.loggingInPromise = undefined;
                        loginInfo.loginStartTS = undefined;
                        loginInfo.loginResult = undefined;
                        throw e_4;
                    case 4: return [2];
                }
            });
        }); };
        this.getWsSign = function () { return __awaiter(_this, void 0, void 0, function () {
            var expiredTs, res, _a, signStr, wsUrl, secretVersion, envId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.wsSign && this.wsSign.expiredTs > Date.now()) {
                            return [2, this.wsSign];
                        }
                        expiredTs = Date.now() + 60000;
                        return [4, this.context.appConfig.request.send('auth.wsWebSign', { runtime: (0, common_1.getRuntime)() })];
                    case 1:
                        res = _b.sent();
                        if (res.code) {
                            throw new Error("[tcb-js-sdk] \u83B7\u53D6\u5B9E\u65F6\u6570\u636E\u63A8\u9001\u767B\u5F55\u7968\u636E\u5931\u8D25: ".concat(res.code));
                        }
                        if (res.data) {
                            _a = res.data, signStr = _a.signStr, wsUrl = _a.wsUrl, secretVersion = _a.secretVersion, envId = _a.envId;
                            return [2, {
                                    signStr: signStr,
                                    wsUrl: wsUrl,
                                    secretVersion: secretVersion,
                                    envId: envId,
                                    expiredTs: expiredTs,
                                }];
                        }
                        throw new Error('[tcb-js-sdk] 获取实时数据推送登录票据失败');
                }
            });
        }); };
        this.getWaitExpectedTimeoutLength = function () {
            if (!_this.rttObserved.length) {
                return DEFAULT_EXPECTED_EVENT_WAIT_TIME;
            }
            return ((_this.rttObserved.reduce(function (acc, cur) { return acc + cur; })
                / _this.rttObserved.length)
                * 1.5);
        };
        this.ping = function () { return __awaiter(_this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        msg = {
                            watchId: undefined,
                            requestId: (0, message_1.genRequestId)(),
                            msgType: 'PING',
                            msgData: null,
                        };
                        return [4, this.send({
                                msg: msg,
                            })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); };
        this.onWatchStart = function (client, queryID) {
            _this.queryIdClientMap.set(queryID, client);
        };
        this.onWatchClose = function (client, queryID) {
            if (queryID) {
                _this.queryIdClientMap.delete(queryID);
            }
            _this.watchIdClientMap.delete(client.watchId);
            _this.virtualWSClient.delete(client);
            if (!_this.virtualWSClient.size) {
                _this.close(ws_event_1.CloseEventCode.NoRealtimeListeners);
            }
        };
        this.maxReconnect = options.maxReconnect || DEFAULT_MAX_RECONNECT;
        this.reconnectInterval = options.reconnectInterval || DEFAULT_WS_RECONNECT_INTERVAL;
        this.context = options.context;
    }
    RealtimeWebSocketClient.prototype.clearHeartbeat = function () {
        this.pingTimeoutId && clearTimeout(this.pingTimeoutId);
        this.pongTimeoutId && clearTimeout(this.pongTimeoutId);
    };
    RealtimeWebSocketClient.prototype.close = function (code) {
        this.clearHeartbeat();
        if (this.ws) {
            this.ws.close(code, ws_event_1.CLOSE_EVENT_CODE_INFO[code].name);
            this.ws = undefined;
        }
    };
    RealtimeWebSocketClient.prototype.watch = function (options) {
        if (!this.ws && (this.wsInitPromise === undefined || this.wsInitPromise === null)) {
            this.initWebSocketConnection(false);
        }
        var virtualClient = new virtual_websocket_client_1.VirtualWebSocketClient(__assign(__assign({}, options), { send: this.send, login: this.webLogin, isWSConnected: this.isWSConnected, onceWSConnected: this.onceWSConnected, getWaitExpectedTimeoutLength: this.getWaitExpectedTimeoutLength, onWatchStart: this.onWatchStart, onWatchClose: this.onWatchClose, debug: true }));
        this.virtualWSClient.add(virtualClient);
        this.watchIdClientMap.set(virtualClient.watchId, virtualClient);
        return virtualClient.listener;
    };
    RealtimeWebSocketClient.prototype.heartbeat = function (immediate) {
        var _this = this;
        this.clearHeartbeat();
        this.pingTimeoutId = setTimeout(function () {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var e_6;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!this.ws || this.ws.readyState !== WS_READY_STATE.OPEN) {
                                return [2];
                            }
                            this.lastPingSendTS = Date.now();
                            return [4, this.ping()];
                        case 1:
                            _a.sent();
                            this.pingFailed = 0;
                            this.pongTimeoutId = setTimeout(function () {
                                console.error('pong timed out');
                                if (_this.pongMissed < DEFAULT_PONG_MISS_TOLERANCE) {
                                    _this.pongMissed += 1;
                                    _this.heartbeat(true);
                                }
                                else {
                                    _this.initWebSocketConnection(true);
                                }
                            }, this.context.appConfig.realtimePongWaitTimeout);
                            return [3, 3];
                        case 2:
                            e_6 = _a.sent();
                            if (this.pingFailed < DEFAULT_PING_FAIL_TOLERANCE) {
                                this.pingFailed += 1;
                                this.heartbeat();
                            }
                            else {
                                this.close(ws_event_1.CloseEventCode.HeartbeatPingError);
                            }
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            }); })();
        }, immediate ? 0 : this.context.appConfig.realtimePingInterval);
    };
    return RealtimeWebSocketClient;
}());
exports.RealtimeWebSocketClient = RealtimeWebSocketClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic29ja2V0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93ZWJzb2NrZXQtY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUVBQW1FO0FBQ25FLHFDQUF3QztBQWN4Qyx1Q0FJbUI7QUFFbkIsaUNBQTBGO0FBQzFGLG1DQUFpRDtBQUNqRCxpQ0FBK0I7QUE0RC9CLElBQU0sY0FBYyxHQUFHO0lBQ3JCLFVBQVUsRUFBRSxDQUFDO0lBQ2IsSUFBSSxFQUFFLENBQUM7SUFDUCxPQUFPLEVBQUUsQ0FBQztJQUNWLE1BQU0sRUFBRSxDQUFDO0NBQ1YsQ0FBQTtBQUVELElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFBO0FBQzFCLElBQU0sZ0NBQWdDLEdBQUcsSUFBSSxDQUFBO0FBQzdDLElBQU0sK0JBQStCLEdBQUcsS0FBSyxDQUFBO0FBQzdDLElBQU0scUJBQXFCLEdBQUcsQ0FBQyxDQUFBO0FBQy9CLElBQU0sNkJBQTZCLEdBQUcsS0FBSyxDQUFBO0FBRTNDLElBQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFBO0FBQ3JDLElBQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFBO0FBQ3JDLElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFBO0FBRWxDO0lBMEJFLGlDQUFZLE9BQW1EO1FBQS9ELGlCQUlDO1FBN0JPLG9CQUFlLEdBQWdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFFeEQscUJBQWdCLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFDakUscUJBQWdCLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFNakUsZUFBVSxHQUFHLENBQUMsQ0FBQTtRQUNkLGVBQVUsR0FBRyxDQUFDLENBQUE7UUFHZCxXQUFNLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFFdkQsc0JBQWlCLEdBQXFCLEVBQUUsQ0FBQTtRQUN4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QUFDLFVBQVUsSUFBSSxDQUFDLENBQUE7Z0NBQ3BCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTs2QkFDakI7aUNBQU07Z0NBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBYyxDQUFDLGtCQUFrQixDQUFDLENBQUE7NkJBQzlDOzs7OztpQkFFSixDQUNGLEVBQUUsQ0FBQTtRQUNMLENBQUMsRUFDRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQzVELENBQUE7SUFDSCxDQUFDO0lBOEJILDhCQUFDO0FBQUQsQ0FBQyxBQXRxQkQsSUFzcUJDO0FBdHFCWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaXJ0dWFsV2ViU29ja2V0Q2xpZW50IH0gZnJvbSAnLi92aXJ0dWFsLXdlYnNvY2tldC1jbGllbnQnXG5pbXBvcnQgeyBnZW5SZXF1ZXN0SWQgfSBmcm9tICcuL21lc3NhZ2UnXG5pbXBvcnQge1xuICBJRGF0YWJhc2VTZXJ2aWNlQ29udGV4dCxcbn0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9kYXRhYmFzZSdcbmltcG9ydCB7XG4gIElXYXRjaE9wdGlvbnMsXG4gIERCUmVhbHRpbWVMaXN0ZW5lcixcbiAgSVJlcXVlc3RNZXNzYWdlLFxuICBJUmVzcG9uc2VNZXNzYWdlLFxuICBJUmVxdWVzdE1lc3NhZ2VQaW5nTXNnLFxuICBJUmVxdWVzdE1lc3NhZ2VMb2dpbk1zZyxcbiAgSVJlc3BvbnNlTWVzc2FnZUxvZ2luUmVzTXNnLFxuICBJUmVxdWVzdE1lc3NhZ2VMb2dpbkRhdGEsXG59IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvcmVhbHRpbWUnXG5pbXBvcnQge1xuICBDbG9zZUV2ZW50Q29kZSxcbiAgQ0xPU0VfRVZFTlRfQ09ERV9JTkZPLFxuICBnZXRXU0Nsb3NlRXJyb3IsXG59IGZyb20gJy4vd3MtZXZlbnQnXG5cbmltcG9ydCB7IEVSUl9DT0RFLCBUaW1lb3V0RXJyb3IsIFJlYWx0aW1lRXJyb3JNZXNzYWdlRXJyb3IsIENsb3VkU0RLRXJyb3IgfSBmcm9tICcuL2Vycm9yJ1xuaW1wb3J0IHsgZ2V0V3NDbGFzcywgZ2V0UnVudGltZSB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tICcuL3V0aWxzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZWFsdGltZVdlYlNvY2tldENsaWVudENvbnN0cnVjdG9yT3B0aW9ucyB7XG4gIG1heFJlY29ubmVjdD86IG51bWJlclxuICByZWNvbm5lY3RJbnRlcnZhbD86IG51bWJlclxuICBjb250ZXh0OiBJRGF0YWJhc2VTZXJ2aWNlQ29udGV4dFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTaWduYXR1cmUge1xuICBlbnZJZDogc3RyaW5nXG4gIHNlY3JldFZlcnNpb246IG51bWJlclxuICBzaWduU3RyOiBzdHJpbmdcbiAgd3NVcmw6IHN0cmluZ1xuICBleHBpcmVUUzogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxvZ2luSW5mbyB7XG4gIGxvZ2dlZEluOiBib29sZWFuXG4gIGxvZ2dpbmdJblByb21pc2U/OiBQcm9taXNlPElMb2dpblJlc3VsdD5cbiAgbG9naW5TdGFydFRTPzogbnVtYmVyXG4gIGxvZ2luUmVzdWx0PzogSUxvZ2luUmVzdWx0XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxvZ2luUmVzdWx0IHtcbiAgZW52SWQ6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXU1NlbmRPcHRpb25zIHtcbiAgbXNnOiBJUmVxdWVzdE1lc3NhZ2VcbiAgd2FpdFJlc3BvbnNlPzogYm9vbGVhblxuICAvLyB3aGVuIHdhaXRSZXNwb25zZSBpcyBzZXQgdG8gdHJ1ZSwgaWYgc2tpcE9uTWVzc2FnZSBpcyB0cnVlLCBnZW5lcmFsIG9uTWVzc2FnZSBoYW5kbGVyIHdpbGwgYmUgc2tpcHBlZFxuICBza2lwT25NZXNzYWdlPzogYm9vbGVhblxuICB0aW1lb3V0PzogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdTV2F0Y2hPcHRpb25zIGV4dGVuZHMgSVdhdGNoT3B0aW9ucyB7XG4gIGVudklkPzogc3RyaW5nXG4gIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmdcbiAgcXVlcnk6IHN0cmluZ1xuICBsaW1pdD86IG51bWJlclxuICBvcmRlckJ5PzogUmVjb3JkPHN0cmluZywgc3RyaW5nPlxufVxuXG5pbnRlcmZhY2UgSVJlc29sdmVSZWplY3Qge1xuICByZXNvbHZlOiAodmFsdWU/OiBhbnkgfCBQcm9taXNlTGlrZTxhbnk+IHwgdW5kZWZpbmVkKSA9PiB2b2lkXG4gIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZFxufVxuXG5pbnRlcmZhY2UgSVJlc3BvbnNlV2FpdFNwZWMgZXh0ZW5kcyBJUmVzb2x2ZVJlamVjdCB7XG4gIHNraXBPbk1lc3NhZ2U/OiBib29sZWFuXG59XG5cbmludGVyZmFjZSBJV3NTaWduIHtcbiAgc2lnblN0cjogc3RyaW5nLFxuICB3c1VybDogc3RyaW5nLFxuICBzZWNyZXRWZXJzaW9uOiBzdHJpbmdcbiAgZW52SWQ6IHN0cmluZ1xuICBleHBpcmVkVHM6IG51bWJlclxufVxuXG5jb25zdCBXU19SRUFEWV9TVEFURSA9IHtcbiAgQ09OTkVDVElORzogMCxcbiAgT1BFTjogMSxcbiAgQ0xPU0lORzogMixcbiAgQ0xPU0VEOiAzLFxufVxuXG5jb25zdCBNQVhfUlRUX09CU0VSVkVEID0gM1xuY29uc3QgREVGQVVMVF9FWFBFQ1RFRF9FVkVOVF9XQUlUX1RJTUUgPSA1MDAwXG5jb25zdCBERUZBVUxUX1VOVFJVU1RFRF9SVFRfVEhSRVNIT0xEID0gMTAwMDBcbmNvbnN0IERFRkFVTFRfTUFYX1JFQ09OTkVDVCA9IDVcbmNvbnN0IERFRkFVTFRfV1NfUkVDT05ORUNUX0lOVEVSVkFMID0gMTAwMDBcbi8vIGNvbnN0IERFRkFVTFRfV1NfUkVDT05ORUNUX01BWF9WQUxJRF9JTlRFUlZBTCA9IDMgKiA2MCAqIDEwMDBcbmNvbnN0IERFRkFVTFRfUElOR19GQUlMX1RPTEVSQU5DRSA9IDJcbmNvbnN0IERFRkFVTFRfUE9OR19NSVNTX1RPTEVSQU5DRSA9IDJcbmNvbnN0IERFRkFVTFRfTE9HSU5fVElNRU9VVCA9IDUwMDBcblxuZXhwb3J0IGNsYXNzIFJlYWx0aW1lV2ViU29ja2V0Q2xpZW50IHtcbiAgcHJpdmF0ZSB2aXJ0dWFsV1NDbGllbnQ6IFNldDxWaXJ0dWFsV2ViU29ja2V0Q2xpZW50PiA9IG5ldyBTZXQoKVxuICAvLyBhZnRlciBsaXN0ZW5lciBpbml0V2F0Y2gsIHRoZSBsaXN0ZW5lciBoYXMgdGhlIHF1ZXJ5SUQgYW5kIGNhbiBzdG9yZSBpdCBoZXJlXG4gIHByaXZhdGUgcXVlcnlJZENsaWVudE1hcDogTWFwPHN0cmluZywgVmlydHVhbFdlYlNvY2tldENsaWVudD4gPSBuZXcgTWFwKClcbiAgcHJpdmF0ZSB3YXRjaElkQ2xpZW50TWFwOiBNYXA8c3RyaW5nLCBWaXJ0dWFsV2ViU29ja2V0Q2xpZW50PiA9IG5ldyBNYXAoKVxuICBwcml2YXRlIG1heFJlY29ubmVjdDogbnVtYmVyXG4gIHByaXZhdGUgcmVjb25uZWN0SW50ZXJ2YWw6IG51bWJlclxuICBwcml2YXRlIGNvbnRleHQ6IElEYXRhYmFzZVNlcnZpY2VDb250ZXh0XG4gIHByaXZhdGUgd3M/OiBhbnlcbiAgcHJpdmF0ZSBsYXN0UGluZ1NlbmRUUz86IG51bWJlclxuICBwcml2YXRlIHBpbmdGYWlsZWQgPSAwXG4gIHByaXZhdGUgcG9uZ01pc3NlZCA9IDBcbiAgcHJpdmF0ZSBwaW5nVGltZW91dElkPzogbnVtYmVyXG4gIHByaXZhdGUgcG9uZ1RpbWVvdXRJZD86IG51bWJlclxuICBwcml2YXRlIGxvZ2luczogTWFwPHN0cmluZyAvKiBlbnZJZCAqLywgSUxvZ2luSW5mbz4gPSBuZXcgTWFwKClcbiAgcHJpdmF0ZSB3c0luaXRQcm9taXNlPzogUHJvbWlzZTx2b2lkPlxuICBwcml2YXRlIHdzUmVhZHlTdWJzcmliZXJzOiBJUmVzb2x2ZVJlamVjdFtdID0gW11cbiAgcHJpdmF0ZSB3c1Jlc3BvbnNlV2FpdDogTWFwPFxuICBzdHJpbmcgLyogcmVxdWVzdElkICovLFxuICBJUmVzcG9uc2VXYWl0U3BlY1xuICA+ID0gbmV3IE1hcCgpXG4gIHByaXZhdGUgcnR0T2JzZXJ2ZWQ6IG51bWJlcltdID0gW11cbiAgcHJpdmF0ZSByZWNvbm5lY3RTdGF0ZTogYm9vbGVhblxuICAvLyBvYnRhaW5lZCBmcm9tIHRoZSBmaXJzdCBnZXRTaWduYXR1cmUgd2l0aCBubyBlbnZJZCBwcm92aWRlZFxuICBwcml2YXRlIHdzU2lnbjogSVdzU2lnblxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IElSZWFsdGltZVdlYlNvY2tldENsaWVudENvbnN0cnVjdG9yT3B0aW9ucykge1xuICAgIHRoaXMubWF4UmVjb25uZWN0ID0gb3B0aW9ucy5tYXhSZWNvbm5lY3QgfHwgREVGQVVMVF9NQVhfUkVDT05ORUNUXG4gICAgdGhpcy5yZWNvbm5lY3RJbnRlcnZhbCA9IG9wdGlvbnMucmVjb25uZWN0SW50ZXJ2YWwgfHwgREVGQVVMVF9XU19SRUNPTk5FQ1RfSU5URVJWQUxcbiAgICB0aGlzLmNvbnRleHQgPSBvcHRpb25zLmNvbnRleHRcbiAgfVxuXG4gIGNsZWFySGVhcnRiZWF0KCkge1xuICAgIHRoaXMucGluZ1RpbWVvdXRJZCAmJiBjbGVhclRpbWVvdXQodGhpcy5waW5nVGltZW91dElkKVxuICAgIHRoaXMucG9uZ1RpbWVvdXRJZCAmJiBjbGVhclRpbWVvdXQodGhpcy5wb25nVGltZW91dElkKVxuICB9XG5cbiAgc2VuZCA9IGFzeW5jIDxUID0gYW55PihvcHRzOiBJV1NTZW5kT3B0aW9ucyk6IFByb21pc2U8VD4gPT4gbmV3IFByb21pc2U8VD4oKF9yZXNvbHZlLCBfcmVqZWN0KSA9PiB7XG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IHRpbWVvdXRJZDogbnVtYmVyXG4gICAgICBsZXQgaGFzUmVzb2x2ZWQgPSBmYWxzZVxuICAgICAgbGV0IGhhc1JlamVjdGVkID0gZmFsc2VcblxuICAgICAgY29uc3QgcmVzb2x2ZTogdHlwZW9mIF9yZXNvbHZlID0gKHZhbHVlPzogVCB8IFByb21pc2VMaWtlPFQ+IHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgICAgIGhhc1Jlc29sdmVkID0gdHJ1ZVxuICAgICAgICB0aW1lb3V0SWQgJiYgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgICAgX3Jlc29sdmUodmFsdWUpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlamVjdDogdHlwZW9mIF9yZWplY3QgPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICBoYXNSZWplY3RlZCA9IHRydWVcbiAgICAgICAgdGltZW91dElkICYmIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpXG4gICAgICAgIF9yZWplY3QoZXJyb3IpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLnRpbWVvdXQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFoYXNSZXNvbHZlZCB8fCAhaGFzUmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgLy8gd2FpdCBhbm90aGVyIGltbWVkaWF0ZSB0aW1lb3V0IHRvIGFsbG93IHRoZSBzdWNjZXNzL2ZhaWwgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBpZiB3cyBoYXMgYWxyZWFkeSBnb3QgdGhlIHJlc3VsdCxcbiAgICAgICAgICAgICAgLy8gdGhpcyBpcyBiZWNhdXNlIHRoZSB0aW1lciBpcyByZWdpc3RlcmVkIGJlZm9yZSB3cy5zZW5kXG4gICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDApXG4gICAgICAgICAgICAgIGlmICghaGFzUmVzb2x2ZWQgfHwgIWhhc1JlamVjdGVkKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBUaW1lb3V0RXJyb3IoJ3dzY2xpZW50LnNlbmQgdGltZWRvdXQnKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKClcbiAgICAgICAgfSwgb3B0cy50aW1lb3V0KVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAodGhpcy53c0luaXRQcm9taXNlICE9PSB1bmRlZmluZWQgfHwgdGhpcy53c0luaXRQcm9taXNlICE9PSBudWxsKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy53c0luaXRQcm9taXNlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMud3MpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdpbnZhbGlkIHN0YXRlOiB3cyBjb25uZWN0aW9uIG5vdCBleGlzdHMsIGNhbiBub3Qgc2VuZCBtZXNzYWdlJykpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53cy5yZWFkeVN0YXRlICE9PSBXU19SRUFEWV9TVEFURS5PUEVOKSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgd3MgcmVhZHlTdGF0ZSBpbnZhbGlkOiAke3RoaXMud3MucmVhZHlTdGF0ZX0sIGNhbiBub3Qgc2VuZCBtZXNzYWdlYCkpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0cy53YWl0UmVzcG9uc2UpIHtcbiAgICAgICAgICBjb25zdCByZXNwV2FpdFNwZWM6IElSZXNwb25zZVdhaXRTcGVjID0ge1xuICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgIHJlamVjdCxcbiAgICAgICAgICAgIHNraXBPbk1lc3NhZ2U6IG9wdHMuc2tpcE9uTWVzc2FnZSxcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy53c1Jlc3BvbnNlV2FpdC5zZXQob3B0cy5tc2cucmVxdWVzdElkLCByZXNwV2FpdFNwZWMpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zb2xlLmxvZygnc2VuZCBtc2c6Jywgb3B0cy5tc2cpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG9wdHMubXNnKSlcbiAgICAgICAgICBpZiAoIW9wdHMud2FpdFJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXNvbHZlKHZvaWQgMClcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgICBpZiAob3B0cy53YWl0UmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgdGhpcy53c1Jlc3BvbnNlV2FpdC5kZWxldGUob3B0cy5tc2cucmVxdWVzdElkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWplY3QoZSlcbiAgICAgIH1cbiAgICB9KSgpXG4gIH0pXG5cbiAgY2xvc2UoY29kZTogQ2xvc2VFdmVudENvZGUpIHtcbiAgICB0aGlzLmNsZWFySGVhcnRiZWF0KClcblxuICAgIGlmICh0aGlzLndzKSB7XG4gICAgICB0aGlzLndzLmNsb3NlKGNvZGUsIENMT1NFX0VWRU5UX0NPREVfSU5GT1tjb2RlXS5uYW1lKVxuICAgICAgdGhpcy53cyA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIGNsb3NlQWxsQ2xpZW50cyA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgdGhpcy52aXJ0dWFsV1NDbGllbnQuZm9yRWFjaCgoY2xpZW50KSA9PiB7XG4gICAgICBjbGllbnQuY2xvc2VXaXRoRXJyb3IoZXJyb3IpXG4gICAgfSlcbiAgfVxuXG4gIHBhdXNlQ2xpZW50cyA9IChjbGllbnRzPzogU2V0PFZpcnR1YWxXZWJTb2NrZXRDbGllbnQ+KSA9PiB7XG4gICAgKGNsaWVudHMgfHwgdGhpcy52aXJ0dWFsV1NDbGllbnQpLmZvckVhY2goKGNsaWVudCkgPT4ge1xuICAgICAgY2xpZW50LnBhdXNlKClcbiAgICB9KVxuICB9XG5cbiAgcmVzdW1lQ2xpZW50cyA9IChjbGllbnRzPzogU2V0PFZpcnR1YWxXZWJTb2NrZXRDbGllbnQ+KSA9PiB7XG4gICAgKGNsaWVudHMgfHwgdGhpcy52aXJ0dWFsV1NDbGllbnQpLmZvckVhY2goKGNsaWVudCkgPT4ge1xuICAgICAgY2xpZW50LnJlc3VtZSgpXG4gICAgfSlcbiAgfVxuXG4gIHdhdGNoKG9wdGlvbnM6IElXU1dhdGNoT3B0aW9ucyk6IERCUmVhbHRpbWVMaXN0ZW5lciB7XG4gICAgaWYgKCF0aGlzLndzICYmICh0aGlzLndzSW5pdFByb21pc2UgPT09IHVuZGVmaW5lZCB8fCB0aGlzLndzSW5pdFByb21pc2UgPT09IG51bGwpKSB7XG4gICAgICB0aGlzLmluaXRXZWJTb2NrZXRDb25uZWN0aW9uKGZhbHNlKVxuICAgIH1cblxuICAgIGNvbnN0IHZpcnR1YWxDbGllbnQgPSBuZXcgVmlydHVhbFdlYlNvY2tldENsaWVudCh7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgc2VuZDogdGhpcy5zZW5kLFxuICAgICAgbG9naW46IHRoaXMud2ViTG9naW4sXG4gICAgICBpc1dTQ29ubmVjdGVkOiB0aGlzLmlzV1NDb25uZWN0ZWQsXG4gICAgICBvbmNlV1NDb25uZWN0ZWQ6IHRoaXMub25jZVdTQ29ubmVjdGVkLFxuICAgICAgZ2V0V2FpdEV4cGVjdGVkVGltZW91dExlbmd0aDogdGhpcy5nZXRXYWl0RXhwZWN0ZWRUaW1lb3V0TGVuZ3RoLFxuICAgICAgb25XYXRjaFN0YXJ0OiB0aGlzLm9uV2F0Y2hTdGFydCxcbiAgICAgIG9uV2F0Y2hDbG9zZTogdGhpcy5vbldhdGNoQ2xvc2UsXG4gICAgICBkZWJ1ZzogdHJ1ZSxcbiAgICB9KVxuICAgIHRoaXMudmlydHVhbFdTQ2xpZW50LmFkZCh2aXJ0dWFsQ2xpZW50KVxuICAgIHRoaXMud2F0Y2hJZENsaWVudE1hcC5zZXQodmlydHVhbENsaWVudC53YXRjaElkLCB2aXJ0dWFsQ2xpZW50KVxuICAgIHJldHVybiB2aXJ0dWFsQ2xpZW50Lmxpc3RlbmVyXG4gIH1cblxuICBwcml2YXRlIGluaXRXZWJTb2NrZXRDb25uZWN0aW9uID0gYXN5bmMgKFxuICAgIHJlY29ubmVjdDogYm9vbGVhbixcbiAgICBhdmFpbGFibGVSZXRyaWVzOiBudW1iZXIgPSB0aGlzLm1heFJlY29ubmVjdFxuICApOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAvLyDlvZPliY3lpITkuo7mraPlnKjph43ov57kuK3nmoTnirbmgIFcbiAgICBpZiAocmVjb25uZWN0ICYmIHRoaXMucmVjb25uZWN0U3RhdGUpIHtcbiAgICAgIHJldHVybiAvLyDlv73nlaVcbiAgICB9XG5cbiAgICBpZiAocmVjb25uZWN0KSB7XG4gICAgICB0aGlzLnJlY29ubmVjdFN0YXRlID0gdHJ1ZSAvLyDph43ov57nirbmgIHlvIDlp4tcbiAgICB9XG5cbiAgICBpZiAodGhpcy53c0luaXRQcm9taXNlICE9PSB1bmRlZmluZWQgJiYgdGhpcy53c0luaXRQcm9taXNlICE9PSBudWxsKSB7XG4gICAgICAvLyB0aGVyZSBhbHJlYWR5IGV4aXN0cyBhIHdlYnNvY2tldCBpbml0aWF0aW9uLCBqdXN0IHdhaXQgZm9yIGl0XG4gICAgICByZXR1cm4gdGhpcy53c0luaXRQcm9taXNlXG4gICAgfVxuXG4gICAgaWYgKHJlY29ubmVjdCkge1xuICAgICAgdGhpcy5wYXVzZUNsaWVudHMoKVxuICAgIH1cblxuICAgIHRoaXMuY2xvc2UoQ2xvc2VFdmVudENvZGUuUmVjb25uZWN0V2ViU29ja2V0KVxuXG4gICAgdGhpcy53c0luaXRQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB3c1NpZ24gPSBhd2FpdCB0aGlzLmdldFdzU2lnbigpXG5cbiAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoc3VjY2VzcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gd3NTaWduLndzVXJsIHx8ICd3c3M6Ly90Y2Itd3MudGVuY2VudGNsb3VkYXBpLmNvbSdcbiAgICAgICAgICAgIGNvbnN0IHdzQ2xhc3MgPSBnZXRXc0NsYXNzKClcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICAgICAgdGhpcy53cyA9IHdzQ2xhc3MgPyBuZXcgd3NDbGFzcyh1cmwpIDogbmV3IFdlYlNvY2tldCh1cmwpXG4gICAgICAgICAgICBzdWNjZXNzKHZvaWQgMClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKHRoaXMud3MuY29ubmVjdCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53cy5jb25uZWN0KClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhd2FpdCB0aGlzLmluaXRXZWJTb2NrZXRFdmVudCgpXG4gICAgICAgICAgcmVzb2x2ZSgpXG5cbiAgICAgICAgICBpZiAocmVjb25uZWN0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VtZUNsaWVudHMoKVxuICAgICAgICAgICAgdGhpcy5yZWNvbm5lY3RTdGF0ZSA9IGZhbHNlIC8vIOmHjei/nueKtuaAgee7k+adn1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tyZWFsdGltZV0gaW5pdFdlYlNvY2tldENvbm5lY3Rpb24gY29ubmVjdCBmYWlsJywgZSlcblxuICAgICAgICAgIGlmIChhdmFpbGFibGVSZXRyaWVzID4gMCkge1xuICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBvcHRpbWl6YXRpb24sIGluIGNhc2Ugb2YgbmV0d29yayBvZmZsaW5lLCB3ZSBkb24ndCBuZWVkIHRvIHN0dWJib3JubHkgc2xlZXAgZm9yIHNvbWV0aW1lLFxuICAgICAgICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIHdhaXQgZm9yIHRoZSBuZXR3b3JrIHRvIGJlIGJhY2sgb25saW5lLCB0aGlzIGVuc3VyZXMgbWluaW11bSBkb3dudGltZVxuICAgICAgICAgICAgLy8gY29uc3QgeyBpc0Nvbm5lY3RlZCB9ID0gYXdhaXQgZ2V0TmV0d29ya1N0YXR1cygpXG4gICAgICAgICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9IHRydWVcblxuICAgICAgICAgICAgdGhpcy53c0luaXRQcm9taXNlID0gdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICBhd2FpdCBzbGVlcCh0aGlzLnJlY29ubmVjdEludGVydmFsKVxuICAgICAgICAgICAgICBpZiAocmVjb25uZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvbm5lY3RTdGF0ZSA9IGZhbHNlIC8vIOmHjei/nuW8guW4uOS5n+eul+mHjei/nueKtuaAgee7k+adn1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5pbml0V2ViU29ja2V0Q29ubmVjdGlvbihyZWNvbm5lY3QsIGF2YWlsYWJsZVJldHJpZXMgLSAxKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KGUpXG5cbiAgICAgICAgICAgIGlmIChyZWNvbm5lY3QpIHtcbiAgICAgICAgICAgICAgdGhpcy5jbG9zZUFsbENsaWVudHMobmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICAgICAgICAgIGVyckNvZGU6IEVSUl9DT0RFLlNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9SRUNPTk5FQ1RfV0FUQ0hfRkFJTCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgZXJyTXNnOiBlLFxuICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKClcbiAgICB9KVxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMud3NJbml0UHJvbWlzZVxuICAgICAgdGhpcy53c1JlYWR5U3Vic3JpYmVycy5mb3JFYWNoKCh7IHJlc29sdmUgfSkgPT4gcmVzb2x2ZSgpKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMud3NSZWFkeVN1YnNyaWJlcnMuZm9yRWFjaCgoeyByZWplY3QgfSkgPT4gcmVqZWN0KCkpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMud3NJbml0UHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy53c1JlYWR5U3Vic3JpYmVycyA9IFtdXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0V2ViU29ja2V0RXZlbnQgPSAoKSA9PiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKCF0aGlzLndzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbiBub3QgaW5pdFdlYlNvY2tldEV2ZW50LCB3cyBub3QgZXhpc3RzJylcbiAgICB9XG5cbiAgICBsZXQgd3NPcGVuZWQgPSBmYWxzZVxuXG4gICAgdGhpcy53cy5vbm9wZW4gPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignW3JlYWx0aW1lXSB3cyBldmVudDogb3BlbicsIGV2ZW50KVxuICAgICAgd3NPcGVuZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKClcbiAgICB9XG5cbiAgICB0aGlzLndzLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIC8vIGFsbCBsb2dpbnMgYXJlIGludmFsaWQgYWZ0ZXIgZGlzY29ubmVjdGlvblxuICAgICAgdGhpcy5sb2dpbnMgPSBuZXcgTWFwKClcblxuICAgICAgLy8gZXJyb3Llhpnov5tmaWxlXG5cbiAgICAgIGlmICghd3NPcGVuZWQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3JlYWx0aW1lXSB3cyBvcGVuIGZhaWxlZCB3aXRoIHdzIGV2ZW50OiBlcnJvcicsIGV2ZW50KVxuICAgICAgICByZWplY3QoZXZlbnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbcmVhbHRpbWVdIHdzIGV2ZW50OiBlcnJvcicsIGV2ZW50KVxuXG4gICAgICAgIHRoaXMuY2xlYXJIZWFydGJlYXQoKVxuICAgICAgICB0aGlzLnZpcnR1YWxXU0NsaWVudC5mb3JFYWNoKGNsaWVudCA9PiBjbGllbnQuY2xvc2VXaXRoRXJyb3IobmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICAgIGVyckNvZGU6IEVSUl9DT0RFLlNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9XRUJTT0NLRVRfQ09OTkVDVElPTl9FUlJPUiBhcyBzdHJpbmcsXG4gICAgICAgICAgZXJyTXNnOiBldmVudCxcbiAgICAgICAgfSkpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE86IHJlY29ubmVjdFxuICAgIHRoaXMud3Mub25jbG9zZSA9IChjbG9zZUV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tyZWFsdGltZV0gd3MgZXZlbnQ6IGNsb3NlJywgY2xvc2VFdmVudClcbiAgICAgIC8vIGFsbCBsb2dpbnMgYXJlIGludmFsaWQgYWZ0ZXIgZGlzY29ubmVjdGlvblxuICAgICAgdGhpcy5sb2dpbnMgPSBuZXcgTWFwKClcblxuICAgICAgdGhpcy5jbGVhckhlYXJ0YmVhdCgpXG4gICAgICBzd2l0Y2ggKGNsb3NlRXZlbnQuY29kZSkge1xuICAgICAgICBjYXNlIENsb3NlRXZlbnRDb2RlLlJlY29ubmVjdFdlYlNvY2tldDoge1xuICAgICAgICAgIC8vIGp1c3QgaWdub3JlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIENsb3NlRXZlbnRDb2RlLk5vUmVhbHRpbWVMaXN0ZW5lcnM6IHtcbiAgICAgICAgICAvLyBxdWl0XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIENsb3NlRXZlbnRDb2RlLkhlYXJ0YmVhdFBpbmdFcnJvcjpcbiAgICAgICAgY2FzZSBDbG9zZUV2ZW50Q29kZS5IZWFydGJlYXRQb25nVGltZW91dEVycm9yOlxuICAgICAgICBjYXNlIENsb3NlRXZlbnRDb2RlLk5vcm1hbENsb3N1cmU6XG4gICAgICAgIGNhc2UgQ2xvc2VFdmVudENvZGUuQWJub3JtYWxDbG9zdXJlOiB7XG4gICAgICAgICAgLy8gTm9ybWFsIENsb3N1cmUgYW5kIEFibm9ybWFsIENsb3N1cmU6XG4gICAgICAgICAgLy8gICBleHBlY3RlZCBjbG9zdXJlLCBtb3N0IGxpa2VseSBkaXNwYXRjaGVkIGJ5IHdlY2hhdCBjbGllbnQsXG4gICAgICAgICAgLy8gICBzaW5jZSB0aGlzIGlzIHRoZSBzdGF0dXMgY29kZSBkaXNwYXRjaGVkIGluIGNhc2Ugb2YgbmV0d29yayBmYWlsdXJlLFxuICAgICAgICAgIC8vICAgd2Ugc2hvdWxkIHJldHJ5XG5cbiAgICAgICAgICBpZiAodGhpcy5tYXhSZWNvbm5lY3QgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRXZWJTb2NrZXRDb25uZWN0aW9uKHRydWUsIHRoaXMubWF4UmVjb25uZWN0KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsQ2xpZW50cyhnZXRXU0Nsb3NlRXJyb3IoY2xvc2VFdmVudC5jb2RlKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIENsb3NlRXZlbnRDb2RlLk5vQXV0aGVudGljYXRpb246IHtcbiAgICAgICAgICB0aGlzLmNsb3NlQWxsQ2xpZW50cyhnZXRXU0Nsb3NlRXJyb3IoY2xvc2VFdmVudC5jb2RlLCBjbG9zZUV2ZW50LnJlYXNvbikpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgLy8gd2Ugc2hvdWxkIHJldHJ5IGJ5IGRlZmF1bHRcbiAgICAgICAgICBpZiAodGhpcy5tYXhSZWNvbm5lY3QgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRXZWJTb2NrZXRDb25uZWN0aW9uKHRydWUsIHRoaXMubWF4UmVjb25uZWN0KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsQ2xpZW50cyhnZXRXU0Nsb3NlRXJyb3IoY2xvc2VFdmVudC5jb2RlKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLndzLm9ubWVzc2FnZSA9IChyZXMpID0+IHtcbiAgICAgIC8vIOaUr+S7mOWuneWwj+eoi+W6j+S8mui/lOWbnnJlcy5kYXRhLmRhdGHmiJZyZXMubWVzc2FnZVxuICAgICAgLy8g5b6u5L+h5bCP56iL5bqP6L+U5ZuecmVzLmRhdGFcbiAgICAgIGNvbnN0IHJhd01zZyA9IHJlcy5kYXRhPy5kYXRhIHx8IHJlcy5kYXRhXG5cbiAgICAgIC8vIHJlc2V0ICYgcmVzdGFydCBoZWFydGJlYXRcbiAgICAgIHRoaXMuaGVhcnRiZWF0KClcblxuICAgICAgbGV0IG1zZzogSVJlc3BvbnNlTWVzc2FnZVxuXG4gICAgICB0cnkge1xuICAgICAgICBtc2cgPSB0eXBlb2YgcmF3TXNnID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UocmF3TXNnIGFzIHN0cmluZykgOiByYXdNc2dcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbcmVhbHRpbWVdIG9uTWVzc2FnZSBwYXJzZSByZXMuZGF0YSBlcnJvcjogJHtlfWApXG4gICAgICB9XG5cbiAgICAgIGlmIChtc2cubXNnVHlwZSA9PT0gJ0VSUk9SJykge1xuICAgICAgICAvLyDmib7liLDlvZPliY3nm5HlkKzvvIzlubblsIZlcnJvcui/lOWbnlxuICAgICAgICBsZXQgdmlydHVhbFdhdGNoID0gbnVsbFxuICAgICAgICB0aGlzLnZpcnR1YWxXU0NsaWVudC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0ud2F0Y2hJZCA9PT0gbXNnLndhdGNoSWQpIHtcbiAgICAgICAgICAgIHZpcnR1YWxXYXRjaCA9IGl0ZW1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKHZpcnR1YWxXYXRjaCkge1xuICAgICAgICAgIHZpcnR1YWxXYXRjaC5saXN0ZW5lci5vbkVycm9yKG1zZylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZVdhaXRTcGVjID0gdGhpcy53c1Jlc3BvbnNlV2FpdC5nZXQobXNnLnJlcXVlc3RJZClcbiAgICAgIGlmIChyZXNwb25zZVdhaXRTcGVjKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKG1zZy5tc2dUeXBlID09PSAnRVJST1InKSB7XG4gICAgICAgICAgICByZXNwb25zZVdhaXRTcGVjLnJlamVjdChuZXcgUmVhbHRpbWVFcnJvck1lc3NhZ2VFcnJvcihtc2cpKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZVdhaXRTcGVjLnJlc29sdmUobXNnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAnd3Mgb25NZXNzYWdlIHJlc3BvbnNlV2FpdFNwZWMucmVzb2x2ZShtc2cpIGVycm9yZWQ6JyxcbiAgICAgICAgICAgIGVcbiAgICAgICAgICApXG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy53c1Jlc3BvbnNlV2FpdC5kZWxldGUobXNnLnJlcXVlc3RJZClcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzcG9uc2VXYWl0U3BlYy5za2lwT25NZXNzYWdlKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1zZy5tc2dUeXBlID09PSAnUE9ORycpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdFBpbmdTZW5kVFMpIHtcbiAgICAgICAgICBjb25zdCBydHQgPSBEYXRlLm5vdygpIC0gdGhpcy5sYXN0UGluZ1NlbmRUU1xuICAgICAgICAgIGlmIChydHQgPiBERUZBVUxUX1VOVFJVU1RFRF9SVFRfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtyZWFsdGltZV0gdW50cnVzdGVkIHJ0dCBvYnNlcnZlZDogJHtydHR9YClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5ydHRPYnNlcnZlZC5sZW5ndGggPj0gTUFYX1JUVF9PQlNFUlZFRCkge1xuICAgICAgICAgICAgdGhpcy5ydHRPYnNlcnZlZC5zcGxpY2UoXG4gICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgIHRoaXMucnR0T2JzZXJ2ZWQubGVuZ3RoIC0gTUFYX1JUVF9PQlNFUlZFRCArIDFcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5ydHRPYnNlcnZlZC5wdXNoKHJ0dClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IGNsaWVudCA9IG1zZy53YXRjaElkICYmIHRoaXMud2F0Y2hJZENsaWVudE1hcC5nZXQobXNnLndhdGNoSWQpXG4gICAgICBpZiAoY2xpZW50KSB7XG4gICAgICAgIGNsaWVudC5vbk1lc3NhZ2UobXNnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBgW3JlYWx0aW1lXSBubyByZWFsdGltZSBsaXN0ZW5lciBmb3VuZCByZXNwb25zaWJsZSBmb3Igd2F0Y2hJZCAke21zZy53YXRjaElkfTogYCxcbiAgICAgICAgICBtc2dcbiAgICAgICAgKVxuICAgICAgICBzd2l0Y2ggKG1zZy5tc2dUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnSU5JVF9FVkVOVCc6XG4gICAgICAgICAgY2FzZSAnTkVYVF9FVkVOVCc6XG4gICAgICAgICAgY2FzZSAnQ0hFQ0tfRVZFTlQnOiB7XG4gICAgICAgICAgICBjbGllbnQgPSB0aGlzLnF1ZXJ5SWRDbGllbnRNYXAuZ2V0KG1zZy5tc2dEYXRhLnF1ZXJ5SUQpXG4gICAgICAgICAgICBpZiAoY2xpZW50KSB7XG4gICAgICAgICAgICAgIGNsaWVudC5vbk1lc3NhZ2UobXNnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbLCBjbGllbnRdIG9mIEFycmF5LmZyb20odGhpcy53YXRjaElkQ2xpZW50TWFwLmVudHJpZXMoKSkpIHtcbiAgICAgICAgICAgICAgY2xpZW50Lm9uTWVzc2FnZShtc2cpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5oZWFydGJlYXQoKVxuICB9KVxuXG4gIHByaXZhdGUgaXNXU0Nvbm5lY3RlZCA9ICgpOiBib29sZWFuID0+IEJvb2xlYW4odGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdTX1JFQURZX1NUQVRFLk9QRU4pXG5cbiAgcHJpdmF0ZSBvbmNlV1NDb25uZWN0ZWQgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgaWYgKHRoaXMuaXNXU0Nvbm5lY3RlZCgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy53c0luaXRQcm9taXNlICE9PSBudWxsICYmIHRoaXMud3NJbml0UHJvbWlzZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy53c0luaXRQcm9taXNlXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMud3NSZWFkeVN1YnNyaWJlcnMucHVzaCh7XG4gICAgICAgIHJlc29sdmUsXG4gICAgICAgIHJlamVjdCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgd2ViTG9naW4gPSBhc3luYyAoXG4gICAgZW52SWQ/OiBzdHJpbmcsXG4gICAgcmVmcmVzaD86IGJvb2xlYW5cbiAgKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICBpZiAoIXJlZnJlc2gpIHtcbiAgICAgIGlmIChlbnZJZCkge1xuICAgICAgICBjb25zdCBsb2dpbkluZm8gPSB0aGlzLmxvZ2lucy5nZXQoZW52SWQpXG4gICAgICAgIGlmIChsb2dpbkluZm8pIHtcbiAgICAgICAgICBpZiAobG9naW5JbmZvLmxvZ2dlZEluICYmIGxvZ2luSW5mby5sb2dpblJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvZ2luSW5mby5sb2dpblJlc3VsdFxuICAgICAgICAgIH0gaWYgKGxvZ2luSW5mby5sb2dnaW5nSW5Qcm9taXNlICE9PSBudWxsICYmIGxvZ2luSW5mby5sb2dnaW5nSW5Qcm9taXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2dpbkluZm8ubG9nZ2luZ0luUHJvbWlzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZW1wdHlFbnZMb2dpbkluZm8gPSB0aGlzLmxvZ2lucy5nZXQoJycpXG4gICAgICAgIGlmIChlbXB0eUVudkxvZ2luSW5mbz8ubG9nZ2luZ0luUHJvbWlzZSAhPT0gbnVsbCAmJiBlbXB0eUVudkxvZ2luSW5mbz8ubG9nZ2luZ0luUHJvbWlzZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuIGVtcHR5RW52TG9naW5JbmZvLmxvZ2dpbmdJblByb21pc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxJTG9naW5SZXN1bHQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgd3NTaWduID0gYXdhaXQgdGhpcy5nZXRXc1NpZ24oKVxuXG4gICAgICAgICAgY29uc3QgbXNnRGF0YTogSVJlcXVlc3RNZXNzYWdlTG9naW5EYXRhID0ge1xuICAgICAgICAgICAgZW52SWQ6IHdzU2lnbi5lbnZJZCB8fCAnJyxcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiAnJywgLy8g5bey5bqf5byD5a2X5q61XG4gICAgICAgICAgICByZWZlcnJlcjogJ3dlYicsXG4gICAgICAgICAgICBzZGtWZXJzaW9uOiAnJyxcbiAgICAgICAgICAgIGRhdGFWZXJzaW9uOiAnJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbG9naW5Nc2c6IElSZXF1ZXN0TWVzc2FnZUxvZ2luTXNnID0ge1xuICAgICAgICAgICAgd2F0Y2hJZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgcmVxdWVzdElkOiBnZW5SZXF1ZXN0SWQoKSxcbiAgICAgICAgICAgIG1zZ1R5cGU6ICdMT0dJTicsXG4gICAgICAgICAgICBtc2dEYXRhLFxuICAgICAgICAgICAgZXhNc2dEYXRhOiB7XG4gICAgICAgICAgICAgIHJ1bnRpbWU6IGdldFJ1bnRpbWUoKSxcbiAgICAgICAgICAgICAgc2lnblN0cjogd3NTaWduLnNpZ25TdHIsXG4gICAgICAgICAgICAgIHNlY3JldFZlcnNpb246IHdzU2lnbi5zZWNyZXRWZXJzaW9uLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbG9naW5SZXNNc2cgPSBhd2FpdCB0aGlzLnNlbmQ8SVJlc3BvbnNlTWVzc2FnZUxvZ2luUmVzTXNnPih7XG4gICAgICAgICAgICBtc2c6IGxvZ2luTXNnLFxuICAgICAgICAgICAgd2FpdFJlc3BvbnNlOiB0cnVlLFxuICAgICAgICAgICAgc2tpcE9uTWVzc2FnZTogdHJ1ZSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IERFRkFVTFRfTE9HSU5fVElNRU9VVCxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKCFsb2dpblJlc01zZy5tc2dEYXRhLmNvZGUpIHtcbiAgICAgICAgICAgIC8vIGxvZ2luIHN1Y2Nlc3NcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICBlbnZJZDogd3NTaWduLmVudklkLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbG9naW4gZmFpbGVkXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGAke2xvZ2luUmVzTXNnLm1zZ0RhdGEuY29kZX0gJHtsb2dpblJlc01zZy5tc2dEYXRhLm1lc3NhZ2V9YCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpXG4gICAgICAgIH1cbiAgICAgIH0pKClcbiAgICB9KVxuXG4gICAgbGV0IGxvZ2luSW5mbyA9IGVudklkICYmIHRoaXMubG9naW5zLmdldChlbnZJZClcblxuICAgIGNvbnN0IGxvZ2luU3RhcnRUUyA9IERhdGUubm93KClcblxuICAgIGlmIChsb2dpbkluZm8pIHtcbiAgICAgIGxvZ2luSW5mby5sb2dnZWRJbiA9IGZhbHNlXG4gICAgICBsb2dpbkluZm8ubG9nZ2luZ0luUHJvbWlzZSA9IHByb21pc2VcbiAgICAgIGxvZ2luSW5mby5sb2dpblN0YXJ0VFMgPSBsb2dpblN0YXJ0VFNcbiAgICB9IGVsc2Uge1xuICAgICAgbG9naW5JbmZvID0ge1xuICAgICAgICBsb2dnZWRJbjogZmFsc2UsXG4gICAgICAgIGxvZ2dpbmdJblByb21pc2U6IHByb21pc2UsXG4gICAgICAgIGxvZ2luU3RhcnRUUyxcbiAgICAgIH1cbiAgICAgIHRoaXMubG9naW5zLnNldChlbnZJZCB8fCAnJywgbG9naW5JbmZvKVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBsb2dpblJlc3VsdCA9IGF3YWl0IHByb21pc2VcbiAgICAgIGNvbnN0IGN1ckxvZ2luSW5mbyA9IGVudklkICYmIHRoaXMubG9naW5zLmdldChlbnZJZClcbiAgICAgIGlmIChcbiAgICAgICAgY3VyTG9naW5JbmZvXG4gICAgICAgICYmIGN1ckxvZ2luSW5mbyA9PT0gbG9naW5JbmZvXG4gICAgICAgICYmIGN1ckxvZ2luSW5mby5sb2dpblN0YXJ0VFMgPT09IGxvZ2luU3RhcnRUU1xuICAgICAgKSB7XG4gICAgICAgIGxvZ2luSW5mby5sb2dnZWRJbiA9IHRydWVcbiAgICAgICAgbG9naW5JbmZvLmxvZ2dpbmdJblByb21pc2UgPSB1bmRlZmluZWRcbiAgICAgICAgbG9naW5JbmZvLmxvZ2luU3RhcnRUUyA9IHVuZGVmaW5lZFxuICAgICAgICBsb2dpbkluZm8ubG9naW5SZXN1bHQgPSBsb2dpblJlc3VsdFxuICAgICAgICByZXR1cm4gbG9naW5SZXN1bHRcbiAgICAgIH0gaWYgKGN1ckxvZ2luSW5mbykge1xuICAgICAgICBpZiAoY3VyTG9naW5JbmZvLmxvZ2dlZEluICYmIGN1ckxvZ2luSW5mby5sb2dpblJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiBjdXJMb2dpbkluZm8ubG9naW5SZXN1bHRcbiAgICAgICAgfSBpZiAoY3VyTG9naW5JbmZvLmxvZ2dpbmdJblByb21pc2UgIT09IG51bGwgJiYgY3VyTG9naW5JbmZvLmxvZ2dpbmdJblByb21pc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiBjdXJMb2dpbkluZm8ubG9nZ2luZ0luUHJvbWlzZVxuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignd3MgdW5leHBlY3RlZCBsb2dpbiBpbmZvJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignd3MgbG9naW4gaW5mbyByZXNldCcpXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9naW5JbmZvLmxvZ2dlZEluID0gZmFsc2VcbiAgICAgIGxvZ2luSW5mby5sb2dnaW5nSW5Qcm9taXNlID0gdW5kZWZpbmVkXG4gICAgICBsb2dpbkluZm8ubG9naW5TdGFydFRTID0gdW5kZWZpbmVkXG4gICAgICBsb2dpbkluZm8ubG9naW5SZXN1bHQgPSB1bmRlZmluZWRcbiAgICAgIHRocm93IGVcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFdzU2lnbiA9IGFzeW5jICgpOiBQcm9taXNlPElXc1NpZ24+ID0+IHtcbiAgICBpZiAodGhpcy53c1NpZ24gJiYgdGhpcy53c1NpZ24uZXhwaXJlZFRzID4gRGF0ZS5ub3coKSkge1xuICAgICAgcmV0dXJuIHRoaXMud3NTaWduXG4gICAgfVxuICAgIGNvbnN0IGV4cGlyZWRUcyA9IERhdGUubm93KCkgKyA2MDAwMFxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuY29udGV4dC5hcHBDb25maWcucmVxdWVzdC5zZW5kKCdhdXRoLndzV2ViU2lnbicsIHsgcnVudGltZTogZ2V0UnVudGltZSgpIH0pXG5cbiAgICBpZiAocmVzLmNvZGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgW3RjYi1qcy1zZGtdIOiOt+WPluWunuaXtuaVsOaNruaOqOmAgeeZu+W9leelqOaNruWksei0pTogJHtyZXMuY29kZX1gKVxuICAgIH1cblxuICAgIGlmIChyZXMuZGF0YSkge1xuICAgICAgY29uc3QgeyBzaWduU3RyLCB3c1VybCwgc2VjcmV0VmVyc2lvbiwgZW52SWQgfSA9IHJlcy5kYXRhXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzaWduU3RyLFxuICAgICAgICB3c1VybCxcbiAgICAgICAgc2VjcmV0VmVyc2lvbixcbiAgICAgICAgZW52SWQsXG4gICAgICAgIGV4cGlyZWRUcyxcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbdGNiLWpzLXNka10g6I635Y+W5a6e5pe25pWw5o2u5o6o6YCB55m75b2V56Wo5o2u5aSx6LSlJylcbiAgfVxuXG4gIHByaXZhdGUgZ2V0V2FpdEV4cGVjdGVkVGltZW91dExlbmd0aCA9ICgpID0+IHtcbiAgICBpZiAoIXRoaXMucnR0T2JzZXJ2ZWQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gREVGQVVMVF9FWFBFQ1RFRF9FVkVOVF9XQUlUX1RJTUVcbiAgICB9XG5cbiAgICAvLyAxLjUgKiBSVFRcbiAgICByZXR1cm4gKFxuICAgICAgKHRoaXMucnR0T2JzZXJ2ZWQucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICsgY3VyKVxuICAgICAgICAvIHRoaXMucnR0T2JzZXJ2ZWQubGVuZ3RoKVxuICAgICAgKiAxLjVcbiAgICApXG4gIH1cblxuICBwcml2YXRlIGhlYXJ0YmVhdChpbW1lZGlhdGU/OiBib29sZWFuKSB7XG4gICAgdGhpcy5jbGVhckhlYXJ0YmVhdCgpXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMucGluZ1RpbWVvdXRJZCA9IHNldFRpbWVvdXQoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIChcbiAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBpZiAoIXRoaXMud3MgfHwgdGhpcy53cy5yZWFkeVN0YXRlICE9PSBXU19SRUFEWV9TVEFURS5PUEVOKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gbmVlZCB0byBwaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB0aGlzLmxhc3RQaW5nU2VuZFRTID0gRGF0ZS5ub3coKVxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBpbmcoKVxuICAgICAgICAgICAgICB0aGlzLnBpbmdGYWlsZWQgPSAwXG5cbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICB0aGlzLnBvbmdUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdwb25nIHRpbWVkIG91dCcpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucG9uZ01pc3NlZCA8IERFRkFVTFRfUE9OR19NSVNTX1RPTEVSQU5DRSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5wb25nTWlzc2VkICs9IDFcbiAgICAgICAgICAgICAgICAgIHRoaXMuaGVhcnRiZWF0KHRydWUpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIGxvZ2ljYWwgcGVyY2VpdmVkIGNvbm5lY3Rpb24gbG9zdCwgZXZlbiB0aG91Z2ggd2Vic29ja2V0IGRpZCBub3QgcmVjZWl2ZSBlcnJvciBvciBjbG9zZSBldmVudFxuICAgICAgICAgICAgICAgICAgdGhpcy5pbml0V2ViU29ja2V0Q29ubmVjdGlvbih0cnVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSwgdGhpcy5jb250ZXh0LmFwcENvbmZpZy5yZWFsdGltZVBvbmdXYWl0VGltZW91dClcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMucGluZ0ZhaWxlZCA8IERFRkFVTFRfUElOR19GQUlMX1RPTEVSQU5DRSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGluZ0ZhaWxlZCArPSAxXG4gICAgICAgICAgICAgICAgdGhpcy5oZWFydGJlYXQoKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoQ2xvc2VFdmVudENvZGUuSGVhcnRiZWF0UGluZ0Vycm9yKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICApKClcbiAgICAgIH0sXG4gICAgICBpbW1lZGlhdGUgPyAwIDogdGhpcy5jb250ZXh0LmFwcENvbmZpZy5yZWFsdGltZVBpbmdJbnRlcnZhbFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgcGluZyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtc2c6IElSZXF1ZXN0TWVzc2FnZVBpbmdNc2cgPSB7XG4gICAgICB3YXRjaElkOiB1bmRlZmluZWQsXG4gICAgICByZXF1ZXN0SWQ6IGdlblJlcXVlc3RJZCgpLFxuICAgICAgbXNnVHlwZTogJ1BJTkcnLFxuICAgICAgbXNnRGF0YTogbnVsbCxcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5zZW5kKHtcbiAgICAgIG1zZyxcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBvbldhdGNoU3RhcnQgPSAoY2xpZW50OiBWaXJ0dWFsV2ViU29ja2V0Q2xpZW50LCBxdWVyeUlEOiBzdHJpbmcpID0+IHtcbiAgICB0aGlzLnF1ZXJ5SWRDbGllbnRNYXAuc2V0KHF1ZXJ5SUQsIGNsaWVudClcbiAgfVxuXG4gIHByaXZhdGUgb25XYXRjaENsb3NlID0gKGNsaWVudDogVmlydHVhbFdlYlNvY2tldENsaWVudCwgcXVlcnlJRDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKHF1ZXJ5SUQpIHtcbiAgICAgIHRoaXMucXVlcnlJZENsaWVudE1hcC5kZWxldGUocXVlcnlJRClcbiAgICB9XG4gICAgdGhpcy53YXRjaElkQ2xpZW50TWFwLmRlbGV0ZShjbGllbnQud2F0Y2hJZClcbiAgICB0aGlzLnZpcnR1YWxXU0NsaWVudC5kZWxldGUoY2xpZW50KVxuXG4gICAgaWYgKCF0aGlzLnZpcnR1YWxXU0NsaWVudC5zaXplKSB7XG4gICAgICAvLyBubyBtb3JlIGV4aXN0aW5nIHdhdGNoLCB3ZSBzaG91bGQgcmVsZWFzZSB0aGUgd2Vic29ja2V0IGNvbm5lY3Rpb25cbiAgICAgIHRoaXMuY2xvc2UoQ2xvc2VFdmVudENvZGUuTm9SZWFsdGltZUxpc3RlbmVycylcbiAgICB9XG4gIH1cbn1cbiJdfQ==
}, function(modId) { var map = {"./virtual-websocket-client":1776008460245,"./message":1776008460246,"./ws-event":1776008460251,"./error":1776008460249,"./common":1776008460252,"./utils":1776008460250}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460245, function(require, module, exports) {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualWebSocketClient = void 0;
var set_1 = __importDefault(require("lodash/set"));
var unset_1 = __importDefault(require("lodash/unset"));
var cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
var message_1 = require("./message");
var listener_1 = require("./listener");
var snapshot_1 = require("./snapshot");
var error_1 = require("./error");
var utils_1 = require("./utils");
var WatchStatus;
(function (WatchStatus) {
    WatchStatus["LOGGINGIN"] = "LOGGINGIN";
    WatchStatus["INITING"] = "INITING";
    WatchStatus["REBUILDING"] = "REBUILDING";
    WatchStatus["ACTIVE"] = "ACTIVE";
    WatchStatus["ERRORED"] = "ERRORED";
    WatchStatus["CLOSING"] = "CLOSING";
    WatchStatus["CLOSED"] = "CLOSED";
    WatchStatus["PAUSED"] = "PAUSED";
    WatchStatus["RESUMING"] = "RESUMING";
})(WatchStatus || (WatchStatus = {}));
var DEFAULT_WAIT_TIME_ON_UNKNOWN_ERROR = 100;
var DEFAULT_MAX_AUTO_RETRY_ON_ERROR = 2;
var DEFAULT_MAX_SEND_ACK_AUTO_RETRY_ON_ERROR = 2;
var DEFAULT_SEND_ACK_DEBOUNCE_TIMEOUT = 10 * 1000;
var DEFAULT_INIT_WATCH_TIMEOUT = 10 * 1000;
var DEFAULT_REBUILD_WATCH_TIMEOUT = 10 * 1000;
var VirtualWebSocketClient = (function () {
    function VirtualWebSocketClient(options) {
        var _this = this;
        this.watchStatus = WatchStatus.INITING;
        this.wsLogin = function (envId, refresh) { return __awaiter(_this, void 0, void 0, function () {
            var loginResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.watchStatus = WatchStatus.LOGGINGIN;
                        return [4, this.login(envId, refresh)];
                    case 1:
                        loginResult = _a.sent();
                        if (!this.envId) {
                            this.envId = loginResult.envId;
                        }
                        return [2, loginResult];
                }
            });
        }); };
        this.initWatch = function (forceRefreshLogin) { return __awaiter(_this, void 0, void 0, function () {
            var success;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initWatchPromise !== null && this.initWatchPromise !== undefined) {
                            return [2, this.initWatchPromise];
                        }
                        this.initWatchPromise = new Promise(function (resolve, reject) {
                            void (function () { return __awaiter(_this, void 0, void 0, function () {
                                var envId, initWatchMsg, initEventMsg, _a, events, currEvent, _i, events_1, e, snapshot, e_1;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 3, , 4]);
                                            if (this.watchStatus === WatchStatus.PAUSED) {
                                                console.log('[realtime] initWatch cancelled on pause');
                                                return [2, resolve()];
                                            }
                                            return [4, this.wsLogin(this.envId, forceRefreshLogin)];
                                        case 1:
                                            envId = (_b.sent()).envId;
                                            if (this.watchStatus === WatchStatus.PAUSED) {
                                                console.log('[realtime] initWatch cancelled on pause');
                                                return [2, resolve()];
                                            }
                                            this.watchStatus = WatchStatus.INITING;
                                            initWatchMsg = {
                                                watchId: this.watchId,
                                                requestId: (0, message_1.genRequestId)(),
                                                msgType: 'INIT_WATCH',
                                                msgData: {
                                                    envId: envId,
                                                    collName: this.collectionName,
                                                    query: this.query,
                                                    limit: this.limit,
                                                    orderBy: this.orderBy,
                                                },
                                            };
                                            return [4, this.send({
                                                    msg: initWatchMsg,
                                                    waitResponse: true,
                                                    skipOnMessage: true,
                                                    timeout: DEFAULT_INIT_WATCH_TIMEOUT,
                                                })];
                                        case 2:
                                            initEventMsg = _b.sent();
                                            _a = initEventMsg.msgData, events = _a.events, currEvent = _a.currEvent;
                                            this.sessionInfo = {
                                                queryID: initEventMsg.msgData.queryID,
                                                currentEventId: currEvent - 1,
                                                currentDocs: [],
                                            };
                                            if (events.length > 0) {
                                                for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                                                    e = events_1[_i];
                                                    e.ID = currEvent;
                                                }
                                                this.handleServerEvents(initEventMsg);
                                            }
                                            else {
                                                this.sessionInfo.currentEventId = currEvent;
                                                snapshot = new snapshot_1.Snapshot({
                                                    id: currEvent,
                                                    docChanges: [],
                                                    docs: [],
                                                    type: 'init',
                                                });
                                                this.listener.onChange(snapshot);
                                                this.scheduleSendACK();
                                            }
                                            this.onWatchStart(this, this.sessionInfo.queryID);
                                            this.watchStatus = WatchStatus.ACTIVE;
                                            this.availableRetries.INIT_WATCH = DEFAULT_MAX_AUTO_RETRY_ON_ERROR;
                                            resolve();
                                            return [3, 4];
                                        case 3:
                                            e_1 = _b.sent();
                                            this.handleWatchEstablishmentError(e_1, {
                                                operationName: 'INIT_WATCH',
                                                resolve: resolve,
                                                reject: reject,
                                            });
                                            return [3, 4];
                                        case 4: return [2];
                                    }
                                });
                            }); })();
                        });
                        success = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4, this.initWatchPromise];
                    case 2:
                        _a.sent();
                        success = true;
                        return [3, 4];
                    case 3:
                        this.initWatchPromise = undefined;
                        return [7];
                    case 4:
                        console.log("[realtime] initWatch ".concat(success ? 'success' : 'fail'));
                        return [2];
                }
            });
        }); };
        this.rebuildWatch = function (forceRefreshLogin) { return __awaiter(_this, void 0, void 0, function () {
            var success;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.rebuildWatchPromise !== null && this.rebuildWatchPromise !== undefined) {
                            return [2, this.rebuildWatchPromise];
                        }
                        this.rebuildWatchPromise = new Promise(function (resolve, reject) {
                            void (function () { return __awaiter(_this, void 0, void 0, function () {
                                var envId, rebuildWatchMsg, nextEventMsg, e_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            if (this.watchStatus === WatchStatus.PAUSED) {
                                                console.log('[realtime] rebuildWatch cancelled on pause');
                                                return [2, resolve()];
                                            }
                                            return [4, this.wsLogin(this.envId, forceRefreshLogin)];
                                        case 1:
                                            envId = (_a.sent()).envId;
                                            if (!this.sessionInfo) {
                                                throw new Error('can not rebuildWatch without a successful initWatch (lack of sessionInfo)');
                                            }
                                            if (this.watchStatus === WatchStatus.PAUSED) {
                                                console.log('[realtime] rebuildWatch cancelled on pause');
                                                return [2, resolve()];
                                            }
                                            this.watchStatus = WatchStatus.REBUILDING;
                                            rebuildWatchMsg = {
                                                watchId: this.watchId,
                                                requestId: (0, message_1.genRequestId)(),
                                                msgType: 'REBUILD_WATCH',
                                                msgData: {
                                                    envId: envId,
                                                    collName: this.collectionName,
                                                    queryID: this.sessionInfo.queryID,
                                                    eventID: this.sessionInfo.currentEventId,
                                                },
                                            };
                                            return [4, this.send({
                                                    msg: rebuildWatchMsg,
                                                    waitResponse: true,
                                                    skipOnMessage: false,
                                                    timeout: DEFAULT_REBUILD_WATCH_TIMEOUT,
                                                })];
                                        case 2:
                                            nextEventMsg = _a.sent();
                                            this.handleServerEvents(nextEventMsg);
                                            this.watchStatus = WatchStatus.ACTIVE;
                                            this.availableRetries.REBUILD_WATCH = DEFAULT_MAX_AUTO_RETRY_ON_ERROR;
                                            resolve();
                                            return [3, 4];
                                        case 3:
                                            e_2 = _a.sent();
                                            this.handleWatchEstablishmentError(e_2, {
                                                operationName: 'REBUILD_WATCH',
                                                resolve: resolve,
                                                reject: reject,
                                            });
                                            return [3, 4];
                                        case 4: return [2];
                                    }
                                });
                            }); })();
                        });
                        success = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4, this.rebuildWatchPromise];
                    case 2:
                        _a.sent();
                        success = true;
                        return [3, 4];
                    case 3:
                        this.rebuildWatchPromise = undefined;
                        return [7];
                    case 4:
                        console.log("[realtime] rebuildWatch ".concat(success ? 'success' : 'fail'));
                        return [2];
                }
            });
        }); };
        this.handleWatchEstablishmentError = function (e, options) { return __awaiter(_this, void 0, void 0, function () {
            var isInitWatch, abortWatch, retry;
            var _this = this;
            return __generator(this, function (_a) {
                isInitWatch = options.operationName === 'INIT_WATCH';
                abortWatch = function () {
                    _this.closeWithError(new error_1.CloudSDKError({
                        errCode: isInitWatch
                            ? error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_INIT_WATCH_FAIL
                            : error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_REBUILD_WATCH_FAIL,
                        errMsg: e,
                    }));
                    options.reject(e);
                };
                retry = function (refreshLogin) {
                    if (_this.useRetryTicket(options.operationName)) {
                        if (isInitWatch) {
                            _this.initWatchPromise = undefined;
                            options.resolve(_this.initWatch(refreshLogin));
                        }
                        else {
                            _this.rebuildWatchPromise = undefined;
                            options.resolve(_this.rebuildWatch(refreshLogin));
                        }
                    }
                    else {
                        abortWatch();
                    }
                };
                this.handleCommonError(e, {
                    onSignError: function () { return retry(true); },
                    onTimeoutError: function () { return retry(false); },
                    onNotRetryableError: abortWatch,
                    onCancelledError: options.reject,
                    onUnknownError: function () {
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var onWSDisconnected, e_3;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 8, , 9]);
                                        onWSDisconnected = function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        this.pause();
                                                        return [4, this.onceWSConnected()];
                                                    case 1:
                                                        _a.sent();
                                                        retry(true);
                                                        return [2];
                                                }
                                            });
                                        }); };
                                        if (!!this.isWSConnected()) return [3, 2];
                                        return [4, onWSDisconnected()];
                                    case 1:
                                        _a.sent();
                                        return [3, 7];
                                    case 2: return [4, (0, utils_1.sleep)(DEFAULT_WAIT_TIME_ON_UNKNOWN_ERROR)];
                                    case 3:
                                        _a.sent();
                                        if (!(this.watchStatus === WatchStatus.PAUSED)) return [3, 4];
                                        options.reject(new error_1.CancelledError("".concat(options.operationName, " cancelled due to pause after unknownError")));
                                        return [3, 7];
                                    case 4:
                                        if (!!this.isWSConnected()) return [3, 6];
                                        return [4, onWSDisconnected()];
                                    case 5:
                                        _a.sent();
                                        return [3, 7];
                                    case 6:
                                        retry(false);
                                        _a.label = 7;
                                    case 7: return [3, 9];
                                    case 8:
                                        e_3 = _a.sent();
                                        retry(true);
                                        return [3, 9];
                                    case 9: return [2];
                                }
                            });
                        }); })();
                    },
                });
                return [2];
            });
        }); };
        this.closeWatch = function () { return __awaiter(_this, void 0, void 0, function () {
            var queryId, closeWatchMsg, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryId = this.sessionInfo ? this.sessionInfo.queryID : '';
                        if (this.watchStatus !== WatchStatus.ACTIVE) {
                            this.watchStatus = WatchStatus.CLOSED;
                            this.onWatchClose(this, queryId);
                            return [2];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        this.watchStatus = WatchStatus.CLOSING;
                        closeWatchMsg = {
                            watchId: this.watchId,
                            requestId: (0, message_1.genRequestId)(),
                            msgType: 'CLOSE_WATCH',
                            msgData: null,
                        };
                        return [4, this.send({
                                msg: closeWatchMsg,
                            })];
                    case 2:
                        _a.sent();
                        this.sessionInfo = undefined;
                        this.watchStatus = WatchStatus.CLOSED;
                        return [3, 5];
                    case 3:
                        e_4 = _a.sent();
                        this.closeWithError(new error_1.CloudSDKError({
                            errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_CLOSE_WATCH_FAIL,
                            errMsg: e_4,
                        }));
                        return [3, 5];
                    case 4:
                        this.onWatchClose(this, queryId);
                        return [7];
                    case 5: return [2];
                }
            });
        }); };
        this.scheduleSendACK = function () {
            _this.clearACKSchedule();
            _this.ackTimeoutId = setTimeout(function () {
                if (_this.waitExpectedTimeoutId) {
                    _this.scheduleSendACK();
                }
                else {
                    _this.sendACK();
                }
            }, DEFAULT_SEND_ACK_DEBOUNCE_TIMEOUT);
        };
        this.clearACKSchedule = function () {
            if (_this.ackTimeoutId) {
                clearTimeout(_this.ackTimeoutId);
            }
        };
        this.sendACK = function () { return __awaiter(_this, void 0, void 0, function () {
            var ackMsg, e_5, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (this.watchStatus !== WatchStatus.ACTIVE) {
                            this.scheduleSendACK();
                            return [2];
                        }
                        if (!this.sessionInfo) {
                            console.warn('[realtime listener] can not send ack without a successful initWatch (lack of sessionInfo)');
                            return [2];
                        }
                        ackMsg = {
                            watchId: this.watchId,
                            requestId: (0, message_1.genRequestId)(),
                            msgType: 'CHECK_LAST',
                            msgData: {
                                queryID: this.sessionInfo.queryID,
                                eventID: this.sessionInfo.currentEventId,
                            },
                        };
                        return [4, this.send({
                                msg: ackMsg,
                            })];
                    case 1:
                        _a.sent();
                        this.scheduleSendACK();
                        return [3, 3];
                    case 2:
                        e_5 = _a.sent();
                        if ((0, error_1.isRealtimeErrorMessageError)(e_5)) {
                            msg = e_5.payload;
                            switch (msg.msgData.code) {
                                case 'CHECK_LOGIN_FAILED':
                                case 'SIGN_EXPIRED_ERROR':
                                case 'SIGN_INVALID_ERROR':
                                case 'SIGN_PARAM_INVALID': {
                                    this.rebuildWatch();
                                    return [2];
                                }
                                case 'QUERYID_INVALID_ERROR':
                                case 'SYS_ERR':
                                case 'INVALIID_ENV':
                                case 'COLLECTION_PERMISSION_DENIED': {
                                    this.closeWithError(new error_1.CloudSDKError({
                                        errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_CHECK_LAST_FAIL,
                                        errMsg: msg.msgData.code,
                                    }));
                                    return [2];
                                }
                                default: {
                                    break;
                                }
                            }
                        }
                        if (this.availableRetries.CHECK_LAST
                            && this.availableRetries.CHECK_LAST > 0) {
                            this.availableRetries.CHECK_LAST -= 1;
                            this.scheduleSendACK();
                        }
                        else {
                            this.closeWithError(new error_1.CloudSDKError({
                                errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_CHECK_LAST_FAIL,
                                errMsg: e_5,
                            }));
                        }
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); };
        this.handleCommonError = function (e, options) {
            if ((0, error_1.isRealtimeErrorMessageError)(e)) {
                var msg = e.payload;
                switch (msg.msgData.code) {
                    case 'CHECK_LOGIN_FAILED':
                    case 'SIGN_EXPIRED_ERROR':
                    case 'SIGN_INVALID_ERROR':
                    case 'SIGN_PARAM_INVALID': {
                        options.onSignError(e);
                        return;
                    }
                    case 'QUERYID_INVALID_ERROR':
                    case 'SYS_ERR':
                    case 'INVALIID_ENV':
                    case 'COLLECTION_PERMISSION_DENIED': {
                        options.onNotRetryableError(e);
                        return;
                    }
                    default: {
                        options.onNotRetryableError(e);
                        return;
                    }
                }
            }
            else if ((0, error_1.isTimeoutError)(e)) {
                options.onTimeoutError(e);
                return;
            }
            else if ((0, error_1.isCancelledError)(e)) {
                options.onCancelledError(e);
                return;
            }
            options.onUnknownError(e);
        };
        this.watchId = "watchid_".concat(+new Date(), "_").concat(Math.random());
        this.envId = options.envId;
        this.collectionName = options.collectionName;
        this.query = options.query;
        this.limit = options.limit;
        this.orderBy = options.orderBy;
        this.send = options.send;
        this.login = options.login;
        this.isWSConnected = options.isWSConnected;
        this.onceWSConnected = options.onceWSConnected;
        this.getWaitExpectedTimeoutLength = options.getWaitExpectedTimeoutLength;
        this.onWatchStart = options.onWatchStart;
        this.onWatchClose = options.onWatchClose;
        this.debug = options.debug;
        this.availableRetries = {
            INIT_WATCH: DEFAULT_MAX_AUTO_RETRY_ON_ERROR,
            REBUILD_WATCH: DEFAULT_MAX_AUTO_RETRY_ON_ERROR,
            CHECK_LAST: DEFAULT_MAX_SEND_ACK_AUTO_RETRY_ON_ERROR,
        };
        this.listener = new listener_1.RealtimeListener({
            close: function () {
                _this.closeWatch();
            },
            onChange: options.onChange,
            onError: options.onError,
            debug: this.debug,
            virtualClient: this,
        });
        this.initWatch();
    }
    VirtualWebSocketClient.prototype.onMessage = function (msg) {
        var _this = this;
        switch (this.watchStatus) {
            case WatchStatus.PAUSED: {
                if (msg.msgType !== 'ERROR') {
                    return;
                }
                break;
            }
            case WatchStatus.LOGGINGIN:
            case WatchStatus.INITING:
            case WatchStatus.REBUILDING: {
                console.warn("[realtime listener] internal non-fatal error: unexpected message received while ".concat(this.watchStatus));
                return;
            }
            case WatchStatus.CLOSED: {
                console.warn('[realtime listener] internal non-fatal error: unexpected message received when the watch has closed');
                return;
            }
            case WatchStatus.ERRORED: {
                console.warn('[realtime listener] internal non-fatal error: unexpected message received when the watch has ended with error');
                return;
            }
        }
        if (!this.sessionInfo) {
            console.warn('[realtime listener] internal non-fatal error: sessionInfo not found while message is received.');
            return;
        }
        this.scheduleSendACK();
        switch (msg.msgType) {
            case 'NEXT_EVENT': {
                console.warn("nextevent ".concat(msg.msgData.currEvent, " ignored"), msg);
                this.handleServerEvents(msg);
                break;
            }
            case 'CHECK_EVENT': {
                if (this.sessionInfo.currentEventId < msg.msgData.currEvent) {
                    this.sessionInfo.expectEventId = msg.msgData.currEvent;
                    this.clearWaitExpectedEvent();
                    this.waitExpectedTimeoutId = setTimeout(function () {
                        _this.rebuildWatch();
                    }, this.getWaitExpectedTimeoutLength());
                    console.log("[realtime] waitExpectedTimeoutLength ".concat(this.getWaitExpectedTimeoutLength()));
                }
                break;
            }
            case 'ERROR': {
                this.closeWithError(new error_1.CloudSDKError({
                    errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_SERVER_ERROR_MSG,
                    errMsg: "".concat(msg.msgData.code, " - ").concat(msg.msgData.message),
                }));
                break;
            }
            default: {
                console.warn("[realtime listener] virtual client receive unexpected msg ".concat(msg.msgType, ": "), msg);
                break;
            }
        }
    };
    VirtualWebSocketClient.prototype.closeWithError = function (error) {
        var _a;
        this.watchStatus = WatchStatus.ERRORED;
        this.clearACKSchedule();
        this.listener.onError(error);
        this.onWatchClose(this, ((_a = this.sessionInfo) === null || _a === void 0 ? void 0 : _a.queryID) || '');
        console.log("[realtime] client closed (".concat(this.collectionName, " ").concat(this.query, ") (watchId ").concat(this.watchId, ")"));
    };
    VirtualWebSocketClient.prototype.pause = function () {
        this.watchStatus = WatchStatus.PAUSED;
        console.log("[realtime] client paused (".concat(this.collectionName, " ").concat(this.query, ") (watchId ").concat(this.watchId, ")"));
    };
    VirtualWebSocketClient.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.watchStatus = WatchStatus.RESUMING;
                        console.log("[realtime] client resuming with ".concat(this.sessionInfo ? 'REBUILD_WATCH' : 'INIT_WATCH', " (").concat(this.collectionName, " ").concat(this.query, ") (").concat(this.watchId, ")"));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, (this.sessionInfo ? this.rebuildWatch() : this.initWatch())];
                    case 2:
                        _a.sent();
                        console.log("[realtime] client successfully resumed (".concat(this.collectionName, " ").concat(this.query, ") (").concat(this.watchId, ")"));
                        return [3, 4];
                    case 3:
                        e_6 = _a.sent();
                        console.error("[realtime] client resume failed (".concat(this.collectionName, " ").concat(this.query, ") (").concat(this.watchId, ")"), e_6);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    VirtualWebSocketClient.prototype.useRetryTicket = function (operationName) {
        if (this.availableRetries[operationName]
            && this.availableRetries[operationName] > 0) {
            this.availableRetries[operationName] -= 1;
            console.log("[realtime] ".concat(operationName, " use a retry ticket, now only ").concat(this.availableRetries[operationName], " retry left"));
            return true;
        }
        return false;
    };
    VirtualWebSocketClient.prototype.handleServerEvents = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.scheduleSendACK();
                        return [4, this.handleServerEventsInternel(msg)];
                    case 1:
                        _a.sent();
                        this.postHandleServerEventsValidityCheck(msg);
                        return [3, 3];
                    case 2:
                        e_7 = _a.sent();
                        console.error('[realtime listener] internal non-fatal error: handle server events failed with error: ', e_7);
                        throw e_7;
                    case 3: return [2];
                }
            });
        });
    };
    VirtualWebSocketClient.prototype.handleServerEventsInternel = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, events, msgType, sessionInfo, allChangeEvents, docs, initEncountered, _loop_1, this_1, i, len, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestId = msg.requestId;
                        events = msg.msgData.events;
                        msgType = msg.msgType;
                        if (!events.length || !this.sessionInfo) {
                            return [2];
                        }
                        sessionInfo = this.sessionInfo;
                        try {
                            allChangeEvents = events.map(getPublicEvent);
                        }
                        catch (e) {
                            this.closeWithError(new error_1.CloudSDKError({
                                errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_RECEIVE_INVALID_SERVER_DATA,
                                errMsg: e,
                            }));
                            return [2];
                        }
                        docs = __spreadArray([], sessionInfo.currentDocs, true);
                        initEncountered = false;
                        _loop_1 = function (i, len) {
                            var change, localDoc, doc_1, _i, _b, fieldPath, err, err, doc, doc, err, ind, ind, docsSnapshot, docChanges, snapshot;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        change = allChangeEvents[i];
                                        if (!(sessionInfo.currentEventId >= change.id)) return [3, 1];
                                        if (!allChangeEvents[i - 1] || change.id > allChangeEvents[i - 1].id) {
                                            console.warn("[realtime] duplicate event received, cur ".concat(sessionInfo.currentEventId, " but got ").concat(change.id));
                                        }
                                        else {
                                            console.error("[realtime listener] server non-fatal error: events out of order (the latter event's id is smaller than that of the former) (requestId ".concat(requestId, ")"));
                                        }
                                        return [2, "continue"];
                                    case 1:
                                        if (!(sessionInfo.currentEventId === change.id - 1)) return [3, 2];
                                        switch (change.dataType) {
                                            case 'update': {
                                                if (!change.doc) {
                                                    switch (change.queueType) {
                                                        case 'update':
                                                        case 'dequeue': {
                                                            localDoc = docs.find(function (doc) { return doc._id === change.docId; });
                                                            if (localDoc) {
                                                                doc_1 = (0, cloneDeep_1.default)(localDoc);
                                                                if (change.updatedFields) {
                                                                    Object.keys(change.updatedFields).forEach(function (fieldPath) {
                                                                        (0, set_1.default)(doc_1, fieldPath, change.updatedFields[fieldPath]);
                                                                    });
                                                                }
                                                                if (change.removedFields) {
                                                                    for (_i = 0, _b = change.removedFields; _i < _b.length; _i++) {
                                                                        fieldPath = _b[_i];
                                                                        (0, unset_1.default)(doc_1, fieldPath);
                                                                    }
                                                                }
                                                                change.doc = doc_1;
                                                            }
                                                            else {
                                                                console.error('[realtime listener] internal non-fatal server error: unexpected update dataType event where no doc is associated.');
                                                            }
                                                            break;
                                                        }
                                                        case 'enqueue': {
                                                            err = new error_1.CloudSDKError({
                                                                errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR,
                                                                errMsg: "HandleServerEvents: full doc is not provided with dataType=\"update\" and queueType=\"enqueue\" (requestId ".concat(msg.requestId, ")"),
                                                            });
                                                            this_1.closeWithError(err);
                                                            throw err;
                                                        }
                                                        default: {
                                                            break;
                                                        }
                                                    }
                                                }
                                                break;
                                            }
                                            case 'replace': {
                                                if (!change.doc) {
                                                    err = new error_1.CloudSDKError({
                                                        errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR,
                                                        errMsg: "HandleServerEvents: full doc is not provided with dataType=\"replace\" (requestId ".concat(msg.requestId, ")"),
                                                    });
                                                    this_1.closeWithError(err);
                                                    throw err;
                                                }
                                                break;
                                            }
                                            case 'remove': {
                                                doc = docs.find(function (doc) { return doc._id === change.docId; });
                                                if (doc) {
                                                    change.doc = doc;
                                                }
                                                else {
                                                    console.error('[realtime listener] internal non-fatal server error: unexpected remove event where no doc is associated.');
                                                }
                                                break;
                                            }
                                            case 'limit': {
                                                if (!change.doc) {
                                                    switch (change.queueType) {
                                                        case 'dequeue': {
                                                            doc = docs.find(function (doc) { return doc._id === change.docId; });
                                                            if (doc) {
                                                                change.doc = doc;
                                                            }
                                                            else {
                                                                console.error('[realtime listener] internal non-fatal server error: unexpected limit dataType event where no doc is associated.');
                                                            }
                                                            break;
                                                        }
                                                        case 'enqueue': {
                                                            err = new error_1.CloudSDKError({
                                                                errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR,
                                                                errMsg: "HandleServerEvents: full doc is not provided with dataType=\"limit\" and queueType=\"enqueue\" (requestId ".concat(msg.requestId, ")"),
                                                            });
                                                            this_1.closeWithError(err);
                                                            throw err;
                                                        }
                                                        default: {
                                                            break;
                                                        }
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        switch (change.queueType) {
                                            case 'init': {
                                                if (!initEncountered) {
                                                    initEncountered = true;
                                                    docs = [change.doc];
                                                }
                                                else {
                                                    docs.push(change.doc);
                                                }
                                                break;
                                            }
                                            case 'enqueue': {
                                                docs.push(change.doc);
                                                break;
                                            }
                                            case 'dequeue': {
                                                ind = docs.findIndex(function (doc) { return doc._id === change.docId; });
                                                if (ind > -1) {
                                                    docs.splice(ind, 1);
                                                }
                                                else {
                                                    console.error('[realtime listener] internal non-fatal server error: unexpected dequeue event where no doc is associated.');
                                                }
                                                break;
                                            }
                                            case 'update': {
                                                ind = docs.findIndex(function (doc) { return doc._id === change.docId; });
                                                if (ind > -1) {
                                                    docs[ind] = change.doc;
                                                }
                                                else {
                                                    console.error('[realtime listener] internal non-fatal server error: unexpected queueType update event where no doc is associated.');
                                                }
                                                break;
                                            }
                                        }
                                        if (i === len - 1
                                            || (allChangeEvents[i + 1] && allChangeEvents[i + 1].id !== change.id)) {
                                            docsSnapshot = __spreadArray([], docs, true);
                                            docChanges = allChangeEvents
                                                .slice(0, i + 1)
                                                .filter(function (c) { return c.id === change.id; });
                                            this_1.sessionInfo.currentEventId = change.id;
                                            this_1.sessionInfo.currentDocs = docs;
                                            snapshot = new snapshot_1.Snapshot({
                                                id: change.id,
                                                docChanges: docChanges,
                                                docs: docsSnapshot,
                                                msgType: msgType,
                                            });
                                            this_1.listener.onChange(snapshot);
                                        }
                                        return [3, 4];
                                    case 2:
                                        console.warn("[realtime listener] event received is out of order, cur ".concat(this_1.sessionInfo.currentEventId, " but got ").concat(change.id));
                                        return [4, this_1.rebuildWatch()];
                                    case 3:
                                        _c.sent();
                                        return [2, { value: void 0 }];
                                    case 4: return [2];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0, len = allChangeEvents.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < len)) return [3, 4];
                        return [5, _loop_1(i, len)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2, state_1.value];
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    };
    VirtualWebSocketClient.prototype.postHandleServerEventsValidityCheck = function (msg) {
        if (!this.sessionInfo) {
            console.error('[realtime listener] internal non-fatal error: sessionInfo lost after server event handling, this should never occur');
            return;
        }
        if (this.sessionInfo.expectEventId
            && this.sessionInfo.currentEventId >= this.sessionInfo.expectEventId) {
            this.clearWaitExpectedEvent();
        }
        if (this.sessionInfo.currentEventId < msg.msgData.currEvent) {
            console.warn('[realtime listener] internal non-fatal error: client eventId does not match with server event id after server event handling');
            return;
        }
    };
    VirtualWebSocketClient.prototype.clearWaitExpectedEvent = function () {
        if (this.waitExpectedTimeoutId) {
            clearTimeout(this.waitExpectedTimeoutId);
            this.waitExpectedTimeoutId = undefined;
        }
    };
    return VirtualWebSocketClient;
}());
exports.VirtualWebSocketClient = VirtualWebSocketClient;
function getPublicEvent(event) {
    var e = {
        id: event.ID,
        dataType: event.DataType,
        queueType: event.QueueType,
        docId: event.DocID,
        doc: event.Doc && event.Doc !== '{}' ? JSON.parse(event.Doc) : undefined,
    };
    if (event.DataType === 'update') {
        if (event.UpdatedFields) {
            e.updatedFields = JSON.parse(event.UpdatedFields);
        }
        if (event.removedFields || event.RemovedFields) {
            e.removedFields = JSON.parse(event.removedFields);
        }
    }
    return e;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC13ZWJzb2NrZXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZpcnR1YWwtd2Vic29ja2V0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBNEI7QUFDNUIsdURBQWdDO0FBQ2hDLCtEQUF3QztBQUN4QyxxQ0FBd0M7QUFnQnhDLHVDQUE2QztBQUM3Qyx1Q0FBcUM7QUFFckMsaUNBU2dCO0FBQ2hCLGlDQUErQjtBQXlDL0IsSUFBSyxXQVVKO0FBVkQsV0FBSyxXQUFXO0lBQ2Qsc0NBQXVCLENBQUE7SUFDdkIsa0NBQW1CLENBQUE7SUFDbkIsd0NBQXlCLENBQUE7SUFDekIsZ0NBQWlCLENBQUE7SUFDakIsa0NBQW1CLENBQUE7SUFDbkIsa0NBQW1CLENBQUE7SUFDbkIsZ0NBQWlCLENBQUE7SUFDakIsZ0NBQWlCLENBQUE7SUFDakIsb0NBQXFCLENBQUE7QUFDdkIsQ0FBQyxFQVZJLFdBQVcsS0FBWCxXQUFXLFFBVWY7QUFFRCxJQUFNLGtDQUFrQyxHQUFHLEdBQUcsQ0FBQTtBQUM5QyxJQUFNLCtCQUErQixHQUFHLENBQUMsQ0FBQTtBQUN6QyxJQUFNLHdDQUF3QyxHQUFHLENBQUMsQ0FBQTtBQUNsRCxJQUFNLGlDQUFpQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUE7QUFDbkQsSUFBTSwwQkFBMEIsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBQzVDLElBQU0sNkJBQTZCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQTtBQUUvQztJQXFDRSxnQ0FBWSxPQUFrRDtRQUE5RCxpQkFpQ0M7UUE3Q08sZ0JBQVcsR0FBZ0IsV0FBVyxDQUFDLE9BQU8sQ0FBQTtRQXNLOUMsWUFBTyxHQUFHLFVBQ2hCLEtBQWMsRUFDZCxPQUFpQjs7Ozs7d0JBRWpCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FB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OTJCWSx3REFBc0I7QUFnM0JuQyxTQUFTLGNBQWMsQ0FBQyxLQUFlO0lBQ3JDLElBQU0sQ0FBQyxHQUFtQjtRQUN4QixFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDWixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDeEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO1FBQzFCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztRQUNsQixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7S0FDekUsQ0FBQTtJQUVELElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFFL0IsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLENBQUMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUE7U0FDbEQ7UUFHRCxJQUFJLEtBQUssQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRTtZQUs5QyxDQUFDLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1NBQ2xEO0tBQ0Y7SUFFRCxPQUFPLENBQUMsQ0FBQTtBQUNWLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2V0IGZyb20gJ2xvZGFzaC9zZXQnXG5pbXBvcnQgdW5zZXQgZnJvbSAnbG9kYXNoL3Vuc2V0J1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJ1xuaW1wb3J0IHsgZ2VuUmVxdWVzdElkIH0gZnJvbSAnLi9tZXNzYWdlJ1xuaW1wb3J0IHtcbiAgSVJlc3BvbnNlTWVzc2FnZSxcbiAgSVJlcXVlc3RNZXNzYWdlSW5pdFdhdGNoTXNnLFxuICBJUmVzcG9uc2VNZXNzYWdlSW5pdEV2ZW50TXNnLFxuICBJREJFdmVudCxcbiAgSVJlcXVlc3RNZXNzYWdlUmVidWlsZFdhdGNoTXNnLFxuICBJUmVxdWVzdE1lc3NhZ2VDbG9zZVdhdGNoTXNnLFxuICBJUmVxdWVzdE1zZ1R5cGUsXG4gIElSZXNwb25zZU1lc3NhZ2VOZXh0RXZlbnRNc2csXG4gIElSZXF1ZXN0TWVzc2FnZUNoZWNrTGFzdE1zZyxcbiAgSVdhdGNoT3B0aW9ucyxcbn0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9yZWFsdGltZSdcbmltcG9ydCB7XG4gIElTaW5nbGVEQkV2ZW50LFxufSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2RhdGFiYXNlJ1xuaW1wb3J0IHsgUmVhbHRpbWVMaXN0ZW5lciB9IGZyb20gJy4vbGlzdGVuZXInXG5pbXBvcnQgeyBTbmFwc2hvdCB9IGZyb20gJy4vc25hcHNob3QnXG5pbXBvcnQgeyBJV1NTZW5kT3B0aW9ucywgSUxvZ2luUmVzdWx0IH0gZnJvbSAnLi93ZWJzb2NrZXQtY2xpZW50J1xuaW1wb3J0IHtcbiAgRVJSX0NPREUsXG4gIENsb3VkU0RLRXJyb3IsXG4gIGlzVGltZW91dEVycm9yLFxuICBDYW5jZWxsZWRFcnJvcixcbiAgaXNDYW5jZWxsZWRFcnJvcixcbiAgaXNSZWFsdGltZUVycm9yTWVzc2FnZUVycm9yLFxuICBSZWFsdGltZUVycm9yTWVzc2FnZUVycm9yLFxuICBUaW1lb3V0RXJyb3IsXG59IGZyb20gJy4vZXJyb3InXG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gJy4vdXRpbHMnXG5cbi8vID09PT09PT09PT09PT09PSBSZWFsdGltZSBWaXJ0dWFsIFdlYlNvY2tldCBDbGllbnQgKEludGVybmFsKSA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgSVZpcnR1YWxXZWJTb2NrZXRDbGllbnRDb25zdHJ1Y3Rvck9wdGlvbnMgZXh0ZW5kcyBJV2F0Y2hPcHRpb25zIHtcbiAgZW52SWQ/OiBzdHJpbmdcbiAgY29sbGVjdGlvbk5hbWU6IHN0cmluZ1xuICBxdWVyeTogc3RyaW5nXG4gIGxpbWl0PzogbnVtYmVyXG4gIG9yZGVyQnk/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gIHNlbmQ6IDxUID0gYW55PihvcHRzOiBJV1NTZW5kT3B0aW9ucykgPT4gUHJvbWlzZTxUPlxuICBsb2dpbjogKGVudklkPzogc3RyaW5nLCByZWZyZXNoPzogYm9vbGVhbikgPT4gUHJvbWlzZTxhbnk+XG4gIGlzV1NDb25uZWN0ZWQ6ICgpID0+IGJvb2xlYW5cbiAgb25jZVdTQ29ubmVjdGVkOiAoKSA9PiBQcm9taXNlPHZvaWQ+XG4gIGdldFdhaXRFeHBlY3RlZFRpbWVvdXRMZW5ndGg6ICgpID0+IG51bWJlclxuICBvbldhdGNoU3RhcnQ6IChjbGllbnQ6IFZpcnR1YWxXZWJTb2NrZXRDbGllbnQsIHF1ZXJ5SUQ6IHN0cmluZykgPT4gdm9pZFxuICBvbldhdGNoQ2xvc2U6IChjbGllbnQ6IFZpcnR1YWxXZWJTb2NrZXRDbGllbnQsIHF1ZXJ5SUQ6IHN0cmluZykgPT4gdm9pZFxuICBkZWJ1Zz86IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElXYXRjaFNlc3Npb25JbmZvIHtcbiAgcXVlcnlJRDogc3RyaW5nXG4gIGN1cnJlbnRFdmVudElkOiBudW1iZXJcbiAgY3VycmVudERvY3M6IFJlY29yZDxzdHJpbmcsIGFueT5bXVxuICBleHBlY3RFdmVudElkPzogbnVtYmVyXG59XG5cbmludGVyZmFjZSBJSGFuZGxlQ29tbW9uRXJyb3JPcHRpb25zIHtcbiAgb25TaWduRXJyb3I6IChlOiBSZWFsdGltZUVycm9yTWVzc2FnZUVycm9yKSA9PiB2b2lkXG4gIG9uVGltZW91dEVycm9yOiAoZTogVGltZW91dEVycm9yKSA9PiB2b2lkXG4gIG9uQ2FuY2VsbGVkRXJyb3I6IChlOiBDYW5jZWxsZWRFcnJvcikgPT4gdm9pZFxuICBvbk5vdFJldHJ5YWJsZUVycm9yOiAoZTogUmVhbHRpbWVFcnJvck1lc3NhZ2VFcnJvcikgPT4gdm9pZFxuICBvblVua25vd25FcnJvcjogKGU6IGFueSkgPT4gdm9pZFxufVxuXG5pbnRlcmZhY2UgSUhhbmRsZVdhdGNoRXN0YWJsaXNobWVudEVycm9yT3B0aW9ucyB7XG4gIG9wZXJhdGlvbk5hbWU6ICdJTklUX1dBVENIJyB8ICdSRUJVSUxEX1dBVENIJ1xuICByZXNvbHZlOiAodmFsdWU/OiBQcm9taXNlTGlrZTx2b2lkPiB8IHVuZGVmaW5lZCkgPT4gdm9pZFxuICByZWplY3Q6IChlOiBhbnkpID0+IHZvaWRcbn1cblxuZW51bSBXYXRjaFN0YXR1cyB7XG4gIExPR0dJTkdJTiA9ICdMT0dHSU5HSU4nLFxuICBJTklUSU5HID0gJ0lOSVRJTkcnLFxuICBSRUJVSUxESU5HID0gJ1JFQlVJTERJTkcnLFxuICBBQ1RJVkUgPSAnQUNUSVZFJyxcbiAgRVJST1JFRCA9ICdFUlJPUkVEJyxcbiAgQ0xPU0lORyA9ICdDTE9TSU5HJyxcbiAgQ0xPU0VEID0gJ0NMT1NFRCcsXG4gIFBBVVNFRCA9ICdQQVVTRUQnLFxuICBSRVNVTUlORyA9ICdSRVNVTUlORydcbn1cblxuY29uc3QgREVGQVVMVF9XQUlUX1RJTUVfT05fVU5LTk9XTl9FUlJPUiA9IDEwMFxuY29uc3QgREVGQVVMVF9NQVhfQVVUT19SRVRSWV9PTl9FUlJPUiA9IDJcbmNvbnN0IERFRkFVTFRfTUFYX1NFTkRfQUNLX0FVVE9fUkVUUllfT05fRVJST1IgPSAyXG5jb25zdCBERUZBVUxUX1NFTkRfQUNLX0RFQk9VTkNFX1RJTUVPVVQgPSAxMCAqIDEwMDBcbmNvbnN0IERFRkFVTFRfSU5JVF9XQVRDSF9USU1FT1VUID0gMTAgKiAxMDAwXG5jb25zdCBERUZBVUxUX1JFQlVJTERfV0FUQ0hfVElNRU9VVCA9IDEwICogMTAwMFxuXG5leHBvcnQgY2xhc3MgVmlydHVhbFdlYlNvY2tldENsaWVudCB7XG4gIC8vIHBhc3NlZCBvdmVyXG4gIHdhdGNoSWQ6IHN0cmluZ1xuICAvLyBvd25cbiAgbGlzdGVuZXI6IFJlYWx0aW1lTGlzdGVuZXJcbiAgcHJpdmF0ZSBlbnZJZD86IHN0cmluZ1xuICBwcml2YXRlIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBxdWVyeTogc3RyaW5nXG4gIHByaXZhdGUgbGltaXQ6IG51bWJlclxuICBwcml2YXRlIG9yZGVyQnk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgcHJpdmF0ZSBzZW5kOiA8VCA9IGFueT4ob3B0czogSVdTU2VuZE9wdGlvbnMpID0+IFByb21pc2U8VD5cbiAgcHJpdmF0ZSBsb2dpbjogKGVudklkPzogc3RyaW5nLCByZWZyZXNoPzogYm9vbGVhbikgPT4gUHJvbWlzZTxhbnk+XG4gIHByaXZhdGUgaXNXU0Nvbm5lY3RlZDogKCkgPT4gYm9vbGVhblxuICBwcml2YXRlIG9uY2VXU0Nvbm5lY3RlZDogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICBwcml2YXRlIGdldFdhaXRFeHBlY3RlZFRpbWVvdXRMZW5ndGg6ICgpID0+IG51bWJlclxuICBwcml2YXRlIG9uV2F0Y2hTdGFydDogKFxuICAgIGNsaWVudDogVmlydHVhbFdlYlNvY2tldENsaWVudCxcbiAgICBxdWVyeUlEOiBzdHJpbmdcbiAgKSA9PiB2b2lkXG4gIHByaXZhdGUgb25XYXRjaENsb3NlOiAoXG4gICAgY2xpZW50OiBWaXJ0dWFsV2ViU29ja2V0Q2xpZW50LFxuICAgIHF1ZXJ5SUQ6IHN0cmluZ1xuICApID0+IHZvaWRcbiAgcHJpdmF0ZSBkZWJ1Zz86IGJvb2xlYW5cblxuICBwcml2YXRlIHdhdGNoU3RhdHVzOiBXYXRjaFN0YXR1cyA9IFdhdGNoU3RhdHVzLklOSVRJTkdcbiAgcHJpdmF0ZSBhdmFpbGFibGVSZXRyaWVzOiBQYXJ0aWFsPFJlY29yZDxJUmVxdWVzdE1zZ1R5cGUsIG51bWJlcj4+XG4gIHByaXZhdGUgYWNrVGltZW91dElkPzogbnVtYmVyXG4gIHByaXZhdGUgaW5pdFdhdGNoUHJvbWlzZT86IFByb21pc2U8dm9pZD5cbiAgcHJpdmF0ZSByZWJ1aWxkV2F0Y2hQcm9taXNlPzogUHJvbWlzZTx2b2lkPlxuXG4gIC8vIG9idGFpbmVkXG4gIHByaXZhdGUgc2Vzc2lvbkluZm8/OiBJV2F0Y2hTZXNzaW9uSW5mb1xuXG4gIC8vIGludGVybmFsXG4gIHByaXZhdGUgd2FpdEV4cGVjdGVkVGltZW91dElkPzogbnVtYmVyXG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogSVZpcnR1YWxXZWJTb2NrZXRDbGllbnRDb25zdHJ1Y3Rvck9wdGlvbnMpIHtcbiAgICB0aGlzLndhdGNoSWQgPSBgd2F0Y2hpZF8keytuZXcgRGF0ZSgpfV8ke01hdGgucmFuZG9tKCl9YFxuICAgIHRoaXMuZW52SWQgPSBvcHRpb25zLmVudklkXG4gICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IG9wdGlvbnMuY29sbGVjdGlvbk5hbWVcbiAgICB0aGlzLnF1ZXJ5ID0gb3B0aW9ucy5xdWVyeVxuICAgIHRoaXMubGltaXQgPSBvcHRpb25zLmxpbWl0XG4gICAgdGhpcy5vcmRlckJ5ID0gb3B0aW9ucy5vcmRlckJ5XG4gICAgdGhpcy5zZW5kID0gb3B0aW9ucy5zZW5kXG4gICAgdGhpcy5sb2dpbiA9IG9wdGlvbnMubG9naW5cbiAgICB0aGlzLmlzV1NDb25uZWN0ZWQgPSBvcHRpb25zLmlzV1NDb25uZWN0ZWRcbiAgICB0aGlzLm9uY2VXU0Nvbm5lY3RlZCA9IG9wdGlvbnMub25jZVdTQ29ubmVjdGVkXG4gICAgdGhpcy5nZXRXYWl0RXhwZWN0ZWRUaW1lb3V0TGVuZ3RoID0gb3B0aW9ucy5nZXRXYWl0RXhwZWN0ZWRUaW1lb3V0TGVuZ3RoXG4gICAgdGhpcy5vbldhdGNoU3RhcnQgPSBvcHRpb25zLm9uV2F0Y2hTdGFydFxuICAgIHRoaXMub25XYXRjaENsb3NlID0gb3B0aW9ucy5vbldhdGNoQ2xvc2VcbiAgICB0aGlzLmRlYnVnID0gb3B0aW9ucy5kZWJ1Z1xuXG4gICAgdGhpcy5hdmFpbGFibGVSZXRyaWVzID0ge1xuICAgICAgSU5JVF9XQVRDSDogREVGQVVMVF9NQVhfQVVUT19SRVRSWV9PTl9FUlJPUixcbiAgICAgIFJFQlVJTERfV0FUQ0g6IERFRkFVTFRfTUFYX0FVVE9fUkVUUllfT05fRVJST1IsXG4gICAgICBDSEVDS19MQVNUOiBERUZBVUxUX01BWF9TRU5EX0FDS19BVVRPX1JFVFJZX09OX0VSUk9SLFxuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXIgPSBuZXcgUmVhbHRpbWVMaXN0ZW5lcih7XG4gICAgICBjbG9zZTogKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlV2F0Y2goKVxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBvcHRpb25zLm9uQ2hhbmdlLFxuICAgICAgb25FcnJvcjogb3B0aW9ucy5vbkVycm9yLFxuICAgICAgZGVidWc6IHRoaXMuZGVidWcsXG4gICAgICB2aXJ0dWFsQ2xpZW50OiB0aGlzLFxuICAgIH0pXG5cbiAgICB0aGlzLmluaXRXYXRjaCgpXG4gIH1cblxuICBvbk1lc3NhZ2UobXNnOiBJUmVzcG9uc2VNZXNzYWdlKSB7XG4gICAgLy8gd2F0Y2hTdGF0dXMgc2FuaXR5IGNoZWNrXG4gICAgc3dpdGNoICh0aGlzLndhdGNoU3RhdHVzKSB7XG4gICAgICBjYXNlIFdhdGNoU3RhdHVzLlBBVVNFRDoge1xuICAgICAgICAvLyBpZ25vcmUgYWxsIGJ1dCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGlmIChtc2cubXNnVHlwZSAhPT0gJ0VSUk9SJykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlIFdhdGNoU3RhdHVzLkxPR0dJTkdJTjpcbiAgICAgIGNhc2UgV2F0Y2hTdGF0dXMuSU5JVElORzpcbiAgICAgIGNhc2UgV2F0Y2hTdGF0dXMuUkVCVUlMRElORzoge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtyZWFsdGltZSBsaXN0ZW5lcl0gaW50ZXJuYWwgbm9uLWZhdGFsIGVycm9yOiB1bmV4cGVjdGVkIG1lc3NhZ2UgcmVjZWl2ZWQgd2hpbGUgJHt0aGlzLndhdGNoU3RhdHVzfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY2FzZSBXYXRjaFN0YXR1cy5DTE9TRUQ6IHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbcmVhbHRpbWUgbGlzdGVuZXJdIGludGVybmFsIG5vbi1mYXRhbCBlcnJvcjogdW5leHBlY3RlZCBtZXNzYWdlIHJlY2VpdmVkIHdoZW4gdGhlIHdhdGNoIGhhcyBjbG9zZWQnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNhc2UgV2F0Y2hTdGF0dXMuRVJST1JFRDoge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tyZWFsdGltZSBsaXN0ZW5lcl0gaW50ZXJuYWwgbm9uLWZhdGFsIGVycm9yOiB1bmV4cGVjdGVkIG1lc3NhZ2UgcmVjZWl2ZWQgd2hlbiB0aGUgd2F0Y2ggaGFzIGVuZGVkIHdpdGggZXJyb3InKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2Vzc2lvbkluZm8pIHtcbiAgICAgIGNvbnNvbGUud2FybignW3JlYWx0aW1lIGxpc3RlbmVyXSBpbnRlcm5hbCBub24tZmF0YWwgZXJyb3I6IHNlc3Npb25JbmZvIG5vdCBmb3VuZCB3aGlsZSBtZXNzYWdlIGlzIHJlY2VpdmVkLicpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnNjaGVkdWxlU2VuZEFDSygpXG5cbiAgICBzd2l0Y2ggKG1zZy5tc2dUeXBlKSB7XG4gICAgICBjYXNlICdORVhUX0VWRU5UJzoge1xuICAgICAgICAvLyBpZiAocHJvY2Vzcy5lbnYuREVCVUcpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAvLyBpZiAod3guX2lnbm9yZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYG5leHRldmVudCAke21zZy5tc2dEYXRhLmN1cnJFdmVudH0gaWdub3JlZGAsIG1zZylcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAvLyB3eC5faWdub3JlID0gZmFsc2VcbiAgICAgICAgLy8gcmV0dXJuXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHRoaXMuaGFuZGxlU2VydmVyRXZlbnRzKG1zZylcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ0NIRUNLX0VWRU5UJzoge1xuICAgICAgICBpZiAodGhpcy5zZXNzaW9uSW5mby5jdXJyZW50RXZlbnRJZCA8IG1zZy5tc2dEYXRhLmN1cnJFdmVudCkge1xuICAgICAgICAgIC8vIGNsaWVudCBldmVudElEIDwgc2VydmVyIGV2ZW50SUQ6XG4gICAgICAgICAgLy8gdGhlcmUgbWlnaHQgYmUgb25lIG9yIG1vcmUgcGVuZGluZyBldmVudHMgbm90IHlldCByZWNlaXZlZCBidXQgc2VudCBieSB0aGUgc2VydmVyXG4gICAgICAgICAgdGhpcy5zZXNzaW9uSW5mby5leHBlY3RFdmVudElkID0gbXNnLm1zZ0RhdGEuY3VyckV2ZW50XG4gICAgICAgICAgdGhpcy5jbGVhcldhaXRFeHBlY3RlZEV2ZW50KClcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgdGhpcy53YWl0RXhwZWN0ZWRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIC8vIG11c3QgcmVidWlsZCB3YXRjaFxuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkV2F0Y2goKVxuICAgICAgICAgIH0sIHRoaXMuZ2V0V2FpdEV4cGVjdGVkVGltZW91dExlbmd0aCgpKVxuXG4gICAgICAgICAgY29uc29sZS5sb2coYFtyZWFsdGltZV0gd2FpdEV4cGVjdGVkVGltZW91dExlbmd0aCAke3RoaXMuZ2V0V2FpdEV4cGVjdGVkVGltZW91dExlbmd0aCgpfWApXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ0VSUk9SJzoge1xuICAgICAgICAvLyByZWNlaXZlIHNlcnZlciBlcnJvclxuICAgICAgICB0aGlzLmNsb3NlV2l0aEVycm9yKG5ldyBDbG91ZFNES0Vycm9yKHtcbiAgICAgICAgICBlcnJDb2RlOiBFUlJfQ09ERS5TREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfU0VSVkVSX0VSUk9SX01TRyBhcyBzdHJpbmcsXG4gICAgICAgICAgZXJyTXNnOiBgJHttc2cubXNnRGF0YS5jb2RlfSAtICR7bXNnLm1zZ0RhdGEubWVzc2FnZX1gLFxuICAgICAgICB9KSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBbcmVhbHRpbWUgbGlzdGVuZXJdIHZpcnR1YWwgY2xpZW50IHJlY2VpdmUgdW5leHBlY3RlZCBtc2cgJHttc2cubXNnVHlwZX06IGAsXG4gICAgICAgICAgbXNnXG4gICAgICAgIClcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjbG9zZVdpdGhFcnJvcihlcnJvcjogYW55KSB7XG4gICAgdGhpcy53YXRjaFN0YXR1cyA9IFdhdGNoU3RhdHVzLkVSUk9SRURcbiAgICB0aGlzLmNsZWFyQUNLU2NoZWR1bGUoKVxuICAgIHRoaXMubGlzdGVuZXIub25FcnJvcihlcnJvcilcbiAgICB0aGlzLm9uV2F0Y2hDbG9zZShcbiAgICAgIHRoaXMsXG4gICAgICAodGhpcy5zZXNzaW9uSW5mbz8ucXVlcnlJRCkgfHwgJydcbiAgICApXG5cbiAgICBjb25zb2xlLmxvZyhgW3JlYWx0aW1lXSBjbGllbnQgY2xvc2VkICgke3RoaXMuY29sbGVjdGlvbk5hbWV9ICR7dGhpcy5xdWVyeX0pICh3YXRjaElkICR7dGhpcy53YXRjaElkfSlgKVxuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgdGhpcy53YXRjaFN0YXR1cyA9IFdhdGNoU3RhdHVzLlBBVVNFRFxuICAgIGNvbnNvbGUubG9nKGBbcmVhbHRpbWVdIGNsaWVudCBwYXVzZWQgKCR7dGhpcy5jb2xsZWN0aW9uTmFtZX0gJHt0aGlzLnF1ZXJ5fSkgKHdhdGNoSWQgJHt0aGlzLndhdGNoSWR9KWApXG4gIH1cblxuXG4gIGFzeW5jIHJlc3VtZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLndhdGNoU3RhdHVzID0gV2F0Y2hTdGF0dXMuUkVTVU1JTkdcblxuICAgIGNvbnNvbGUubG9nKGBbcmVhbHRpbWVdIGNsaWVudCByZXN1bWluZyB3aXRoICR7XG4gICAgICB0aGlzLnNlc3Npb25JbmZvID8gJ1JFQlVJTERfV0FUQ0gnIDogJ0lOSVRfV0FUQ0gnXG4gICAgfSAoJHt0aGlzLmNvbGxlY3Rpb25OYW1lfSAke3RoaXMucXVlcnl9KSAoJHt0aGlzLndhdGNoSWR9KWApXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgKHRoaXMuc2Vzc2lvbkluZm8gPyB0aGlzLnJlYnVpbGRXYXRjaCgpIDogdGhpcy5pbml0V2F0Y2goKSlcblxuICAgICAgY29uc29sZS5sb2coYFtyZWFsdGltZV0gY2xpZW50IHN1Y2Nlc3NmdWxseSByZXN1bWVkICgke3RoaXMuY29sbGVjdGlvbk5hbWV9ICR7dGhpcy5xdWVyeX0pICgke3RoaXMud2F0Y2hJZH0pYClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBgW3JlYWx0aW1lXSBjbGllbnQgcmVzdW1lIGZhaWxlZCAoJHt0aGlzLmNvbGxlY3Rpb25OYW1lfSAke3RoaXMucXVlcnl9KSAoJHt0aGlzLndhdGNoSWR9KWAsXG4gICAgICAgIGVcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHdzTG9naW4gPSBhc3luYyAoXG4gICAgZW52SWQ/OiBzdHJpbmcsXG4gICAgcmVmcmVzaD86IGJvb2xlYW5cbiAgKTogUHJvbWlzZTxJTG9naW5SZXN1bHQ+ID0+IHtcbiAgICB0aGlzLndhdGNoU3RhdHVzID0gV2F0Y2hTdGF0dXMuTE9HR0lOR0lOXG4gICAgY29uc3QgbG9naW5SZXN1bHQgPSBhd2FpdCB0aGlzLmxvZ2luKGVudklkLCByZWZyZXNoKVxuICAgIGlmICghdGhpcy5lbnZJZCkge1xuICAgICAgdGhpcy5lbnZJZCA9IGxvZ2luUmVzdWx0LmVudklkXG4gICAgfVxuICAgIHJldHVybiBsb2dpblJlc3VsdFxuICB9XG5cbiAgcHJpdmF0ZSBpbml0V2F0Y2ggPSBhc3luYyAoZm9yY2VSZWZyZXNoTG9naW4/OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgaWYgKHRoaXMuaW5pdFdhdGNoUHJvbWlzZSAhPT0gbnVsbCAmJiB0aGlzLmluaXRXYXRjaFByb21pc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFdhdGNoUHJvbWlzZVxuICAgIH1cblxuICAgIHRoaXMuaW5pdFdhdGNoUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodGhpcy53YXRjaFN0YXR1cyA9PT0gV2F0Y2hTdGF0dXMuUEFVU0VEKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3JlYWx0aW1lXSBpbml0V2F0Y2ggY2FuY2VsbGVkIG9uIHBhdXNlJylcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB7IGVudklkIH0gPSBhd2FpdCB0aGlzLndzTG9naW4odGhpcy5lbnZJZCwgZm9yY2VSZWZyZXNoTG9naW4pXG4gICAgICAgICAgaWYgKCh0aGlzLndhdGNoU3RhdHVzIGFzIFdhdGNoU3RhdHVzKSA9PT0gV2F0Y2hTdGF0dXMuUEFVU0VEKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3JlYWx0aW1lXSBpbml0V2F0Y2ggY2FuY2VsbGVkIG9uIHBhdXNlJylcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLndhdGNoU3RhdHVzID0gV2F0Y2hTdGF0dXMuSU5JVElOR1xuXG4gICAgICAgICAgY29uc3QgaW5pdFdhdGNoTXNnOiBJUmVxdWVzdE1lc3NhZ2VJbml0V2F0Y2hNc2cgPSB7XG4gICAgICAgICAgICB3YXRjaElkOiB0aGlzLndhdGNoSWQsXG4gICAgICAgICAgICByZXF1ZXN0SWQ6IGdlblJlcXVlc3RJZCgpLFxuICAgICAgICAgICAgbXNnVHlwZTogJ0lOSVRfV0FUQ0gnLFxuICAgICAgICAgICAgbXNnRGF0YToge1xuICAgICAgICAgICAgICBlbnZJZCxcbiAgICAgICAgICAgICAgY29sbE5hbWU6IHRoaXMuY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgICAgIHF1ZXJ5OiB0aGlzLnF1ZXJ5LFxuICAgICAgICAgICAgICBsaW1pdDogdGhpcy5saW1pdCxcbiAgICAgICAgICAgICAgb3JkZXJCeTogdGhpcy5vcmRlckJ5LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbml0RXZlbnRNc2cgPSBhd2FpdCB0aGlzLnNlbmQ8SVJlc3BvbnNlTWVzc2FnZUluaXRFdmVudE1zZz4oe1xuICAgICAgICAgICAgbXNnOiBpbml0V2F0Y2hNc2csXG4gICAgICAgICAgICB3YWl0UmVzcG9uc2U6IHRydWUsXG4gICAgICAgICAgICBza2lwT25NZXNzYWdlOiB0cnVlLFxuICAgICAgICAgICAgdGltZW91dDogREVGQVVMVF9JTklUX1dBVENIX1RJTUVPVVQsXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGNvbnN0IHsgZXZlbnRzLCBjdXJyRXZlbnQgfSA9IGluaXRFdmVudE1zZy5tc2dEYXRhXG5cbiAgICAgICAgICB0aGlzLnNlc3Npb25JbmZvID0ge1xuICAgICAgICAgICAgcXVlcnlJRDogaW5pdEV2ZW50TXNnLm1zZ0RhdGEucXVlcnlJRCxcbiAgICAgICAgICAgIGN1cnJlbnRFdmVudElkOiBjdXJyRXZlbnQgLSAxLFxuICAgICAgICAgICAgY3VycmVudERvY3M6IFtdLFxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZJWDogaW4gaW5pdEV2ZW50IG1lc3NhZ2UsIGFsbCBldmVudHMgaGF2ZSBpZCAwLCB3aGljaCBpcyBpbmNvbnNpc3RlbnQgd2l0aCBjdXJyRXZlbnRcbiAgICAgICAgICBpZiAoZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZSBvZiBldmVudHMpIHtcbiAgICAgICAgICAgICAgZS5JRCA9IGN1cnJFdmVudFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oYW5kbGVTZXJ2ZXJFdmVudHMoaW5pdEV2ZW50TXNnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb25JbmZvLmN1cnJlbnRFdmVudElkID0gY3VyckV2ZW50XG4gICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IG5ldyBTbmFwc2hvdCh7XG4gICAgICAgICAgICAgIGlkOiBjdXJyRXZlbnQsXG4gICAgICAgICAgICAgIGRvY0NoYW5nZXM6IFtdLFxuICAgICAgICAgICAgICBkb2NzOiBbXSxcbiAgICAgICAgICAgICAgdHlwZTogJ2luaXQnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXIub25DaGFuZ2Uoc25hcHNob3QpXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlU2VuZEFDSygpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMub25XYXRjaFN0YXJ0KHRoaXMsIHRoaXMuc2Vzc2lvbkluZm8ucXVlcnlJRClcbiAgICAgICAgICB0aGlzLndhdGNoU3RhdHVzID0gV2F0Y2hTdGF0dXMuQUNUSVZFXG4gICAgICAgICAgdGhpcy5hdmFpbGFibGVSZXRyaWVzLklOSVRfV0FUQ0ggPSBERUZBVUxUX01BWF9BVVRPX1JFVFJZX09OX0VSUk9SXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZVdhdGNoRXN0YWJsaXNobWVudEVycm9yKGUsIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6ICdJTklUX1dBVENIJyxcbiAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICByZWplY3QsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSkoKVxuICAgIH0pXG5cbiAgICBsZXQgc3VjY2VzcyA9IGZhbHNlXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5pbml0V2F0Y2hQcm9taXNlXG4gICAgICBzdWNjZXNzID0gdHJ1ZVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmluaXRXYXRjaFByb21pc2UgPSB1bmRlZmluZWRcbiAgICB9XG4gICAgY29uc29sZS5sb2coYFtyZWFsdGltZV0gaW5pdFdhdGNoICR7c3VjY2VzcyA/ICdzdWNjZXNzJyA6ICdmYWlsJ31gKVxuICB9XG5cbiAgcHJpdmF0ZSByZWJ1aWxkV2F0Y2ggPSBhc3luYyAoZm9yY2VSZWZyZXNoTG9naW4/OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgaWYgKHRoaXMucmVidWlsZFdhdGNoUHJvbWlzZSAhPT0gbnVsbCAmJiB0aGlzLnJlYnVpbGRXYXRjaFByb21pc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVidWlsZFdhdGNoUHJvbWlzZVxuICAgIH1cblxuICAgIHRoaXMucmVidWlsZFdhdGNoUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodGhpcy53YXRjaFN0YXR1cyA9PT0gV2F0Y2hTdGF0dXMuUEFVU0VEKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3JlYWx0aW1lXSByZWJ1aWxkV2F0Y2ggY2FuY2VsbGVkIG9uIHBhdXNlJylcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgeyBlbnZJZCB9ID0gYXdhaXQgdGhpcy53c0xvZ2luKHRoaXMuZW52SWQsIGZvcmNlUmVmcmVzaExvZ2luKVxuXG4gICAgICAgICAgaWYgKCF0aGlzLnNlc3Npb25JbmZvKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbiBub3QgcmVidWlsZFdhdGNoIHdpdGhvdXQgYSBzdWNjZXNzZnVsIGluaXRXYXRjaCAobGFjayBvZiBzZXNzaW9uSW5mbyknKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICgodGhpcy53YXRjaFN0YXR1cyBhcyBXYXRjaFN0YXR1cykgPT09IFdhdGNoU3RhdHVzLlBBVVNFRCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tyZWFsdGltZV0gcmVidWlsZFdhdGNoIGNhbmNlbGxlZCBvbiBwYXVzZScpXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy53YXRjaFN0YXR1cyA9IFdhdGNoU3RhdHVzLlJFQlVJTERJTkdcblxuICAgICAgICAgIGNvbnN0IHJlYnVpbGRXYXRjaE1zZzogSVJlcXVlc3RNZXNzYWdlUmVidWlsZFdhdGNoTXNnID0ge1xuICAgICAgICAgICAgd2F0Y2hJZDogdGhpcy53YXRjaElkLFxuICAgICAgICAgICAgcmVxdWVzdElkOiBnZW5SZXF1ZXN0SWQoKSxcbiAgICAgICAgICAgIG1zZ1R5cGU6ICdSRUJVSUxEX1dBVENIJyxcbiAgICAgICAgICAgIG1zZ0RhdGE6IHtcbiAgICAgICAgICAgICAgZW52SWQsXG4gICAgICAgICAgICAgIGNvbGxOYW1lOiB0aGlzLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgICAgICBxdWVyeUlEOiB0aGlzLnNlc3Npb25JbmZvLnF1ZXJ5SUQsXG4gICAgICAgICAgICAgIGV2ZW50SUQ6IHRoaXMuc2Vzc2lvbkluZm8uY3VycmVudEV2ZW50SWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG5leHRFdmVudE1zZyA9IGF3YWl0IHRoaXMuc2VuZDxJUmVzcG9uc2VNZXNzYWdlTmV4dEV2ZW50TXNnPih7XG4gICAgICAgICAgICBtc2c6IHJlYnVpbGRXYXRjaE1zZyxcbiAgICAgICAgICAgIHdhaXRSZXNwb25zZTogdHJ1ZSxcbiAgICAgICAgICAgIHNraXBPbk1lc3NhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgdGltZW91dDogREVGQVVMVF9SRUJVSUxEX1dBVENIX1RJTUVPVVQsXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHRoaXMuaGFuZGxlU2VydmVyRXZlbnRzKG5leHRFdmVudE1zZylcblxuICAgICAgICAgIHRoaXMud2F0Y2hTdGF0dXMgPSBXYXRjaFN0YXR1cy5BQ1RJVkVcbiAgICAgICAgICB0aGlzLmF2YWlsYWJsZVJldHJpZXMuUkVCVUlMRF9XQVRDSCA9IERFRkFVTFRfTUFYX0FVVE9fUkVUUllfT05fRVJST1JcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHRoaXMuaGFuZGxlV2F0Y2hFc3RhYmxpc2htZW50RXJyb3IoZSwge1xuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogJ1JFQlVJTERfV0FUQ0gnLFxuICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgIHJlamVjdCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KSgpXG4gICAgfSlcblxuICAgIGxldCBzdWNjZXNzID0gZmFsc2VcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnJlYnVpbGRXYXRjaFByb21pc2VcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMucmVidWlsZFdhdGNoUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbcmVhbHRpbWVdIHJlYnVpbGRXYXRjaCAke3N1Y2Nlc3MgPyAnc3VjY2VzcycgOiAnZmFpbCd9YClcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlV2F0Y2hFc3RhYmxpc2htZW50RXJyb3IgPSBhc3luYyAoXG4gICAgZTogYW55LFxuICAgIG9wdGlvbnM6IElIYW5kbGVXYXRjaEVzdGFibGlzaG1lbnRFcnJvck9wdGlvbnNcbiAgKSA9PiB7XG4gICAgY29uc3QgaXNJbml0V2F0Y2ggPSBvcHRpb25zLm9wZXJhdGlvbk5hbWUgPT09ICdJTklUX1dBVENIJ1xuXG4gICAgY29uc3QgYWJvcnRXYXRjaCA9ICgpID0+IHtcbiAgICAgIC8vIG1vY2sgdGVtcCBjb21tZW50XG4gICAgICB0aGlzLmNsb3NlV2l0aEVycm9yKG5ldyBDbG91ZFNES0Vycm9yKHtcbiAgICAgICAgZXJyQ29kZTogaXNJbml0V2F0Y2hcbiAgICAgICAgICA/IChFUlJfQ09ERS5TREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfSU5JVF9XQVRDSF9GQUlMIGFzIHN0cmluZylcbiAgICAgICAgICA6IChFUlJfQ09ERS5TREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfUkVCVUlMRF9XQVRDSF9GQUlMIGFzIHN0cmluZyksXG4gICAgICAgIGVyck1zZzogZSxcbiAgICAgIH0pKVxuICAgICAgb3B0aW9ucy5yZWplY3QoZSlcbiAgICB9XG5cbiAgICBjb25zdCByZXRyeSA9IChyZWZyZXNoTG9naW4/OiBib29sZWFuKSA9PiB7XG4gICAgICBpZiAodGhpcy51c2VSZXRyeVRpY2tldChvcHRpb25zLm9wZXJhdGlvbk5hbWUpKSB7XG4gICAgICAgIGlmIChpc0luaXRXYXRjaCkge1xuICAgICAgICAgIHRoaXMuaW5pdFdhdGNoUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgICAgIG9wdGlvbnMucmVzb2x2ZSh0aGlzLmluaXRXYXRjaChyZWZyZXNoTG9naW4pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVidWlsZFdhdGNoUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgICAgIG9wdGlvbnMucmVzb2x2ZSh0aGlzLnJlYnVpbGRXYXRjaChyZWZyZXNoTG9naW4pKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhYm9ydFdhdGNoKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmhhbmRsZUNvbW1vbkVycm9yKGUsIHtcbiAgICAgIG9uU2lnbkVycm9yOiAoKSA9PiByZXRyeSh0cnVlKSxcbiAgICAgIG9uVGltZW91dEVycm9yOiAoKSA9PiByZXRyeShmYWxzZSksXG4gICAgICBvbk5vdFJldHJ5YWJsZUVycm9yOiBhYm9ydFdhdGNoLFxuICAgICAgb25DYW5jZWxsZWRFcnJvcjogb3B0aW9ucy5yZWplY3QsXG4gICAgICBvblVua25vd25FcnJvcjogKCkgPT4ge1xuICAgICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvbldTRGlzY29ubmVjdGVkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnBhdXNlKClcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5vbmNlV1NDb25uZWN0ZWQoKVxuICAgICAgICAgICAgICByZXRyeSh0cnVlKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNXU0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgIGF3YWl0IG9uV1NEaXNjb25uZWN0ZWQoKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoREVGQVVMVF9XQUlUX1RJTUVfT05fVU5LTk9XTl9FUlJPUilcbiAgICAgICAgICAgICAgaWYgKHRoaXMud2F0Y2hTdGF0dXMgPT09IFdhdGNoU3RhdHVzLlBBVVNFRCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbmNlbFxuICAgICAgICAgICAgICAgIG9wdGlvbnMucmVqZWN0KG5ldyBDYW5jZWxsZWRFcnJvcihgJHtvcHRpb25zLm9wZXJhdGlvbk5hbWV9IGNhbmNlbGxlZCBkdWUgdG8gcGF1c2UgYWZ0ZXIgdW5rbm93bkVycm9yYCkpXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNXU0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgb25XU0Rpc2Nvbm5lY3RlZCgpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0cnkoZmFsc2UpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyB1bmV4cGVjdGVkIGVycm9yIHdoaWxlIGhhbmRsaW5nIGVycm9yLCBpbiBvcmRlciB0byBwcm92aWRlIG1heGltdW0gZWZmb3J0IG9uIFNFQU1JTkdMRVNTIEZBVUxUIFRPTEVSQU5DRSwganVzdCByZXRyeVxuICAgICAgICAgICAgcmV0cnkodHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pKClcbiAgICAgIH0sXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2VXYXRjaCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBxdWVyeUlkID0gdGhpcy5zZXNzaW9uSW5mbyA/IHRoaXMuc2Vzc2lvbkluZm8ucXVlcnlJRCA6ICcnXG5cbiAgICBpZiAodGhpcy53YXRjaFN0YXR1cyAhPT0gV2F0Y2hTdGF0dXMuQUNUSVZFKSB7XG4gICAgICB0aGlzLndhdGNoU3RhdHVzID0gV2F0Y2hTdGF0dXMuQ0xPU0VEXG4gICAgICB0aGlzLm9uV2F0Y2hDbG9zZSh0aGlzLCBxdWVyeUlkKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMud2F0Y2hTdGF0dXMgPSBXYXRjaFN0YXR1cy5DTE9TSU5HXG5cbiAgICAgIGNvbnN0IGNsb3NlV2F0Y2hNc2c6IElSZXF1ZXN0TWVzc2FnZUNsb3NlV2F0Y2hNc2cgPSB7XG4gICAgICAgIHdhdGNoSWQ6IHRoaXMud2F0Y2hJZCxcbiAgICAgICAgcmVxdWVzdElkOiBnZW5SZXF1ZXN0SWQoKSxcbiAgICAgICAgbXNnVHlwZTogJ0NMT1NFX1dBVENIJyxcbiAgICAgICAgbXNnRGF0YTogbnVsbCxcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zZW5kKHtcbiAgICAgICAgbXNnOiBjbG9zZVdhdGNoTXNnLFxuICAgICAgfSlcblxuICAgICAgdGhpcy5zZXNzaW9uSW5mbyA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy53YXRjaFN0YXR1cyA9IFdhdGNoU3RhdHVzLkNMT1NFRFxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuY2xvc2VXaXRoRXJyb3IobmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICBlcnJDb2RlOiBFUlJfQ09ERS5TREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfQ0xPU0VfV0FUQ0hfRkFJTCBhcyBzdHJpbmcsXG4gICAgICAgIGVyck1zZzogZSxcbiAgICAgIH0pKVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLm9uV2F0Y2hDbG9zZSh0aGlzLCBxdWVyeUlkKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVTZW5kQUNLID0gKCkgPT4ge1xuICAgIHRoaXMuY2xlYXJBQ0tTY2hlZHVsZSgpXG5cbiAgICAvLyBUT0RPOiBzaG91bGQgd2UgY2hlY2sgc3RhdHVzIGFmdGVyIHRpbWVvdXRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5hY2tUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLndhaXRFeHBlY3RlZFRpbWVvdXRJZCkge1xuICAgICAgICB0aGlzLnNjaGVkdWxlU2VuZEFDSygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlbmRBQ0soKVxuICAgICAgfVxuICAgIH0sIERFRkFVTFRfU0VORF9BQ0tfREVCT1VOQ0VfVElNRU9VVClcbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJBQ0tTY2hlZHVsZSA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5hY2tUaW1lb3V0SWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmFja1RpbWVvdXRJZClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNlbmRBQ0sgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLndhdGNoU3RhdHVzICE9PSBXYXRjaFN0YXR1cy5BQ1RJVkUpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVNlbmRBQ0soKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnNlc3Npb25JbmZvKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3JlYWx0aW1lIGxpc3RlbmVyXSBjYW4gbm90IHNlbmQgYWNrIHdpdGhvdXQgYSBzdWNjZXNzZnVsIGluaXRXYXRjaCAobGFjayBvZiBzZXNzaW9uSW5mbyknKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWNrTXNnOiBJUmVxdWVzdE1lc3NhZ2VDaGVja0xhc3RNc2cgPSB7XG4gICAgICAgIHdhdGNoSWQ6IHRoaXMud2F0Y2hJZCxcbiAgICAgICAgcmVxdWVzdElkOiBnZW5SZXF1ZXN0SWQoKSxcbiAgICAgICAgbXNnVHlwZTogJ0NIRUNLX0xBU1QnLFxuICAgICAgICBtc2dEYXRhOiB7XG4gICAgICAgICAgcXVlcnlJRDogdGhpcy5zZXNzaW9uSW5mby5xdWVyeUlELFxuICAgICAgICAgIGV2ZW50SUQ6IHRoaXMuc2Vzc2lvbkluZm8uY3VycmVudEV2ZW50SWQsXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuc2VuZCh7XG4gICAgICAgIG1zZzogYWNrTXNnLFxuICAgICAgfSlcblxuICAgICAgdGhpcy5zY2hlZHVsZVNlbmRBQ0soKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRPRE86IHJlZmFjdG9yXG4gICAgICBpZiAoaXNSZWFsdGltZUVycm9yTWVzc2FnZUVycm9yKGUpKSB7XG4gICAgICAgIGNvbnN0IG1zZyA9IGUucGF5bG9hZFxuICAgICAgICBzd2l0Y2ggKG1zZy5tc2dEYXRhLmNvZGUpIHtcbiAgICAgICAgICAvLyBzaWduYXR1cmUgZXJyb3IgLT4gcmV0cnkgd2l0aCByZWZyZXNoZWQgc2lnbmF0dXJlXG4gICAgICAgICAgY2FzZSAnQ0hFQ0tfTE9HSU5fRkFJTEVEJzpcbiAgICAgICAgICBjYXNlICdTSUdOX0VYUElSRURfRVJST1InOlxuICAgICAgICAgIGNhc2UgJ1NJR05fSU5WQUxJRF9FUlJPUic6XG4gICAgICAgICAgY2FzZSAnU0lHTl9QQVJBTV9JTlZBTElEJzoge1xuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkV2F0Y2goKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIG90aGVyIC0+IHRocm93XG4gICAgICAgICAgY2FzZSAnUVVFUllJRF9JTlZBTElEX0VSUk9SJzpcbiAgICAgICAgICBjYXNlICdTWVNfRVJSJzpcbiAgICAgICAgICBjYXNlICdJTlZBTElJRF9FTlYnOlxuICAgICAgICAgIGNhc2UgJ0NPTExFQ1RJT05fUEVSTUlTU0lPTl9ERU5JRUQnOiB7XG4gICAgICAgICAgICAvLyBtdXN0IHRocm93XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2l0aEVycm9yKG5ldyBDbG91ZFNES0Vycm9yKHtcbiAgICAgICAgICAgICAgZXJyQ29kZTogRVJSX0NPREUuU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX0NIRUNLX0xBU1RfRkFJTCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgIGVyck1zZzogbXNnLm1zZ0RhdGEuY29kZSxcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1heWJlIHJldHJ5YWJsZVxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmF2YWlsYWJsZVJldHJpZXMuQ0hFQ0tfTEFTVFxuICAgICAgICAmJiB0aGlzLmF2YWlsYWJsZVJldHJpZXMuQ0hFQ0tfTEFTVCA+IDBcbiAgICAgICkge1xuICAgICAgICB0aGlzLmF2YWlsYWJsZVJldHJpZXMuQ0hFQ0tfTEFTVCAtPSAxXG4gICAgICAgIHRoaXMuc2NoZWR1bGVTZW5kQUNLKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaXRoRXJyb3IobmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICAgIGVyckNvZGU6IEVSUl9DT0RFLlNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9DSEVDS19MQVNUX0ZBSUwgYXMgc3RyaW5nLFxuICAgICAgICAgIGVyck1zZzogZSxcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVDb21tb25FcnJvciA9IChcbiAgICBlOiBhbnksXG4gICAgb3B0aW9uczogSUhhbmRsZUNvbW1vbkVycm9yT3B0aW9uc1xuICApOiB2b2lkID0+IHtcbiAgICBpZiAoaXNSZWFsdGltZUVycm9yTWVzc2FnZUVycm9yKGUpKSB7XG4gICAgICBjb25zdCBtc2cgPSBlLnBheWxvYWRcbiAgICAgIHN3aXRjaCAobXNnLm1zZ0RhdGEuY29kZSkge1xuICAgICAgICAvLyBzaWduYXR1cmUgZXJyb3IgLT4gcmV0cnkgd2l0aCByZWZyZXNoZWQgc2lnbmF0dXJlXG4gICAgICAgIGNhc2UgJ0NIRUNLX0xPR0lOX0ZBSUxFRCc6XG4gICAgICAgIGNhc2UgJ1NJR05fRVhQSVJFRF9FUlJPUic6XG4gICAgICAgIGNhc2UgJ1NJR05fSU5WQUxJRF9FUlJPUic6XG4gICAgICAgIGNhc2UgJ1NJR05fUEFSQU1fSU5WQUxJRCc6IHtcbiAgICAgICAgICBvcHRpb25zLm9uU2lnbkVycm9yKGUpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgLy8gbm90LXJldHJ5YWJsZSBlcnJvciAtPiB0aHJvd1xuICAgICAgICBjYXNlICdRVUVSWUlEX0lOVkFMSURfRVJST1InOlxuICAgICAgICBjYXNlICdTWVNfRVJSJzpcbiAgICAgICAgY2FzZSAnSU5WQUxJSURfRU5WJzpcbiAgICAgICAgY2FzZSAnQ09MTEVDVElPTl9QRVJNSVNTSU9OX0RFTklFRCc6IHtcbiAgICAgICAgICBvcHRpb25zLm9uTm90UmV0cnlhYmxlRXJyb3IoZSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgb3B0aW9ucy5vbk5vdFJldHJ5YWJsZUVycm9yKGUpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVGltZW91dEVycm9yKGUpKSB7XG4gICAgICAvLyB0aW1lb3V0IGVycm9yXG4gICAgICBvcHRpb25zLm9uVGltZW91dEVycm9yKGUpXG4gICAgICByZXR1cm5cbiAgICB9IGVsc2UgaWYgKGlzQ2FuY2VsbGVkRXJyb3IoZSkpIHtcbiAgICAgIC8vIGNhbmNlbGxlZCBlcnJvclxuICAgICAgb3B0aW9ucy5vbkNhbmNlbGxlZEVycm9yKGUpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyB1bmtub3duIGVycm9yXG4gICAgb3B0aW9ucy5vblVua25vd25FcnJvcihlKVxuICB9XG5cbiAgLy8gY3JlZGl0IGEgcmV0cnkgY2hhbmNlIGZyb20gYXZhaWxhYmxlUmV0cmllc1xuICBwcml2YXRlIHVzZVJldHJ5VGlja2V0KG9wZXJhdGlvbk5hbWU6IElSZXF1ZXN0TXNnVHlwZSk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYXZhaWxhYmxlUmV0cmllc1tvcGVyYXRpb25OYW1lXVxuICAgICAgJiYgdGhpcy5hdmFpbGFibGVSZXRyaWVzW29wZXJhdGlvbk5hbWVdISA+IDBcbiAgICApIHtcbiAgICAgIHRoaXMuYXZhaWxhYmxlUmV0cmllc1tvcGVyYXRpb25OYW1lXSEgLT0gMVxuICAgICAgY29uc29sZS5sb2coYFtyZWFsdGltZV0gJHtvcGVyYXRpb25OYW1lfSB1c2UgYSByZXRyeSB0aWNrZXQsIG5vdyBvbmx5ICR7dGhpcy5hdmFpbGFibGVSZXRyaWVzW29wZXJhdGlvbk5hbWVdfSByZXRyeSBsZWZ0YClcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZVNlcnZlckV2ZW50cyhtc2c6IElSZXNwb25zZU1lc3NhZ2VJbml0RXZlbnRNc2cgfCBJUmVzcG9uc2VNZXNzYWdlTmV4dEV2ZW50TXNnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2NoZWR1bGVTZW5kQUNLKClcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU2VydmVyRXZlbnRzSW50ZXJuZWwobXNnKVxuICAgICAgdGhpcy5wb3N0SGFuZGxlU2VydmVyRXZlbnRzVmFsaWRpdHlDaGVjayhtc2cpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gVE9ETzogcmVwb3J0XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnW3JlYWx0aW1lIGxpc3RlbmVyXSBpbnRlcm5hbCBub24tZmF0YWwgZXJyb3I6IGhhbmRsZSBzZXJ2ZXIgZXZlbnRzIGZhaWxlZCB3aXRoIGVycm9yOiAnLFxuICAgICAgICBlXG4gICAgICApXG4gICAgICB0aHJvdyBlXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZXJ2ZXJFdmVudHNJbnRlcm5lbChtc2c6IElSZXNwb25zZU1lc3NhZ2VJbml0RXZlbnRNc2cgfCBJUmVzcG9uc2VNZXNzYWdlTmV4dEV2ZW50TXNnKSB7XG4gICAgY29uc3QgeyByZXF1ZXN0SWQgfSA9IG1zZ1xuXG4gICAgY29uc3QgeyBldmVudHMgfSA9IG1zZy5tc2dEYXRhXG4gICAgY29uc3QgeyBtc2dUeXBlIH0gPSBtc2dcblxuICAgIGlmICghZXZlbnRzLmxlbmd0aCB8fCAhdGhpcy5zZXNzaW9uSW5mbykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgeyBzZXNzaW9uSW5mbyB9ID0gdGhpc1xuXG4gICAgbGV0IGFsbENoYW5nZUV2ZW50czogSVNpbmdsZURCRXZlbnRbXVxuICAgIHRyeSB7XG4gICAgICBhbGxDaGFuZ2VFdmVudHMgPSBldmVudHMubWFwKGdldFB1YmxpY0V2ZW50KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuY2xvc2VXaXRoRXJyb3IobmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICBlcnJDb2RlOiBFUlJfQ09ERS5TREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfUkVDRUlWRV9JTlZBTElEX1NFUlZFUl9EQVRBIGFzIHN0cmluZyxcbiAgICAgICAgZXJyTXNnOiBlLFxuICAgICAgfSkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBhZ2dyZWdhdGUgZG9jc1xuICAgIGxldCBkb2NzID0gWy4uLnNlc3Npb25JbmZvLmN1cnJlbnREb2NzXVxuICAgIGxldCBpbml0RW5jb3VudGVyZWQgPSBmYWxzZVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBhbGxDaGFuZ2VFdmVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoYW5nZSA9IGFsbENoYW5nZUV2ZW50c1tpXVxuXG4gICAgICBpZiAoc2Vzc2lvbkluZm8uY3VycmVudEV2ZW50SWQgPj0gY2hhbmdlLmlkKSB7XG4gICAgICAgIGlmICghYWxsQ2hhbmdlRXZlbnRzW2kgLSAxXSB8fCBjaGFuZ2UuaWQgPiBhbGxDaGFuZ2VFdmVudHNbaSAtIDFdLmlkKSB7XG4gICAgICAgICAgLy8gZHVwbGljYXRlIGV2ZW50LCBkcm9wYWJsZVxuICAgICAgICAgIC8vIFRPRE86IHJlcG9ydFxuICAgICAgICAgIC8vIGlmIChwcm9jZXNzLmVudi5ERUJVRykge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgW3JlYWx0aW1lXSBkdXBsaWNhdGUgZXZlbnQgcmVjZWl2ZWQsIGN1ciAke3Nlc3Npb25JbmZvLmN1cnJlbnRFdmVudElkfSBidXQgZ290ICR7Y2hhbmdlLmlkfWApXG4gICAgICAgICAgLy8gfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGFsbENoYW5nZUV2ZW50cyBzaG91bGQgYmUgaW4gYXNjZW5kaW5nIG9yZGVyIGFjY29yZGluZyB0byBldmVudElkLCB0aGlzIHNob3VsZCBuZXZlciBoYXBwZW5zLCBtdXN0IHJlcG9ydCBhIG5vbi1mYXRhbCBlcnJvclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtyZWFsdGltZSBsaXN0ZW5lcl0gc2VydmVyIG5vbi1mYXRhbCBlcnJvcjogZXZlbnRzIG91dCBvZiBvcmRlciAodGhlIGxhdHRlciBldmVudCdzIGlkIGlzIHNtYWxsZXIgdGhhbiB0aGF0IG9mIHRoZSBmb3JtZXIpIChyZXF1ZXN0SWQgJHtyZXF1ZXN0SWR9KWApXG4gICAgICAgIH1cbiAgICAgICAgY29udGludWVcbiAgICAgIH0gZWxzZSBpZiAoc2Vzc2lvbkluZm8uY3VycmVudEV2ZW50SWQgPT09IGNoYW5nZS5pZCAtIDEpIHtcbiAgICAgICAgLy8gY29ycmVjdCBzZXF1ZW5jZVxuICAgICAgICAvLyBmaXJzdCBoYW5kbGUgZGF0YVR5cGUgdGhlbiBxdWV1ZVR5cGU6XG4gICAgICAgIC8vIDEuIGRhdGFUeXBlOiB3ZSBPTkxZIHBvcHVsYXRlIGNoYW5nZS5kb2MgaWYgbmVjY2Vzc2FyeVxuICAgICAgICAvLyAyLiBxdWV1ZVR5cGU6IHdlIGJ1aWxkIHRoZSBkYXRhIHNuYXBzaG90XG5cbiAgICAgICAgc3dpdGNoIChjaGFuZ2UuZGF0YVR5cGUpIHtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOiB7XG4gICAgICAgICAgICAvLyBvbmx5IG5lZWQgdG8gcG9wdWxhdGUgY2hhbmdlLmRvYyB3aGVuIGl0IGlzIG5vdCBwcm92aWRlZFxuICAgICAgICAgICAgaWYgKCFjaGFuZ2UuZG9jKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoY2hhbmdlLnF1ZXVlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVxdWV1ZSc6IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsRG9jID0gZG9jcy5maW5kKGRvYyA9PiBkb2MuX2lkID09PSBjaGFuZ2UuZG9jSWQpXG4gICAgICAgICAgICAgICAgICBpZiAobG9jYWxEb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYSBwYXJ0aWFsIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBjbG9uZURlZXAobG9jYWxEb2MpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZS51cGRhdGVkRmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY2hhbmdlLnVwZGF0ZWRGaWVsZHMpLmZvckVhY2goKGZpZWxkUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0KGRvYywgZmllbGRQYXRoLCBjaGFuZ2UudXBkYXRlZEZpZWxkc1tmaWVsZFBhdGhdKVxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlLnJlbW92ZWRGaWVsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpZWxkUGF0aCBvZiBjaGFuZ2UucmVtb3ZlZEZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5zZXQoZG9jLCBmaWVsZFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlLmRvYyA9IGRvY1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyByZXBvcnRcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW3JlYWx0aW1lIGxpc3RlbmVyXSBpbnRlcm5hbCBub24tZmF0YWwgc2VydmVyIGVycm9yOiB1bmV4cGVjdGVkIHVwZGF0ZSBkYXRhVHlwZSBldmVudCB3aGVyZSBubyBkb2MgaXMgYXNzb2NpYXRlZC4nKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnZW5xdWV1ZSc6IHtcbiAgICAgICAgICAgICAgICAgIC8vIGRvYyBpcyBwcm92aWRlZCBieSBzZXJ2ZXIsIHRoaXMgc2hvdWxkIG5ldmVyIG9jY3VyXG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgQ2xvdWRTREtFcnJvcih7XG4gICAgICAgICAgICAgICAgICAgIGVyckNvZGU6IEVSUl9DT0RFLlNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9VTkVYUEVDVEVEX0ZBVEFMX0VSUk9SIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgZXJyTXNnOiBgSGFuZGxlU2VydmVyRXZlbnRzOiBmdWxsIGRvYyBpcyBub3QgcHJvdmlkZWQgd2l0aCBkYXRhVHlwZT1cInVwZGF0ZVwiIGFuZCBxdWV1ZVR5cGU9XCJlbnF1ZXVlXCIgKHJlcXVlc3RJZCAke21zZy5yZXF1ZXN0SWR9KWAsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVdpdGhFcnJvcihlcnIpXG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgJ3JlcGxhY2UnOiB7XG4gICAgICAgICAgICAvLyB2YWxpZGF0aW9uXG4gICAgICAgICAgICBpZiAoIWNoYW5nZS5kb2MpIHtcbiAgICAgICAgICAgICAgLy8gZG9jIGlzIHByb3ZpZGVkIGJ5IHNlcnZlciwgdGhpcyBzaG91bGQgbmV2ZXIgb2NjdXJcbiAgICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICAgICAgICAgIGVyckNvZGU6IEVSUl9DT0RFLlNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9VTkVYUEVDVEVEX0ZBVEFMX0VSUk9SIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBlcnJNc2c6IGBIYW5kbGVTZXJ2ZXJFdmVudHM6IGZ1bGwgZG9jIGlzIG5vdCBwcm92aWRlZCB3aXRoIGRhdGFUeXBlPVwicmVwbGFjZVwiIChyZXF1ZXN0SWQgJHttc2cucmVxdWVzdElkfSlgLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB0aGlzLmNsb3NlV2l0aEVycm9yKGVycilcbiAgICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlICdyZW1vdmUnOiB7XG4gICAgICAgICAgICBjb25zdCBkb2MgPSBkb2NzLmZpbmQoZG9jID0+IGRvYy5faWQgPT09IGNoYW5nZS5kb2NJZClcbiAgICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgICAgY2hhbmdlLmRvYyA9IGRvY1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVE9ETyByZXBvcnRcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW3JlYWx0aW1lIGxpc3RlbmVyXSBpbnRlcm5hbCBub24tZmF0YWwgc2VydmVyIGVycm9yOiB1bmV4cGVjdGVkIHJlbW92ZSBldmVudCB3aGVyZSBubyBkb2MgaXMgYXNzb2NpYXRlZC4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAnbGltaXQnOiB7XG4gICAgICAgICAgICBpZiAoIWNoYW5nZS5kb2MpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChjaGFuZ2UucXVldWVUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVxdWV1ZSc6IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRvYyA9IGRvY3MuZmluZChkb2MgPT4gZG9jLl9pZCA9PT0gY2hhbmdlLmRvY0lkKVxuICAgICAgICAgICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2UuZG9jID0gZG9jXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbcmVhbHRpbWUgbGlzdGVuZXJdIGludGVybmFsIG5vbi1mYXRhbCBzZXJ2ZXIgZXJyb3I6IHVuZXhwZWN0ZWQgbGltaXQgZGF0YVR5cGUgZXZlbnQgd2hlcmUgbm8gZG9jIGlzIGFzc29jaWF0ZWQuJylcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2VucXVldWUnOiB7XG4gICAgICAgICAgICAgICAgICAvLyBkb2MgaXMgcHJvdmlkZWQgYnkgc2VydmVyLCB0aGlzIHNob3VsZCBuZXZlciBvY2N1clxuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IENsb3VkU0RLRXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICBlcnJDb2RlOiBFUlJfQ09ERS5TREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfVU5FWFBFQ1RFRF9GQVRBTF9FUlJPUiBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGVyck1zZzogYEhhbmRsZVNlcnZlckV2ZW50czogZnVsbCBkb2MgaXMgbm90IHByb3ZpZGVkIHdpdGggZGF0YVR5cGU9XCJsaW1pdFwiIGFuZCBxdWV1ZVR5cGU9XCJlbnF1ZXVlXCIgKHJlcXVlc3RJZCAke21zZy5yZXF1ZXN0SWR9KWAsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVdpdGhFcnJvcihlcnIpXG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChjaGFuZ2UucXVldWVUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnaW5pdCc6IHtcbiAgICAgICAgICAgIGlmICghaW5pdEVuY291bnRlcmVkKSB7XG4gICAgICAgICAgICAgIGluaXRFbmNvdW50ZXJlZCA9IHRydWVcbiAgICAgICAgICAgICAgZG9jcyA9IFtjaGFuZ2UuZG9jXVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZG9jcy5wdXNoKGNoYW5nZS5kb2MpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlICdlbnF1ZXVlJzoge1xuICAgICAgICAgICAgZG9jcy5wdXNoKGNoYW5nZS5kb2MpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlICdkZXF1ZXVlJzoge1xuICAgICAgICAgICAgY29uc3QgaW5kID0gZG9jcy5maW5kSW5kZXgoZG9jID0+IGRvYy5faWQgPT09IGNoYW5nZS5kb2NJZClcbiAgICAgICAgICAgIGlmIChpbmQgPiAtMSkge1xuICAgICAgICAgICAgICBkb2NzLnNwbGljZShpbmQsIDEpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUT0RPIHJlcG9ydFxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbcmVhbHRpbWUgbGlzdGVuZXJdIGludGVybmFsIG5vbi1mYXRhbCBzZXJ2ZXIgZXJyb3I6IHVuZXhwZWN0ZWQgZGVxdWV1ZSBldmVudCB3aGVyZSBubyBkb2MgaXMgYXNzb2NpYXRlZC4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzoge1xuICAgICAgICAgICAgY29uc3QgaW5kID0gZG9jcy5maW5kSW5kZXgoZG9jID0+IGRvYy5faWQgPT09IGNoYW5nZS5kb2NJZClcbiAgICAgICAgICAgIGlmIChpbmQgPiAtMSkge1xuICAgICAgICAgICAgICBkb2NzW2luZF0gPSBjaGFuZ2UuZG9jXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUT0RPIHJlcG9ydFxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbcmVhbHRpbWUgbGlzdGVuZXJdIGludGVybmFsIG5vbi1mYXRhbCBzZXJ2ZXIgZXJyb3I6IHVuZXhwZWN0ZWQgcXVldWVUeXBlIHVwZGF0ZSBldmVudCB3aGVyZSBubyBkb2MgaXMgYXNzb2NpYXRlZC4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgaSA9PT0gbGVuIC0gMVxuICAgICAgICAgIHx8IChhbGxDaGFuZ2VFdmVudHNbaSArIDFdICYmIGFsbENoYW5nZUV2ZW50c1tpICsgMV0uaWQgIT09IGNoYW5nZS5pZClcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gYSBzaGFsbG93IHNsaWNlIGNyZWF0ZXMgYSBzaGFsbG93IHNuYXBzaG90XG4gICAgICAgICAgY29uc3QgZG9jc1NuYXBzaG90ID0gWy4uLmRvY3NdXG5cbiAgICAgICAgICAvLyB3ZSBzbGljZSBmaXJzdCBjYXVzZScgaWYgdGhlcmUncmUgYWxsQ2hhbmdlRXZlbnRzIHRoYXQgYXJlIG9mIHRoZSBzYW1lIGlkIGFmdGVyIHRoaXMgY2hhbmdlLCB3ZSBkb24ndCB3YW50IHRvIGludm9sdmUgaXQgZm9yIGl0IGlzIHVuZXhwZWN0ZWQgaW52YWxpZCBvcmRlclxuICAgICAgICAgIGNvbnN0IGRvY0NoYW5nZXMgPSBhbGxDaGFuZ2VFdmVudHNcbiAgICAgICAgICAgIC5zbGljZSgwLCBpICsgMSlcbiAgICAgICAgICAgIC5maWx0ZXIoYyA9PiBjLmlkID09PSBjaGFuZ2UuaWQpXG5cbiAgICAgICAgICAvLyBhbGwgY2hhbmdlcyBvZiB0aGlzIGV2ZW50IGhhcyBiZWVuIGhhbmRsZSwgd2UgY291bGQgZGlzcGF0Y2ggdGhlIGV2ZW50IG5vd1xuICAgICAgICAgIHRoaXMuc2Vzc2lvbkluZm8uY3VycmVudEV2ZW50SWQgPSBjaGFuZ2UuaWRcbiAgICAgICAgICB0aGlzLnNlc3Npb25JbmZvLmN1cnJlbnREb2NzID0gZG9jc1xuXG4gICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBuZXcgU25hcHNob3Qoe1xuICAgICAgICAgICAgaWQ6IGNoYW5nZS5pZCxcbiAgICAgICAgICAgIGRvY0NoYW5nZXMsXG4gICAgICAgICAgICBkb2NzOiBkb2NzU25hcHNob3QsXG4gICAgICAgICAgICBtc2dUeXBlLFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICB0aGlzLmxpc3RlbmVyLm9uQ2hhbmdlKHNuYXBzaG90KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvdXQtb2Ytb3JkZXIgZXZlbnRcbiAgICAgICAgLy8gaWYgKHByb2Nlc3MuZW52LkRFQlVHKSB7XG4gICAgICAgIC8vIFRPRE86IHJlcG9ydFxuICAgICAgICBjb25zb2xlLndhcm4oYFtyZWFsdGltZSBsaXN0ZW5lcl0gZXZlbnQgcmVjZWl2ZWQgaXMgb3V0IG9mIG9yZGVyLCBjdXIgJHt0aGlzLnNlc3Npb25JbmZvLmN1cnJlbnRFdmVudElkfSBidXQgZ290ICR7Y2hhbmdlLmlkfWApXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gcmVidWlsZCB3YXRjaFxuICAgICAgICBhd2FpdCB0aGlzLnJlYnVpbGRXYXRjaCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcG9zdEhhbmRsZVNlcnZlckV2ZW50c1ZhbGlkaXR5Q2hlY2sobXNnOiBJUmVzcG9uc2VNZXNzYWdlSW5pdEV2ZW50TXNnIHwgSVJlc3BvbnNlTWVzc2FnZU5leHRFdmVudE1zZykge1xuICAgIGlmICghdGhpcy5zZXNzaW9uSW5mbykge1xuICAgICAgY29uc29sZS5lcnJvcignW3JlYWx0aW1lIGxpc3RlbmVyXSBpbnRlcm5hbCBub24tZmF0YWwgZXJyb3I6IHNlc3Npb25JbmZvIGxvc3QgYWZ0ZXIgc2VydmVyIGV2ZW50IGhhbmRsaW5nLCB0aGlzIHNob3VsZCBuZXZlciBvY2N1cicpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLnNlc3Npb25JbmZvLmV4cGVjdEV2ZW50SWRcbiAgICAgICYmIHRoaXMuc2Vzc2lvbkluZm8uY3VycmVudEV2ZW50SWQgPj0gdGhpcy5zZXNzaW9uSW5mby5leHBlY3RFdmVudElkXG4gICAgKSB7XG4gICAgICB0aGlzLmNsZWFyV2FpdEV4cGVjdGVkRXZlbnQoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNlc3Npb25JbmZvLmN1cnJlbnRFdmVudElkIDwgbXNnLm1zZ0RhdGEuY3VyckV2ZW50KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tyZWFsdGltZSBsaXN0ZW5lcl0gaW50ZXJuYWwgbm9uLWZhdGFsIGVycm9yOiBjbGllbnQgZXZlbnRJZCBkb2VzIG5vdCBtYXRjaCB3aXRoIHNlcnZlciBldmVudCBpZCBhZnRlciBzZXJ2ZXIgZXZlbnQgaGFuZGxpbmcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhcldhaXRFeHBlY3RlZEV2ZW50KCkge1xuICAgIGlmICh0aGlzLndhaXRFeHBlY3RlZFRpbWVvdXRJZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMud2FpdEV4cGVjdGVkVGltZW91dElkKVxuICAgICAgdGhpcy53YWl0RXhwZWN0ZWRUaW1lb3V0SWQgPSB1bmRlZmluZWRcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHVibGljRXZlbnQoZXZlbnQ6IElEQkV2ZW50KTogSVNpbmdsZURCRXZlbnQge1xuICBjb25zdCBlOiBJU2luZ2xlREJFdmVudCA9IHtcbiAgICBpZDogZXZlbnQuSUQsXG4gICAgZGF0YVR5cGU6IGV2ZW50LkRhdGFUeXBlLFxuICAgIHF1ZXVlVHlwZTogZXZlbnQuUXVldWVUeXBlLFxuICAgIGRvY0lkOiBldmVudC5Eb2NJRCxcbiAgICBkb2M6IGV2ZW50LkRvYyAmJiBldmVudC5Eb2MgIT09ICd7fScgPyBKU09OLnBhcnNlKGV2ZW50LkRvYykgOiB1bmRlZmluZWQsXG4gIH1cblxuICBpZiAoZXZlbnQuRGF0YVR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmIChldmVudC5VcGRhdGVkRmllbGRzKSB7XG4gICAgICBlLnVwZGF0ZWRGaWVsZHMgPSBKU09OLnBhcnNlKGV2ZW50LlVwZGF0ZWRGaWVsZHMpXG4gICAgfVxuICAgIC8vIFRPRE86IHdhaXQgZm9yIHRjYiB0byBjaGFuZ2UgcmVtb3ZlZEZpZWxkcyB0byBSZW1vdmVkRmllbGRzXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmIChldmVudC5yZW1vdmVkRmllbGRzIHx8IGV2ZW50LlJlbW92ZWRGaWVsZHMpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIC8vIGUucmVtb3ZlZEZpZWxkcyA9IGV2ZW50LnJlbW92ZWRGaWVsZHNcbiAgICAgIC8vICAgPyBKU09OLnBhcnNlKGV2ZW50LnJlbW92ZWRGaWVsZHMpXG4gICAgICAvLyAgIDogSlNPTi5wYXJzZShldmVudC5SZW1vdmVkRmllbGRzKVxuICAgICAgZS5yZW1vdmVkRmllbGRzID0gSlNPTi5wYXJzZShldmVudC5yZW1vdmVkRmllbGRzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlXG59XG4iXX0=
}, function(modId) { var map = {"./message":1776008460246,"./listener":1776008460247,"./snapshot":1776008460248,"./error":1776008460249,"./utils":1776008460250}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460246, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isInitEventMessage = exports.genRequestId = void 0;
function genRequestId(prefix) {
    if (prefix === void 0) { prefix = ''; }
    return "".concat(prefix ? "".concat(prefix, "_") : '').concat(+new Date(), "_").concat(Math.random());
}
exports.genRequestId = genRequestId;
function isInitEventMessage(msg) {
    return msg.msgType === 'INIT_EVENT';
}
exports.isInitEventMessage = isInitEventMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUtBLFNBQWdCLFlBQVksQ0FBQyxNQUFXO0lBQVgsdUJBQUEsRUFBQSxXQUFXO0lBQ3RDLE9BQU8sVUFBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQUcsTUFBTSxNQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLGNBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFFLENBQUE7QUFDdkUsQ0FBQztBQUZELG9DQUVDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsR0FBcUI7SUFDdEQsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFlBQVksQ0FBQTtBQUNyQyxDQUFDO0FBRkQsZ0RBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBJUmVzcG9uc2VNZXNzYWdlLFxuICBJUmVzcG9uc2VNZXNzYWdlSW5pdEV2ZW50TXNnLFxufSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL3JlYWx0aW1lJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuUmVxdWVzdElkKHByZWZpeCA9ICcnKSB7XG4gIHJldHVybiBgJHtwcmVmaXggPyBgJHtwcmVmaXh9X2AgOiAnJ30keytuZXcgRGF0ZSgpfV8ke01hdGgucmFuZG9tKCl9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbml0RXZlbnRNZXNzYWdlKG1zZzogSVJlc3BvbnNlTWVzc2FnZSk6IG1zZyBpcyBJUmVzcG9uc2VNZXNzYWdlSW5pdEV2ZW50TXNnIHtcbiAgcmV0dXJuIG1zZy5tc2dUeXBlID09PSAnSU5JVF9FVkVOVCdcbn1cbiJdfQ==
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460247, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeListener = void 0;
var RealtimeListener = (function () {
    function RealtimeListener(options) {
        this.close = options.close;
        this.onChange = options.onChange;
        this.onError = options.onError;
        if (options.debug) {
            Object.defineProperty(this, 'virtualClient', {
                get: function () { return options.virtualClient; },
            });
        }
    }
    return RealtimeListener;
}());
exports.RealtimeListener = RealtimeListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZ0JBO0lBS0UsMEJBQVksT0FBaUM7UUFDM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQTtRQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUE7UUFFOUIsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ2pCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtnQkFDM0MsR0FBRyxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsYUFBYSxFQUFyQixDQUFxQjthQUNqQyxDQUFDLENBQUE7U0FDSDtJQUNILENBQUM7SUFDSCx1QkFBQztBQUFELENBQUMsQUFoQkQsSUFnQkM7QUFoQlksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlydHVhbFdlYlNvY2tldENsaWVudCB9IGZyb20gJy4vdmlydHVhbC13ZWJzb2NrZXQtY2xpZW50J1xuaW1wb3J0IHtcbiAgSVJlYWx0aW1lTGlzdGVuZXJDb25zdHJ1Y3Rvck9wdGlvbnMsXG4gIERCUmVhbHRpbWVMaXN0ZW5lcixcbn0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9yZWFsdGltZSdcblxuLy8gPT09PT09PT09PT09PT09IFJlYWx0aW1lIExpc3RlbmVyIChQdWJsaWMpID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBJUmVhbHRpbWVMaXN0ZW5lck9wdGlvbnMgZXh0ZW5kcyBJUmVhbHRpbWVMaXN0ZW5lckNvbnN0cnVjdG9yT3B0aW9ucyB7XG4gIC8vIGluaXRcbiAgY2xvc2U6ICgpID0+IHZvaWRcbiAgLy8gZGVidWdcbiAgZGVidWc/OiBib29sZWFuXG4gIHZpcnR1YWxDbGllbnQ/OiBWaXJ0dWFsV2ViU29ja2V0Q2xpZW50XG59XG5cbmV4cG9ydCBjbGFzcyBSZWFsdGltZUxpc3RlbmVyIGltcGxlbWVudHMgREJSZWFsdGltZUxpc3RlbmVyIHtcbiAgY2xvc2U6ICgpID0+IHZvaWRcbiAgb25DaGFuZ2U6IChyZXM6IGFueSkgPT4gdm9pZFxuICBvbkVycm9yOiAoZXJyb3I6IGFueSkgPT4gdm9pZFxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IElSZWFsdGltZUxpc3RlbmVyT3B0aW9ucykge1xuICAgIHRoaXMuY2xvc2UgPSBvcHRpb25zLmNsb3NlXG4gICAgdGhpcy5vbkNoYW5nZSA9IG9wdGlvbnMub25DaGFuZ2VcbiAgICB0aGlzLm9uRXJyb3IgPSBvcHRpb25zLm9uRXJyb3JcblxuICAgIGlmIChvcHRpb25zLmRlYnVnKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZpcnR1YWxDbGllbnQnLCB7XG4gICAgICAgIGdldDogKCkgPT4gb3B0aW9ucy52aXJ0dWFsQ2xpZW50LFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbiJdfQ==
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460248, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Snapshot = void 0;
var Snapshot = (function () {
    function Snapshot(options) {
        var id = options.id, docChanges = options.docChanges, docs = options.docs, msgType = options.msgType, type = options.type;
        var cachedDocChanges;
        var cachedDocs;
        Object.defineProperties(this, {
            id: {
                get: function () { return id; },
                enumerable: true,
            },
            docChanges: {
                get: function () {
                    if (!cachedDocChanges) {
                        cachedDocChanges = JSON.parse(JSON.stringify(docChanges));
                    }
                    return cachedDocChanges;
                },
                enumerable: true,
            },
            docs: {
                get: function () {
                    if (!cachedDocs) {
                        cachedDocs = JSON.parse(JSON.stringify(docs));
                    }
                    return cachedDocs;
                },
                enumerable: true,
            },
            msgType: {
                get: function () { return msgType; },
                enumerable: true,
            },
            type: {
                get: function () { return type; },
                enumerable: true,
            },
        });
    }
    return Snapshot;
}());
exports.Snapshot = Snapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcHNob3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc25hcHNob3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBY0E7SUFPRSxrQkFBWSxPQUFvQztRQUN0QyxJQUFBLEVBQUUsR0FBc0MsT0FBTyxHQUE3QyxFQUFFLFVBQVUsR0FBMEIsT0FBTyxXQUFqQyxFQUFFLElBQUksR0FBb0IsT0FBTyxLQUEzQixFQUFFLE9BQU8sR0FBVyxPQUFPLFFBQWxCLEVBQUUsSUFBSSxHQUFLLE9BQU8sS0FBWixDQUFZO1FBRXZELElBQUksZ0JBQWtDLENBQUE7UUFDdEMsSUFBSSxVQUFpQyxDQUFBO1FBRXJDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7WUFDNUIsRUFBRSxFQUFFO2dCQUNGLEdBQUcsRUFBRSxjQUFNLE9BQUEsRUFBRSxFQUFGLENBQUU7Z0JBQ2IsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRCxVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFO29CQUNILElBQUksQ0FBQyxnQkFBZ0IsRUFBRTt3QkFDckIsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7cUJBQzFEO29CQUNELE9BQU8sZ0JBQWdCLENBQUE7Z0JBQ3pCLENBQUM7Z0JBQ0QsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osR0FBRyxFQUFFO29CQUNILElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO3FCQUM5QztvQkFDRCxPQUFPLFVBQVUsQ0FBQTtnQkFDbkIsQ0FBQztnQkFDRCxVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNELE9BQU8sRUFBRTtnQkFDUCxHQUFHLEVBQUUsY0FBTSxPQUFBLE9BQU8sRUFBUCxDQUFPO2dCQUNsQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNELElBQUksRUFBRTtnQkFDSixHQUFHLEVBQUUsY0FBTSxPQUFBLElBQUksRUFBSixDQUFJO2dCQUNmLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNILGVBQUM7QUFBRCxDQUFDLEFBOUNELElBOENDO0FBOUNZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU25hcHNob3RUeXBlLCBJU25hcHNob3QgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL3JlYWx0aW1lJ1xuaW1wb3J0IHsgSVNpbmdsZURCRXZlbnQgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2RhdGFiYXNlJ1xuXG4vLyA9PT09PT09PT09PT09PT0gUmVhbHRpbWUgU25hcHNob3QgLyBDaGFuZ2UgRXZlbnQgKFB1YmxpYykgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIElTbmFwc2hvdENvbnN0cnVjdG9yT3B0aW9ucyB7XG4gIGlkOiBudW1iZXJcbiAgZG9jQ2hhbmdlczogSVNpbmdsZURCRXZlbnRbXVxuICBkb2NzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+W11cbiAgdHlwZT86IFNuYXBzaG90VHlwZVxuICAvLyBFSlNPTjogYW55XG4gIG1zZ1R5cGU/OiBTdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIFNuYXBzaG90IGltcGxlbWVudHMgSVNuYXBzaG90IHtcbiAgaWQhOiBudW1iZXJcbiAgZG9jQ2hhbmdlcyE6IElTaW5nbGVEQkV2ZW50W11cbiAgZG9jcyE6IFJlY29yZDxzdHJpbmcsIGFueT5bXVxuICB0eXBlPzogJ2luaXQnXG4gIC8vIEVKU09OOiBhbnlcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBJU25hcHNob3RDb25zdHJ1Y3Rvck9wdGlvbnMpIHtcbiAgICBjb25zdCB7IGlkLCBkb2NDaGFuZ2VzLCBkb2NzLCBtc2dUeXBlLCB0eXBlIH0gPSBvcHRpb25zXG5cbiAgICBsZXQgY2FjaGVkRG9jQ2hhbmdlczogSVNpbmdsZURCRXZlbnRbXVxuICAgIGxldCBjYWNoZWREb2NzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+W11cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIGlkOiB7XG4gICAgICAgIGdldDogKCkgPT4gaWQsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAgZG9jQ2hhbmdlczoge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICBpZiAoIWNhY2hlZERvY0NoYW5nZXMpIHtcbiAgICAgICAgICAgIGNhY2hlZERvY0NoYW5nZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRvY0NoYW5nZXMpKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2FjaGVkRG9jQ2hhbmdlc1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGRvY3M6IHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFjYWNoZWREb2NzKSB7XG4gICAgICAgICAgICBjYWNoZWREb2NzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkb2NzKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNhY2hlZERvY3NcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBtc2dUeXBlOiB7XG4gICAgICAgIGdldDogKCkgPT4gbXNnVHlwZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0eXBlOiB7XG4gICAgICAgIGdldDogKCkgPT4gdHlwZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSlcbiAgfVxufVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460249, function(require, module, exports) {

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERR_CODE = exports.CloudSDKError = exports.isCancelledError = exports.CancelledError = exports.isTimeoutError = exports.TimeoutError = exports.isRealtimeErrorMessageError = exports.RealtimeErrorMessageError = void 0;
var RealtimeErrorMessageError = (function (_super) {
    __extends(RealtimeErrorMessageError, _super);
    function RealtimeErrorMessageError(serverErrorMsg) {
        var _this = _super.call(this, "Watch Error ".concat(JSON.stringify(serverErrorMsg.msgData), " (requestid: ").concat(serverErrorMsg.requestId, ")")) || this;
        _this.isRealtimeErrorMessageError = true;
        _this.payload = serverErrorMsg;
        return _this;
    }
    return RealtimeErrorMessageError;
}(Error));
exports.RealtimeErrorMessageError = RealtimeErrorMessageError;
var isRealtimeErrorMessageError = function (e) { return e === null || e === void 0 ? void 0 : e.isRealtimeErrorMessageError; };
exports.isRealtimeErrorMessageError = isRealtimeErrorMessageError;
var TimeoutError = (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'timeout';
        _this.payload = null;
        _this.generic = true;
        return _this;
    }
    return TimeoutError;
}(Error));
exports.TimeoutError = TimeoutError;
var isTimeoutError = function (e) { return e.type === 'timeout'; };
exports.isTimeoutError = isTimeoutError;
var CancelledError = (function (_super) {
    __extends(CancelledError, _super);
    function CancelledError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'cancelled';
        _this.payload = null;
        _this.generic = true;
        return _this;
    }
    return CancelledError;
}(Error));
exports.CancelledError = CancelledError;
var isCancelledError = function (e) { return e.type === 'cancelled'; };
exports.isCancelledError = isCancelledError;
var CloudSDKError = (function (_super) {
    __extends(CloudSDKError, _super);
    function CloudSDKError(options) {
        var _this = _super.call(this, options.errMsg) || this;
        _this.errCode = 'UNKNOWN_ERROR';
        Object.defineProperties(_this, {
            message: {
                get: function () {
                    return ("errCode: ".concat(this.errCode, " ").concat(exports.ERR_CODE[this.errCode]
                        || '', " | errMsg: ").concat(this.errMsg));
                },
                set: function (msg) {
                    this.errMsg = msg;
                },
            },
        });
        _this.errCode = options.errCode || 'UNKNOWN_ERROR';
        _this.errMsg = options.errMsg;
        return _this;
    }
    Object.defineProperty(CloudSDKError.prototype, "message", {
        get: function () {
            return "errCode: ".concat(this.errCode, " | errMsg: ").concat(this.errMsg);
        },
        set: function (msg) {
            this.errMsg = msg;
        },
        enumerable: false,
        configurable: true
    });
    return CloudSDKError;
}(Error));
exports.CloudSDKError = CloudSDKError;
exports.ERR_CODE = {
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    SDK_DATABASE_REALTIME_LISTENER_INIT_WATCH_FAIL: 'SDK_DATABASE_REALTIME_LISTENER_INIT_WATCH_FAIL',
    SDK_DATABASE_REALTIME_LISTENER_RECONNECT_WATCH_FAIL: 'SDK_DATABASE_REALTIME_LISTENER_RECONNECT_WATCH_FAIL',
    SDK_DATABASE_REALTIME_LISTENER_REBUILD_WATCH_FAIL: 'SDK_DATABASE_REALTIME_LISTENER_REBUILD_WATCH_FAIL',
    SDK_DATABASE_REALTIME_LISTENER_CLOSE_WATCH_FAIL: 'SDK_DATABASE_REALTIME_LISTENER_CLOSE_WATCH_FAIL',
    SDK_DATABASE_REALTIME_LISTENER_SERVER_ERROR_MSG: 'SDK_DATABASE_REALTIME_LISTENER_SERVER_ERROR_MSG',
    SDK_DATABASE_REALTIME_LISTENER_RECEIVE_INVALID_SERVER_DATA: 'SDK_DATABASE_REALTIME_LISTENER_RECEIVE_INVALID_SERVER_DATA',
    SDK_DATABASE_REALTIME_LISTENER_WEBSOCKET_CONNECTION_ERROR: 'SDK_DATABASE_REALTIME_LISTENER_WEBSOCKET_CONNECTION_ERROR',
    SDK_DATABASE_REALTIME_LISTENER_WEBSOCKET_CONNECTION_CLOSED: 'SDK_DATABASE_REALTIME_LISTENER_WEBSOCKET_CONNECTION_CLOSED',
    SDK_DATABASE_REALTIME_LISTENER_CHECK_LAST_FAIL: 'SDK_DATABASE_REALTIME_LISTENER_CHECK_LAST_FAIL',
    SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR: 'SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0E7SUFBK0MsNkNBQUs7SUFJbEQsbUNBQVksY0FBd0M7UUFBcEQsWUFDRSxrQkFBTSxzQkFBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsMEJBQ3pELGNBQWMsQ0FBQyxTQUFTLE1BQ3ZCLENBQUMsU0FFTDtRQVJELGlDQUEyQixHQUFHLElBQUksQ0FBQTtRQU9oQyxLQUFJLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQTs7SUFDL0IsQ0FBQztJQUNILGdDQUFDO0FBQUQsQ0FBQyxBQVZELENBQStDLEtBQUssR0FVbkQ7QUFWWSw4REFBeUI7QUFZL0IsSUFBTSwyQkFBMkIsR0FBRyxVQUFDLENBQU0sSUFBcUMsT0FBQSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsMkJBQTJCLEVBQTlCLENBQThCLENBQUE7QUFBeEcsUUFBQSwyQkFBMkIsK0JBQTZFO0FBRXJIO0lBQWtDLGdDQUFLO0lBQXZDO1FBQUEscUVBS0M7UUFIQyxVQUFJLEdBQUcsU0FBa0IsQ0FBQTtRQUN6QixhQUFPLEdBQUcsSUFBSSxDQUFBO1FBQ2QsYUFBTyxHQUFHLElBQUksQ0FBQTs7SUFDaEIsQ0FBQztJQUFELG1CQUFDO0FBQUQsQ0FBQyxBQUxELENBQWtDLEtBQUssR0FLdEM7QUFMWSxvQ0FBWTtBQU9sQixJQUFNLGNBQWMsR0FBRyxVQUFDLENBQU0sSUFBd0IsT0FBQSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBcEIsQ0FBb0IsQ0FBQTtBQUFwRSxRQUFBLGNBQWMsa0JBQXNEO0FBRWpGO0lBQW9DLGtDQUFLO0lBQXpDO1FBQUEscUVBS0M7UUFIQyxVQUFJLEdBQUcsV0FBb0IsQ0FBQTtRQUMzQixhQUFPLEdBQUcsSUFBSSxDQUFBO1FBQ2QsYUFBTyxHQUFHLElBQUksQ0FBQTs7SUFDaEIsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUxELENBQW9DLEtBQUssR0FLeEM7QUFMWSx3Q0FBYztBQU9wQixJQUFNLGdCQUFnQixHQUFHLFVBQUMsQ0FBTSxJQUEwQixPQUFBLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUF0QixDQUFzQixDQUFBO0FBQTFFLFFBQUEsZ0JBQWdCLG9CQUEwRDtBQUV2RjtJQUFtQyxpQ0FBSztJQU10Qyx1QkFBWSxPQUFpQztRQUE3QyxZQUNFLGtCQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FrQnRCO1FBeEJNLGFBQU8sR0FBRyxlQUFlLENBQUE7UUFROUIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUksRUFBRTtZQUM1QixPQUFPLEVBQUU7Z0JBQ1AsR0FBRztvQkFDRCxPQUFPLENBQ0wsbUJBQVksSUFBSSxDQUFDLE9BQU8sY0FBSSxnQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7MkJBQzdDLEVBQUUsd0JBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUNuQyxDQUFBO2dCQUNILENBQUM7Z0JBQ0QsR0FBRyxZQUFDLEdBQVc7b0JBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUE7Z0JBQ25CLENBQUM7YUFDRjtTQUNGLENBQUMsQ0FBQTtRQUVGLEtBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxlQUFlLENBQUE7UUFDakQsS0FBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFBOztJQUM5QixDQUFDO0lBRUQsc0JBQUksa0NBQU87YUFBWDtZQUNFLE9BQU8sbUJBQVksSUFBSSxDQUFDLE9BQU8sd0JBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFBO1FBQzVELENBQUM7YUFFRCxVQUFZLEdBQVc7WUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUE7UUFDbkIsQ0FBQzs7O09BSkE7SUFLSCxvQkFBQztBQUFELENBQUMsQUFsQ0QsQ0FBbUMsS0FBSyxHQWtDdkM7QUFsQ1ksc0NBQWE7QUF5Q2IsUUFBQSxRQUFRLEdBQXVDO0lBRTFELGFBQWEsRUFBRSxlQUFlO0lBQzlCLDhDQUE4QyxFQUM1QyxnREFBZ0Q7SUFFbEQsbURBQW1ELEVBQ2pELHFEQUFxRDtJQUV2RCxpREFBaUQsRUFDL0MsbURBQW1EO0lBRXJELCtDQUErQyxFQUM3QyxpREFBaUQ7SUFFbkQsK0NBQStDLEVBQzdDLGlEQUFpRDtJQUVuRCwwREFBMEQsRUFDeEQsNERBQTREO0lBRTlELHlEQUF5RCxFQUN2RCwyREFBMkQ7SUFFN0QsMERBQTBELEVBQ3hELDREQUE0RDtJQUU5RCw4Q0FBOEMsRUFDNUMsZ0RBQWdEO0lBRWxELHFEQUFxRCxFQUNuRCx1REFBdUQ7Q0FFMUQsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElHZW5lcmljRXJyb3IgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzJ1xuaW1wb3J0IHsgSVJlc3BvbnNlTWVzc2FnZUVycm9yTXNnIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9yZWFsdGltZSdcblxuZXhwb3J0IGNsYXNzIFJlYWx0aW1lRXJyb3JNZXNzYWdlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGlzUmVhbHRpbWVFcnJvck1lc3NhZ2VFcnJvciA9IHRydWVcbiAgcGF5bG9hZDogSVJlc3BvbnNlTWVzc2FnZUVycm9yTXNnXG5cbiAgY29uc3RydWN0b3Ioc2VydmVyRXJyb3JNc2c6IElSZXNwb25zZU1lc3NhZ2VFcnJvck1zZykge1xuICAgIHN1cGVyKGBXYXRjaCBFcnJvciAke0pTT04uc3RyaW5naWZ5KHNlcnZlckVycm9yTXNnLm1zZ0RhdGEpfSAocmVxdWVzdGlkOiAke1xuICAgICAgc2VydmVyRXJyb3JNc2cucmVxdWVzdElkXG4gICAgfSlgKVxuICAgIHRoaXMucGF5bG9hZCA9IHNlcnZlckVycm9yTXNnXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzUmVhbHRpbWVFcnJvck1lc3NhZ2VFcnJvciA9IChlOiBhbnkpOiBlIGlzIFJlYWx0aW1lRXJyb3JNZXNzYWdlRXJyb3IgPT4gZT8uaXNSZWFsdGltZUVycm9yTWVzc2FnZUVycm9yXG5cbmV4cG9ydCBjbGFzcyBUaW1lb3V0RXJyb3IgZXh0ZW5kcyBFcnJvclxuICBpbXBsZW1lbnRzIElHZW5lcmljRXJyb3I8J3RpbWVvdXQnLCBudWxsPiB7XG4gIHR5cGUgPSAndGltZW91dCcgYXMgY29uc3RcbiAgcGF5bG9hZCA9IG51bGxcbiAgZ2VuZXJpYyA9IHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IGlzVGltZW91dEVycm9yID0gKGU6IGFueSk6IGUgaXMgVGltZW91dEVycm9yID0+IGUudHlwZSA9PT0gJ3RpbWVvdXQnXG5cbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRFcnJvciBleHRlbmRzIEVycm9yXG4gIGltcGxlbWVudHMgSUdlbmVyaWNFcnJvcjwnY2FuY2VsbGVkJywgbnVsbD4ge1xuICB0eXBlID0gJ2NhbmNlbGxlZCcgYXMgY29uc3RcbiAgcGF5bG9hZCA9IG51bGxcbiAgZ2VuZXJpYyA9IHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IGlzQ2FuY2VsbGVkRXJyb3IgPSAoZTogYW55KTogZSBpcyBDYW5jZWxsZWRFcnJvciA9PiBlLnR5cGUgPT09ICdjYW5jZWxsZWQnXG5cbmV4cG9ydCBjbGFzcyBDbG91ZFNES0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgZXJyQ29kZSA9ICdVTktOT1dOX0VSUk9SJ1xuICBwdWJsaWMgZXJyTXNnOiBzdHJpbmdcblxuICBwdWJsaWMgcmVxdWVzdElEPzogc3RyaW5nXG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogSUVycm9yQ29uc3RydWN0b3JPcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucy5lcnJNc2cpXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBtZXNzYWdlOiB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgYGVyckNvZGU6ICR7dGhpcy5lcnJDb2RlfSAke0VSUl9DT0RFW3RoaXMuZXJyQ29kZV1cbiAgICAgICAgICAgICAgfHwgJyd9IHwgZXJyTXNnOiAke3RoaXMuZXJyTXNnfWBcbiAgICAgICAgICApXG4gICAgICAgIH0sXG4gICAgICAgIHNldChtc2c6IHN0cmluZykge1xuICAgICAgICAgIHRoaXMuZXJyTXNnID0gbXNnXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICB0aGlzLmVyckNvZGUgPSBvcHRpb25zLmVyckNvZGUgfHwgJ1VOS05PV05fRVJST1InXG4gICAgdGhpcy5lcnJNc2cgPSBvcHRpb25zLmVyck1zZ1xuICB9XG5cbiAgZ2V0IG1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIGBlcnJDb2RlOiAke3RoaXMuZXJyQ29kZX0gfCBlcnJNc2c6ICR7dGhpcy5lcnJNc2d9YFxuICB9XG5cbiAgc2V0IG1lc3NhZ2UobXNnOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVyck1zZyA9IG1zZ1xuICB9XG59XG5cbmludGVyZmFjZSBJRXJyb3JDb25zdHJ1Y3Rvck9wdGlvbnMge1xuICBlcnJDb2RlPzogc3RyaW5nXG4gIGVyck1zZzogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBFUlJfQ09ERTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfSA9IHtcbiAgLy8gXCItMVwiOiBcIlwiLFxuICBVTktOT1dOX0VSUk9SOiAnVU5LTk9XTl9FUlJPUicsXG4gIFNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9JTklUX1dBVENIX0ZBSUw6XG4gICAgJ1NES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9JTklUX1dBVENIX0ZBSUwnLFxuICAvLyBcInJlYWx0aW1lIGxpc3RlbmVyIGluaXQgd2F0Y2ggZmFpbFwiLFxuICBTREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfUkVDT05ORUNUX1dBVENIX0ZBSUw6XG4gICAgJ1NES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9SRUNPTk5FQ1RfV0FUQ0hfRkFJTCcsXG4gIC8vIFwicmVhbHRpbWUgbGlzdGVuZXIgcmVjb25uZWN0IHdhdGNoIGZhaWxcIixcbiAgU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX1JFQlVJTERfV0FUQ0hfRkFJTDpcbiAgICAnU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX1JFQlVJTERfV0FUQ0hfRkFJTCcsXG4gIC8vIFwicmVhbHRpbWUgbGlzdGVuZXIgcmVidWlsZCB3YXRjaCBmYWlsXCIsXG4gIFNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9DTE9TRV9XQVRDSF9GQUlMOlxuICAgICdTREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfQ0xPU0VfV0FUQ0hfRkFJTCcsXG4gIC8vIFwicmVhbHRpbWUgbGlzdGVuZXIgcmVidWlsZCB3YXRjaCBmYWlsXCIsXG4gIFNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9TRVJWRVJfRVJST1JfTVNHOlxuICAgICdTREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfU0VSVkVSX0VSUk9SX01TRycsXG4gIC8vIFwicmVhbHRpbWUgbGlzdGVuZXIgcmVjZWl2ZSBzZXJ2ZXIgZXJyb3IgbXNnXCIsXG4gIFNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9SRUNFSVZFX0lOVkFMSURfU0VSVkVSX0RBVEE6XG4gICAgJ1NES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9SRUNFSVZFX0lOVkFMSURfU0VSVkVSX0RBVEEnLFxuICAvLyBcInJlYWx0aW1lIGxpc3RlbmVyIHJlY2VpdmUgaW52YWxpZCBzZXJ2ZXIgZGF0YVwiLFxuICBTREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfV0VCU09DS0VUX0NPTk5FQ1RJT05fRVJST1I6XG4gICAgJ1NES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9XRUJTT0NLRVRfQ09OTkVDVElPTl9FUlJPUicsXG4gIC8vIFwicmVhbHRpbWUgbGlzdGVuZXIgd2Vic29ja2V0IGNvbm5lY3Rpb24gZXJyb3JcIixcbiAgU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX1dFQlNPQ0tFVF9DT05ORUNUSU9OX0NMT1NFRDpcbiAgICAnU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX1dFQlNPQ0tFVF9DT05ORUNUSU9OX0NMT1NFRCcsXG4gIC8vIFwicmVhbHRpbWUgbGlzdGVuZXIgd2Vic29ja2V0IGNvbm5lY3Rpb24gY2xvc2VkXCIsXG4gIFNES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9DSEVDS19MQVNUX0ZBSUw6XG4gICAgJ1NES19EQVRBQkFTRV9SRUFMVElNRV9MSVNURU5FUl9DSEVDS19MQVNUX0ZBSUwnLFxuICAvLyBcInJlYWx0aW1lIGxpc3RlbmVyIGNoZWNrIGxhc3QgZmFpbFwiLFxuICBTREtfREFUQUJBU0VfUkVBTFRJTUVfTElTVEVORVJfVU5FWFBFQ1RFRF9GQVRBTF9FUlJPUjpcbiAgICAnU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX1VORVhQRUNURURfRkFUQUxfRVJST1InLFxuICAvLyBcInJlYWx0aW1lIGxpc3RlbmVyIHVuZXhwZWN0ZWQgZmF0YWwgZXJyb3JcIlxufVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460250, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
var sleep = function (ms) {
    if (ms === void 0) { ms = 0; }
    return new Promise(function (r) { return setTimeout(r, ms); });
};
exports.sleep = sleep;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sSUFBTSxLQUFLLEdBQUcsVUFBQyxFQUFNO0lBQU4sbUJBQUEsRUFBQSxNQUFNO0lBQUssT0FBQSxJQUFJLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLFVBQVUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQWpCLENBQWlCLENBQUM7QUFBbkMsQ0FBbUMsQ0FBQTtBQUF2RCxRQUFBLEtBQUssU0FBa0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3Qgc2xlZXAgPSAobXMgPSAwKSA9PiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgbXMpKVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460251, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getWSCloseError = exports.CloseEventCode = exports.CLOSE_EVENT_CODE_INFO = void 0;
var error_1 = require("./error");
exports.CLOSE_EVENT_CODE_INFO = {
    1000: {
        code: 1000,
        name: 'Normal Closure',
        description: 'Normal closure; the connection successfully completed whatever purpose for which it was created.',
    },
    1001: {
        code: 1001,
        name: 'Going Away',
        description: 'The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection.',
    },
    1002: {
        code: 1002,
        name: 'Protocol Error',
        description: 'The endpoint is terminating the connection due to a protocol error.',
    },
    1003: {
        code: 1003,
        name: 'Unsupported Data',
        description: 'The connection is being terminated because the endpoint received data of a type it cannot accept (for example, a text-only endpoint received binary data).',
    },
    1005: {
        code: 1005,
        name: 'No Status Received',
        description: 'Indicates that no status code was provided even though one was expected.',
    },
    1006: {
        code: 1006,
        name: 'Abnormal Closure',
        description: 'Used to indicate that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected.',
    },
    1007: {
        code: 1007,
        name: 'Invalid frame payload data',
        description: 'The endpoint is terminating the connection because a message was received that contained inconsistent data (e.g., non-UTF-8 data within a text message).',
    },
    1008: {
        code: 1008,
        name: 'Policy Violation',
        description: 'The endpoint is terminating the connection because it received a message that violates its policy. This is a generic status code, used when codes 1003 and 1009 are not suitable.',
    },
    1009: {
        code: 1009,
        name: 'Message too big',
        description: 'The endpoint is terminating the connection because a data frame was received that is too large.',
    },
    1010: {
        code: 1010,
        name: 'Missing Extension',
        description: 'The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn\'t.',
    },
    1011: {
        code: 1011,
        name: 'Internal Error',
        description: 'The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.',
    },
    1012: {
        code: 1012,
        name: 'Service Restart',
        description: 'The server is terminating the connection because it is restarting.',
    },
    1013: {
        code: 1013,
        name: 'Try Again Later',
        description: 'The server is terminating the connection due to a temporary condition, e.g. it is overloaded and is casting off some of its clients.',
    },
    1014: {
        code: 1014,
        name: 'Bad Gateway',
        description: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server. This is similar to 502 HTTP Status Code.',
    },
    1015: {
        code: 1015,
        name: 'TLS Handshake',
        description: 'Indicates that the connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can\'t be verified).',
    },
    3000: {
        code: 3000,
        name: 'Reconnect WebSocket',
        description: 'The client is terminating the connection because it wants to reconnect',
    },
    3001: {
        code: 3001,
        name: 'No Realtime Listeners',
        description: 'The client is terminating the connection because no more realtime listeners exist',
    },
    3002: {
        code: 3002,
        name: 'Heartbeat Ping Error',
        description: 'The client is terminating the connection due to its failure in sending heartbeat messages',
    },
    3003: {
        code: 3003,
        name: 'Heartbeat Pong Timeout Error',
        description: 'The client is terminating the connection because no heartbeat response is received from the server',
    },
    3050: {
        code: 3050,
        name: 'Server Close',
        description: 'The client is terminating the connection because no heartbeat response is received from the server',
    },
};
var CloseEventCode;
(function (CloseEventCode) {
    CloseEventCode[CloseEventCode["NormalClosure"] = 1000] = "NormalClosure";
    CloseEventCode[CloseEventCode["GoingAway"] = 1001] = "GoingAway";
    CloseEventCode[CloseEventCode["ProtocolError"] = 1002] = "ProtocolError";
    CloseEventCode[CloseEventCode["UnsupportedData"] = 1003] = "UnsupportedData";
    CloseEventCode[CloseEventCode["NoStatusReceived"] = 1005] = "NoStatusReceived";
    CloseEventCode[CloseEventCode["AbnormalClosure"] = 1006] = "AbnormalClosure";
    CloseEventCode[CloseEventCode["InvalidFramePayloadData"] = 1007] = "InvalidFramePayloadData";
    CloseEventCode[CloseEventCode["PolicyViolation"] = 1008] = "PolicyViolation";
    CloseEventCode[CloseEventCode["MessageTooBig"] = 1009] = "MessageTooBig";
    CloseEventCode[CloseEventCode["MissingExtension"] = 1010] = "MissingExtension";
    CloseEventCode[CloseEventCode["InternalError"] = 1011] = "InternalError";
    CloseEventCode[CloseEventCode["ServiceRestart"] = 1012] = "ServiceRestart";
    CloseEventCode[CloseEventCode["TryAgainLater"] = 1013] = "TryAgainLater";
    CloseEventCode[CloseEventCode["BadGateway"] = 1014] = "BadGateway";
    CloseEventCode[CloseEventCode["TLSHandshake"] = 1015] = "TLSHandshake";
    CloseEventCode[CloseEventCode["ReconnectWebSocket"] = 3000] = "ReconnectWebSocket";
    CloseEventCode[CloseEventCode["NoRealtimeListeners"] = 3001] = "NoRealtimeListeners";
    CloseEventCode[CloseEventCode["HeartbeatPingError"] = 3002] = "HeartbeatPingError";
    CloseEventCode[CloseEventCode["HeartbeatPongTimeoutError"] = 3003] = "HeartbeatPongTimeoutError";
    CloseEventCode[CloseEventCode["NoAuthentication"] = 3050] = "NoAuthentication";
})(CloseEventCode = exports.CloseEventCode || (exports.CloseEventCode = {}));
var getWSCloseError = function (code, reason) {
    var info = exports.CLOSE_EVENT_CODE_INFO[code];
    var errMsg = !info
        ? "code ".concat(code)
        : "".concat(info.name, ", code ").concat(code, ", reason ").concat(reason || info.description);
    return new error_1.CloudSDKError({
        errCode: error_1.ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_WEBSOCKET_CONNECTION_CLOSED,
        errMsg: errMsg,
    });
};
exports.getWSCloseError = getWSCloseError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MtZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvd3MtZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlEO0FBRXBDLFFBQUEscUJBQXFCLEdBQUc7SUFDbkMsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLFdBQVcsRUFDVCxrR0FBa0c7S0FDckc7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxZQUFZO1FBQ2xCLFdBQVcsRUFDVCxvSkFBb0o7S0FDdko7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsV0FBVyxFQUNULHFFQUFxRTtLQUN4RTtJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixXQUFXLEVBQ1QsNEpBQTRKO0tBQy9KO0lBQ0QsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsb0JBQW9CO1FBQzFCLFdBQVcsRUFDVCwwRUFBMEU7S0FDN0U7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxrQkFBa0I7UUFDeEIsV0FBVyxFQUNULG9JQUFvSTtLQUN2STtJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLDRCQUE0QjtRQUNsQyxXQUFXLEVBQ1QsMEpBQTBKO0tBQzdKO0lBQ0QsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsa0JBQWtCO1FBQ3hCLFdBQVcsRUFDVCxtTEFBbUw7S0FDdEw7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsV0FB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ImltcG9ydCB7IEVSUl9DT0RFLCBDbG91ZFNES0Vycm9yIH0gZnJvbSAnLi9lcnJvcidcblxuZXhwb3J0IGNvbnN0IENMT1NFX0VWRU5UX0NPREVfSU5GTyA9IHtcbiAgMTAwMDoge1xuICAgIGNvZGU6IDEwMDAsXG4gICAgbmFtZTogJ05vcm1hbCBDbG9zdXJlJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdOb3JtYWwgY2xvc3VyZTsgdGhlIGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCB3aGF0ZXZlciBwdXJwb3NlIGZvciB3aGljaCBpdCB3YXMgY3JlYXRlZC4nLFxuICB9LFxuICAxMDAxOiB7XG4gICAgY29kZTogMTAwMSxcbiAgICBuYW1lOiAnR29pbmcgQXdheScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIGVuZHBvaW50IGlzIGdvaW5nIGF3YXksIGVpdGhlciBiZWNhdXNlIG9mIGEgc2VydmVyIGZhaWx1cmUgb3IgYmVjYXVzZSB0aGUgYnJvd3NlciBpcyBuYXZpZ2F0aW5nIGF3YXkgZnJvbSB0aGUgcGFnZSB0aGF0IG9wZW5lZCB0aGUgY29ubmVjdGlvbi4nLFxuICB9LFxuICAxMDAyOiB7XG4gICAgY29kZTogMTAwMixcbiAgICBuYW1lOiAnUHJvdG9jb2wgRXJyb3InLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSBlbmRwb2ludCBpcyB0ZXJtaW5hdGluZyB0aGUgY29ubmVjdGlvbiBkdWUgdG8gYSBwcm90b2NvbCBlcnJvci4nLFxuICB9LFxuICAxMDAzOiB7XG4gICAgY29kZTogMTAwMyxcbiAgICBuYW1lOiAnVW5zdXBwb3J0ZWQgRGF0YScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIGNvbm5lY3Rpb24gaXMgYmVpbmcgdGVybWluYXRlZCBiZWNhdXNlIHRoZSBlbmRwb2ludCByZWNlaXZlZCBkYXRhIG9mIGEgdHlwZSBpdCBjYW5ub3QgYWNjZXB0IChmb3IgZXhhbXBsZSwgYSB0ZXh0LW9ubHkgZW5kcG9pbnQgcmVjZWl2ZWQgYmluYXJ5IGRhdGEpLicsXG4gIH0sXG4gIDEwMDU6IHtcbiAgICBjb2RlOiAxMDA1LFxuICAgIG5hbWU6ICdObyBTdGF0dXMgUmVjZWl2ZWQnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0luZGljYXRlcyB0aGF0IG5vIHN0YXR1cyBjb2RlIHdhcyBwcm92aWRlZCBldmVuIHRob3VnaCBvbmUgd2FzIGV4cGVjdGVkLicsXG4gIH0sXG4gIDEwMDY6IHtcbiAgICBjb2RlOiAxMDA2LFxuICAgIG5hbWU6ICdBYm5vcm1hbCBDbG9zdXJlJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdVc2VkIHRvIGluZGljYXRlIHRoYXQgYSBjb25uZWN0aW9uIHdhcyBjbG9zZWQgYWJub3JtYWxseSAodGhhdCBpcywgd2l0aCBubyBjbG9zZSBmcmFtZSBiZWluZyBzZW50KSB3aGVuIGEgc3RhdHVzIGNvZGUgaXMgZXhwZWN0ZWQuJyxcbiAgfSxcbiAgMTAwNzoge1xuICAgIGNvZGU6IDEwMDcsXG4gICAgbmFtZTogJ0ludmFsaWQgZnJhbWUgcGF5bG9hZCBkYXRhJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgZW5kcG9pbnQgaXMgdGVybWluYXRpbmcgdGhlIGNvbm5lY3Rpb24gYmVjYXVzZSBhIG1lc3NhZ2Ugd2FzIHJlY2VpdmVkIHRoYXQgY29udGFpbmVkIGluY29uc2lzdGVudCBkYXRhIChlLmcuLCBub24tVVRGLTggZGF0YSB3aXRoaW4gYSB0ZXh0IG1lc3NhZ2UpLicsXG4gIH0sXG4gIDEwMDg6IHtcbiAgICBjb2RlOiAxMDA4LFxuICAgIG5hbWU6ICdQb2xpY3kgVmlvbGF0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgZW5kcG9pbnQgaXMgdGVybWluYXRpbmcgdGhlIGNvbm5lY3Rpb24gYmVjYXVzZSBpdCByZWNlaXZlZCBhIG1lc3NhZ2UgdGhhdCB2aW9sYXRlcyBpdHMgcG9saWN5LiBUaGlzIGlzIGEgZ2VuZXJpYyBzdGF0dXMgY29kZSwgdXNlZCB3aGVuIGNvZGVzIDEwMDMgYW5kIDEwMDkgYXJlIG5vdCBzdWl0YWJsZS4nLFxuICB9LFxuICAxMDA5OiB7XG4gICAgY29kZTogMTAwOSxcbiAgICBuYW1lOiAnTWVzc2FnZSB0b28gYmlnJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgZW5kcG9pbnQgaXMgdGVybWluYXRpbmcgdGhlIGNvbm5lY3Rpb24gYmVjYXVzZSBhIGRhdGEgZnJhbWUgd2FzIHJlY2VpdmVkIHRoYXQgaXMgdG9vIGxhcmdlLicsXG4gIH0sXG4gIDEwMTA6IHtcbiAgICBjb2RlOiAxMDEwLFxuICAgIG5hbWU6ICdNaXNzaW5nIEV4dGVuc2lvbicsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIGNsaWVudCBpcyB0ZXJtaW5hdGluZyB0aGUgY29ubmVjdGlvbiBiZWNhdXNlIGl0IGV4cGVjdGVkIHRoZSBzZXJ2ZXIgdG8gbmVnb3RpYXRlIG9uZSBvciBtb3JlIGV4dGVuc2lvbiwgYnV0IHRoZSBzZXJ2ZXIgZGlkblxcJ3QuJyxcbiAgfSxcbiAgMTAxMToge1xuICAgIGNvZGU6IDEwMTEsXG4gICAgbmFtZTogJ0ludGVybmFsIEVycm9yJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgc2VydmVyIGlzIHRlcm1pbmF0aW5nIHRoZSBjb25uZWN0aW9uIGJlY2F1c2UgaXQgZW5jb3VudGVyZWQgYW4gdW5leHBlY3RlZCBjb25kaXRpb24gdGhhdCBwcmV2ZW50ZWQgaXQgZnJvbSBmdWxmaWxsaW5nIHRoZSByZXF1ZXN0LicsXG4gIH0sXG4gIDEwMTI6IHtcbiAgICBjb2RlOiAxMDEyLFxuICAgIG5hbWU6ICdTZXJ2aWNlIFJlc3RhcnQnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSBzZXJ2ZXIgaXMgdGVybWluYXRpbmcgdGhlIGNvbm5lY3Rpb24gYmVjYXVzZSBpdCBpcyByZXN0YXJ0aW5nLicsXG4gIH0sXG4gIDEwMTM6IHtcbiAgICBjb2RlOiAxMDEzLFxuICAgIG5hbWU6ICdUcnkgQWdhaW4gTGF0ZXInLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSBzZXJ2ZXIgaXMgdGVybWluYXRpbmcgdGhlIGNvbm5lY3Rpb24gZHVlIHRvIGEgdGVtcG9yYXJ5IGNvbmRpdGlvbiwgZS5nLiBpdCBpcyBvdmVybG9hZGVkIGFuZCBpcyBjYXN0aW5nIG9mZiBzb21lIG9mIGl0cyBjbGllbnRzLicsXG4gIH0sXG4gIDEwMTQ6IHtcbiAgICBjb2RlOiAxMDE0LFxuICAgIG5hbWU6ICdCYWQgR2F0ZXdheScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIHNlcnZlciB3YXMgYWN0aW5nIGFzIGEgZ2F0ZXdheSBvciBwcm94eSBhbmQgcmVjZWl2ZWQgYW4gaW52YWxpZCByZXNwb25zZSBmcm9tIHRoZSB1cHN0cmVhbSBzZXJ2ZXIuIFRoaXMgaXMgc2ltaWxhciB0byA1MDIgSFRUUCBTdGF0dXMgQ29kZS4nLFxuICB9LFxuICAxMDE1OiB7XG4gICAgY29kZTogMTAxNSxcbiAgICBuYW1lOiAnVExTIEhhbmRzaGFrZScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnSW5kaWNhdGVzIHRoYXQgdGhlIGNvbm5lY3Rpb24gd2FzIGNsb3NlZCBkdWUgdG8gYSBmYWlsdXJlIHRvIHBlcmZvcm0gYSBUTFMgaGFuZHNoYWtlIChlLmcuLCB0aGUgc2VydmVyIGNlcnRpZmljYXRlIGNhblxcJ3QgYmUgdmVyaWZpZWQpLicsXG4gIH0sXG4gIC8vIGN1c3RvbVxuICAzMDAwOiB7XG4gICAgY29kZTogMzAwMCxcbiAgICBuYW1lOiAnUmVjb25uZWN0IFdlYlNvY2tldCcsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIGNsaWVudCBpcyB0ZXJtaW5hdGluZyB0aGUgY29ubmVjdGlvbiBiZWNhdXNlIGl0IHdhbnRzIHRvIHJlY29ubmVjdCcsXG4gIH0sXG4gIDMwMDE6IHtcbiAgICBjb2RlOiAzMDAxLFxuICAgIG5hbWU6ICdObyBSZWFsdGltZSBMaXN0ZW5lcnMnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSBjbGllbnQgaXMgdGVybWluYXRpbmcgdGhlIGNvbm5lY3Rpb24gYmVjYXVzZSBubyBtb3JlIHJlYWx0aW1lIGxpc3RlbmVycyBleGlzdCcsXG4gIH0sXG4gIDMwMDI6IHtcbiAgICBjb2RlOiAzMDAyLFxuICAgIG5hbWU6ICdIZWFydGJlYXQgUGluZyBFcnJvcicsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIGNsaWVudCBpcyB0ZXJtaW5hdGluZyB0aGUgY29ubmVjdGlvbiBkdWUgdG8gaXRzIGZhaWx1cmUgaW4gc2VuZGluZyBoZWFydGJlYXQgbWVzc2FnZXMnLFxuICB9LFxuICAzMDAzOiB7XG4gICAgY29kZTogMzAwMyxcbiAgICBuYW1lOiAnSGVhcnRiZWF0IFBvbmcgVGltZW91dCBFcnJvcicsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnVGhlIGNsaWVudCBpcyB0ZXJtaW5hdGluZyB0aGUgY29ubmVjdGlvbiBiZWNhdXNlIG5vIGhlYXJ0YmVhdCByZXNwb25zZSBpcyByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXInLFxuICB9LFxuICAzMDUwOiB7XG4gICAgY29kZTogMzA1MCxcbiAgICBuYW1lOiAnU2VydmVyIENsb3NlJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgY2xpZW50IGlzIHRlcm1pbmF0aW5nIHRoZSBjb25uZWN0aW9uIGJlY2F1c2Ugbm8gaGVhcnRiZWF0IHJlc3BvbnNlIGlzIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlcicsXG4gIH0sXG59XG5cbmV4cG9ydCBlbnVtIENsb3NlRXZlbnRDb2RlIHtcbiAgLy8gc3BlY1xuICBOb3JtYWxDbG9zdXJlID0gMTAwMCxcbiAgR29pbmdBd2F5ID0gMTAwMSxcbiAgUHJvdG9jb2xFcnJvciA9IDEwMDIsXG4gIFVuc3VwcG9ydGVkRGF0YSA9IDEwMDMsXG4gIE5vU3RhdHVzUmVjZWl2ZWQgPSAxMDA1LFxuICBBYm5vcm1hbENsb3N1cmUgPSAxMDA2LFxuICBJbnZhbGlkRnJhbWVQYXlsb2FkRGF0YSA9IDEwMDcsXG4gIFBvbGljeVZpb2xhdGlvbiA9IDEwMDgsXG4gIE1lc3NhZ2VUb29CaWcgPSAxMDA5LFxuICBNaXNzaW5nRXh0ZW5zaW9uID0gMTAxMCxcbiAgSW50ZXJuYWxFcnJvciA9IDEwMTEsXG4gIFNlcnZpY2VSZXN0YXJ0ID0gMTAxMixcbiAgVHJ5QWdhaW5MYXRlciA9IDEwMTMsXG4gIEJhZEdhdGV3YXkgPSAxMDE0LFxuICBUTFNIYW5kc2hha2UgPSAxMDE1LFxuICAvLyBjdXN0b20gLSBjbGllbnQgY2xvc2UgaXRzZWxmXG4gIFJlY29ubmVjdFdlYlNvY2tldCA9IDMwMDAsXG4gIE5vUmVhbHRpbWVMaXN0ZW5lcnMgPSAzMDAxLFxuICBIZWFydGJlYXRQaW5nRXJyb3IgPSAzMDAyLFxuICBIZWFydGJlYXRQb25nVGltZW91dEVycm9yID0gMzAwMyxcbiAgLy8gY3VzdG9tIC0gc2VydmVyIGNsb3NlXG4gIE5vQXV0aGVudGljYXRpb24gPSAzMDUwXG59XG5cbmV4cG9ydCBjb25zdCBnZXRXU0Nsb3NlRXJyb3IgPSAoY29kZTogQ2xvc2VFdmVudENvZGUsIHJlYXNvbj86IHN0cmluZykgPT4ge1xuICBjb25zdCBpbmZvID0gQ0xPU0VfRVZFTlRfQ09ERV9JTkZPW2NvZGVdXG4gIGNvbnN0IGVyck1zZyA9ICFpbmZvXG4gICAgPyBgY29kZSAke2NvZGV9YFxuICAgIDogYCR7aW5mby5uYW1lfSwgY29kZSAke2NvZGV9LCByZWFzb24gJHtyZWFzb24gfHwgaW5mby5kZXNjcmlwdGlvbn1gXG4gIHJldHVybiBuZXcgQ2xvdWRTREtFcnJvcih7XG4gICAgZXJyQ29kZTogRVJSX0NPREUuU0RLX0RBVEFCQVNFX1JFQUxUSU1FX0xJU1RFTkVSX1dFQlNPQ0tFVF9DT05ORUNUSU9OX0NMT1NFRCBhcyBzdHJpbmcsXG4gICAgZXJyTXNnLFxuICB9KVxufVxuIl19
}, function(modId) { var map = {"./error":1776008460249}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460252, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.setRuntime = exports.getRuntime = exports.setWsClass = exports.getWsClass = void 0;
var wsClass = null;
var runtime = 'web';
function getWsClass() {
    return wsClass;
}
exports.getWsClass = getWsClass;
function setWsClass(val) {
    wsClass = val;
}
exports.setWsClass = setWsClass;
function getRuntime() {
    return runtime;
}
exports.getRuntime = getRuntime;
function setRuntime(val) {
    runtime = val;
}
exports.setRuntime = setRuntime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDbEIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBRW5CLFNBQWdCLFVBQVU7SUFDeEIsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQztBQUZELGdDQUVDO0FBQ0QsU0FBZ0IsVUFBVSxDQUFDLEdBQVE7SUFDakMsT0FBTyxHQUFHLEdBQUcsQ0FBQTtBQUNmLENBQUM7QUFGRCxnQ0FFQztBQUVELFNBQWdCLFVBQVU7SUFDeEIsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQztBQUZELGdDQUVDO0FBQ0QsU0FBZ0IsVUFBVSxDQUFDLEdBQVc7SUFDcEMsT0FBTyxHQUFHLEdBQUcsQ0FBQTtBQUNmLENBQUM7QUFGRCxnQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImxldCB3c0NsYXNzID0gbnVsbFxubGV0IHJ1bnRpbWUgPSAnd2ViJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0V3NDbGFzcygpIHtcbiAgcmV0dXJuIHdzQ2xhc3Ncbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRXc0NsYXNzKHZhbDogYW55KSB7XG4gIHdzQ2xhc3MgPSB2YWxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJ1bnRpbWUoKSB7XG4gIHJldHVybiBydW50aW1lXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0UnVudGltZSh2YWw6IHN0cmluZykge1xuICBydW50aW1lID0gdmFsXG59XG4iXX0=
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1776008460243);
})()
//miniprogram-npm-outsideDeps=["lodash/set","lodash/unset","lodash/cloneDeep"]
//# sourceMappingURL=index.js.map