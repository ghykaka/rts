module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1776008460195, function(require, module, exports) {

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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.cloudbase = exports.LANGS = exports.getBaseEndPoint = void 0;
var utilities_1 = require("@cloudbase/utilities");
var component_1 = require("./libs/component");
var adapter_1 = require("./libs/adapter");
var cache_1 = require("./libs/cache");
var request_1 = require("./libs/request");
var common_1 = require("./constants/common");
var lang_1 = require("./libs/lang");
var common_2 = require("./constants/common");
Object.defineProperty(exports, "getBaseEndPoint", { enumerable: true, get: function () { return common_2.getBaseEndPoint; } });
var lang_2 = require("./libs/lang");
Object.defineProperty(exports, "LANGS", { enumerable: true, get: function () { return lang_2.LANGS; } });
var useAdapters = utilities_1.adapters.useAdapters, useDefaultAdapter = utilities_1.adapters.useDefaultAdapter;
var ERRORS = utilities_1.constants.ERRORS, COMMUNITY_SITE_URL = utilities_1.constants.COMMUNITY_SITE_URL;
var printWarn = utilities_1.utils.printWarn;
var catchErrorsDecorator = utilities_1.helpers.catchErrorsDecorator;
var DEFAULT_INIT_CONFIG = {
    timeout: 15000,
    persistence: 'local',
};
var MAX_TIMEOUT = 1000 * 60 * 10;
var MIN_TIMEOUT = 100;
var extensionMap = {};
var Cloudbase = (function () {
    function Cloudbase(config) {
        this.cloudbaseConfig = config ? config : this.cloudbaseConfig;
        this.authInstance = null;
        this.oauthInstance = null;
        this.version = (0, common_1.getSdkVersion)();
    }
    Object.defineProperty(Cloudbase.prototype, "config", {
        get: function () {
            return this.cloudbaseConfig;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "platform", {
        get: function () {
            return adapter_1.Platform;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "cache", {
        get: function () {
            return (0, cache_1.getCacheByEnvId)(this.cloudbaseConfig.env);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "localCache", {
        get: function () {
            return (0, cache_1.getLocalCache)(this.cloudbaseConfig.env);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "request", {
        get: function () {
            return (0, request_1.getRequestByEnvId)(this.cloudbaseConfig.env);
        },
        enumerable: false,
        configurable: true
    });
    Cloudbase.prototype.init = function (config) {
        var _a, _b, _c;
        if (config === void 0) { config = { env: '' }; }
        config.endPointMode = config.endPointMode || 'CLOUD_API';
        if (!adapter_1.Platform.adapter) {
            this.useDefaultAdapter();
        }
        config = this.dealNodeAdapterConfig(config);
        if (!config.env) {
            throw new Error(JSON.stringify({
                code: ERRORS.INVALID_PARAMS,
                msg: 'env must not be specified',
            }));
        }
        this.isInitialized(config);
        var reqConfig = {
            timeout: config.timeout || 15000,
            timeoutMsg: "[".concat((0, common_1.getSdkName)(), "][REQUEST TIMEOUT] request had been abort since didn't finished within").concat(config.timeout / 1000, "s"),
            auth: config.auth,
        };
        this.requestClient = new adapter_1.Platform.adapter.reqClass(reqConfig);
        this.cloudbaseConfig = __assign(__assign(__assign({}, DEFAULT_INIT_CONFIG), config), { i18n: (0, lang_1.i18nProxy)(adapter_1.Platform, config) });
        delete this.cloudbaseConfig.lang;
        this.cloudbaseConfig.timeout = this.formatTimeout(this.cloudbaseConfig.timeout);
        var _d = this.cloudbaseConfig, env = _d.env, persistence = _d.persistence, debug = _d.debug, timeout = _d.timeout, oauthClient = _d.oauthClient, i18n = _d.i18n;
        (0, cache_1.initCache)({ env: env, persistence: persistence, debug: debug, platformInfo: this.platform });
        (0, common_1.setRegionLevelEndpoint)(env, config.region || '');
        (0, common_1.setGatewayEndPointWithEnv)(env, common_1.DEFAULT_PROTOCOL, config.region || '');
        var app = new Cloudbase(this.cloudbaseConfig);
        (0, request_1.initRequest)({
            env: env,
            region: config.region || '',
            timeout: timeout,
            oauthClient: oauthClient,
            _fromApp: app,
            i18n: i18n,
            endPointMode: config.endPointMode,
            auth: config.auth,
        });
        app.requestClient = this.requestClient;
        (_a = this === null || this === void 0 ? void 0 : this.fire) === null || _a === void 0 ? void 0 : _a.call(this, 'cloudbase_init', app);
        this.try2InitAuth(app);
        if ((_b = adapter_1.Platform.adapter) === null || _b === void 0 ? void 0 : _b.nodeTool) {
            (_c = adapter_1.Platform.adapter) === null || _c === void 0 ? void 0 : _c.nodeTool(app, this.cloudbaseConfig);
        }
        return app;
    };
    Cloudbase.prototype.updateConfig = function (config) {
        var persistence = config.persistence, debug = config.debug;
        this.cloudbaseConfig.persistence = persistence;
        this.cloudbaseConfig.debug = debug;
        (0, cache_1.initCache)({ env: this.cloudbaseConfig.env, persistence: persistence, debug: debug, platformInfo: this.platform });
    };
    Cloudbase.prototype.updateLang = function (lang) {
        var _a;
        if (!lang || lang === ((_a = this.cloudbaseConfig.i18n) === null || _a === void 0 ? void 0 : _a.lang))
            return;
        this.cloudbaseConfig.i18n.lang = lang;
    };
    Cloudbase.prototype.registerExtension = function (ext) {
        extensionMap[ext.name] = ext;
    };
    Cloudbase.prototype.invokeExtension = function (name, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var ext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = extensionMap[name];
                        if (!ext) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: "extension:".concat(name, " must be registered before invoke"),
                            }));
                        }
                        return [4, ext.invoke(opts, this)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Cloudbase.prototype.useAdapters = function (adapters, options) {
        var _a = useAdapters(adapters, options) || {}, adapter = _a.adapter, runtime = _a.runtime;
        adapter && (adapter_1.Platform.adapter = adapter);
        runtime && (adapter_1.Platform.runtime = runtime);
    };
    Cloudbase.prototype.registerHook = function (hook) {
        (0, component_1.registerHook)(Cloudbase, hook);
    };
    Cloudbase.prototype.registerComponent = function (component) {
        (0, component_1.registerComponent)(Cloudbase, component);
    };
    Cloudbase.prototype.registerVersion = function (version) {
        (0, common_1.setSdkVersion)(version);
        this.version = version;
    };
    Cloudbase.prototype.registerSdkName = function (name) {
        (0, common_1.setSdkName)(name);
    };
    Cloudbase.prototype.isInitialized = function (config) {
        if (config === void 0) { config = this.cloudbaseConfig; }
        var PLACEHOLDER_PATTERNS = [
            'your-env-id', 'your-envid', 'your_env_id',
            'xxx-yyy', 'xxxx-yyy', 'envId', 'env-id',
            'your-environment-id', 'REPLACE_ME',
        ];
        if (PLACEHOLDER_PATTERNS.some(function (p) { return config.env.toLowerCase() === p.toLowerCase(); })) {
            printWarn(ERRORS.INVALID_PARAMS, "[CloudBase] \u68C0\u6D4B\u5230\u73AF\u5883 ID \"".concat(config.env, "\" \u53EF\u80FD\u662F\u5360\u4F4D\u7B26\uFF0C\u8BF7\u66FF\u6362\u4E3A\u771F\u5B9E\u7684\u73AF\u5883 ID\u3002\n")
                + '  获取方式：登录腾讯云开发平台 → 环境管理 → 环境设置 → 环境 ID\n'
                + '  建议通过环境变量配置：process.env.CLOUDBASE_ENV 或 import.meta.env.VITE_CLOUDBASE_ENV');
        }
        return !!(config === null || config === void 0 ? void 0 : config.env);
    };
    Cloudbase.prototype.registerEndPoint = function (url, protocol) {
        (0, common_1.setEndPointInfo)({ baseUrl: url, protocol: protocol, env: this.config.env, endPointKey: 'CLOUD_API' });
    };
    Cloudbase.prototype.registerEndPointWithKey = function (props) {
        (0, common_1.setEndPointInfo)({
            env: this.config.env,
            endPointKey: props.key,
            baseUrl: props.url,
            protocol: props.protocol,
        });
    };
    Cloudbase.prototype.getEndPointWithKey = function (key) {
        var info = (0, common_1.getEndPointInfo)(this.config.env, key);
        return {
            BASE_URL: info.baseUrl,
            PROTOCOL: info.protocol,
        };
    };
    Cloudbase.prototype.parseCaptcha = function (url) {
        return utilities_1.utils.parseCaptcha(url);
    };
    Cloudbase.prototype.useDefaultAdapter = function () {
        var _a = useDefaultAdapter.bind(this)(), adapter = _a.adapter, runtime = _a.runtime;
        adapter_1.Platform.adapter = adapter;
        adapter_1.Platform.runtime = runtime;
    };
    Cloudbase.prototype.formatTimeout = function (timeout) {
        switch (true) {
            case timeout > MAX_TIMEOUT:
                printWarn(ERRORS.INVALID_PARAMS, 'timeout is greater than maximum value[10min]');
                return MAX_TIMEOUT;
            case timeout < MIN_TIMEOUT:
                printWarn(ERRORS.INVALID_PARAMS, 'timeout is less than maximum value[100ms]');
                return MIN_TIMEOUT;
            default:
                return timeout;
        }
    };
    Cloudbase.prototype.try2InitAuth = function (app) {
        try {
            app.auth();
        }
        catch (error) {
            console.log('try2InitAuth error:', error);
        }
    };
    Cloudbase.prototype.dealNodeAdapterConfig = function (config) {
        var _a, _b;
        if (typeof process !== 'undefined' && typeof process.env !== 'undefined' && !process.env.IS_BROWSER_BUILD && ((_a = adapter_1.Platform.adapter) === null || _a === void 0 ? void 0 : _a.getSecretInfo)) {
            var secretInfo = (_b = adapter_1.Platform.adapter) === null || _b === void 0 ? void 0 : _b.getSecretInfo(config);
            config.auth = __assign(__assign({}, config.auth), { secretId: secretInfo.secretId, secretKey: secretInfo.secretKey, sessionToken: secretInfo.sessionToken, secretType: secretInfo.secretType });
            if (!config.env) {
                config.env = secretInfo.env;
            }
            if (!config.accessKey && secretInfo.accessKey) {
                config.accessKey = secretInfo.accessKey;
            }
        }
        return config;
    };
    __decorate([
        catchErrorsDecorator({
            mode: 'sync',
            title: 'Cloudbase 初始化失败',
            messages: [
                '请确认以下各项：',
                '  1 - 调用 cloudbase.init() 的语法或参数是否正确',
                '  2 - 如果是非浏览器环境，是否配置了安全应用来源（https://docs.cloudbase.net/api-reference/webv3/adapter#%E7%AC%AC-2-%E6%AD%A5%E9%85%8D%E7%BD%AE%E5%AE%89%E5%85%A8%E5%BA%94%E7%94%A8%E6%9D%A5%E6%BA%90）',
                "\u5982\u679C\u95EE\u9898\u4F9D\u7136\u5B58\u5728\uFF0C\u5EFA\u8BAE\u5230\u5B98\u65B9\u95EE\u7B54\u793E\u533A\u63D0\u95EE\u6216\u5BFB\u627E\u5E2E\u52A9\uFF1A".concat(COMMUNITY_SITE_URL),
            ],
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Cloudbase)
    ], Cloudbase.prototype, "init", null);
    __decorate([
        catchErrorsDecorator({
            title: '调用扩展能力失败',
            messages: [
                '请确认以下各项：',
                '  1 - 调用 invokeExtension() 的语法或参数是否正确',
                '  2 - 被调用的扩展能力是否已经安装并通过 registerExtension() 注册',
                "\u5982\u679C\u95EE\u9898\u4F9D\u7136\u5B58\u5728\uFF0C\u5EFA\u8BAE\u5230\u5B98\u65B9\u95EE\u7B54\u793E\u533A\u63D0\u95EE\u6216\u5BFB\u627E\u5E2E\u52A9\uFF1A".concat(COMMUNITY_SITE_URL),
            ],
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object]),
        __metadata("design:returntype", Promise)
    ], Cloudbase.prototype, "invokeExtension", null);
    return Cloudbase;
}());
exports.cloudbase = new Cloudbase();
exports.cloudbase.useAdapters((0, adapter_1.getWxDefaultAdapter)());
exports.default = exports.cloudbase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBMEU7QUFhMUUsOENBQWtFO0FBQ2xFLDBDQUE4RDtBQUc5RCxzQ0FBd0U7QUFFeEUsMENBQStEO0FBQy9ELDZDQVcyQjtBQUMzQixvQ0FBOEM7QUFDOUMsNkNBQW9EO0FBQTNDLHlHQUFBLGVBQWUsT0FBQTtBQUN4QixvQ0FBbUM7QUFBMUIsNkZBQUEsS0FBSyxPQUFBO0FBQ04sSUFBQSxXQUFXLEdBQXdCLG9CQUFRLFlBQWhDLEVBQUUsaUJBQWlCLEdBQUssb0JBQVEsa0JBQWIsQ0FBYTtBQUMzQyxJQUFBLE1BQU0sR0FBeUIscUJBQVMsT0FBbEMsRUFBRSxrQkFBa0IsR0FBSyxxQkFBUyxtQkFBZCxDQUFjO0FBQ3hDLElBQUEsU0FBUyxHQUFLLGlCQUFLLFVBQVYsQ0FBVTtBQUNuQixJQUFBLG9CQUFvQixHQUFLLG1CQUFPLHFCQUFaLENBQVk7QUFLeEMsSUFBTSxtQkFBbUIsR0FBOEI7SUFDckQsT0FBTyxFQUFFLEtBQUs7SUFDZCxXQUFXLEVBQUUsT0FBTztDQUNyQixDQUFBO0FBR0QsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7QUFFbEMsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFBO0FBRXZCLElBQU0sWUFBWSxHQUE0QixFQUFFLENBQUE7QUFFaEQ7SUFVRSxtQkFBWSxNQUF5QjtRQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFBO1FBQzdELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxD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QUN6QyxDQUFBO1lBR0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7Z0JBQ2YsTUFBTSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFBO2FBQzVCO1lBR0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFBO2FBQ3hDO1NBQ0Y7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFoUU07UUFWTixvQkFBb0IsQ0FBQztZQUNwQixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxpQkFBaUI7WUFDeEIsUUFBUSxFQUFFO2dCQUNSLFVBQVU7Z0JBQ1Ysc0NBQXNDO2dCQUN0QyxtTEFBbUw7Z0JBQ25MLHNLQUE2QixrQkFBa0IsQ0FBRTthQUNsRDtTQUNGLENBQUM7Ozt3Q0FDc0UsU0FBUzt5Q0FvRWhGO0lBNEJZO1FBVFosb0JBQW9CLENBQUM7WUFDcEIsS0FBSyxFQUFFLFVBQVU7WUFDakIsUUFBUSxFQUFFO2dCQUNSLFVBQVU7Z0JBQ1YsdUNBQXVDO2dCQUN2QyxnREFBZ0Q7Z0JBQ2hELHNLQUE2QixrQkFBa0IsQ0FBRTthQUNsRDtTQUNGLENBQUM7Ozs7b0RBV0Q7SUF1SkgsZ0JBQUM7Q0FBQSxBQWhURCxJQWdUQztBQU1ZLFFBQUEsU0FBUyxHQUFlLElBQUksU0FBUyxFQUFFLENBQUE7QUFFcEQsaUJBQVMsQ0FBQyxXQUFXLENBQUMsSUFBQSw2QkFBbUIsR0FBRSxDQUFDLENBQUE7QUFHNUMsa0JBQWUsaUJBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFkYXB0ZXJzLCBjb25zdGFudHMsIHV0aWxzLCBoZWxwZXJzIH0gZnJvbSAnQGNsb3VkYmFzZS91dGlsaXRpZXMnXG5pbXBvcnQgeyBTREtBZGFwdGVySW50ZXJmYWNlLCBDbG91ZGJhc2VBZGFwdGVyLCBJUmVxdWVzdENvbmZpZyB9IGZyb20gJ0BjbG91ZGJhc2UvYWRhcHRlci1pbnRlcmZhY2UnXG5pbXBvcnQge1xuICBJQ2xvdWRiYXNlQ29uZmlnLFxuICBJQ2xvdWRiYXNlVXBncmFkZWRDb25maWcsXG4gIElDbG91ZGJhc2UsXG4gIElDbG91ZGJhc2VFeHRlbnNpb24sXG4gIEtWLFxuICBJQ2xvdWRiYXNlUGxhdGZvcm1JbmZvLFxuICBFbmRQb2ludEtleSxcbiAgSUNsb3VkYmFzZUFwaXMsXG59IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgeyBJQ2xvdWRiYXNlQXV0aCB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvYXV0aCdcbmltcG9ydCB7IHJlZ2lzdGVyQ29tcG9uZW50LCByZWdpc3Rlckhvb2sgfSBmcm9tICcuL2xpYnMvY29tcG9uZW50J1xuaW1wb3J0IHsgZ2V0V3hEZWZhdWx0QWRhcHRlciwgUGxhdGZvcm0gfSBmcm9tICcuL2xpYnMvYWRhcHRlcidcbmltcG9ydCB7IElDbG91ZGJhc2VDb21wb25lbnQsIElDbG91ZGJhc2VIb29rIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jb21wb25lbnQnXG5pbXBvcnQgeyBJQ2xvdWRiYXNlQ2FjaGUgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2NhY2hlJ1xuaW1wb3J0IHsgaW5pdENhY2hlLCBnZXRDYWNoZUJ5RW52SWQsIGdldExvY2FsQ2FjaGUgfSBmcm9tICcuL2xpYnMvY2FjaGUnXG5pbXBvcnQgeyBJQ2xvdWRiYXNlUmVxdWVzdCB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvcmVxdWVzdCdcbmltcG9ydCB7IGluaXRSZXF1ZXN0LCBnZXRSZXF1ZXN0QnlFbnZJZCB9IGZyb20gJy4vbGlicy9yZXF1ZXN0J1xuaW1wb3J0IHtcbiAgZ2V0U2RrTmFtZSxcbiAgc2V0U2RrVmVyc2lvbixcbiAgc2V0UmVnaW9uTGV2ZWxFbmRwb2ludCxcbiAgc2V0U2RrTmFtZSxcbiAgc2V0R2F0ZXdheUVuZFBvaW50V2l0aEVudixcbiAgdHlwZSBJU2V0RW5kUG9pbnRXaXRoS2V5LFxuICBzZXRFbmRQb2ludEluZm8sXG4gIGdldEVuZFBvaW50SW5mbyxcbiAgZ2V0U2RrVmVyc2lvbixcbiAgREVGQVVMVF9QUk9UT0NPTCxcbn0gZnJvbSAnLi9jb25zdGFudHMvY29tbW9uJ1xuaW1wb3J0IHsgaTE4blByb3h5LCBMQU5HUyB9IGZyb20gJy4vbGlicy9sYW5nJ1xuZXhwb3J0IHsgZ2V0QmFzZUVuZFBvaW50IH0gZnJvbSAnLi9jb25zdGFudHMvY29tbW9uJ1xuZXhwb3J0IHsgTEFOR1MgfSBmcm9tICcuL2xpYnMvbGFuZydcbmNvbnN0IHsgdXNlQWRhcHRlcnMsIHVzZURlZmF1bHRBZGFwdGVyIH0gPSBhZGFwdGVyc1xuY29uc3QgeyBFUlJPUlMsIENPTU1VTklUWV9TSVRFX1VSTCB9ID0gY29uc3RhbnRzXG5jb25zdCB7IHByaW50V2FybiB9ID0gdXRpbHNcbmNvbnN0IHsgY2F0Y2hFcnJvcnNEZWNvcmF0b3IgfSA9IGhlbHBlcnNcblxuLyoqXG4gKiBAY29uc3RhbnQg6buY6K6k6YWN572uXG4gKi9cbmNvbnN0IERFRkFVTFRfSU5JVF9DT05GSUc6IFBhcnRpYWw8SUNsb3VkYmFzZUNvbmZpZz4gPSB7XG4gIHRpbWVvdXQ6IDE1MDAwLFxuICBwZXJzaXN0ZW5jZTogJ2xvY2FsJywgLy8g5oyB5LmF5YyW5a2Y5YKo57G75Z6LXG59XG5cbi8vIHRpbWVvdXTkuIrpmZAxMOWIhumSn1xuY29uc3QgTUFYX1RJTUVPVVQgPSAxMDAwICogNjAgKiAxMFxuLy8gdGltZW91dOS4i+mZkDEwMG1zXG5jb25zdCBNSU5fVElNRU9VVCA9IDEwMFxuXG5jb25zdCBleHRlbnNpb25NYXA6IEtWPElDbG91ZGJhc2VFeHRlbnNpb24+ID0ge31cblxuY2xhc3MgQ2xvdWRiYXNlIGltcGxlbWVudHMgSUNsb3VkYmFzZSB7XG4gIHB1YmxpYyBhdXRoSW5zdGFuY2U6IElDbG91ZGJhc2VBdXRoXG4gIHB1YmxpYyBvYXV0aEluc3RhbmNlOiBhbnlcbiAgcHVibGljIHJlcXVlc3RDbGllbnQ6IGFueVxuICBwdWJsaWMgb2F1dGhDbGllbnQ6IGFueVxuICBwdWJsaWMgdmVyc2lvbjogc3RyaW5nXG4gIHB1YmxpYyBhdXRoOiBJQ2xvdWRiYXNlWydhdXRoJ10gJiBJQ2xvdWRiYXNlQXV0aFxuICBwdWJsaWMgYXBpczogSUNsb3VkYmFzZUFwaXNcbiAgcHJpdmF0ZSBjbG91ZGJhc2VDb25maWc6IElDbG91ZGJhc2VDb25maWdcblxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBJQ2xvdWRiYXNlQ29uZmlnKSB7XG4gICAgdGhpcy5jbG91ZGJhc2VDb25maWcgPSBjb25maWcgPyBjb25maWcgOiB0aGlzLmNsb3VkYmFzZUNvbmZpZ1xuICAgIHRoaXMuYXV0aEluc3RhbmNlID0gbnVsbFxuICAgIHRoaXMub2F1dGhJbnN0YW5jZSA9IG51bGxcbiAgICB0aGlzLnZlcnNpb24gPSBnZXRTZGtWZXJzaW9uKClcbiAgfVxuXG4gIGdldCBjb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xvdWRiYXNlQ29uZmlnXG4gIH1cblxuICBnZXQgcGxhdGZvcm0oKTogSUNsb3VkYmFzZVBsYXRmb3JtSW5mbyB7XG4gICAgcmV0dXJuIFBsYXRmb3JtXG4gIH1cblxuICBnZXQgY2FjaGUoKTogSUNsb3VkYmFzZUNhY2hlIHtcbiAgICByZXR1cm4gZ2V0Q2FjaGVCeUVudklkKHRoaXMuY2xvdWRiYXNlQ29uZmlnLmVudilcbiAgfVxuXG4gIGdldCBsb2NhbENhY2hlKCk6IElDbG91ZGJhc2VDYWNoZSB7XG4gICAgcmV0dXJuIGdldExvY2FsQ2FjaGUodGhpcy5jbG91ZGJhc2VDb25maWcuZW52KVxuICB9XG5cbiAgZ2V0IHJlcXVlc3QoKTogSUNsb3VkYmFzZVJlcXVlc3Qge1xuICAgIHJldHVybiBnZXRSZXF1ZXN0QnlFbnZJZCh0aGlzLmNsb3VkYmFzZUNvbmZpZy5lbnYpXG4gIH1cblxuICBAY2F0Y2hFcnJvcnNEZWNvcmF0b3Ioe1xuICAgIG1vZGU6ICdzeW5jJyxcbiAgICB0aXRsZTogJ0Nsb3VkYmFzZSDliJ3lp4vljJblpLHotKUnLFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICAn6K+356Gu6K6k5Lul5LiL5ZCE6aG577yaJyxcbiAgICAgICcgIDEgLSDosIPnlKggY2xvdWRiYXNlLmluaXQoKSDnmoTor63ms5XmiJblj4LmlbDmmK/lkKbmraPnoa4nLFxuICAgICAgJyAgMiAtIOWmguaenOaYr+mdnua1j+iniOWZqOeOr+Wig++8jOaYr+WQpumFjee9ruS6huWuieWFqOW6lOeUqOadpea6kO+8iGh0dHBzOi8vZG9jcy5jbG91ZGJhc2UubmV0L2FwaS1yZWZlcmVuY2Uvd2VidjMvYWRhcHRlciMlRTclQUMlQUMtMi0lRTYlQUQlQTUlRTklODUlOEQlRTclQkQlQUUlRTUlQUUlODklRTUlODUlQTglRTUlQkElOTQlRTclOTQlQTglRTYlOUQlQTUlRTYlQkElOTDvvIknLFxuICAgICAgYOWmguaenOmXrumimOS+neeEtuWtmOWcqO+8jOW7uuiuruWIsOWumOaWuemXruetlOekvuWMuuaPkOmXruaIluWvu+aJvuW4ruWKqe+8miR7Q09NTVVOSVRZX1NJVEVfVVJMfWAsXG4gICAgXSxcbiAgfSlcbiAgcHVibGljIGluaXQoY29uZmlnOiBJQ2xvdWRiYXNlQ29uZmlnICYgeyBsYW5nPzogTEFOR1MgfSA9IHsgZW52OiAnJyB9KTogQ2xvdWRiYXNlIHtcbiAgICBjb25maWcuZW5kUG9pbnRNb2RlID0gY29uZmlnLmVuZFBvaW50TW9kZSB8fCAnQ0xPVURfQVBJJ1xuXG4gICAgLy8g5Yid5aeL5YyW5pe26Iul5pyq5YW85a655bmz5Y+w77yM5YiZ5L2/55So6buY6K6kYWRhcHRlclxuICAgIGlmICghUGxhdGZvcm0uYWRhcHRlcikge1xuICAgICAgdGhpcy51c2VEZWZhdWx0QWRhcHRlcigpXG4gICAgfVxuXG4gICAgLy8g5Zyo5Yik5patY29uZmlnLmVuduS5i+WJje+8jOWFiOWkhOeQhm5vZGXnjq/looPnmoTphY3nva5cbiAgICBjb25maWcgPSB0aGlzLmRlYWxOb2RlQWRhcHRlckNvbmZpZyhjb25maWcpXG5cbiAgICBpZiAoIWNvbmZpZy5lbnYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX1BBUkFNUyxcbiAgICAgICAgbXNnOiAnZW52IG11c3Qgbm90IGJlIHNwZWNpZmllZCcsXG4gICAgICB9KSwpXG4gICAgfVxuXG4gICAgdGhpcy5pc0luaXRpYWxpemVkKGNvbmZpZylcblxuICAgIGNvbnN0IHJlcUNvbmZpZzogSVJlcXVlc3RDb25maWcgJiB7IGF1dGg6IElDbG91ZGJhc2VDb25maWdbJ2F1dGgnXSB9ID0ge1xuICAgICAgdGltZW91dDogY29uZmlnLnRpbWVvdXQgfHwgMTUwMDAsXG4gICAgICB0aW1lb3V0TXNnOiBgWyR7Z2V0U2RrTmFtZSgpfV1bUkVRVUVTVCBUSU1FT1VUXSByZXF1ZXN0IGhhZCBiZWVuIGFib3J0IHNpbmNlIGRpZG4ndCBmaW5pc2hlZCB3aXRoaW4ke1xuICAgICAgICBjb25maWcudGltZW91dCAvIDEwMDBcbiAgICAgIH1zYCxcbiAgICAgIGF1dGg6IGNvbmZpZy5hdXRoLFxuICAgIH1cblxuICAgIHRoaXMucmVxdWVzdENsaWVudCA9IG5ldyBQbGF0Zm9ybS5hZGFwdGVyLnJlcUNsYXNzKHJlcUNvbmZpZylcblxuICAgIHRoaXMuY2xvdWRiYXNlQ29uZmlnID0ge1xuICAgICAgLi4uREVGQVVMVF9JTklUX0NPTkZJRyxcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIGkxOG46IGkxOG5Qcm94eShQbGF0Zm9ybSwgY29uZmlnKSxcbiAgICB9XG5cbiAgICBkZWxldGUgKHRoaXMuY2xvdWRiYXNlQ29uZmlnIGFzIGFueSkubGFuZ1xuICAgIC8vIOS/ruato3RpbWVvdXTlj5blgLxcbiAgICB0aGlzLmNsb3VkYmFzZUNvbmZpZy50aW1lb3V0ID0gdGhpcy5mb3JtYXRUaW1lb3V0KHRoaXMuY2xvdWRiYXNlQ29uZmlnLnRpbWVvdXQpXG4gICAgLy8g5Yid5aeL5YyWY2FjaGXlkoxyZXF1ZXN0XG4gICAgY29uc3QgeyBlbnYsIHBlcnNpc3RlbmNlLCBkZWJ1ZywgdGltZW91dCwgb2F1dGhDbGllbnQsIGkxOG4gfSA9IHRoaXMuY2xvdWRiYXNlQ29uZmlnXG4gICAgaW5pdENhY2hlKHsgZW52LCBwZXJzaXN0ZW5jZSwgZGVidWcsIHBsYXRmb3JtSW5mbzogdGhpcy5wbGF0Zm9ybSB9KVxuXG4gICAgc2V0UmVnaW9uTGV2ZWxFbmRwb2ludChlbnYsIGNvbmZpZy5yZWdpb24gfHwgJycpXG4gICAgc2V0R2F0ZXdheUVuZFBvaW50V2l0aEVudihlbnYsIERFRkFVTFRfUFJPVE9DT0wsIGNvbmZpZy5yZWdpb24gfHwgJycpXG5cbiAgICBjb25zdCBhcHAgPSBuZXcgQ2xvdWRiYXNlKHRoaXMuY2xvdWRiYXNlQ29uZmlnKVxuICAgIGluaXRSZXF1ZXN0KHtcbiAgICAgIGVudixcbiAgICAgIHJlZ2lvbjogY29uZmlnLnJlZ2lvbiB8fCAnJyxcbiAgICAgIHRpbWVvdXQsXG4gICAgICBvYXV0aENsaWVudCxcbiAgICAgIF9mcm9tQXBwOiBhcHAsXG4gICAgICBpMThuLFxuICAgICAgZW5kUG9pbnRNb2RlOiBjb25maWcuZW5kUG9pbnRNb2RlLFxuICAgICAgYXV0aDogY29uZmlnLmF1dGgsXG4gICAgfSlcbiAgICBhcHAucmVxdWVzdENsaWVudCA9IHRoaXMucmVxdWVzdENsaWVudFxuICAgIDsodGhpcyBhcyBhbnkpPy5maXJlPy4oJ2Nsb3VkYmFzZV9pbml0JywgYXBwKVxuXG4gICAgdGhpcy50cnkySW5pdEF1dGgoYXBwKVxuXG4gICAgLy8gbm9kZeeOr+Wig+WPr+S7peS7jmFkYXB0ZXLojrflj5Zub2RlVG9vbOeahOaWueazlVxuICAgIGlmIChQbGF0Zm9ybS5hZGFwdGVyPy5ub2RlVG9vbCkge1xuICAgICAgUGxhdGZvcm0uYWRhcHRlcj8ubm9kZVRvb2woYXBwLCB0aGlzLmNsb3VkYmFzZUNvbmZpZylcbiAgICB9XG5cbiAgICByZXR1cm4gYXBwXG4gIH1cblxuICBwdWJsaWMgdXBkYXRlQ29uZmlnKGNvbmZpZzogSUNsb3VkYmFzZVVwZ3JhZGVkQ29uZmlnKSB7XG4gICAgY29uc3QgeyBwZXJzaXN0ZW5jZSwgZGVidWcgfSA9IGNvbmZpZ1xuICAgIHRoaXMuY2xvdWRiYXNlQ29uZmlnLnBlcnNpc3RlbmNlID0gcGVyc2lzdGVuY2VcbiAgICB0aGlzLmNsb3VkYmFzZUNvbmZpZy5kZWJ1ZyA9IGRlYnVnXG4gICAgLy8gcGVyc2lzdGVuY2XmlLnliqjlvbHlk41jYWNoZVxuICAgIGluaXRDYWNoZSh7IGVudjogdGhpcy5jbG91ZGJhc2VDb25maWcuZW52LCBwZXJzaXN0ZW5jZSwgZGVidWcsIHBsYXRmb3JtSW5mbzogdGhpcy5wbGF0Zm9ybSB9KVxuICB9XG5cbiAgcHVibGljIHVwZGF0ZUxhbmcobGFuZzogTEFOR1MpIHtcbiAgICBpZiAoIWxhbmcgfHwgbGFuZyA9PT0gdGhpcy5jbG91ZGJhc2VDb25maWcuaTE4bj8ubGFuZykgcmV0dXJuXG5cbiAgICB0aGlzLmNsb3VkYmFzZUNvbmZpZy5pMThuLmxhbmcgPSBsYW5nXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJFeHRlbnNpb24oZXh0OiBJQ2xvdWRiYXNlRXh0ZW5zaW9uKSB7XG4gICAgZXh0ZW5zaW9uTWFwW2V4dC5uYW1lXSA9IGV4dFxuICB9XG4gIEBjYXRjaEVycm9yc0RlY29yYXRvcih7XG4gICAgdGl0bGU6ICfosIPnlKjmianlsZXog73lipvlpLHotKUnLFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICAn6K+356Gu6K6k5Lul5LiL5ZCE6aG577yaJyxcbiAgICAgICcgIDEgLSDosIPnlKggaW52b2tlRXh0ZW5zaW9uKCkg55qE6K+t5rOV5oiW5Y+C5pWw5piv5ZCm5q2j56GuJyxcbiAgICAgICcgIDIgLSDooqvosIPnlKjnmoTmianlsZXog73lipvmmK/lkKblt7Lnu4/lronoo4XlubbpgJrov4cgcmVnaXN0ZXJFeHRlbnNpb24oKSDms6jlhownLFxuICAgICAgYOWmguaenOmXrumimOS+neeEtuWtmOWcqO+8jOW7uuiuruWIsOWumOaWuemXruetlOekvuWMuuaPkOmXruaIluWvu+aJvuW4ruWKqe+8miR7Q09NTVVOSVRZX1NJVEVfVVJMfWAsXG4gICAgXSxcbiAgfSlcbiAgcHVibGljIGFzeW5jIGludm9rZUV4dGVuc2lvbihuYW1lOiBzdHJpbmcsIG9wdHM6IGFueSkge1xuICAgIGNvbnN0IGV4dCA9IGV4dGVuc2lvbk1hcFtuYW1lXVxuICAgIGlmICghZXh0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjb2RlOiBFUlJPUlMuSU5WQUxJRF9QQVJBTVMsXG4gICAgICAgIG1zZzogYGV4dGVuc2lvbjoke25hbWV9IG11c3QgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgaW52b2tlYCxcbiAgICAgIH0pLClcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgZXh0Lmludm9rZShvcHRzLCB0aGlzKVxuICB9XG5cbiAgcHVibGljIHVzZUFkYXB0ZXJzKGFkYXB0ZXJzOiBDbG91ZGJhc2VBZGFwdGVyIHwgQ2xvdWRiYXNlQWRhcHRlcltdLCBvcHRpb25zPzogYW55KSB7XG4gICAgY29uc3QgeyBhZGFwdGVyLCBydW50aW1lIH0gPSB1c2VBZGFwdGVycyhhZGFwdGVycywgb3B0aW9ucykgfHwge31cbiAgICBhZGFwdGVyICYmIChQbGF0Zm9ybS5hZGFwdGVyID0gYWRhcHRlciBhcyBTREtBZGFwdGVySW50ZXJmYWNlKVxuICAgIHJ1bnRpbWUgJiYgKFBsYXRmb3JtLnJ1bnRpbWUgPSBydW50aW1lIGFzIHN0cmluZylcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3Rlckhvb2soaG9vazogSUNsb3VkYmFzZUhvb2spIHtcbiAgICByZWdpc3Rlckhvb2soQ2xvdWRiYXNlLCBob29rKVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudDogSUNsb3VkYmFzZUNvbXBvbmVudCkge1xuICAgIHJlZ2lzdGVyQ29tcG9uZW50KENsb3VkYmFzZSwgY29tcG9uZW50KVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyVmVyc2lvbih2ZXJzaW9uOiBzdHJpbmcpIHtcbiAgICBzZXRTZGtWZXJzaW9uKHZlcnNpb24pXG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvblxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyU2RrTmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICBzZXRTZGtOYW1lKG5hbWUpXG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5b2T5YmNIENsb3VkYmFzZSDlrp7kvovmmK/lkKblt7LlrozmiJDliJ3lp4vljJZcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBpbXBvcnQgY2xvdWRiYXNlIGZyb20gJ0BjbG91ZGJhc2UvanMtc2RrJ1xuICAgKlxuICAgKiAvLyDliJ3lp4vljJbliY1cbiAgICogY29uc29sZS5sb2coY2xvdWRiYXNlLmlzSW5pdGlhbGl6ZWQoKSkgLy8gZmFsc2VcbiAgICpcbiAgICogY29uc3QgYXBwID0gY2xvdWRiYXNlLmluaXQoeyBlbnY6ICd5b3VyLWVudi1pZCcgfSlcbiAgICpcbiAgICogLy8g5Yid5aeL5YyW5ZCOXG4gICAqIGNvbnNvbGUubG9nKGFwcC5pc0luaXRpYWxpemVkKCkpIC8vIHRydWVcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSDmmK/lkKblt7LliJ3lp4vljJZcbiAgICovXG4gIHB1YmxpYyBpc0luaXRpYWxpemVkKGNvbmZpZyA9IHRoaXMuY2xvdWRiYXNlQ29uZmlnKTogYm9vbGVhbiB7XG4gICAgLy8g5qOA5rWL5bi46KeB5Y2g5L2N56ymIGVudiDlgLzvvIzlnKjlvIDlj5HpmLbmrrXnu5nlh7rlj4vlpb3mj5DnpLpcbiAgICBjb25zdCBQTEFDRUhPTERFUl9QQVRURVJOUyA9IFtcbiAgICAgICd5b3VyLWVudi1pZCcsICd5b3VyLWVudmlkJywgJ3lvdXJfZW52X2lkJyxcbiAgICAgICd4eHgteXl5JywgJ3h4eHgteXl5JywgJ2VudklkJywgJ2Vudi1pZCcsXG4gICAgICAneW91ci1lbnZpcm9ubWVudC1pZCcsICdSRVBMQUNFX01FJyxcbiAgICBdXG4gICAgaWYgKFBMQUNFSE9MREVSX1BBVFRFUk5TLnNvbWUocCA9PiBjb25maWcuZW52LnRvTG93ZXJDYXNlKCkgPT09IHAudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgIHByaW50V2FybihcbiAgICAgICAgRVJST1JTLklOVkFMSURfUEFSQU1TLFxuICAgICAgICBgW0Nsb3VkQmFzZV0g5qOA5rWL5Yiw546v5aKDIElEIFwiJHtjb25maWcuZW52fVwiIOWPr+iDveaYr+WNoOS9jeespu+8jOivt+abv+aNouS4uuecn+WunueahOeOr+WigyBJROOAglxcbmBcbiAgICAgICAgKyAnICDojrflj5bmlrnlvI/vvJrnmbvlvZXohb7orq/kupHlvIDlj5HlubPlj7Ag4oaSIOeOr+Wig+euoeeQhiDihpIg546v5aKD6K6+572uIOKGkiDnjq/looMgSURcXG4nXG4gICAgICAgICsgJyAg5bu66K6u6YCa6L+H546v5aKD5Y+Y6YeP6YWN572u77yacHJvY2Vzcy5lbnYuQ0xPVURCQVNFX0VOViDmiJYgaW1wb3J0Lm1ldGEuZW52LlZJVEVfQ0xPVURCQVNFX0VOVicsXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKGNvbmZpZz8uZW52KVxuICB9XG5cbiAgLyoqIOiuvue9riB0Y2IgYXBpIOeahCBlbmRwb2ludCAqL1xuICBwdWJsaWMgcmVnaXN0ZXJFbmRQb2ludCh1cmw6IHN0cmluZywgcHJvdG9jb2w/OiAnaHR0cCcgfCAnaHR0cHMnKSB7XG4gICAgc2V0RW5kUG9pbnRJbmZvKHsgYmFzZVVybDogdXJsLCBwcm90b2NvbCwgZW52OiB0aGlzLmNvbmZpZy5lbnYsIGVuZFBvaW50S2V5OiAnQ0xPVURfQVBJJyB9KVxuICB9XG5cbiAgLyoqIOiuvue9rue9keWFsy90Y2IgYXBp55qEIGVuZFBvaW5077yM6YCa6L+HIGtleSDmjIflrpogKi9cbiAgcHVibGljIHJlZ2lzdGVyRW5kUG9pbnRXaXRoS2V5KHByb3BzOiBJU2V0RW5kUG9pbnRXaXRoS2V5KSB7XG4gICAgc2V0RW5kUG9pbnRJbmZvKHtcbiAgICAgIGVudjogdGhpcy5jb25maWcuZW52LFxuICAgICAgZW5kUG9pbnRLZXk6IHByb3BzLmtleSxcbiAgICAgIGJhc2VVcmw6IHByb3BzLnVybCxcbiAgICAgIHByb3RvY29sOiBwcm9wcy5wcm90b2NvbCxcbiAgICB9KVxuICB9XG5cbiAgLyoqIOaLv+e9keWFsy90Y2IgYXBp55qEIGVuZFBvaW5077yM6YCa6L+HIGtleSDmjIflrpogKi9cbiAgcHVibGljIGdldEVuZFBvaW50V2l0aEtleShrZXk6IEVuZFBvaW50S2V5KSB7XG4gICAgY29uc3QgaW5mbyA9IGdldEVuZFBvaW50SW5mbyh0aGlzLmNvbmZpZy5lbnYsIGtleSlcbiAgICByZXR1cm4ge1xuICAgICAgQkFTRV9VUkw6IGluZm8uYmFzZVVybCxcbiAgICAgIFBST1RPQ09MOiBpbmZvLnByb3RvY29sLFxuICAgIH1cbiAgfVxuXG4gIC8vIOino+aekFVSTOWPguaVsFxuICBwdWJsaWMgcGFyc2VDYXB0Y2hhKHVybCkge1xuICAgIHJldHVybiB1dGlscy5wYXJzZUNhcHRjaGEodXJsKVxuICB9XG5cbiAgcHJpdmF0ZSB1c2VEZWZhdWx0QWRhcHRlcigpIHtcbiAgICBjb25zdCB7IGFkYXB0ZXIsIHJ1bnRpbWUgfSA9IHVzZURlZmF1bHRBZGFwdGVyLmJpbmQodGhpcykoKVxuICAgIFBsYXRmb3JtLmFkYXB0ZXIgPSBhZGFwdGVyIGFzIFNES0FkYXB0ZXJJbnRlcmZhY2VcbiAgICBQbGF0Zm9ybS5ydW50aW1lID0gcnVudGltZSBhcyBzdHJpbmdcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0VGltZW91dCh0aW1lb3V0OiBudW1iZXIpIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgdGltZW91dCA+IE1BWF9USU1FT1VUOlxuICAgICAgICBwcmludFdhcm4oRVJST1JTLklOVkFMSURfUEFSQU1TLCAndGltZW91dCBpcyBncmVhdGVyIHRoYW4gbWF4aW11bSB2YWx1ZVsxMG1pbl0nKVxuICAgICAgICByZXR1cm4gTUFYX1RJTUVPVVRcbiAgICAgIGNhc2UgdGltZW91dCA8IE1JTl9USU1FT1VUOlxuICAgICAgICBwcmludFdhcm4oRVJST1JTLklOVkFMSURfUEFSQU1TLCAndGltZW91dCBpcyBsZXNzIHRoYW4gbWF4aW11bSB2YWx1ZVsxMDBtc10nKVxuICAgICAgICByZXR1cm4gTUlOX1RJTUVPVVRcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aW1lb3V0XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0cnkySW5pdEF1dGgoYXBwKSB7XG4gICAgdHJ5IHtcbiAgICAgIGFwcC5hdXRoKClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5sb2coJ3RyeTJJbml0QXV0aCBlcnJvcjonLCBlcnJvcilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5aSE55CGIE5vZGUg546v5aKD5LiLIGFkYXB0ZXIg55qE6YWN572u5L+h5oGvXG4gICAqIOWcqCBOb2RlIOeOr+Wig+S4re+8jOmAmui/hyBhZGFwdGVyIOiHquWKqOiOt+WPluWvhumSpeOAgeeOr+Wig0lE44CBYWNjZXNzS2V5IOetiemFjee9ru+8jFxuICAgKiDlh4/lsJHnlKjmiLfmiYvliqjkvKDlhaXphY3nva7nmoTotJ/mi4VcbiAgICogQHBhcmFtIGNvbmZpZyAtIOS6keW8gOWPkeWIneWni+WMlumFjee9ruWvueixoVxuICAgKiBAcmV0dXJucyDooaXlhYXkuoYgTm9kZSBhZGFwdGVyIOS/oeaBr+WQjueahOmFjee9ruWvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBkZWFsTm9kZUFkYXB0ZXJDb25maWcoY29uZmlnOiBJQ2xvdWRiYXNlQ29uZmlnKSB7XG4gICAgLy8gbm9kZeeOr+Wig+WPr+S7peS7jmFkYXB0ZXLojrflj5bpu5jorqTnmoRzZWNyZXRJZOWSjHNlY3JldEtleVxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MuZW52ICE9PSAndW5kZWZpbmVkJyAmJiAhcHJvY2Vzcy5lbnYuSVNfQlJPV1NFUl9CVUlMRCAmJiBQbGF0Zm9ybS5hZGFwdGVyPy5nZXRTZWNyZXRJbmZvKSB7XG4gICAgICBjb25zdCBzZWNyZXRJbmZvID0gUGxhdGZvcm0uYWRhcHRlcj8uZ2V0U2VjcmV0SW5mbyhjb25maWcpXG4gICAgICAvLyDlsIYgYWRhcHRlciDmj5DkvpvnmoTlr4bpkqXkv6Hmga/lhpnlhaUgY29uZmlnLmF1dGhcbiAgICAgIGNvbmZpZy5hdXRoID0ge1xuICAgICAgICAuLi5jb25maWcuYXV0aCxcbiAgICAgICAgc2VjcmV0SWQ6IHNlY3JldEluZm8uc2VjcmV0SWQsXG4gICAgICAgIHNlY3JldEtleTogc2VjcmV0SW5mby5zZWNyZXRLZXksXG4gICAgICAgIHNlc3Npb25Ub2tlbjogc2VjcmV0SW5mby5zZXNzaW9uVG9rZW4sXG4gICAgICAgIHNlY3JldFR5cGU6IHNlY3JldEluZm8uc2VjcmV0VHlwZSBhcyBhbnksXG4gICAgICB9XG5cbiAgICAgIC8vIG5vZGUg546v5aKD5Y+v6IO95Y+v5Lul5LuO5LiK5LiL5paH6I635Y+WZW5277yM55So5oi35pyq5pi+5byP5oyH5a6a5pe26Ieq5Yqo5aGr5YWFXG4gICAgICBpZiAoIWNvbmZpZy5lbnYpIHtcbiAgICAgICAgY29uZmlnLmVudiA9IHNlY3JldEluZm8uZW52XG4gICAgICB9XG5cbiAgICAgIC8vIG5vZGUgYWRhcHRlcueOr+Wig+iDveivu+WPluWIsCBwcm9jZXNzLmVudi5DTE9VREJBU0VfQVBJS0VZIOaXtu+8jOWcqOayoeacieS8oOWFpWFjY2Vzc0tleeaXtu+8jOS9v+eUqCBub2RlIGFkYXB0ZXIg5o+Q5L6b55qEIGFjY2Vzc0tlee+8iHByb2Nlc3MuZW52LkNMT1VEQkFTRV9BUElLRVnvvIlcbiAgICAgIGlmICghY29uZmlnLmFjY2Vzc0tleSAmJiBzZWNyZXRJbmZvLmFjY2Vzc0tleSkge1xuICAgICAgICBjb25maWcuYWNjZXNzS2V5ID0gc2VjcmV0SW5mby5hY2Nlc3NLZXlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnXG4gIH1cbn1cblxuLy8g57G75Z6L5a+85Ye6XG5leHBvcnQgdHlwZSB7IENsb3VkYmFzZSB9XG5cbi8vIOWAvOWvvOWHulxuZXhwb3J0IGNvbnN0IGNsb3VkYmFzZTogSUNsb3VkYmFzZSA9IG5ldyBDbG91ZGJhc2UoKVxuXG5jbG91ZGJhc2UudXNlQWRhcHRlcnMoZ2V0V3hEZWZhdWx0QWRhcHRlcigpKVxuXG4vLyDpu5jorqTlr7zlh7rlrp7kvotcbmV4cG9ydCBkZWZhdWx0IGNsb3VkYmFzZVxuIl19
}, function(modId) {var map = {"./libs/component":1776008460196,"./libs/adapter":1776008460197,"./libs/cache":1776008460198,"./libs/request":1776008460199,"./constants/common":1776008460200,"./libs/lang":1776008460201}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460196, function(require, module, exports) {

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHook = exports.registerComponent = void 0;
var utilities_1 = require("@cloudbase/utilities");
var ERRORS = utilities_1.constants.ERRORS;
var components = {};
function registerComponent(app, component) {
    var name = component.name, namespace = component.namespace, entity = component.entity, injectEvents = component.injectEvents, _a = component.IIFE, IIFE = _a === void 0 ? false : _a;
    if (components[name] || (namespace && app[namespace])) {
        throw new Error(JSON.stringify({
            code: ERRORS.INVALID_OPERATION,
            msg: "Duplicate component ".concat(name),
        }));
    }
    if (IIFE) {
        if (!entity || typeof entity !== 'function') {
            throw new Error(JSON.stringify({
                code: ERRORS.INVALID_PARAMS,
                msg: 'IIFE component\'s entity must be a function',
            }));
        }
        entity.call(app);
    }
    components[name] = component;
    if (namespace) {
        app.prototype[namespace] = entity;
    }
    else {
        deepExtend(app.prototype, entity);
    }
    if (injectEvents) {
        var bus = injectEvents.bus, events = injectEvents.events;
        if (!bus || !events || events.length === 0) {
            return;
        }
        var originCallback_1 = app.prototype.fire || function () { };
        if (!app.prototype.events) {
            app.prototype.events = {};
        }
        var originEvents = app.prototype.events || {};
        if (originEvents[name]) {
            app.prototype.events[name].events = __spreadArray(__spreadArray([], app.prototype.events[name].events, true), events, true);
        }
        else {
            app.prototype.events[name] = { bus: bus, events: events };
        }
        app.prototype.fire = function (eventName, data) {
            originCallback_1(eventName, data);
            var eventNames = Object.keys(this.events);
            for (var _i = 0, eventNames_1 = eventNames; _i < eventNames_1.length; _i++) {
                var name_1 = eventNames_1[_i];
                var _a = this.events[name_1], bus_1 = _a.bus, eventList = _a.events;
                if (eventList.includes(eventName)) {
                    bus_1.fire(eventName, data);
                    break;
                }
            }
        };
    }
}
exports.registerComponent = registerComponent;
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date: {
            var dateValue = source;
            return new Date(dateValue.getTime());
        }
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            target = [];
            break;
        default:
            return source;
    }
    var sourceKeys = Object.keys(source);
    for (var _i = 0, sourceKeys_1 = sourceKeys; _i < sourceKeys_1.length; _i++) {
        var key = sourceKeys_1[_i];
        if (!Object.prototype.hasOwnProperty.call(source, key)) {
            continue;
        }
        target[key] = deepExtend(target[key], source[key]);
    }
    return target;
}
function registerHook(app, hook) {
    var entity = hook.entity, target = hook.target;
    if (Object.prototype.hasOwnProperty.call(app, target)) {
        throw new Error(JSON.stringify({
            code: ERRORS.INVALID_OPERATION,
            msg: "target:".concat(target, " is not exist"),
        }));
    }
    var originMethod = app.prototype[target];
    if (typeof originMethod !== 'function') {
        throw new Error(JSON.stringify({
            code: ERRORS.INVALID_OPERATION,
            msg: "target:".concat(target, " is not a function which is the only type supports hook"),
        }));
    }
    app.prototype[target] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        entity.call.apply(entity, __spreadArray([this], args, false));
        return originMethod.call.apply(originMethod, __spreadArray([this], args, false));
    };
}
exports.registerHook = registerHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYnMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLGtEQUFnRDtBQUV4QyxJQUFBLE1BQU0sR0FBSyxxQkFBUyxPQUFkLENBQWM7QUFFNUIsSUFBTSxVQUFVLEdBQTRCLEVBQUUsQ0FBQTtBQUU5QyxTQUFnQixpQkFBaUIsQ0FBQyxHQUFRLEVBQUUsU0FBOEI7SUFDaEUsSUFBQSxJQUFJLEdBQW9ELFNBQVMsS0FBN0QsRUFBRSxTQUFTLEdBQXlDLFNBQVMsVUFBbEQsRUFBRSxNQUFNLEdBQWlDLFNBQVMsT0FBMUMsRUFBRSxZQUFZLEdBQW1CLFNBQVMsYUFBNUIsRUFBRSxLQUFpQixTQUFTLEtBQWQsRUFBWixJQUFJLG1CQUFHLEtBQUssS0FBQSxDQUFjO0lBRXpFLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtZQUM5QixHQUFHLEVBQUUsOEJBQXVCLElBQUksQ0FBRTtTQUNuQyxDQUFDLENBQUMsQ0FBQTtLQUNKO0lBRUQsSUFBSSxJQUFJLEVBQUU7UUFDUixJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtZQUMzQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYztnQkFDM0IsR0FBRyxFQUFFLDZDQUE2QzthQUNuRCxDQUFDLENBQUMsQ0FBQTtTQUNKO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNqQjtJQUVELFVBQVUsQ0FBQyxJQUFJ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WSxFQUFaLHFCQUFZLEVBQVosSUFBWTtZQUFaLHlCQUFZOztRQUM1QyxNQUFNLENBQUMsSUFBSSxPQUFYLE1BQU0saUJBQU0sSUFBSSxHQUFLLElBQUksVUFBQztRQUMxQixPQUFPLFlBQVksQ0FBQyxJQUFJLE9BQWpCLFlBQVksaUJBQU0sSUFBSSxHQUFLLElBQUksVUFBQztJQUN6QyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBbkJELG9DQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEtWIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcydcbmltcG9ydCB7IElDbG91ZGJhc2VDb21wb25lbnQsIElDbG91ZGJhc2VIb29rIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jb21wb25lbnQnXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcblxuY29uc3QgeyBFUlJPUlMgfSA9IGNvbnN0YW50c1xuXG5jb25zdCBjb21wb25lbnRzOiBLVjxJQ2xvdWRiYXNlQ29tcG9uZW50PiA9IHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudChhcHA6IGFueSwgY29tcG9uZW50OiBJQ2xvdWRiYXNlQ29tcG9uZW50KSB7XG4gIGNvbnN0IHsgbmFtZSwgbmFtZXNwYWNlLCBlbnRpdHksIGluamVjdEV2ZW50cywgSUlGRSA9IGZhbHNlIH0gPSBjb21wb25lbnRcbiAgLy8g5LiN5YWB6K646YeN5aSN5rOo5YaM5oiW5ZG95ZCN56m66Ze06YeN5ZCNXG4gIGlmIChjb21wb25lbnRzW25hbWVdIHx8IChuYW1lc3BhY2UgJiYgYXBwW25hbWVzcGFjZV0pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX09QRVJBVElPTixcbiAgICAgIG1zZzogYER1cGxpY2F0ZSBjb21wb25lbnQgJHtuYW1lfWAsXG4gICAgfSkpXG4gIH1cbiAgLy8gSUlGReexu+Wei+eahOe7hOS7tuS7pWFwcOS4unNjb3Bl5omn6KGMZW50aXR55Ye95pWw77yM5LiN5oyC6L295YiwYXBwLnByb3RvdHlwZeS4ilxuICBpZiAoSUlGRSkge1xuICAgIGlmICghZW50aXR5IHx8IHR5cGVvZiBlbnRpdHkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX1BBUkFNUyxcbiAgICAgICAgbXNnOiAnSUlGRSBjb21wb25lbnRcXCdzIGVudGl0eSBtdXN0IGJlIGEgZnVuY3Rpb24nLFxuICAgICAgfSkpXG4gICAgfVxuICAgIGVudGl0eS5jYWxsKGFwcClcbiAgfVxuXG4gIGNvbXBvbmVudHNbbmFtZV0gPSBjb21wb25lbnRcblxuICBpZiAobmFtZXNwYWNlKSB7XG4gICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZVtuYW1lc3BhY2VdID0gZW50aXR5XG4gIH0gZWxzZSB7XG4gICAgZGVlcEV4dGVuZCgoYXBwIGFzIGFueSkucHJvdG90eXBlLCBlbnRpdHkpXG4gIH1cbiAgaWYgKGluamVjdEV2ZW50cykge1xuICAgIGNvbnN0IHsgYnVzLCBldmVudHMgfSA9IGluamVjdEV2ZW50c1xuICAgIGlmICghYnVzIHx8ICFldmVudHMgfHwgZXZlbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IG9yaWdpbkNhbGxiYWNrID0gKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5maXJlIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgaWYgKCEoYXBwIGFzIGFueSkucHJvdG90eXBlLmV2ZW50cykge1xuICAgICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5ldmVudHMgPSB7fVxuICAgIH1cbiAgICBjb25zdCBvcmlnaW5FdmVudHM6IEtWPGFueT4gPSAoYXBwIGFzIGFueSkucHJvdG90eXBlLmV2ZW50cyB8fCB7fVxuICAgIGlmIChvcmlnaW5FdmVudHNbbmFtZV0pIHtcbiAgICAgIChhcHAgYXMgYW55KS5wcm90b3R5cGUuZXZlbnRzW25hbWVdLmV2ZW50cyA9IFsuLi4oYXBwIGFzIGFueSkucHJvdG90eXBlLmV2ZW50c1tuYW1lXS5ldmVudHMsIC4uLmV2ZW50c11cbiAgICB9IGVsc2Uge1xuICAgICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5ldmVudHNbbmFtZV0gPSB7IGJ1cywgZXZlbnRzIH1cbiAgICB9XG4gICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKGV2ZW50TmFtZTogc3RyaW5nLCBkYXRhPzogYW55KSB7XG4gICAgICBvcmlnaW5DYWxsYmFjayhldmVudE5hbWUsIGRhdGEpXG4gICAgICBjb25zdCBldmVudE5hbWVzID0gT2JqZWN0LmtleXModGhpcy5ldmVudHMpXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgZXZlbnROYW1lcykge1xuICAgICAgICBjb25zdCB7IGJ1cywgZXZlbnRzOiBldmVudExpc3QgfSA9IHRoaXMuZXZlbnRzW25hbWVdXG4gICAgICAgIGlmIChldmVudExpc3QuaW5jbHVkZXMoZXZlbnROYW1lKSkge1xuICAgICAgICAgIGJ1cy5maXJlKGV2ZW50TmFtZSwgZGF0YSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZXBFeHRlbmQodGFyZ2V0OiBhbnksIHNvdXJjZTogYW55KTogS1Y8YW55PiB7XG4gIGlmICghKHNvdXJjZSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICByZXR1cm4gc291cmNlXG4gIH1cblxuICBzd2l0Y2ggKHNvdXJjZS5jb25zdHJ1Y3Rvcikge1xuICAgIGNhc2UgRGF0ZToge1xuICAgICAgY29uc3QgZGF0ZVZhbHVlID0gc291cmNlIGFzIERhdGVcbiAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlVmFsdWUuZ2V0VGltZSgpKVxuICAgIH1cbiAgICBjYXNlIE9iamVjdDpcbiAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXJnZXQgPSB7fVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIEFycmF5OlxuICAgICAgdGFyZ2V0ID0gW11cbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzb3VyY2VcbiAgfVxuICBjb25zdCBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKVxuICBmb3IgKGNvbnN0IGtleSBvZiBzb3VyY2VLZXlzKSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICB0YXJnZXRba2V5XSA9IGRlZXBFeHRlbmQodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJIb29rKGFwcDogYW55LCBob29rOiBJQ2xvdWRiYXNlSG9vaykge1xuICBjb25zdCB7IGVudGl0eSwgdGFyZ2V0IH0gPSBob29rXG4gIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXBwLCB0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX09QRVJBVElPTixcbiAgICAgIG1zZzogYHRhcmdldDoke3RhcmdldH0gaXMgbm90IGV4aXN0YCxcbiAgICB9KSlcbiAgfVxuICBjb25zdCBvcmlnaW5NZXRob2QgPSBhcHAucHJvdG90eXBlW3RhcmdldF1cbiAgaWYgKHR5cGVvZiBvcmlnaW5NZXRob2QgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgY29kZTogRVJST1JTLklOVkFMSURfT1BFUkFUSU9OLFxuICAgICAgbXNnOiBgdGFyZ2V0OiR7dGFyZ2V0fSBpcyBub3QgYSBmdW5jdGlvbiB3aGljaCBpcyB0aGUgb25seSB0eXBlIHN1cHBvcnRzIGhvb2tgLFxuICAgIH0pKVxuICB9XG4gIGFwcC5wcm90b3R5cGVbdGFyZ2V0XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnkpIHtcbiAgICBlbnRpdHkuY2FsbCh0aGlzLCAuLi5hcmdzKVxuICAgIHJldHVybiBvcmlnaW5NZXRob2QuY2FsbCh0aGlzLCAuLi5hcmdzKVxuICB9XG59XG4iXX0=
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460197, function(require, module, exports) {

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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWxDefaultAdapter = exports.Platform = void 0;
var adapter_wx_mp_1 = __importStar(require("@cloudbase/adapter-wx_mp"));
var adapter_interface_1 = require("@cloudbase/adapter-interface");
exports.Platform = {};
var getWxDefaultAdapter = function () {
    adapter_wx_mp_1.WxRequest.prototype.upload = function (options) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve) {
            var url = options.url, file = options.file, data = options.data, headers = options.headers;
            var fs = wx.getFileSystemManager();
            var task = wx.request({
                url: url,
                method: options.method,
                header: __assign({ 'content-type': ' ' }, headers),
                data: fs.readFileSync(file),
                timeout: _this._timeout,
                success: function (res) {
                    var result = {
                        statusCode: res.statusCode,
                        data: res.data || {},
                    };
                    if (res.statusCode === 200 && (data === null || data === void 0 ? void 0 : data.success_action_status)) {
                        result.statusCode = parseInt(data.success_action_status, 10);
                    }
                    resolve(result);
                },
                fail: function (err) {
                    resolve(err);
                },
                complete: function (err) {
                    if (!(err === null || err === void 0 ? void 0 : err.errMsg)) {
                        return;
                    }
                    if (!self._timeout || self._restrictedMethods.indexOf('upload') === -1) {
                        return;
                    }
                    var errMsg = err.errMsg;
                    if (errMsg === 'request:fail timeout') {
                        console.warn(self._timeoutMsg);
                        try {
                            task.abort();
                        }
                        catch (e) { }
                    }
                },
            });
        });
    };
    function isPlugin() {
        return (typeof App === 'undefined'
            && typeof getApp === 'undefined'
            && !wx.onAppHide
            && !wx.offAppHide
            && !wx.onAppShow
            && !wx.offAppShow);
    }
    adapter_wx_mp_1.default.genAdapter = function genAdapter(options) {
        var adapter = {
            root: { globalThis: {} },
            reqClass: adapter_wx_mp_1.WxRequest,
            wsClass: adapter_wx_mp_1.WxMpWebSocket,
            captchaOptions: {
                openURIWithCallback: function (_url) {
                    var EventBus = options.EventBus;
                    var queryObj = {};
                    var url = _url;
                    console.log('openURIWithCallback', _url);
                    var matched = _url.match(/^(data:.*?)(\?[^#\s]*)?$/);
                    if (matched) {
                        url = matched[1];
                        console.log('openURIWithCallback url', url);
                        var search = matched[2];
                        if (search) {
                            queryObj = (0, adapter_wx_mp_1.parseQueryString)(search);
                        }
                    }
                    console.log('openURIWithCallback queryObj', queryObj);
                    var token = queryObj.token, restQueryObj = __rest(queryObj, ["token"]);
                    if (/^data:/.test(url) && !token) {
                        return Promise.reject({
                            error: 'invalid_argument',
                            error_description: "invalie captcha data: ".concat(_url),
                        });
                    }
                    if (!token) {
                        return Promise.reject({
                            error: 'unimplemented',
                            error_description: 'need to impl captcha data',
                        });
                    }
                    return new Promise(function (resolve) {
                        console.log('wait for captcha...');
                        EventBus.$emit('CAPTCHA_DATA_CHANGE', __assign(__assign({}, restQueryObj), { token: token, url: url }));
                        EventBus.$once('RESOLVE_CAPTCHA_DATA', function (res) {
                            resolve(res);
                        });
                    });
                },
            },
            localStorage: adapter_wx_mp_1.wxMpStorage,
            primaryStorage: adapter_interface_1.StorageType.local,
            getAppSign: function () {
                var info = wx.getAccountInfoSync();
                if (isPlugin()) {
                    return info && info.plugin ? info.plugin.appId : '';
                }
                return info && info.miniProgram ? info.miniProgram.appId : '';
            },
        };
        return adapter;
    };
    return adapter_wx_mp_1.default;
};
exports.getWxDefaultAdapter = getWxDefaultAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWJzL2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0VBQWtIO0FBQ2xILGtFQUFpRjtBQU1wRSxRQUFBLFFBQVEsR0FBMkIsRUFBRSxDQUFBO0FBRTNDLElBQU0sbUJBQW1CLEdBQUc7SUFDakMseUJBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsT0FBOEI7UUFBeEMsaUJBNkM1QjtRQTNDQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUE7UUFDakIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU87WUFDakIsSUFBQSxHQUFHLEdBQTBCLE9BQU8sSUFBakMsRUFBRSxJQUFJLEdBQW9CLE9BQU8sS0FBM0IsRUFBRSxJQUFJLEdBQWMsT0FBTyxLQUFyQixFQUFFLE9BQU8sR0FBSyxPQUFPLFFBQVosQ0FBWTtZQUM1QyxJQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtZQUNwQyxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUN0QixHQUFHLEtBQUE7Z0JBQ0gsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2dCQUN0QixNQUFNLGFBQ0osY0FBYyxFQUFFLEdBQUcsSUFDaEIsT0FBTyxDQUNYO2dCQUNELElBQUksRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDM0IsT0FBTyxFQUFFLEtBQUksQ0FBQyxRQUFRO2dCQUN0QixPQUFPLFlBQUMsR0FBMEM7b0JBQ2hELElBQU0sTUFBTSxHQUFHO3dCQUNiLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTt3QkFDMUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRTtxQkFDckIsQ0FBQTtvQkFDRCxJQUFJLEdBQUcsQ0FB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RixDQUFBO1FBQ0QsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFBO0lBRUQsT0FBTyx1QkFBYyxDQUFBO0FBQ3ZCLENBQUMsQ0FBQTtBQXpIWSxRQUFBLG1CQUFtQix1QkF5SC9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUNsb3VkYmFzZVBsYXRmb3JtSW5mbyB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgYWRhcHRlckZvcld4TXAsIHsgV3hSZXF1ZXN0LCBXeE1wV2ViU29ja2V0LCB3eE1wU3RvcmFnZSwgcGFyc2VRdWVyeVN0cmluZyB9IGZyb20gJ0BjbG91ZGJhc2UvYWRhcHRlci13eF9tcCdcbmltcG9ydCB7IElVcGxvYWRSZXF1ZXN0T3B0aW9ucywgU3RvcmFnZVR5cGUgfSBmcm9tICdAY2xvdWRiYXNlL2FkYXB0ZXItaW50ZXJmYWNlJ1xuXG5kZWNsYXJlIGNvbnN0IHd4OiBhbnlcbmRlY2xhcmUgY29uc3QgQXBwOiBhbnlcbmRlY2xhcmUgY29uc3QgZ2V0QXBwOiBhbnlcblxuZXhwb3J0IGNvbnN0IFBsYXRmb3JtOiBJQ2xvdWRiYXNlUGxhdGZvcm1JbmZvID0ge31cblxuZXhwb3J0IGNvbnN0IGdldFd4RGVmYXVsdEFkYXB0ZXIgPSAoKSA9PiB7XG4gIFd4UmVxdWVzdC5wcm90b3R5cGUudXBsb2FkID0gZnVuY3Rpb24gKG9wdGlvbnM6IElVcGxvYWRSZXF1ZXN0T3B0aW9ucykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCB7IHVybCwgZmlsZSwgZGF0YSwgaGVhZGVycyB9ID0gb3B0aW9uc1xuICAgICAgY29uc3QgZnMgPSB3eC5nZXRGaWxlU3lzdGVtTWFuYWdlcigpIC8vIOivu+WPluaWh+S7tiDkuozov5vliLblhoXlrrlcbiAgICAgIGNvbnN0IHRhc2sgPSB3eC5yZXF1ZXN0KHtcbiAgICAgICAgdXJsLFxuICAgICAgICBtZXRob2Q6IG9wdGlvbnMubWV0aG9kLFxuICAgICAgICBoZWFkZXI6IHtcbiAgICAgICAgICAnY29udGVudC10eXBlJzogJyAnLCAvLyDlsI/nqIvluo8gY29udGVudC10eXBlIOm7mOiupOS4uiBhcHBsaWNhdGlvbi9qc29u77yMIOi/memHjOS4gOWumuimgeW8uuWItuS4uiDnqbrvvIwg5ZCm5YiZ562+5ZCN6ZSZ6K+vXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnMucmVhZEZpbGVTeW5jKGZpbGUpLCAvLyDlsIbkuozov5vliLbmlofku7bovazkuLrlrZfnrKbkuLLnm7TmjqXotYvlgLzliLAgcmVxdWVzdCBwYXlsb2Fk77yMIOS4jeimgeS7pSBmb3JtIOeahOaWueW8j+S8oOi+k1xuICAgICAgICB0aW1lb3V0OiB0aGlzLl90aW1lb3V0LFxuICAgICAgICBzdWNjZXNzKHJlczogeyBzdGF0dXNDb2RlOiBudW1iZXI7IGRhdGE6IHVua25vd24gfSkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IHJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgZGF0YTogcmVzLmRhdGEgfHwge30sXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMjAwICYmIGRhdGE/LnN1Y2Nlc3NfYWN0aW9uX3N0YXR1cykge1xuICAgICAgICAgICAgcmVzdWx0LnN0YXR1c0NvZGUgPSBwYXJzZUludChkYXRhLnN1Y2Nlc3NfYWN0aW9uX3N0YXR1cywgMTApXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgICAgICB9LFxuICAgICAgICBmYWlsKGVycjogdW5rbm93bikge1xuICAgICAgICAgIHJlc29sdmUoZXJyKVxuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZShlcnI6IHsgZXJyTXNnOiBzdHJpbmcgfSkge1xuICAgICAgICAgIGlmICghZXJyPy5lcnJNc2cpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXNlbGYuX3RpbWVvdXQgfHwgc2VsZi5fcmVzdHJpY3RlZE1ldGhvZHMuaW5kZXhPZigndXBsb2FkJykgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgeyBlcnJNc2cgfSA9IGVyclxuICAgICAgICAgIGlmIChlcnJNc2cgPT09ICdyZXF1ZXN0OmZhaWwgdGltZW91dCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihzZWxmLl90aW1lb3V0TXNnKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGFzay5hYm9ydCgpXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzUGx1Z2luKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0eXBlb2YgQXBwID09PSAndW5kZWZpbmVkJ1xuICAgICAgJiYgdHlwZW9mIGdldEFwcCA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgICYmICF3eC5vbkFwcEhpZGVcbiAgICAgICYmICF3eC5vZmZBcHBIaWRlXG4gICAgICAmJiAhd3gub25BcHBTaG93XG4gICAgICAmJiAhd3gub2ZmQXBwU2hvd1xuICAgIClcbiAgfVxuICBhZGFwdGVyRm9yV3hNcC5nZW5BZGFwdGVyID0gZnVuY3Rpb24gZ2VuQWRhcHRlcihvcHRpb25zKSB7XG4gICAgY29uc3QgYWRhcHRlciA9IHtcbiAgICAgIHJvb3Q6IHsgZ2xvYmFsVGhpczoge30gfSxcbiAgICAgIHJlcUNsYXNzOiBXeFJlcXVlc3QsXG4gICAgICB3c0NsYXNzOiBXeE1wV2ViU29ja2V0LFxuICAgICAgY2FwdGNoYU9wdGlvbnM6IHtcbiAgICAgICAgb3BlblVSSVdpdGhDYWxsYmFjazogKF91cmw6IHN0cmluZykgPT4ge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgICBjb25zdCB7IEV2ZW50QnVzIH0gPSBvcHRpb25zXG4gICAgICAgICAgbGV0IHF1ZXJ5T2JqOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICAgICAgICBsZXQgdXJsID0gX3VybFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdvcGVuVVJJV2l0aENhbGxiYWNrJywgX3VybClcbiAgICAgICAgICBjb25zdCBtYXRjaGVkID0gX3VybC5tYXRjaCgvXihkYXRhOi4qPykoXFw/W14jXFxzXSopPyQvKVxuICAgICAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWRlc3RydWN0dXJpbmdcbiAgICAgICAgICAgIHVybCA9IG1hdGNoZWRbMV1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvcGVuVVJJV2l0aENhbGxiYWNrIHVybCcsIHVybClcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IG1hdGNoZWRbMl1cbiAgICAgICAgICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgICAgICAgcXVlcnlPYmogPSBwYXJzZVF1ZXJ5U3RyaW5nKHNlYXJjaClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coJ29wZW5VUklXaXRoQ2FsbGJhY2sgcXVlcnlPYmonLCBxdWVyeU9iailcbiAgICAgICAgICBjb25zdCB7IHRva2VuLCAuLi5yZXN0UXVlcnlPYmogfSA9IHF1ZXJ5T2JqXG4gICAgICAgICAgaWYgKC9eZGF0YTovLnRlc3QodXJsKSAmJiAhdG9rZW4pIHtcbiAgICAgICAgICAgIC8vIOWmguaenOaYryBkYXRhOiDlvIDlpLTnmoQgVVJMIOS4lOayoeaciSB0b2tlbu+8jOWImeebtOaOpei/lOWbnlxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHtcbiAgICAgICAgICAgICAgZXJyb3I6ICdpbnZhbGlkX2FyZ3VtZW50JyxcbiAgICAgICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb246IGBpbnZhbGllIGNhcHRjaGEgZGF0YTogJHtfdXJsfWAsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoe1xuICAgICAgICAgICAgICBlcnJvcjogJ3VuaW1wbGVtZW50ZWQnLFxuICAgICAgICAgICAgICBlcnJvcl9kZXNjcmlwdGlvbjogJ25lZWQgdG8gaW1wbCBjYXB0Y2hhIGRhdGEnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd2FpdCBmb3IgY2FwdGNoYS4uLicpXG4gICAgICAgICAgICBFdmVudEJ1cy4kZW1pdCgnQ0FQVENIQV9EQVRBX0NIQU5HRScsIHsgLi4ucmVzdFF1ZXJ5T2JqLCB0b2tlbiwgdXJsIH0pXG5cbiAgICAgICAgICAgIC8vIOebkeWQrOS6i+S7tuaAu+e6v++8jOetieW+hemqjOivgeeggeaVsOaNruWPmOWMllxuICAgICAgICAgICAgRXZlbnRCdXMuJG9uY2UoJ1JFU09MVkVfQ0FQVENIQV9EQVRBJywgKHJlczogeyBjYXB0Y2hhX3Rva2VuOiBzdHJpbmc7IGV4cGlyZXNfaW46IG51bWJlciB9KSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUocmVzKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGxvY2FsU3RvcmFnZTogd3hNcFN0b3JhZ2UsXG4gICAgICBwcmltYXJ5U3RvcmFnZTogU3RvcmFnZVR5cGUubG9jYWwsXG4gICAgICBnZXRBcHBTaWduKCkge1xuICAgICAgICBjb25zdCBpbmZvID0gd3guZ2V0QWNjb3VudEluZm9TeW5jKClcbiAgICAgICAgaWYgKGlzUGx1Z2luKCkpIHtcbiAgICAgICAgICAvLyDmj5Lku7bnjq/looPov5Tlm57mj5Lku7ZhcHBpZFxuICAgICAgICAgIHJldHVybiBpbmZvICYmIGluZm8ucGx1Z2luID8gaW5mby5wbHVnaW4uYXBwSWQgOiAnJ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmZvICYmIGluZm8ubWluaVByb2dyYW0gPyBpbmZvLm1pbmlQcm9ncmFtLmFwcElkIDogJydcbiAgICAgIH0sXG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyXG4gIH1cblxuICByZXR1cm4gYWRhcHRlckZvcld4TXBcbn1cbiJdfQ==
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460198, function(require, module, exports) {

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
exports.getLocalCache = exports.getCacheByEnvId = exports.initCache = void 0;
var utilities_1 = require("@cloudbase/utilities");
var USER_INFO_KEY = 'user_info';
var CloudbaseCache = utilities_1.cache.CloudbaseCache;
var cacheMap = {};
var localCacheMap = {};
function initCache(config) {
    var env = config.env, platformInfo = config.platformInfo;
    var userInfoKey = "".concat(USER_INFO_KEY, "_").concat(env);
    var keys = {
        userInfoKey: userInfoKey,
    };
    cacheMap[env] = cacheMap[env] || (new CloudbaseCache(__assign(__assign({}, config), { keys: keys, platformInfo: platformInfo })));
    localCacheMap[env] = localCacheMap[env] || new CloudbaseCache(__assign(__assign({}, config), { keys: keys, platformInfo: platformInfo, persistence: 'local' }));
}
exports.initCache = initCache;
function getCacheByEnvId(env) {
    return cacheMap[env];
}
exports.getCacheByEnvId = getCacheByEnvId;
function getLocalCache(env) {
    return localCacheMap[env];
}
exports.getLocalCache = getLocalCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGlicy9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLGtEQUE0QztBQUc1QyxJQUFNLGFBQWEsR0FBRyxXQUFXLENBQUE7QUFFekIsSUFBQSxjQUFjLEdBQUssaUJBQUssZUFBVixDQUFVO0FBRWhDLElBQU0sUUFBUSxHQUF3QixFQUFFLENBQUE7QUFFeEMsSUFBTSxhQUFhLEdBQXdCLEVBQUUsQ0FBQTtBQUU3QyxTQUFnQixTQUFTLENBQUMsTUFBc0M7SUFDdEQsSUFBQSxHQUFHLEdBQW1CLE1BQU0sSUFBekIsRUFBRSxZQUFZLEdBQUssTUFBTSxhQUFYLENBQVc7SUFFcEMsSUFBTSxXQUFXLEdBQUcsVUFBRyxhQUFhLGNBQUksR0FBRyxDQUFFLENBQUE7SUFFN0MsSUFBTSxJQUFJLEdBQUc7UUFDWCxXQUFXLGFBQUE7S0FDWixDQUFBO0lBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyx1QkFDL0MsTUFBTSxLQUNULElBQUksTUFBQSxFQUNKLFlBQVksY0FBQSxJQUNaLENBQUMsQ0FBQTtJQUNILGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxjQUFjLHVCQUN4RCxNQUFNLEtBQ1QsSUFBSSxNQUFBLEVBQ0osWUFBWSxjQUFBLEVBQ1osV0FBVyxFQUFFLE9BQU8sSUFDcEIsQ0FBQTtBQUNKLENBQUM7QUFwQkQsOEJBb0JDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLEdBQVc7SUFDekMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUZELDBDQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQVc7SUFDdkMsT0FBTyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsQ0FBQztBQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgS1YgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzJ1xuaW1wb3J0IHsgY2FjaGUgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcbmltcG9ydCB7IElDbG91ZGJhc2VDYWNoZSwgSUNhY2hlQ29uZmlnIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jYWNoZSdcblxuY29uc3QgVVNFUl9JTkZPX0tFWSA9ICd1c2VyX2luZm8nXG5cbmNvbnN0IHsgQ2xvdWRiYXNlQ2FjaGUgfSA9IGNhY2hlXG5cbmNvbnN0IGNhY2hlTWFwOiBLVjxJQ2xvdWRiYXNlQ2FjaGU+ID0ge31cbi8vIOacrOWcsOWtmOWCqFxuY29uc3QgbG9jYWxDYWNoZU1hcDogS1Y8SUNsb3VkYmFzZUNhY2hlPiA9IHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0Q2FjaGUoY29uZmlnOiBJQ2FjaGVDb25maWcgJiB7IGVudjogc3RyaW5nIH0pIHtcbiAgY29uc3QgeyBlbnYsIHBsYXRmb3JtSW5mbyB9ID0gY29uZmlnXG5cbiAgY29uc3QgdXNlckluZm9LZXkgPSBgJHtVU0VSX0lORk9fS0VZfV8ke2Vudn1gXG5cbiAgY29uc3Qga2V5cyA9IHtcbiAgICB1c2VySW5mb0tleSxcbiAgfVxuICAvLyDoi6XmjIflrpplbnblt7LlrZjlnKhjYWNoZeWImeWwneivleabtOaWsHBlcnNpc3RlbmNlXG4gIGNhY2hlTWFwW2Vudl0gPSBjYWNoZU1hcFtlbnZdIHx8IChuZXcgQ2xvdWRiYXNlQ2FjaGUoe1xuICAgIC4uLmNvbmZpZyxcbiAgICBrZXlzLFxuICAgIHBsYXRmb3JtSW5mbyxcbiAgfSkpXG4gIGxvY2FsQ2FjaGVNYXBbZW52XSA9IGxvY2FsQ2FjaGVNYXBbZW52XSB8fCBuZXcgQ2xvdWRiYXNlQ2FjaGUoe1xuICAgIC4uLmNvbmZpZyxcbiAgICBrZXlzLFxuICAgIHBsYXRmb3JtSW5mbyxcbiAgICBwZXJzaXN0ZW5jZTogJ2xvY2FsJyxcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlQnlFbnZJZChlbnY6IHN0cmluZyk6IElDbG91ZGJhc2VDYWNoZSB7XG4gIHJldHVybiBjYWNoZU1hcFtlbnZdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbENhY2hlKGVudjogc3RyaW5nKTogSUNsb3VkYmFzZUNhY2hlIHtcbiAgcmV0dXJuIGxvY2FsQ2FjaGVNYXBbZW52XVxufVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460199, function(require, module, exports) {

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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestByEnvId = exports.initRequest = exports.CloudbaseRequest = void 0;
var common_1 = require("../constants/common");
var utilities_1 = require("@cloudbase/utilities");
var cache_1 = require("./cache");
var adapter_1 = require("./adapter");
var ERRORS = utilities_1.constants.ERRORS;
var genSeqId = utilities_1.utils.genSeqId, isFormData = utilities_1.utils.isFormData, formatUrl = utilities_1.utils.formatUrl;
var ACTIONS_WITHOUT_ACCESSTOKEN = [
    'auth.getJwt',
    'auth.logout',
    'auth.signInWithTicket',
    'auth.signInAnonymously',
    'auth.signIn',
    'auth.fetchAccessTokenWithRefreshToken',
    'auth.signUpWithEmailAndPassword',
    'auth.activateEndUserMail',
    'auth.sendPasswordResetEmail',
    'auth.resetPasswordWithToken',
    'auth.isUsernameRegistered',
];
function bindHooks(instance, name, hooks) {
    var originMethod = instance[name];
    instance[name] = function (options) {
        var data = {};
        var headers = {};
        hooks.forEach(function (hook) {
            var _a = hook.call(instance, options), appendedData = _a.data, appendedHeaders = _a.headers;
            Object.assign(data, appendedData);
            Object.assign(headers, appendedHeaders);
        });
        var originData = options.data;
        originData
            && (function () {
                if (isFormData(originData)) {
                    Object.keys(data).forEach(function (key) {
                        originData.append(key, data[key]);
                    });
                    return;
                }
                options.data = __assign(__assign({}, originData), data);
            })();
        options.headers = __assign(__assign({}, (options.headers || {})), headers);
        return originMethod.call(instance, options);
    };
}
function beforeEach() {
    var seqId = genSeqId();
    return {
        data: {
            seqId: seqId,
        },
        headers: {
            'X-SDK-Version': "@cloudbase/js-sdk/".concat((0, common_1.getSdkVersion)()),
            'x-seqid': seqId,
        },
    };
}
var CloudbaseRequest = (function () {
    function CloudbaseRequest(config) {
        var _this = this;
        this.throwWhenRequestFail = false;
        this.config = config;
        var reqConfig = {
            timeout: this.config.timeout,
            timeoutMsg: "[@cloudbase/js-sdk] \u8BF7\u6C42\u5728".concat(this.config.timeout / 1000, "s\u5185\u672A\u5B8C\u6210\uFF0C\u5DF2\u4E2D\u65AD"),
            restrictedMethods: ['post', 'put'],
            auth: config.auth,
        };
        this.reqClass = new adapter_1.Platform.adapter.reqClass(reqConfig);
        this.throwWhenRequestFail = config.throw || false;
        this.localCache = (0, cache_1.getLocalCache)(this.config.env);
        if (this.config.endPointMode !== 'GATEWAY') {
            bindHooks(this.reqClass, 'post', [beforeEach]);
            bindHooks(this.reqClass, 'upload', [beforeEach]);
            bindHooks(this.reqClass, 'download', [beforeEach]);
        }
        utilities_1.langEvent.bus.on(utilities_1.langEvent.LANG_CHANGE_EVENT, function (params) {
            var _a;
            _this.config.i18n = ((_a = params.data) === null || _a === void 0 ? void 0 : _a.i18n) || _this.config.i18n;
        });
    }
    CloudbaseRequest.prototype.getAccessToken = function (token) {
        if (token === void 0) { token = null; }
        return __awaiter(this, void 0, void 0, function () {
            var app, oauthInstance, oauthClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (token != null) {
                            return [2, token];
                        }
                        app = this.config._fromApp;
                        if (!app.oauthInstance) {
                            throw new Error('you can\'t request without auth');
                        }
                        oauthInstance = app.oauthInstance;
                        oauthClient = oauthInstance.oauth2client;
                        return [4, this.getOauthAccessTokenV2(oauthClient)];
                    case 1: return [2, (_a.sent()).accessToken];
                }
            });
        });
    };
    CloudbaseRequest.prototype.getDefaultHeaders = function () {
        var _a;
        var _b, _c;
        return _a = {},
            _a[(_b = this.config.i18n) === null || _b === void 0 ? void 0 : _b.LANG_HEADER_KEY] = (_c = this.config.i18n) === null || _c === void 0 ? void 0 : _c.lang,
            _a['X-SDK-Version'] = "@cloudbase/js-sdk/".concat((0, common_1.getSdkVersion)()),
            _a;
    };
    CloudbaseRequest.prototype.post = function (options, customReqOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.reqClass.post(__assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), this.getDefaultHeaders()), customReqOpts: customReqOpts }))];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.upload = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.reqClass.upload(__assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), this.getDefaultHeaders()) }))];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.download = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.reqClass.download(__assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), this.getDefaultHeaders()) }))];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.getBaseEndPoint = function (endPointKey) {
        if (endPointKey === void 0) { endPointKey = 'CLOUD_API'; }
        return (0, common_1.getBaseEndPoint)(this.config.env, endPointKey);
    };
    CloudbaseRequest.prototype.getOauthAccessTokenV2 = function (oauthClient) {
        return __awaiter(this, void 0, void 0, function () {
            var validAccessToken, credentials;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, oauthClient.getAccessToken()];
                    case 1:
                        validAccessToken = _a.sent();
                        return [4, oauthClient.getCredentials()];
                    case 2:
                        credentials = _a.sent();
                        return [2, {
                                accessToken: validAccessToken,
                                accessTokenExpire: new Date(credentials.expires_at).getTime(),
                            }];
                }
            });
        });
    };
    CloudbaseRequest.prototype.request = function (action, params, options, customReqOpts) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var tcbTraceKey, contentType, tmpObj_1, app, oauthInstance, oauthClient, _c, payload_1, opts, traceHeader, parse, inQuery, search, formatQuery, endPointMode, url, BASE_URL, PROTOCOL, url_1, newUrl, res, resTraceHeader, err_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        tcbTraceKey = "x-tcb-trace_".concat(this.config.env);
                        contentType = 'application/x-www-form-urlencoded';
                        tmpObj_1 = __assign({ action: action, dataVersion: common_1.DATA_VERSION, env: this.config.env }, params);
                        if (!(ACTIONS_WITHOUT_ACCESSTOKEN.indexOf(action) === -1)) return [3, 2];
                        app = this.config._fromApp;
                        if (!app.oauthInstance) {
                            throw new Error('you can\'t request without auth');
                        }
                        oauthInstance = app.oauthInstance;
                        oauthClient = oauthInstance.oauth2client;
                        _c = tmpObj_1;
                        return [4, this.getOauthAccessTokenV2(oauthClient)];
                    case 1:
                        _c.access_token = (_d.sent()).accessToken;
                        _d.label = 2;
                    case 2:
                        if (action === 'storage.uploadFile') {
                            payload_1 = new FormData();
                            Object.keys(payload_1).forEach(function (key) {
                                if (Object.prototype.hasOwnProperty.call(payload_1, key) && payload_1[key] !== undefined) {
                                    payload_1.append(key, tmpObj_1[key]);
                                }
                            });
                            contentType = 'multipart/form-data';
                        }
                        else {
                            contentType = 'application/json;charset=UTF-8';
                            payload_1 = {};
                            Object.keys(tmpObj_1).forEach(function (key) {
                                if (tmpObj_1[key] !== undefined) {
                                    payload_1[key] = tmpObj_1[key];
                                }
                            });
                        }
                        opts = {
                            headers: __assign(__assign({ 'content-type': contentType }, this.getDefaultHeaders()), options === null || options === void 0 ? void 0 : options.headers),
                        };
                        if (options === null || options === void 0 ? void 0 : options.onUploadProgress) {
                            opts.onUploadProgress = options.onUploadProgress;
                        }
                        if (this.config.region) {
                            opts.headers['X-TCB-Region'] = this.config.region;
                        }
                        traceHeader = this.localCache.getStore(tcbTraceKey);
                        if (traceHeader) {
                            opts.headers['X-TCB-Trace'] = traceHeader;
                        }
                        parse = (options === null || options === void 0 ? void 0 : options.parse) !== undefined ? options.parse : params.parse;
                        inQuery = (options === null || options === void 0 ? void 0 : options.inQuery) !== undefined ? options.inQuery : params.inQuery;
                        search = (options === null || options === void 0 ? void 0 : options.search) !== undefined ? options.search : params.search;
                        formatQuery = __assign(__assign({}, ((options === null || options === void 0 ? void 0 : options.defaultQuery) || {})), { env: this.config.env });
                        parse && (formatQuery.parse = true);
                        inQuery
                            && (formatQuery = __assign(__assign({}, inQuery), formatQuery));
                        endPointMode = (options === null || options === void 0 ? void 0 : options.endPointMode) || this.config.endPointMode || 'CLOUD_API';
                        url = (0, common_1.getEndPointInfo)(this.config.env, endPointMode);
                        BASE_URL = url.baseUrl;
                        PROTOCOL = url.protocol;
                        if (endPointMode === 'GATEWAY') {
                            if (/^((database)\.)|(auth\.wsWebSign)/.test(action)) {
                                url_1 = (0, common_1.getEndPointInfo)(this.config.env, 'CLOUD_API');
                                BASE_URL = "".concat(url_1.baseUrl.match(/\/\/([^/?#]*)/)[0], "/web");
                            }
                        }
                        newUrl = void 0;
                        if (options.pathname) {
                            newUrl = formatUrl(PROTOCOL, "".concat((_a = (0, common_1.getBaseEndPoint)(this.config.env, endPointMode)) === null || _a === void 0 ? void 0 : _a.replace(/^https?:/, ''), "/").concat(options.pathname), formatQuery);
                        }
                        else {
                            newUrl = formatUrl(PROTOCOL, BASE_URL, formatQuery);
                        }
                        if (search) {
                            newUrl += search;
                        }
                        return [4, this.post(__assign({ url: newUrl, data: payload_1 }, opts), customReqOpts)];
                    case 3:
                        res = _d.sent();
                        resTraceHeader = (_b = res.header) === null || _b === void 0 ? void 0 : _b['x-tcb-trace'];
                        if (resTraceHeader) {
                            this.localCache.setStore(tcbTraceKey, resTraceHeader);
                        }
                        if ((Number(res.status) !== 200 && Number(res.statusCode) !== 200) || !res.data) {
                            throw new Error('network request error');
                        }
                        return [2, res];
                    case 4:
                        err_1 = _d.sent();
                        try {
                            err_1.requestId = err_1.requestId || (options === null || options === void 0 ? void 0 : options.headers['x-request-id']) || (options === null || options === void 0 ? void 0 : options.headers['X-Request-Id']) || '';
                        }
                        catch (error) { }
                        throw err_1;
                    case 5: return [2];
                }
            });
        });
    };
    CloudbaseRequest.prototype.fetch = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var token, _j, headers, restOptions, doFetch, result, err_2;
            var _this = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        token = options.token, _j = options.headers, headers = _j === void 0 ? {} : _j, restOptions = __rest(options, ["token", "headers"]);
                        doFetch = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            var _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _b = (_a = this.reqClass).fetch;
                                        _d = {};
                                        _e = { 'X-SDK-Version': "@cloudbase/js-sdk/".concat((0, common_1.getSdkVersion)()) };
                                        _c = "Bearer ".concat;
                                        return [4, this.getAccessToken(token)];
                                    case 1: return [2, _b.apply(_a, [__assign.apply(void 0, [(_d.headers = __assign.apply(void 0, [__assign.apply(void 0, [(_e.Authorization = _c.apply("Bearer ", [_f.sent()]), _e), this.getDefaultHeaders()]), headers]), _d), restOptions])])];
                                }
                            });
                        }); };
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 3, , 6]);
                        return [4, doFetch()];
                    case 2:
                        result = _k.sent();
                        return [2, result];
                    case 3:
                        err_2 = _k.sent();
                        try {
                            err_2.requestId = err_2.requestId || headers['x-request-id'] || headers['X-Request-Id'] || '';
                        }
                        catch (error) { }
                        if (!((err_2 === null || err_2 === void 0 ? void 0 : err_2.code) === 'ACCESS_TOKEN_EXPIRED')) return [3, 5];
                        if (typeof ((_d = (_c = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a._fromApp) === null || _b === void 0 ? void 0 : _b.oauthInstance) === null || _c === void 0 ? void 0 : _c.authApi) === null || _d === void 0 ? void 0 : _d.refreshTokenForce) !== 'function') {
                            throw err_2;
                        }
                        return [4, ((_h = (_g = (_f = (_e = this.config) === null || _e === void 0 ? void 0 : _e._fromApp) === null || _f === void 0 ? void 0 : _f.oauthInstance) === null || _g === void 0 ? void 0 : _g.authApi) === null || _h === void 0 ? void 0 : _h.refreshTokenForce())];
                    case 4:
                        _k.sent();
                        return [2, doFetch()];
                    case 5: throw err_2;
                    case 6: return [2];
                }
            });
        });
    };
    CloudbaseRequest.prototype.send = function (action, data, options, customReqOpts) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(action, data, __assign(__assign({}, options), { onUploadProgress: data.onUploadProgress }), customReqOpts)];
                    case 1:
                        response = _a.sent();
                        if (response.data.code && this.throwWhenRequestFail) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.OPERATION_FAIL,
                                msg: "[".concat(response.data.code, "] ").concat(response.data.message),
                            }));
                        }
                        return [2, response.data];
                }
            });
        });
    };
    CloudbaseRequest.prototype.gateWay = function (options, customReqOpts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var url, name, data, _b, path, method, _c, header, jsonData, requestId, _d, baseUrl, protocol, endpoint, isGetAndHead, dataParse_1, response, _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        url = options.url, name = options.name, data = options.data, _b = options.path, path = _b === void 0 ? '' : _b, method = options.method, _c = options.header, header = _c === void 0 ? {} : _c;
                        if ((!name || !path) && !url) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: '[gateWay] invalid function name or path or url',
                            }));
                        }
                        try {
                            jsonData = data ? JSON.stringify(data) : '';
                        }
                        catch (e) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: '[gateWay] invalid data',
                            }));
                        }
                        requestId = utilities_1.utils.generateRequestId();
                        _d = (0, common_1.getEndPointInfo)(this.config.env, 'GATEWAY'), baseUrl = _d.baseUrl, protocol = _d.protocol;
                        endpoint = "".concat(protocol).concat(baseUrl).concat(url || "/".concat(path, "/").concat(name));
                        isGetAndHead = ['GET', 'HEAD'].includes((_a = method === null || method === void 0 ? void 0 : method.toUpperCase) === null || _a === void 0 ? void 0 : _a.call(method));
                        if (isGetAndHead) {
                            try {
                                dataParse_1 = {};
                                try {
                                    dataParse_1 = JSON.parse(data);
                                }
                                catch (error) {
                                    dataParse_1 = data || {};
                                }
                                endpoint = "".concat(endpoint).concat(endpoint.includes('?') ? '&' : '?').concat(Object.keys(dataParse_1)
                                    .map(function (key) { return "".concat(key, "=").concat(dataParse_1[key]); })
                                    .join('&'));
                            }
                            catch (error) {
                            }
                        }
                        return [4, this.fetch(__assign(__assign({ method: method || 'POST', headers: __assign({ 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId }, header) }, (isGetAndHead ? {} : { body: jsonData })), { url: endpoint, customReqOpts: customReqOpts }))];
                    case 1:
                        response = _g.sent();
                        _e = [__assign({ requestId: requestId }, response)];
                        _f = {};
                        return [4, response.data];
                    case 2: return [2, __assign.apply(void 0, _e.concat([(_f.data = _g.sent(), _f)]))];
                }
            });
        });
    };
    return CloudbaseRequest;
}());
exports.CloudbaseRequest = CloudbaseRequest;
var requestMap = {};
function initRequest(config) {
    requestMap[config.env] = new CloudbaseRequest(__assign(__assign({}, config), { throw: true }));
}
exports.initRequest = initRequest;
function getRequestByEnvId(env) {
    return requestMap[env];
}
exports.getRequestByEnvId = getRequestByEnvId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWJzL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUFtRztBQVNuRyxrREFBa0U7QUFVbEUsaUNBQXVDO0FBQ3ZDLHFDQUFvQztBQUM1QixJQUFBLE1BQU0sR0FBSyxxQkFBUyxPQUFkLENBQWM7QUFDcEIsSUFBQSxRQUFRLEdBQTRCLGlCQUFLLFNBQWpDLEVBQUUsVUFBVSxHQUFnQixpQkFBSyxXQUFyQixFQUFFLFNBQVMsR0FBSyxpQkFBSyxVQUFWLENBQVU7QUFHakQsSUFBTSwyQkFBMkIsR0FBRztJQUNsQyxhQUFhO0lBQ2IsYUFBYTtJQUNiLHVCQUF1QjtJQUN2Qix3QkFBd0I7SUFDeEIsYUFBYTtJQUNiLHVDQUF1QztJQUN2QyxpQ0FBaUM7SUFDakMsMEJBQTBCO0lBQzFCLDZCQUE2QjtJQUM3Qiw2QkFBNkI7SUFDN0IsMkJBQTJCO0NBQzVCLENBQUE7QUFFRCxTQUFTLFNBQVMsQ0FBQyxRQUE2QixFQUFFLElBQVksRUFBRSxLQUEyQjtJQUN6RixJQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsT0FBd0I7UUFDakQsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQ1gsSUFBQSxLQUFtRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBdkUsWUFBWSxVQUFBLEVBQVcsZUFBZSxhQUFpQyxDQUFBO1lBQ3JGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFB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LEVBQ2pELGNBQWMsRUFBRSxTQUFTLElBQ3RCLE1BQU0sS0FFUixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxLQUMzQyxHQUFHLEVBQUUsUUFBUSxFQUNiLGFBQWEsZUFBQSxJQUNiLEVBQUE7O3dCQVZJLFFBQVEsR0FBRyxTQVVmO3lDQUVPLFNBQVMsV0FBQSxJQUFLLFFBQVE7O3dCQUFRLFdBQU0sUUFBUSxDQUFDLElBQUksRUFBQTs0QkFBMUQsOENBQWlDLE9BQUksR0FBRSxTQUFtQixVQUFFOzs7O0tBQzdEO0lBQ0gsdUJBQUM7QUFBRCxDQUFDLEFBdldELElBdVdDO0FBdldZLDRDQUFnQjtBQXlXN0IsSUFBTSxVQUFVLEdBQXlCLEVBQUUsQ0FBQTtBQUUzQyxTQUFnQixXQUFXLENBQUMsTUFBK0I7SUFDekQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLGdCQUFnQix1QkFDeEMsTUFBTSxLQUNULEtBQUssRUFBRSxJQUFJLElBQ1gsQ0FBQTtBQUNKLENBQUM7QUFMRCxrQ0FLQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLEdBQVc7SUFDM0MsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDeEIsQ0FBQztBQUZELDhDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgREFUQV9WRVJTSU9OLCBnZXRTZGtWZXJzaW9uLCBnZXRCYXNlRW5kUG9pbnQsIGdldEVuZFBvaW50SW5mbyB9IGZyb20gJy4uL2NvbnN0YW50cy9jb21tb24nXG5pbXBvcnQge1xuICBJUmVxdWVzdE9wdGlvbnMsXG4gIFNES1JlcXVlc3RJbnRlcmZhY2UsXG4gIFJlc3BvbnNlT2JqZWN0LFxuICBJVXBsb2FkUmVxdWVzdE9wdGlvbnMsXG4gIElSZXF1ZXN0Q29uZmlnLFxuICBJRmV0Y2hPcHRpb25zLFxufSBmcm9tICdAY2xvdWRiYXNlL2FkYXB0ZXItaW50ZXJmYWNlJ1xuaW1wb3J0IHsgdXRpbHMsIGNvbnN0YW50cywgbGFuZ0V2ZW50IH0gZnJvbSAnQGNsb3VkYmFzZS91dGlsaXRpZXMnXG5pbXBvcnQgeyBFbmRQb2ludEtleSwgS1YgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzJ1xuaW1wb3J0IHsgSUN1c3RvbVJlcU9wdHMgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2Z1bmN0aW9ucydcbmltcG9ydCB7XG4gIElHZXRBY2Nlc3NUb2tlblJlc3VsdCxcbiAgSUNsb3VkYmFzZVJlcXVlc3RDb25maWcsXG4gIElBcHBlbmRlZFJlcXVlc3RJbmZvLFxuICBJUmVxdWVzdEJlZm9yZUhvb2ssXG59IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvcmVxdWVzdCdcbmltcG9ydCB7IElDbG91ZGJhc2VDYWNoZSB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvY2FjaGUnXG5pbXBvcnQgeyBnZXRMb2NhbENhY2hlIH0gZnJvbSAnLi9jYWNoZSdcbmltcG9ydCB7IFBsYXRmb3JtIH0gZnJvbSAnLi9hZGFwdGVyJ1xuY29uc3QgeyBFUlJPUlMgfSA9IGNvbnN0YW50c1xuY29uc3QgeyBnZW5TZXFJZCwgaXNGb3JtRGF0YSwgZm9ybWF0VXJsIH0gPSB1dGlsc1xuXG4vLyDkuIvpnaLlh6Dnp40gYWN0aW9uIOS4jemcgOimgSBhY2Nlc3MgdG9rZW5cbmNvbnN0IEFDVElPTlNfV0lUSE9VVF9BQ0NFU1NUT0tFTiA9IFtcbiAgJ2F1dGguZ2V0Snd0JyxcbiAgJ2F1dGgubG9nb3V0JyxcbiAgJ2F1dGguc2lnbkluV2l0aFRpY2tldCcsXG4gICdhdXRoLnNpZ25JbkFub255bW91c2x5JyxcbiAgJ2F1dGguc2lnbkluJyxcbiAgJ2F1dGguZmV0Y2hBY2Nlc3NUb2tlbldpdGhSZWZyZXNoVG9rZW4nLFxuICAnYXV0aC5zaWduVXBXaXRoRW1haWxBbmRQYXNzd29yZCcsXG4gICdhdXRoLmFjdGl2YXRlRW5kVXNlck1haWwnLFxuICAnYXV0aC5zZW5kUGFzc3dvcmRSZXNldEVtYWlsJyxcbiAgJ2F1dGgucmVzZXRQYXNzd29yZFdpdGhUb2tlbicsXG4gICdhdXRoLmlzVXNlcm5hbWVSZWdpc3RlcmVkJyxcbl1cblxuZnVuY3Rpb24gYmluZEhvb2tzKGluc3RhbmNlOiBTREtSZXF1ZXN0SW50ZXJmYWNlLCBuYW1lOiBzdHJpbmcsIGhvb2tzOiBJUmVxdWVzdEJlZm9yZUhvb2tbXSkge1xuICBjb25zdCBvcmlnaW5NZXRob2QgPSBpbnN0YW5jZVtuYW1lXVxuICBpbnN0YW5jZVtuYW1lXSA9IGZ1bmN0aW9uIChvcHRpb25zOiBJUmVxdWVzdE9wdGlvbnMpIHtcbiAgICBjb25zdCBkYXRhID0ge31cbiAgICBjb25zdCBoZWFkZXJzID0ge31cbiAgICBob29rcy5mb3JFYWNoKChob29rKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGE6IGFwcGVuZGVkRGF0YSwgaGVhZGVyczogYXBwZW5kZWRIZWFkZXJzIH0gPSBob29rLmNhbGwoaW5zdGFuY2UsIG9wdGlvbnMpXG4gICAgICBPYmplY3QuYXNzaWduKGRhdGEsIGFwcGVuZGVkRGF0YSlcbiAgICAgIE9iamVjdC5hc3NpZ24oaGVhZGVycywgYXBwZW5kZWRIZWFkZXJzKVxuICAgIH0pXG4gICAgY29uc3Qgb3JpZ2luRGF0YSA9IG9wdGlvbnMuZGF0YVxuICAgIG9yaWdpbkRhdGFcbiAgICAgICYmICgoKSA9PiB7XG4gICAgICAgIGlmIChpc0Zvcm1EYXRhKG9yaWdpbkRhdGEpKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAob3JpZ2luRGF0YSBhcyBGb3JtRGF0YSkuYXBwZW5kKGtleSwgZGF0YVtrZXldKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy5kYXRhID0ge1xuICAgICAgICAgIC4uLm9yaWdpbkRhdGEsXG4gICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgfVxuICAgICAgfSkoKVxuICAgIG9wdGlvbnMuaGVhZGVycyA9IHtcbiAgICAgIC4uLihvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuICAgICAgLi4uaGVhZGVycyxcbiAgICB9XG4gICAgcmV0dXJuIChvcmlnaW5NZXRob2QgYXMgRnVuY3Rpb24pLmNhbGwoaW5zdGFuY2UsIG9wdGlvbnMpXG4gIH1cbn1cbmZ1bmN0aW9uIGJlZm9yZUVhY2goKTogSUFwcGVuZGVkUmVxdWVzdEluZm8ge1xuICBjb25zdCBzZXFJZCA9IGdlblNlcUlkKClcbiAgcmV0dXJuIHtcbiAgICBkYXRhOiB7XG4gICAgICBzZXFJZCxcbiAgICB9LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdYLVNESy1WZXJzaW9uJzogYEBjbG91ZGJhc2UvanMtc2RrLyR7Z2V0U2RrVmVyc2lvbigpfWAsXG4gICAgICAneC1zZXFpZCc6IHNlcUlkLFxuICAgIH0sXG4gIH1cbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUdhdGVXYXlPcHRpb25zIHtcbiAgbmFtZT86IHN0cmluZ1xuICBkYXRhPzogYW55XG4gIHBhdGg/OiBzdHJpbmdcbiAgbWV0aG9kOiBzdHJpbmdcbiAgaGVhZGVyPzoge31cbiAgdXJsPzogc3RyaW5nXG59XG5leHBvcnQgaW50ZXJmYWNlIElDbG91ZGJhc2VSZXF1ZXN0IHtcbiAgcG9zdDogKG9wdGlvbnM6IElSZXF1ZXN0T3B0aW9ucykgPT4gUHJvbWlzZTxSZXNwb25zZU9iamVjdD5cbiAgdXBsb2FkOiAob3B0aW9uczogSVVwbG9hZFJlcXVlc3RPcHRpb25zKSA9PiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PlxuICBkb3dubG9hZDogKG9wdGlvbnM6IElSZXF1ZXN0T3B0aW9ucykgPT4gUHJvbWlzZTxSZXNwb25zZU9iamVjdD5cbiAgcmVxdWVzdDogKGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IEtWPGFueT4sIG9wdGlvbnM/OiBLVjxhbnk+KSA9PiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PlxuICBzZW5kOiAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IEtWPGFueT4pID0+IFByb21pc2U8YW55PlxuICBmZXRjaDogKG9wdGlvbnM6IElGZXRjaE9wdGlvbnMpID0+IFByb21pc2U8UmVzcG9uc2VPYmplY3Q+XG59XG5cbi8qKlxuICogQGNsYXNzIENsb3VkYmFzZVJlcXVlc3RcbiAqL1xuZXhwb3J0IGNsYXNzIENsb3VkYmFzZVJlcXVlc3QgaW1wbGVtZW50cyBJQ2xvdWRiYXNlUmVxdWVzdCB7XG4gIGNvbmZpZzogSUNsb3VkYmFzZVJlcXVlc3RDb25maWdcbiAgcHJpdmF0ZSByZXFDbGFzczogU0RLUmVxdWVzdEludGVyZmFjZVxuICAvLyDor7fmsYLlpLHotKXmmK/lkKbmipvlh7pFcnJvclxuICBwcml2YXRlIHRocm93V2hlblJlcXVlc3RGYWlsID0gZmFsc2VcbiAgLy8g5oyB5LmF5YyW5pys5Zyw5a2Y5YKoXG4gIHByaXZhdGUgbG9jYWxDYWNoZTogSUNsb3VkYmFzZUNhY2hlXG4gIC8qKlxuICAgKiDliJ3lp4vljJZcbiAgICogQHBhcmFtIGNvbmZpZ1xuICAgKi9cbiAgY29uc3RydWN0b3IoY29uZmlnOiBJQ2xvdWRiYXNlUmVxdWVzdENvbmZpZyAmIHsgdGhyb3c/OiBib29sZWFuIH0pIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZ1xuICAgIGNvbnN0IHJlcUNvbmZpZzogSVJlcXVlc3RDb25maWcgJiB7IGF1dGg6IElDbG91ZGJhc2VSZXF1ZXN0Q29uZmlnWydhdXRoJ10gfSA9IHtcbiAgICAgIHRpbWVvdXQ6IHRoaXMuY29uZmlnLnRpbWVvdXQsXG4gICAgICB0aW1lb3V0TXNnOiBgW0BjbG91ZGJhc2UvanMtc2RrXSDor7fmsYLlnKgke3RoaXMuY29uZmlnLnRpbWVvdXQgLyAxMDAwfXPlhoXmnKrlrozmiJDvvIzlt7LkuK3mlq1gLFxuICAgICAgcmVzdHJpY3RlZE1ldGhvZHM6IFsncG9zdCcsICdwdXQnXSxcbiAgICAgIGF1dGg6IGNvbmZpZy5hdXRoLFxuICAgIH1cbiAgICB0aGlzLnJlcUNsYXNzID0gbmV3IFBsYXRmb3JtLmFkYXB0ZXIucmVxQ2xhc3MocmVxQ29uZmlnKVxuICAgIHRoaXMudGhyb3dXaGVuUmVxdWVzdEZhaWwgPSBjb25maWcudGhyb3cgfHwgZmFsc2VcbiAgICB0aGlzLmxvY2FsQ2FjaGUgPSBnZXRMb2NhbENhY2hlKHRoaXMuY29uZmlnLmVudilcblxuICAgIGlmICh0aGlzLmNvbmZpZy5lbmRQb2ludE1vZGUgIT09ICdHQVRFV0FZJykge1xuICAgICAgYmluZEhvb2tzKHRoaXMucmVxQ2xhc3MsICdwb3N0JywgW2JlZm9yZUVhY2hdKVxuICAgICAgYmluZEhvb2tzKHRoaXMucmVxQ2xhc3MsICd1cGxvYWQnLCBbYmVmb3JlRWFjaF0pXG4gICAgICBiaW5kSG9va3ModGhpcy5yZXFDbGFzcywgJ2Rvd25sb2FkJywgW2JlZm9yZUVhY2hdKVxuICAgIH1cblxuICAgIGxhbmdFdmVudC5idXMub24obGFuZ0V2ZW50LkxBTkdfQ0hBTkdFX0VWRU5ULCAocGFyYW1zKSA9PiB7XG4gICAgICB0aGlzLmNvbmZpZy5pMThuID0gcGFyYW1zLmRhdGE/LmkxOG4gfHwgdGhpcy5jb25maWcuaTE4blxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QWNjZXNzVG9rZW4odG9rZW4gPSBudWxsKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuICAgIGlmICh0b2tlbiAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdG9rZW5cbiAgICB9XG4gICAgY29uc3QgYXBwID0gdGhpcy5jb25maWcuX2Zyb21BcHBcblxuICAgIGlmICghYXBwLm9hdXRoSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigneW91IGNhblxcJ3QgcmVxdWVzdCB3aXRob3V0IGF1dGgnKVxuICAgIH1cblxuICAgIGNvbnN0IHsgb2F1dGhJbnN0YW5jZSB9ID0gYXBwXG4gICAgY29uc3Qgb2F1dGhDbGllbnQgPSBvYXV0aEluc3RhbmNlLm9hdXRoMmNsaWVudFxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRPYXV0aEFjY2Vzc1Rva2VuVjIob2F1dGhDbGllbnQpKS5hY2Nlc3NUb2tlblxuICB9XG5cbiAgcHVibGljIGdldERlZmF1bHRIZWFkZXJzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy5jb25maWcuaTE4bj8uTEFOR19IRUFERVJfS0VZXTogdGhpcy5jb25maWcuaTE4bj8ubGFuZyxcbiAgICAgICdYLVNESy1WZXJzaW9uJzogYEBjbG91ZGJhc2UvanMtc2RrLyR7Z2V0U2RrVmVyc2lvbigpfWAsXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHBvc3Qob3B0aW9uczogSVJlcXVlc3RPcHRpb25zLCBjdXN0b21SZXFPcHRzPzogSUN1c3RvbVJlcU9wdHMpOiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5yZXFDbGFzcy5wb3N0KHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBoZWFkZXJzOiB7IC4uLm9wdGlvbnMuaGVhZGVycywgLi4udGhpcy5nZXREZWZhdWx0SGVhZGVycygpIH0sXG4gICAgICBjdXN0b21SZXFPcHRzLFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc1xuICB9XG4gIHB1YmxpYyBhc3luYyB1cGxvYWQob3B0aW9uczogSVVwbG9hZFJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxSZXNwb25zZU9iamVjdD4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMucmVxQ2xhc3MudXBsb2FkKHsgLi4ub3B0aW9ucywgaGVhZGVyczogeyAuLi5vcHRpb25zLmhlYWRlcnMsIC4uLnRoaXMuZ2V0RGVmYXVsdEhlYWRlcnMoKSB9IH0pXG4gICAgcmV0dXJuIHJlc1xuICB9XG4gIHB1YmxpYyBhc3luYyBkb3dubG9hZChvcHRpb25zOiBJUmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5yZXFDbGFzcy5kb3dubG9hZCh7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgaGVhZGVyczogeyAuLi5vcHRpb25zLmhlYWRlcnMsIC4uLnRoaXMuZ2V0RGVmYXVsdEhlYWRlcnMoKSB9LFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgcHVibGljIGdldEJhc2VFbmRQb2ludChlbmRQb2ludEtleTogRW5kUG9pbnRLZXkgPSAnQ0xPVURfQVBJJykge1xuICAgIHJldHVybiBnZXRCYXNlRW5kUG9pbnQodGhpcy5jb25maWcuZW52LCBlbmRQb2ludEtleSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRPYXV0aEFjY2Vzc1Rva2VuVjIob2F1dGhDbGllbnQ6IGFueSk6IFByb21pc2U8SUdldEFjY2Vzc1Rva2VuUmVzdWx0PiB7XG4gICAgY29uc3QgdmFsaWRBY2Nlc3NUb2tlbiA9IGF3YWl0IG9hdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKClcbiAgICBjb25zdCBjcmVkZW50aWFscyA9IGF3YWl0IG9hdXRoQ2xpZW50LmdldENyZWRlbnRpYWxzKClcbiAgICByZXR1cm4ge1xuICAgICAgYWNjZXNzVG9rZW46IHZhbGlkQWNjZXNzVG9rZW4sXG4gICAgICBhY2Nlc3NUb2tlbkV4cGlyZTogbmV3IERhdGUoY3JlZGVudGlhbHMuZXhwaXJlc19hdCkuZ2V0VGltZSgpLFxuICAgIH1cbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgcHVibGljIGFzeW5jIHJlcXVlc3QoXG4gICAgYWN0aW9uOiBzdHJpbmcsXG4gICAgcGFyYW1zOiBLVjxhbnk+LFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBvblVwbG9hZFByb2dyZXNzPzogRnVuY3Rpb25cbiAgICAgIHBhdGhuYW1lPzogc3RyaW5nXG4gICAgICBwYXJzZT86IGJvb2xlYW5cbiAgICAgIGluUXVlcnk/OiBLVjxhbnk+XG4gICAgICBzZWFyY2g/OiBzdHJpbmdcbiAgICAgIGRlZmF1bHRRdWVyeT86IEtWPGFueT5cbiAgICAgIGhlYWRlcnM/OiBLVjxzdHJpbmc+XG4gICAgICBlbmRQb2ludE1vZGU/OiAnQ0xPVURfQVBJJyB8ICdHQVRFV0FZJ1xuICAgIH0sXG4gICAgY3VzdG9tUmVxT3B0cz86IElDdXN0b21SZXFPcHRzLFxuICApOiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRjYlRyYWNlS2V5ID0gYHgtdGNiLXRyYWNlXyR7dGhpcy5jb25maWcuZW52fWBcbiAgICAgIGxldCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG5cbiAgICAgIGNvbnN0IHRtcE9iajogS1Y8YW55PiA9IHtcbiAgICAgICAgYWN0aW9uLFxuICAgICAgICBkYXRhVmVyc2lvbjogREFUQV9WRVJTSU9OLFxuICAgICAgICBlbnY6IHRoaXMuY29uZmlnLmVudixcbiAgICAgICAgLi4ucGFyYW1zLFxuICAgICAgfVxuXG4gICAgICBpZiAoQUNUSU9OU19XSVRIT1VUX0FDQ0VTU1RPS0VOLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEpIHtcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5jb25maWcuX2Zyb21BcHBcblxuICAgICAgICBpZiAoIWFwcC5vYXV0aEluc3RhbmNlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd5b3UgY2FuXFwndCByZXF1ZXN0IHdpdGhvdXQgYXV0aCcpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IG9hdXRoSW5zdGFuY2UgfSA9IGFwcFxuICAgICAgICBjb25zdCBvYXV0aENsaWVudCA9IG9hdXRoSW5zdGFuY2Uub2F1dGgyY2xpZW50XG4gICAgICAgIHRtcE9iai5hY2Nlc3NfdG9rZW4gPSAoYXdhaXQgdGhpcy5nZXRPYXV0aEFjY2Vzc1Rva2VuVjIob2F1dGhDbGllbnQpKS5hY2Nlc3NUb2tlblxuICAgICAgfVxuXG4gICAgICAvLyDmi7xib2R55ZKMY29udGVudC10eXBlXG4gICAgICBsZXQgcGF5bG9hZFxuICAgICAgaWYgKGFjdGlvbiA9PT0gJ3N0b3JhZ2UudXBsb2FkRmlsZScpIHtcbiAgICAgICAgcGF5bG9hZCA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICAgIE9iamVjdC5rZXlzKHBheWxvYWQpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocGF5bG9hZCwga2V5KSAmJiBwYXlsb2FkW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcGF5bG9hZC5hcHBlbmQoa2V5LCB0bXBPYmpba2V5XSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnRlbnRUeXBlID0gJ211bHRpcGFydC9mb3JtLWRhdGEnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnXG4gICAgICAgIHBheWxvYWQgPSB7fVxuICAgICAgICBPYmplY3Qua2V5cyh0bXBPYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgIGlmICh0bXBPYmpba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwYXlsb2FkW2tleV0gPSB0bXBPYmpba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wdHM6IGFueSA9IHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdjb250ZW50LXR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAuLi50aGlzLmdldERlZmF1bHRIZWFkZXJzKCksXG4gICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zPy5vblVwbG9hZFByb2dyZXNzKSB7XG4gICAgICAgIG9wdHMub25VcGxvYWRQcm9ncmVzcyA9IG9wdGlvbnMub25VcGxvYWRQcm9ncmVzc1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcucmVnaW9uKSB7XG4gICAgICAgIG9wdHMuaGVhZGVyc1snWC1UQ0ItUmVnaW9uJ10gPSB0aGlzLmNvbmZpZy5yZWdpb25cbiAgICAgIH1cblxuICAgICAgY29uc3QgdHJhY2VIZWFkZXIgPSB0aGlzLmxvY2FsQ2FjaGUuZ2V0U3RvcmUodGNiVHJhY2VLZXkpXG4gICAgICBpZiAodHJhY2VIZWFkZXIpIHtcbiAgICAgICAgb3B0cy5oZWFkZXJzWydYLVRDQi1UcmFjZSddID0gdHJhY2VIZWFkZXJcbiAgICAgIH1cblxuICAgICAgLy8g5Y+R5Ye66K+35rGCXG4gICAgICAvLyDmlrDnmoQgdXJsIOmcgOimgeaQuuW4piBlbnYg5Y+C5pWw6L+b6KGMIENPUlMg5qCh6aqMXG4gICAgICAvLyDor7fmsYLpk77mjqXmlK/mjIHmt7vliqDliqjmgIEgcXVlcnkg5Y+C5pWw77yM5pa55L6/55So5oi36LCD6K+V5a6a5L2N6K+35rGCXG4gICAgICBjb25zdCBwYXJzZSA9IG9wdGlvbnM/LnBhcnNlICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnBhcnNlIDogcGFyYW1zLnBhcnNlXG4gICAgICBjb25zdCBpblF1ZXJ5ID0gb3B0aW9ucz8uaW5RdWVyeSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5pblF1ZXJ5IDogcGFyYW1zLmluUXVlcnlcbiAgICAgIGNvbnN0IHNlYXJjaCA9IG9wdGlvbnM/LnNlYXJjaCAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5zZWFyY2ggOiBwYXJhbXMuc2VhcmNoXG5cbiAgICAgIGxldCBmb3JtYXRRdWVyeTogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcbiAgICAgICAgLi4uKG9wdGlvbnM/LmRlZmF1bHRRdWVyeSB8fCB7fSksXG4gICAgICAgIGVudjogdGhpcy5jb25maWcuZW52LFxuICAgICAgfVxuICAgICAgLy8g5bCd6K+V6Kej5p6Q5ZON5bqU5pWw5o2u5Li6IEpTT05cbiAgICAgIHBhcnNlICYmIChmb3JtYXRRdWVyeS5wYXJzZSA9IHRydWUpXG4gICAgICBpblF1ZXJ5XG4gICAgICAgICYmIChmb3JtYXRRdWVyeSA9IHtcbiAgICAgICAgICAuLi5pblF1ZXJ5LFxuICAgICAgICAgIC4uLmZvcm1hdFF1ZXJ5LFxuICAgICAgICB9KVxuXG4gICAgICBjb25zdCBlbmRQb2ludE1vZGUgPSBvcHRpb25zPy5lbmRQb2ludE1vZGUgfHwgdGhpcy5jb25maWcuZW5kUG9pbnRNb2RlIHx8ICdDTE9VRF9BUEknXG5cbiAgICAgIGNvbnN0IHVybCA9IGdldEVuZFBvaW50SW5mbyh0aGlzLmNvbmZpZy5lbnYsIGVuZFBvaW50TW9kZSlcbiAgICAgIGxldCBCQVNFX1VSTCA9IHVybC5iYXNlVXJsXG4gICAgICBjb25zdCBQUk9UT0NPTCA9IHVybC5wcm90b2NvbFxuXG4gICAgICBpZiAoZW5kUG9pbnRNb2RlID09PSAnR0FURVdBWScpIHtcbiAgICAgICAgaWYgKC9eKChkYXRhYmFzZSlcXC4pfChhdXRoXFwud3NXZWJTaWduKS8udGVzdChhY3Rpb24pKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gZ2V0RW5kUG9pbnRJbmZvKHRoaXMuY29uZmlnLmVudiwgJ0NMT1VEX0FQSScpXG4gICAgICAgICAgQkFTRV9VUkwgPSBgJHt1cmwuYmFzZVVybC5tYXRjaCgvXFwvXFwvKFteLz8jXSopLylbMF19L3dlYmBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyDnlJ/miJDor7fmsYIgdXJsXG4gICAgICBsZXQgbmV3VXJsXG4gICAgICBpZiAob3B0aW9ucy5wYXRobmFtZSkge1xuICAgICAgICBuZXdVcmwgPSBmb3JtYXRVcmwoXG4gICAgICAgICAgUFJPVE9DT0wsXG4gICAgICAgICAgYCR7Z2V0QmFzZUVuZFBvaW50KHRoaXMuY29uZmlnLmVudiwgZW5kUG9pbnRNb2RlKT8ucmVwbGFjZSgvXmh0dHBzPzovLCAnJyl9LyR7b3B0aW9ucy5wYXRobmFtZX1gLFxuICAgICAgICAgIGZvcm1hdFF1ZXJ5LFxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdVcmwgPSBmb3JtYXRVcmwoUFJPVE9DT0wsIEJBU0VfVVJMLCBmb3JtYXRRdWVyeSlcbiAgICAgIH1cblxuICAgICAgaWYgKHNlYXJjaCkge1xuICAgICAgICBuZXdVcmwgKz0gc2VhcmNoXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlczogUmVzcG9uc2VPYmplY3QgPSBhd2FpdCB0aGlzLnBvc3QoXG4gICAgICAgIHtcbiAgICAgICAgICB1cmw6IG5ld1VybCxcbiAgICAgICAgICBkYXRhOiBwYXlsb2FkLFxuICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgIH0sXG4gICAgICAgIGN1c3RvbVJlcU9wdHMsXG4gICAgICApXG5cbiAgICAgIC8vIOS/neWtmCB0cmFjZSBoZWFkZXJcbiAgICAgIGNvbnN0IHJlc1RyYWNlSGVhZGVyID0gcmVzLmhlYWRlcj8uWyd4LXRjYi10cmFjZSddXG4gICAgICBpZiAocmVzVHJhY2VIZWFkZXIpIHtcbiAgICAgICAgdGhpcy5sb2NhbENhY2hlLnNldFN0b3JlKHRjYlRyYWNlS2V5LCByZXNUcmFjZUhlYWRlcilcbiAgICAgIH1cblxuICAgICAgaWYgKChOdW1iZXIocmVzLnN0YXR1cykgIT09IDIwMCAmJiBOdW1iZXIocmVzLnN0YXR1c0NvZGUpICE9PSAyMDApIHx8ICFyZXMuZGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25ldHdvcmsgcmVxdWVzdCBlcnJvcicpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVyci5yZXF1ZXN0SWQgPSBlcnIucmVxdWVzdElkIHx8IG9wdGlvbnM/LmhlYWRlcnNbJ3gtcmVxdWVzdC1pZCddIHx8IG9wdGlvbnM/LmhlYWRlcnNbJ1gtUmVxdWVzdC1JZCddIHx8ICcnXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmZXRjaChvcHRpb25zOiBJRmV0Y2hPcHRpb25zICYgeyB0b2tlbj86IHN0cmluZzsgY3VzdG9tUmVxT3B0cz86IElDdXN0b21SZXFPcHRzIH0sKTogUHJvbWlzZTxSZXNwb25zZU9iamVjdD4ge1xuICAgIGNvbnN0IHsgdG9rZW4sIGhlYWRlcnMgPSB7fSwgLi4ucmVzdE9wdGlvbnMgfSA9IG9wdGlvbnNcblxuICAgIGNvbnN0IGRvRmV0Y2ggPSBhc3luYyAoKSA9PiB0aGlzLnJlcUNsYXNzLmZldGNoKHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgLy8gJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgLy8gJ1gtUmVxdWVzdC1JZCc6IGAke3V0aWxzLmdlbmVyYXRlUmVxdWVzdElkKCl9YCxcbiAgICAgICAgLy8gJ1gtUmVxdWVzdC1UaW1lc3RhbXAnOiBgJHtEYXRlLm5vdygpfWAsXG4gICAgICAgICdYLVNESy1WZXJzaW9uJzogYEBjbG91ZGJhc2UvanMtc2RrLyR7Z2V0U2RrVmVyc2lvbigpfWAsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKHRva2VuKX1gLFxuICAgICAgICAuLi50aGlzLmdldERlZmF1bHRIZWFkZXJzKCksXG4gICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICB9LFxuICAgICAgLi4ucmVzdE9wdGlvbnMsXG4gICAgfSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb0ZldGNoKClcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVyci5yZXF1ZXN0SWQgPSBlcnIucmVxdWVzdElkIHx8IGhlYWRlcnNbJ3gtcmVxdWVzdC1pZCddIHx8IGhlYWRlcnNbJ1gtUmVxdWVzdC1JZCddIHx8ICcnXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgIGlmIChlcnI/LmNvZGUgPT09ICdBQ0NFU1NfVE9LRU5fRVhQSVJFRCcpIHtcbiAgICAgICAgLy8g5aaC5p6c5piv5Zug5Li6IHRva2VuIOi/h+acn+Wksei0pe+8jOWItyB0b2tlbiDlkI7lho3or5XkuIDmrKFcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZz8uX2Zyb21BcHA/Lm9hdXRoSW5zdGFuY2U/LmF1dGhBcGk/LnJlZnJlc2hUb2tlbkZvcmNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5jb25maWc/Ll9mcm9tQXBwPy5vYXV0aEluc3RhbmNlPy5hdXRoQXBpPy5yZWZyZXNoVG9rZW5Gb3JjZSgpXG4gICAgICAgIHJldHVybiBkb0ZldGNoKClcbiAgICAgIH1cbiAgICAgIC8vIOWFtuS7luWOn+WboOWQkeS4iuaKm+WHulxuXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2VuZChcbiAgICBhY3Rpb246IHN0cmluZyxcbiAgICBkYXRhOiBLVjxhbnk+ID0ge30sXG4gICAgb3B0aW9uczogS1Y8YW55PiA9IHt9LFxuICAgIGN1c3RvbVJlcU9wdHM/OiBJQ3VzdG9tUmVxT3B0cyxcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIGFjdGlvbixcbiAgICAgIGRhdGEsXG4gICAgICB7IC4uLm9wdGlvbnMsIG9uVXBsb2FkUHJvZ3Jlc3M6IGRhdGEub25VcGxvYWRQcm9ncmVzcyB9LFxuICAgICAgY3VzdG9tUmVxT3B0cyxcbiAgICApXG5cbiAgICBpZiAocmVzcG9uc2UuZGF0YS5jb2RlICYmIHRoaXMudGhyb3dXaGVuUmVxdWVzdEZhaWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNvZGU6IEVSUk9SUy5PUEVSQVRJT05fRkFJTCxcbiAgICAgICAgbXNnOiBgWyR7cmVzcG9uc2UuZGF0YS5jb2RlfV0gJHtyZXNwb25zZS5kYXRhLm1lc3NhZ2V9YCxcbiAgICAgIH0pLClcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdhdGVXYXkob3B0aW9uczogSUdhdGVXYXlPcHRpb25zLCBjdXN0b21SZXFPcHRzPzogSUN1c3RvbVJlcU9wdHMpIHtcbiAgICBjb25zdCB7IHVybCwgbmFtZSwgZGF0YSwgcGF0aCA9ICcnLCBtZXRob2QsIGhlYWRlciA9IHt9IH0gPSBvcHRpb25zXG5cbiAgICBpZiAoKCFuYW1lIHx8ICFwYXRoKSAmJiAhdXJsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjb2RlOiBFUlJPUlMuSU5WQUxJRF9QQVJBTVMsXG4gICAgICAgIG1zZzogJ1tnYXRlV2F5XSBpbnZhbGlkIGZ1bmN0aW9uIG5hbWUgb3IgcGF0aCBvciB1cmwnLFxuICAgICAgfSksKVxuICAgIH1cbiAgICBsZXQganNvbkRhdGFcbiAgICB0cnkge1xuICAgICAganNvbkRhdGEgPSBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiAnJ1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX1BBUkFNUyxcbiAgICAgICAgbXNnOiAnW2dhdGVXYXldIGludmFsaWQgZGF0YScsXG4gICAgICB9KSwpXG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdElkID0gdXRpbHMuZ2VuZXJhdGVSZXF1ZXN0SWQoKVxuICAgIGNvbnN0IHsgYmFzZVVybCwgcHJvdG9jb2wgfSA9IGdldEVuZFBvaW50SW5mbyh0aGlzLmNvbmZpZy5lbnYsICdHQVRFV0FZJylcbiAgICBsZXQgZW5kcG9pbnQgPSBgJHtwcm90b2NvbH0ke2Jhc2VVcmx9JHt1cmwgfHwgYC8ke3BhdGh9LyR7bmFtZX1gfWBcblxuICAgIGNvbnN0IGlzR2V0QW5kSGVhZCA9IFsnR0VUJywgJ0hFQUQnXS5pbmNsdWRlcyhtZXRob2Q/LnRvVXBwZXJDYXNlPy4oKSlcblxuICAgIGlmIChpc0dldEFuZEhlYWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBkYXRhUGFyc2UgPSB7fVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGFQYXJzZSA9IEpTT04ucGFyc2UoZGF0YSBhcyBhbnkpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgZGF0YVBhcnNlID0gZGF0YSB8fCB7fVxuICAgICAgICB9XG4gICAgICAgIGVuZHBvaW50ID0gYCR7ZW5kcG9pbnR9JHtlbmRwb2ludC5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nfSR7T2JqZWN0LmtleXMoZGF0YVBhcnNlKVxuICAgICAgICAgIC5tYXAoa2V5ID0+IGAke2tleX09JHtkYXRhUGFyc2Vba2V5XX1gKVxuICAgICAgICAgIC5qb2luKCcmJyl9YFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy9cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZmV0Y2goe1xuICAgICAgbWV0aG9kOiBtZXRob2QgfHwgJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAgICAgICAnWC1SZXF1ZXN0LUlkJzogcmVxdWVzdElkLFxuICAgICAgICAuLi5oZWFkZXIsXG4gICAgICB9LFxuICAgICAgLi4uKGlzR2V0QW5kSGVhZCA/IHt9IDogeyBib2R5OiBqc29uRGF0YSB9KSxcbiAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICBjdXN0b21SZXFPcHRzLFxuICAgIH0pXG5cbiAgICByZXR1cm4geyByZXF1ZXN0SWQsIC4uLnJlc3BvbnNlLCBkYXRhOiBhd2FpdCByZXNwb25zZS5kYXRhIH1cbiAgfVxufVxuXG5jb25zdCByZXF1ZXN0TWFwOiBLVjxDbG91ZGJhc2VSZXF1ZXN0PiA9IHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0UmVxdWVzdChjb25maWc6IElDbG91ZGJhc2VSZXF1ZXN0Q29uZmlnKSB7XG4gIHJlcXVlc3RNYXBbY29uZmlnLmVudl0gPSBuZXcgQ2xvdWRiYXNlUmVxdWVzdCh7XG4gICAgLi4uY29uZmlnLFxuICAgIHRocm93OiB0cnVlLFxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVxdWVzdEJ5RW52SWQoZW52OiBzdHJpbmcpOiBDbG91ZGJhc2VSZXF1ZXN0IHtcbiAgcmV0dXJuIHJlcXVlc3RNYXBbZW52XVxufVxuIl19
}, function(modId) { var map = {"../constants/common":1776008460200,"./cache":1776008460198,"./adapter":1776008460197}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460200, function(require, module, exports) {

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
exports.OAUTH2_LOGINTYPE_PREFIX = exports.LOGINTYPE = exports.getBaseEndPoint = exports.setRegionLevelEndpoint = exports.setGatewayEndPointWithEnv = exports.getEndPointInfo = exports.setEndPointInfo = exports.DEFAULT_PROTOCOL = exports.DATA_VERSION = exports.getSdkName = exports.setSdkName = exports.getSdkVersion = exports.setSdkVersion = void 0;
var utilities_1 = require("@cloudbase/utilities");
var ZONE_CHINA = ['ap-shanghai', 'ap-guangzhou', 'ap-shenzhen-fsi', 'ap-shanghai-fsi', 'ap-nanjing', 'ap-beijing', 'ap-chengdu', 'ap-chongqing', 'ap-hongkong'];
var setUtilitiesSdkName = utilities_1.constants.setSdkName, setUtilitiesProtocol = utilities_1.constants.setProtocol;
var sdkVersion = '';
var sdkName = '@cloudbase/js-sdk';
function setSdkVersion(version) {
    sdkVersion = version;
}
exports.setSdkVersion = setSdkVersion;
function getSdkVersion() {
    return sdkVersion;
}
exports.getSdkVersion = getSdkVersion;
function setSdkName(name) {
    sdkName = name;
    setUtilitiesSdkName(name);
}
exports.setSdkName = setSdkName;
function getSdkName() {
    return sdkName;
}
exports.getSdkName = getSdkName;
exports.DATA_VERSION = '2020-01-10';
var END_POINT_INFO_ARR = [];
var END_POINT_INFO_SEARCH_KEYS = ['env', 'endPointKey', 'region'];
exports.DEFAULT_PROTOCOL = 'https:';
function findMatchedInfo(info) {
    return END_POINT_INFO_ARR.find(function (targetInfo) { return END_POINT_INFO_SEARCH_KEYS.filter(function (searchKey) { return info[searchKey] != null; }).every(function (searchKey) { return targetInfo[searchKey] === info[searchKey]; }); });
}
function setEndPointInfo(newInfo) {
    var _a, _b;
    if (newInfo.protocol && !/:$/.test(newInfo.protocol)) {
        newInfo.protocol = "".concat(newInfo.protocol, ":");
    }
    var endPointInfo = findMatchedInfo(newInfo);
    if (endPointInfo) {
        if (newInfo.baseUrl != null) {
            endPointInfo.baseUrl = newInfo.baseUrl;
        }
        if (newInfo.protocol != null) {
            endPointInfo.protocol = newInfo.protocol;
        }
    }
    else {
        END_POINT_INFO_ARR.push(__assign(__assign({}, newInfo), { protocol: (_a = newInfo.protocol) !== null && _a !== void 0 ? _a : exports.DEFAULT_PROTOCOL }));
    }
    if (newInfo.endPointKey === 'CLOUD_API') {
        setUtilitiesProtocol(((_b = newInfo.protocol) !== null && _b !== void 0 ? _b : exports.DEFAULT_PROTOCOL));
    }
}
exports.setEndPointInfo = setEndPointInfo;
function getEndPointInfo(env, endPointKey, region) {
    return findMatchedInfo({ env: env, endPointKey: endPointKey, region: region });
}
exports.getEndPointInfo = getEndPointInfo;
function setGatewayEndPointWithEnv(env, protocol, region) {
    if (region === void 0) { region = 'ap-shanghai'; }
    region = region || 'ap-shanghai';
    var baseUrl = "//".concat(env, ".api.tcloudbasegateway.com/v1");
    if (!ZONE_CHINA.includes(region)) {
        baseUrl = "//".concat(env, ".api.intl.tcloudbasegateway.com/v1");
    }
    setEndPointInfo({ endPointKey: 'GATEWAY', env: env, baseUrl: baseUrl, protocol: protocol });
}
exports.setGatewayEndPointWithEnv = setGatewayEndPointWithEnv;
function setRegionLevelEndpoint(env, region, protocol) {
    var baseUrl = "//".concat(env, ".").concat(region || 'ap-shanghai', ".tcb-api.tencentcloudapi.com/web");
    setEndPointInfo({ env: env, region: region, baseUrl: baseUrl, protocol: protocol, endPointKey: 'CLOUD_API' });
}
exports.setRegionLevelEndpoint = setRegionLevelEndpoint;
function getBaseEndPoint(env, endPointKey) {
    if (endPointKey === void 0) { endPointKey = 'CLOUD_API'; }
    var info = getEndPointInfo(env, endPointKey || 'CLOUD_API');
    var PROTOCOL = info.protocol, BASE_URL = info.baseUrl;
    var webEndpoint = "".concat(PROTOCOL).concat(BASE_URL);
    return webEndpoint.match(/(http(s)?:)?\/\/([^/?#]*)/)[0];
}
exports.getBaseEndPoint = getBaseEndPoint;
var LOGINTYPE;
(function (LOGINTYPE) {
    LOGINTYPE["NULL"] = "NULL";
    LOGINTYPE["ANONYMOUS"] = "ANONYMOUS";
    LOGINTYPE["WECHAT"] = "WECHAT";
    LOGINTYPE["WECHAT_PUBLIC"] = "WECHAT-PUBLIC";
    LOGINTYPE["WECHAT_OPEN"] = "WECHAT-OPEN";
    LOGINTYPE["CUSTOM"] = "CUSTOM";
    LOGINTYPE["EMAIL"] = "EMAIL";
    LOGINTYPE["USERNAME"] = "USERNAME";
    LOGINTYPE["PHONE"] = "PHONE";
})(LOGINTYPE = exports.LOGINTYPE || (exports.LOGINTYPE = {}));
exports.OAUTH2_LOGINTYPE_PREFIX = 'OAUTH2';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnN0YW50cy9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSxrREFBZ0Q7QUFFaEQsSUFBTSxVQUFVLEdBQUcsQ0FBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQTtBQUd6SixJQUFZLG1CQUFtQixHQUF3QyxxQkFBUyxXQUFqRCxFQUFlLG9CQUFvQixHQUFLLHFCQUFTLFlBQWQsQ0FBYztBQUl4RixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDbkIsSUFBSSxPQUFPLEdBQUcsbUJBQW1CLENBQUE7QUFFakMsU0FBZ0IsYUFBYSxDQUFDLE9BQWU7SUFDM0MsVUFBVSxHQUFHLE9BQU8sQ0FBQTtBQUN0QixDQUFDO0FBRkQsc0NBRUM7QUFDRCxTQUFnQixhQUFhO0lBQzNCLE9BQU8sVUFBVSxDQUFBO0FBQ25CLENBQUM7QUFGRCxzQ0FFQztBQUNELFNBQWdCLFVBQVUsQ0FBQyxJQUFZO0lBQ3JDLE9BQU8sR0FBRyxJQUFJLENBQUE7SUFDZCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMzQixDQUFDO0FBSEQsZ0NBR0M7QUFDRCxTQUFnQixVQUFVO0lBQ3hCLE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUM7QUFGRCxnQ0FFQztBQUNZLFFBQUEsWUFBWSxHQUFHLFlBQVksQ0FBQTtBQWlCeEMsSUFBTSxrQkFBa0IsR0FBd0IsRUFBRSxDQUFBO0FBR2xELElBQU0sMEJBQTBCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBRXRELFFBQUEsZ0JBQWdCLEdBQXVCLFFBQVEsQ0FBQTtBQUU1RCxTQUFTLGVBQWUsQ0FBQyxJQUFrQjtJQUV6QyxPQUFP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QUFJLFdBQVcsQ0FBQyxDQUFBO0lBRXJELElBQVUsUUFBUSxHQUF3QixJQUFJLFNBQTVCLEVBQVcsUUFBUSxHQUFLLElBQUksUUFBVCxDQUFTO0lBQ3RELElBQU0sV0FBVyxHQUFHLFVBQUcsUUFBUSxTQUFHLFFBQVEsQ0FBRSxDQUFBO0lBRTVDLE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRTFELENBQUM7QUFSRCwwQ0FRQztBQUVELElBQVksU0FVWDtBQVZELFdBQVksU0FBUztJQUNuQiwwQkFBYSxDQUFBO0lBQ2Isb0NBQXVCLENBQUE7SUFDdkIsOEJBQWlCLENBQUE7SUFDakIsNENBQStCLENBQUE7SUFDL0Isd0NBQTJCLENBQUE7SUFDM0IsOEJBQWlCLENBQUE7SUFDakIsNEJBQWUsQ0FBQTtJQUNmLGtDQUFxQixDQUFBO0lBQ3JCLDRCQUFlLENBQUE7QUFDakIsQ0FBQyxFQVZXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBVXBCO0FBRVksUUFBQSx1QkFBdUIsR0FBRyxRQUFRLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbmRQb2ludEtleSB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcblxuY29uc3QgWk9ORV9DSElOQSA9IFsnYXAtc2hhbmdoYWknLCAnYXAtZ3Vhbmd6aG91JywgJ2FwLXNoZW56aGVuLWZzaScsICdhcC1zaGFuZ2hhaS1mc2knLCAnYXAtbmFuamluZycsICdhcC1iZWlqaW5nJywgJ2FwLWNoZW5nZHUnLCAnYXAtY2hvbmdxaW5nJywgJ2FwLWhvbmdrb25nJ11cblxuLy8gQHRzLWlnbm9yZVxuY29uc3QgeyBzZXRTZGtOYW1lOiBzZXRVdGlsaXRpZXNTZGtOYW1lLCBzZXRQcm90b2NvbDogc2V0VXRpbGl0aWVzUHJvdG9jb2wgfSA9IGNvbnN0YW50c1xuLyoqXG4gKiBTREtcbiAqL1xubGV0IHNka1ZlcnNpb24gPSAnJ1xubGV0IHNka05hbWUgPSAnQGNsb3VkYmFzZS9qcy1zZGsnXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZGtWZXJzaW9uKHZlcnNpb246IHN0cmluZykge1xuICBzZGtWZXJzaW9uID0gdmVyc2lvblxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFNka1ZlcnNpb24oKSB7XG4gIHJldHVybiBzZGtWZXJzaW9uXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0U2RrTmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgc2RrTmFtZSA9IG5hbWVcbiAgc2V0VXRpbGl0aWVzU2RrTmFtZShuYW1lKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFNka05hbWUoKSB7XG4gIHJldHVybiBzZGtOYW1lXG59XG5leHBvcnQgY29uc3QgREFUQV9WRVJTSU9OID0gJzIwMjAtMDEtMTAnXG5cbmludGVyZmFjZSBFbmRQb2ludEluZm8ge1xuICBlbnY6IHN0cmluZ1xuICBlbmRQb2ludEtleTogRW5kUG9pbnRLZXlcbiAgcmVnaW9uPzogc3RyaW5nXG4gIGJhc2VVcmw/OiBzdHJpbmdcbiAgcHJvdG9jb2w/OiBQcm90b2NvbFxufVxuXG50eXBlIFByb3RvY29sID0gJ2h0dHAnIHwgJ2h0dHBzJyB8ICdodHRwOicgfCAnaHR0cHM6J1xuXG4vKipcbiAqICDmiYDmnIkgZW5kUG9pbnQg5L+h5oGvXG4gKiAg6YG/5YWN55u05o6l5pON5L2c6K+l5pWw57uEXG4gKiAg5L2/55SoIHNldEVuZFBvaW50SW5mb+OAgSBnZXRFbmRQb2ludEluZm9cbiAqL1xuY29uc3QgRU5EX1BPSU5UX0lORk9fQVJSOiBBcnJheTxFbmRQb2ludEluZm8+ID0gW11cblxuLyoqIOeUqOadpeafpeaJviBlbmRQb2ludCDnmoTlrZfmrrUgKi9cbmNvbnN0IEVORF9QT0lOVF9JTkZPX1NFQVJDSF9LRVlTID0gWydlbnYnLCAnZW5kUG9pbnRLZXknLCAncmVnaW9uJ11cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPVE9DT0w6ICdodHRwOicgfCAnaHR0cHM6JyA9ICdodHRwczonXG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGVkSW5mbyhpbmZvOiBFbmRQb2ludEluZm8pIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW4sIGVxZXFlcVxuICByZXR1cm4gRU5EX1BPSU5UX0lORk9fQVJSLmZpbmQodGFyZ2V0SW5mbyA9PiBFTkRfUE9JTlRfSU5GT19TRUFSQ0hfS0VZUy5maWx0ZXIoc2VhcmNoS2V5ID0+IGluZm9bc2VhcmNoS2V5XSAhPSBudWxsKS5ldmVyeShzZWFyY2hLZXkgPT4gdGFyZ2V0SW5mb1tzZWFyY2hLZXldID09PSBpbmZvW3NlYXJjaEtleV0sKSwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRFbmRQb2ludEluZm8obmV3SW5mbzogRW5kUG9pbnRJbmZvKSB7XG4gIGlmIChuZXdJbmZvLnByb3RvY29sICYmICEvOiQvLnRlc3QobmV3SW5mby5wcm90b2NvbCkpIHtcbiAgICBuZXdJbmZvLnByb3RvY29sID0gYCR7bmV3SW5mby5wcm90b2NvbH06YCBhcyBQcm90b2NvbFxuICB9XG5cbiAgY29uc3QgZW5kUG9pbnRJbmZvID0gZmluZE1hdGNoZWRJbmZvKG5ld0luZm8pXG4gIGlmIChlbmRQb2ludEluZm8pIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXG4gICAgaWYgKG5ld0luZm8uYmFzZVVybCAhPSBudWxsKSB7XG4gICAgICBlbmRQb2ludEluZm8uYmFzZVVybCA9IG5ld0luZm8uYmFzZVVybFxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXG4gICAgaWYgKG5ld0luZm8ucHJvdG9jb2wgIT0gbnVsbCkge1xuICAgICAgZW5kUG9pbnRJbmZvLnByb3RvY29sID0gbmV3SW5mby5wcm90b2NvbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBFTkRfUE9JTlRfSU5GT19BUlIucHVzaCh7IC4uLm5ld0luZm8sIHByb3RvY29sOiBuZXdJbmZvLnByb3RvY29sID8/IERFRkFVTFRfUFJPVE9DT0wgfSlcbiAgfVxuXG4gIC8vIOS/neaMgeaXp+S7o+eggemAu+i+kVxuICBpZiAobmV3SW5mby5lbmRQb2ludEtleSA9PT0gJ0NMT1VEX0FQSScpIHtcbiAgICBzZXRVdGlsaXRpZXNQcm90b2NvbCgobmV3SW5mby5wcm90b2NvbCA/PyBERUZBVUxUX1BST1RPQ09MKSBhcyAnaHR0cDonIHwgJ2h0dHBzOicpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVuZFBvaW50SW5mbyhlbnY6IHN0cmluZywgZW5kUG9pbnRLZXk6IEVuZFBvaW50S2V5LCByZWdpb24/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGZpbmRNYXRjaGVkSW5mbyh7IGVudiwgZW5kUG9pbnRLZXksIHJlZ2lvbiB9KVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXRFbmRQb2ludFdpdGhLZXkge1xuICBrZXk6IEVuZFBvaW50S2V5XG4gIHVybD86IHN0cmluZ1xuICBwcm90b2NvbD86ICdodHRwJyB8ICdodHRwcydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEdhdGV3YXlFbmRQb2ludFdpdGhFbnYoZW52OiBzdHJpbmcsIHByb3RvY29sPzogUHJvdG9jb2wsIHJlZ2lvbiA9ICdhcC1zaGFuZ2hhaScpIHtcbiAgcmVnaW9uID0gcmVnaW9uIHx8ICdhcC1zaGFuZ2hhaSdcbiAgbGV0IGJhc2VVcmwgPSBgLy8ke2Vudn0uYXBpLnRjbG91ZGJhc2VnYXRld2F5LmNvbS92MWBcblxuICBpZiAoIVpPTkVfQ0hJTkEuaW5jbHVkZXMocmVnaW9uKSkge1xuICAgIGJhc2VVcmwgPSBgLy8ke2Vudn0uYXBpLmludGwudGNsb3VkYmFzZWdhdGV3YXkuY29tL3YxYFxuICB9XG5cbiAgc2V0RW5kUG9pbnRJbmZvKHsgZW5kUG9pbnRLZXk6ICdHQVRFV0FZJywgZW52LCBiYXNlVXJsLCBwcm90b2NvbCB9KVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldFJlZ2lvbkxldmVsRW5kcG9pbnQoZW52OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nLCBwcm90b2NvbD86IFByb3RvY29sKSB7XG4gIGNvbnN0IGJhc2VVcmwgPSBgLy8ke2Vudn0uJHtyZWdpb24gfHwgJ2FwLXNoYW5naGFpJ30udGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tL3dlYmBcbiAgc2V0RW5kUG9pbnRJbmZvKHsgZW52LCByZWdpb24sIGJhc2VVcmwsIHByb3RvY29sLCBlbmRQb2ludEtleTogJ0NMT1VEX0FQSScgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VFbmRQb2ludChlbnY6IHN0cmluZywgZW5kUG9pbnRLZXk6IEVuZFBvaW50S2V5ID0gJ0NMT1VEX0FQSScpIHtcbiAgY29uc3QgaW5mbyA9IGdldEVuZFBvaW50SW5mbyhlbnYsIGVuZFBvaW50S2V5IHx8ICdDTE9VRF9BUEknKVxuXG4gIGNvbnN0IHsgcHJvdG9jb2w6IFBST1RPQ09MLCBiYXNlVXJsOiBCQVNFX1VSTCB9ID0gaW5mb1xuICBjb25zdCB3ZWJFbmRwb2ludCA9IGAke1BST1RPQ09MfSR7QkFTRV9VUkx9YFxuICAvLyBAdG9kbyDkuLTml7blhbzlrrnlsI/nqIvluo9cbiAgcmV0dXJuIHdlYkVuZHBvaW50Lm1hdGNoKC8oaHR0cChzKT86KT9cXC9cXC8oW14vPyNdKikvKVswXVxuICAvLyByZXR1cm4gYCR7bmV3IFVSTCh3ZWJFbmRwb2ludCkub3JpZ2lufWBcbn1cblxuZXhwb3J0IGVudW0gTE9HSU5UWVBFIHtcbiAgTlVMTCA9ICdOVUxMJyxcbiAgQU5PTllNT1VTID0gJ0FOT05ZTU9VUycsXG4gIFdFQ0hBVCA9ICdXRUNIQVQnLFxuICBXRUNIQVRfUFVCTElDID0gJ1dFQ0hBVC1QVUJMSUMnLFxuICBXRUNIQVRfT1BFTiA9ICdXRUNIQVQtT1BFTicsXG4gIENVU1RPTSA9ICdDVVNUT00nLFxuICBFTUFJTCA9ICdFTUFJTCcsXG4gIFVTRVJOQU1FID0gJ1VTRVJOQU1FJyxcbiAgUEhPTkUgPSAnUEhPTkUnLFxufVxuXG5leHBvcnQgY29uc3QgT0FVVEgyX0xPR0lOVFlQRV9QUkVGSVggPSAnT0FVVEgyJ1xuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460201, function(require, module, exports) {

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nProxy = exports.t = exports.langMap = exports.LANG_HEADER_KEY = exports.LANGS = void 0;
var utilities_1 = require("@cloudbase/utilities");
var LANGS;
(function (LANGS) {
    LANGS["ZH"] = "zh-CN";
    LANGS["EN"] = "en-US";
})(LANGS = exports.LANGS || (exports.LANGS = {}));
exports.LANG_HEADER_KEY = 'Accept-Language';
exports.langMap = (_a = {},
    _a[LANGS.EN] = {
        '请检查调用方式，或前往云开发 AI+ 首页查看文档': 'Please check the calling method or visit the AI+ homepage to view the documentation',
        'AI+ 请求出错，错误码': 'AI+ request error, error code',
        错误信息: 'error message',
        未实现: 'not implemented',
        '小程序不支持 wasm 加载': 'wasm loading is not supported in mini programs',
        '小程序不支持动态 js 加载': 'dynamic js loading is not supported in mini programs',
        请求超时: 'request timeout',
        '缺少 privatelink sdk 地址': 'missing privatelink sdk address',
    },
    _a);
var t = function (text, lang) { var _a; return ((_a = exports.langMap[lang]) === null || _a === void 0 ? void 0 : _a[text]) || text; };
exports.t = t;
var getLangCacheKey = function (config) { return "lang_".concat(config.clientId || config.env); };
var i18nProxy = function (platform, config) {
    var _a, _b;
    var cacheKey = getLangCacheKey(config);
    var localStorage = (platform.adapter || {}).localStorage;
    var lang = config.lang || ((_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem) === null || _a === void 0 ? void 0 : _a.call(localStorage, cacheKey)) || LANGS.ZH;
    (_b = localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem) === null || _b === void 0 ? void 0 : _b.call(localStorage, cacheKey, lang);
    return new Proxy({
        t: function (text) { return (0, exports.t)(text, lang); },
        LANG_HEADER_KEY: exports.LANG_HEADER_KEY,
        lang: lang,
    }, {
        get: function (target, prop) {
            var _a;
            if (prop === 'lang') {
                return ((_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem) === null || _a === void 0 ? void 0 : _a.call(localStorage, cacheKey)) || target[prop];
            }
            return target[prop];
        },
        set: function (target, prop, newValue) {
            var _a;
            if (prop === 'lang' && newValue !== target[prop]) {
                target[prop] = newValue;
                target.t = function (text) { return (0, exports.t)(text, newValue); };
                (_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem) === null || _a === void 0 ? void 0 : _a.call(localStorage, cacheKey, newValue);
                utilities_1.langEvent.bus.fire(utilities_1.langEvent.LANG_CHANGE_EVENT, { i18n: target });
            }
            target[prop] = newValue;
            return true;
        },
    });
};
exports.i18nProxy = i18nProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWJzL2xhbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUFnRDtBQUVoRCxJQUFZLEtBR1g7QUFIRCxXQUFZLEtBQUs7SUFDZixxQkFBWSxDQUFBO0lBQ1oscUJBQVksQ0FBQTtBQUNkLENBQUMsRUFIVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFHaEI7QUFFWSxRQUFBLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQTtBQUVuQyxRQUFBLE9BQU87SUFDbEIsR0FBQyxLQUFLLENBQUMsRUFBRSxJQUFHO1FBQ1YsMkJBQTJCLEVBQ3pCLHFGQUFxRjtRQUN2RixjQUFjLEVBQUUsK0JBQStCO1FBQy9DLElBQUksRUFBRSxlQUFlO1FBQ3JCLEdBQUcsRUFBRSxpQkFBaUI7UUFDdEIsZ0JBQWdCLEVBQUUsZ0RBQWdEO1FBQ2xFLGdCQUFnQixFQUFFLHNEQUFzRDtRQUN4RSxJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLHVCQUF1QixFQUFFLGlDQUFpQztLQUMzRDtRQUNGO0FBRU0sSUFBTSxDQUFDLEdBQUcsVUFBQyxJQUFZLEVBQUUsSUFBVyxZQUFLLE9BQUEsQ0FBQSxNQUFBLGVBQU8sQ0FBQyxJQUFJLENBQUMsMENBQUcsSUFBSSxDQUFDLEtBQUksSUFBSSxDQUFBLEVBQUEsQ0FBQTtBQUFoRSxRQUFBLENBQUMsS0FBK0Q7QUFFN0UsSUFBTSxlQUFlLEdBQUcsVUFBQSxNQUFNLElBQUksT0FBQSxlQUFRLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBRSxFQUF2QyxDQUF1QyxDQUFBO0FBRWxFLElBQU0sU0FBUyxHQUFHLFVBQUMsUUFBUSxFQUFFLE1BQU07O0lBQ3hDLElBQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNoQyxJQUFBLFlBQVksR0FBSyxDQUFBLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFBLGFBQTNCLENBQTJCO0lBQy9DLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUksTUFBQSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsT0FBTyw2REFBRyxRQUFRLENBQUMsQ0FBQSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUE7SUFDekUsTUFBQSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsT0FBTyw2REFBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFdkMsT0FBTyxJQUFJLEtBQUssQ0FDZDtRQUNFLENBQUMsRUFBRSxVQUFDLElBQVksSUFBSyxPQUFBLElBQUEsU0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBYixDQUFhO1FBQ2xDLGVBQWUseUJBQUE7UUFDZixJQUFJLE1BQUE7S0FDTCxFQUNEO1FBQ0UsR0FBRyxZQUFDLE1BQU0sRUFBRSxJQUFJOztZQUNkLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtnQkFDbkIsT0FBTyxDQUFBLE1BQUEsWUFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxDQUFFLE9BQU8sNkRBQUcsUUFBUSxDQUFDLEtBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO2FBQ3pEO1lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckIsQ0FBQztRQUNELEdBQUcsWUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVE7O1lBQ3hCLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxRQUFRLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFBO2dCQUN2QixNQUFNLENBQUMsQ0FBQyxHQUFHLFVBQUMsSUFBWSxJQUFLLE9BQUEsSUFBQSxTQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFqQixDQUFpQixDQUFBO2dCQUM5QyxNQUFBLFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxPQUFPLDZEQUFHLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtnQkFDM0MscUJBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTthQUNsRTtZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUE7WUFFdkIsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO0tBQ0YsQ0FDRixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBakNZLFFBQUEsU0FBUyxhQWlDckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsYW5nRXZlbnQgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcblxuZXhwb3J0IGVudW0gTEFOR1Mge1xuICBaSCA9ICd6aC1DTicsXG4gIEVOID0gJ2VuLVVTJyxcbn1cblxuZXhwb3J0IGNvbnN0IExBTkdfSEVBREVSX0tFWSA9ICdBY2NlcHQtTGFuZ3VhZ2UnXG5cbmV4cG9ydCBjb25zdCBsYW5nTWFwID0ge1xuICBbTEFOR1MuRU5dOiB7XG4gICAgJ+ivt+ajgOafpeiwg+eUqOaWueW8j++8jOaIluWJjeW+gOS6keW8gOWPkSBBSSsg6aaW6aG15p+l55yL5paH5qGjJzpcbiAgICAgICdQbGVhc2UgY2hlY2sgdGhlIGNhbGxpbmcgbWV0aG9kIG9yIHZpc2l0IHRoZSBBSSsgaG9tZXBhZ2UgdG8gdmlldyB0aGUgZG9jdW1lbnRhdGlvbicsXG4gICAgJ0FJKyDor7fmsYLlh7rplJnvvIzplJnor6/noIEnOiAnQUkrIHJlcXVlc3QgZXJyb3IsIGVycm9yIGNvZGUnLFxuICAgIOmUmeivr+S/oeaBrzogJ2Vycm9yIG1lc3NhZ2UnLFxuICAgIOacquWunueOsDogJ25vdCBpbXBsZW1lbnRlZCcsXG4gICAgJ+Wwj+eoi+W6j+S4jeaUr+aMgSB3YXNtIOWKoOi9vSc6ICd3YXNtIGxvYWRpbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBtaW5pIHByb2dyYW1zJyxcbiAgICAn5bCP56iL5bqP5LiN5pSv5oyB5Yqo5oCBIGpzIOWKoOi9vSc6ICdkeW5hbWljIGpzIGxvYWRpbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBtaW5pIHByb2dyYW1zJyxcbiAgICDor7fmsYLotoXml7Y6ICdyZXF1ZXN0IHRpbWVvdXQnLFxuICAgICfnvLrlsJEgcHJpdmF0ZWxpbmsgc2RrIOWcsOWdgCc6ICdtaXNzaW5nIHByaXZhdGVsaW5rIHNkayBhZGRyZXNzJyxcbiAgfSxcbn1cblxuZXhwb3J0IGNvbnN0IHQgPSAodGV4dDogc3RyaW5nLCBsYW5nOiBMQU5HUykgPT4gbGFuZ01hcFtsYW5nXT8uW3RleHRdIHx8IHRleHRcblxuY29uc3QgZ2V0TGFuZ0NhY2hlS2V5ID0gY29uZmlnID0+IGBsYW5nXyR7Y29uZmlnLmNsaWVudElkIHx8IGNvbmZpZy5lbnZ9YFxuXG5leHBvcnQgY29uc3QgaTE4blByb3h5ID0gKHBsYXRmb3JtLCBjb25maWcpID0+IHtcbiAgY29uc3QgY2FjaGVLZXkgPSBnZXRMYW5nQ2FjaGVLZXkoY29uZmlnKVxuICBjb25zdCB7IGxvY2FsU3RvcmFnZSB9ID0gcGxhdGZvcm0uYWRhcHRlciB8fCB7fVxuICBjb25zdCBsYW5nID0gY29uZmlnLmxhbmcgfHwgbG9jYWxTdG9yYWdlPy5nZXRJdGVtPy4oY2FjaGVLZXkpIHx8IExBTkdTLlpIXG4gIGxvY2FsU3RvcmFnZT8uc2V0SXRlbT8uKGNhY2hlS2V5LCBsYW5nKVxuXG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge1xuICAgICAgdDogKHRleHQ6IHN0cmluZykgPT4gdCh0ZXh0LCBsYW5nKSxcbiAgICAgIExBTkdfSEVBREVSX0tFWSxcbiAgICAgIGxhbmcsXG4gICAgfSxcbiAgICB7XG4gICAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmIChwcm9wID09PSAnbGFuZycpIHtcbiAgICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlPy5nZXRJdGVtPy4oY2FjaGVLZXkpIHx8IHRhcmdldFtwcm9wXVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF1cbiAgICAgIH0sXG4gICAgICBzZXQodGFyZ2V0LCBwcm9wLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAocHJvcCA9PT0gJ2xhbmcnICYmIG5ld1ZhbHVlICE9PSB0YXJnZXRbcHJvcF0pIHtcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBuZXdWYWx1ZVxuICAgICAgICAgIHRhcmdldC50ID0gKHRleHQ6IHN0cmluZykgPT4gdCh0ZXh0LCBuZXdWYWx1ZSlcbiAgICAgICAgICBsb2NhbFN0b3JhZ2U/LnNldEl0ZW0/LihjYWNoZUtleSwgbmV3VmFsdWUpXG4gICAgICAgICAgbGFuZ0V2ZW50LmJ1cy5maXJlKGxhbmdFdmVudC5MQU5HX0NIQU5HRV9FVkVOVCwgeyBpMThuOiB0YXJnZXQgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldFtwcm9wXSA9IG5ld1ZhbHVlXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0sXG4gICAgfSxcbiAgKVxufVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1776008460195);
})()
//miniprogram-npm-outsideDeps=["@cloudbase/utilities","@cloudbase/adapter-wx_mp","@cloudbase/adapter-interface"]
//# sourceMappingURL=index.js.map