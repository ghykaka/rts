module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1776008460202, function(require, module, exports) {

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
exports.registerCloudrun = exports.requestContainer = void 0;
var utilities_1 = require("@cloudbase/utilities");
var ERRORS = utilities_1.constants.ERRORS;
var COMPONENT_NAME = 'cloudrun';
var CloudbaseRun = (function () {
    function CloudbaseRun() {
    }
    CloudbaseRun.prototype.callContainer = function (options, customReqOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var name, data, jsonData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = options.name, data = options.data;
                        if (!name) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: "[".concat(COMPONENT_NAME, ".callContainer] invalid name"),
                            }));
                        }
                        try {
                            jsonData = data ? JSON.stringify(data) : '';
                        }
                        catch (e) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: "[".concat(COMPONENT_NAME, ".callContainer] invalid data"),
                            }));
                        }
                        return [4, requestContainer.call(this, __assign(__assign({}, options), { data: jsonData }), customReqOpts)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    return CloudbaseRun;
}());
function requestContainer(options, customReqOpts) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var name, data, _b, path, method, _c, header, _d, BASE_URL, PROTOCOL, endpoint, reqPath, isGetAndHead, dataParse_1, response;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    name = options.name, data = options.data, _b = options.path, path = _b === void 0 ? '' : _b, method = options.method, _c = options.header, header = _c === void 0 ? {} : _c;
                    _d = this.getEndPointWithKey('GATEWAY'), BASE_URL = _d.BASE_URL, PROTOCOL = _d.PROTOCOL;
                    endpoint = "".concat(PROTOCOL).concat(BASE_URL, "/cloudrun/").concat(name);
                    reqPath = path.startsWith('/') ? path : "/".concat(path);
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
                            reqPath = "".concat(reqPath).concat(reqPath.includes('?') ? '&' : '?').concat(Object.keys(dataParse_1)
                                .map(function (key) { return "".concat(key, "=").concat(dataParse_1[key]); })
                                .join('&'));
                        }
                        catch (error) {
                        }
                    }
                    return [4, this.request.fetch(__assign(__assign({ method: method || 'POST', headers: Object.assign({}, {
                                'Content-Type': 'application/json; charset=utf-8',
                            }, header) }, (isGetAndHead ? {} : { body: data })), { url: "".concat(endpoint).concat(reqPath), customReqOpts: customReqOpts }))];
                case 1:
                    response = _e.sent();
                    if ((customReqOpts === null || customReqOpts === void 0 ? void 0 : customReqOpts.from) === 'node-sdk') {
                        return [2, response];
                    }
                    return [4, response.data];
                case 2: return [2, _e.sent()];
            }
        });
    });
}
exports.requestContainer = requestContainer;
var cloudbaseRun = new CloudbaseRun();
var component = {
    name: COMPONENT_NAME,
    entity: {
        callContainer: cloudbaseRun.callContainer,
    },
};
try {
    cloudbase.registerComponent(component);
}
catch (e) { }
function registerCloudrun(app) {
    try {
        app.registerComponent(component);
    }
    catch (e) {
        console.warn(e);
    }
}
exports.registerCloudrun = registerCloudrun;
try {
    window.registerCloudrun = registerCloudrun;
}
catch (e) { }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxrREFBZ0Q7QUFJeEMsSUFBQSxNQUFNLEdBQUsscUJBQVMsT0FBZCxDQUFjO0FBRTVCLElBQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQTtBQUVqQztJQUFBO0lBc0JBLENBQUM7SUFyQmMsb0NBQWEsR0FBMUIsVUFBMkIsT0FBNkIsRUFBRSxhQUE4Qjs7Ozs7O3dCQUM5RSxJQUFJLEdBQVcsT0FBTyxLQUFsQixFQUFFLElBQUksR0FBSyxPQUFPLEtBQVosQ0FBWTt3QkFFOUIsSUFBSSxDQUFDLElBQUksRUFBRTs0QkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0NBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYztnQ0FDM0IsR0FBRyxFQUFFLFdBQUksY0FBYyxpQ0FBOEI7NkJBQ3RELENBQUMsQ0FBRSxDQUFBO3lCQUNMO3dCQUVELElBQUk7NEJBQ0YsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO3lCQUM1Qzt3QkFBQyxPQUFPLENBQUMsRUFBRTs0QkFDVixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0NBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYztnQ0FDM0IsR0FBRyxFQUFFLFdBQUksY0FBYyxpQ0FBOEI7NkJBQ3RELENBQUMsQ0FBRSxDQUFBO3lCQUNMO3dCQUVNLFdBQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQU8sT0FBTyxLQUFFLElBQUksRUFBRSxRQUFRLEtBQUksYUFBYSxDQUFDLEVBQUE7NEJBQXZGLFdBQU8sU0FBZ0YsRUFBQTs7OztLQUN4RjtJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQXRCRCxJQXNCQztBQUVELFNBQXNCLGdCQUFnQixDQUFZLE9BQTZCLEVBQUUsYUFBOEI7Ozs7Ozs7b0JBQ3JHLElBQUksR0FBMkMsT0FBTyxLQUFsRCxFQUFFLElBQUksR0FBcUMsT0FBTyxLQUE1QyxFQUFFLEtBQW1DLE9BQU8sS0FBakMsRUFBVCxJQUFJLG1CQUFHLEVBQUUsS0FBQSxFQUFFLE1BQU0sR0FBa0IsT0FBTyxPQUF6QixFQUFFLEtBQWdCLE9BQU8sT0FBWixFQUFYLE1BQU0sbUJBQUcsRUFBRSxLQUFBLENBQVk7b0JBQ3hELEtBQXlCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsRUFBekQsUUFBUSxjQUFBLEVBQUUsUUFBUSxjQUFBLENBQXVDO29CQUMzRCxRQUFRLEdBQUcsVUFBRyxRQUFRLFNBQUcsUUFBUSx1QkFBYSxJQUFJLENBQUUsQ0FBQTtvQkFDdEQsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBSSxJQUFJLENBQUUsQ0FBQTtvQkFDaEQsWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxXQUFXLHNEQUFJLENBQUMsQ0FBQTtvQkFFdEUsSUFBSSxZQUFZLEVBQUU7d0JBQ2hCLElBQUk7NEJBQ0UsY0FBWSxFQUFFLENBQUE7NEJBQ2xCLElBQUk7Z0NBQ0YsV0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBVyxDQUFDLENBQUE7NkJBQ3BDOzRCQUFDLE9BQU8sS0FBSyxFQUFFO2dDQUNkLFdBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBOzZCQUN2Qjs0QkFDRCxPQUFPLEdBQUcsVUFBRyxPQUFPLFNBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFTLENBQUM7aUNBQzlFLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLFVBQUcsR0FBRyxjQUFJLFdBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUExQixDQUEwQixDQUFDO2lDQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQTt5QkFDZjt3QkFBQyxPQUFPLEtBQUssRUFBRTt5QkFFZjtxQkFDRjtvQkFHZ0IsV0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUsscUJBQ3ZDLE1BQU0sRUFBRSxNQUFNLElBQUksTUFBTSxFQUN4QixPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FDcEIsRUFBRSxFQUNGO2dDQUNFLGNBQWMsRUFBRSxpQ0FBaUM7NkJBQ2xELEVBQ0QsTUFBTSxDQUNQLElBRUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FDdkMsR0FBRyxFQUFFLFVBQUcsUUFBUSxTQUFHLE9BQU8sQ0FBRSxFQUM1QixhQUFhLGVBQUEsSUFDYixFQUFBOztvQkFiSSxRQUFRLEdBQUcsU0FhZjtvQkFFRixJQUFJLENBQUEsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLElBQUksTUFBSyxVQUFVLEVBQUU7d0JBQ3RDLFdBQU8sUUFBUSxFQUFBO3FCQUNoQjtvQkFFTSxXQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUE7d0JBQTFCLFdBQU8sU0FBbUIsRUFBQTs7OztDQUMzQjtBQTVDRCw0Q0E0Q0M7QUFFRCxJQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO0FBRXZDLElBQU0sU0FBUyxHQUF3QjtJQUNyQyxJQUFJLEVBQUUsY0FBYztJQUNwQixNQUFNLEVBQUU7UUFDTixhQUFhLEVBQUUsWUFBWSxDQUFDLGFBQWE7S0FDMUM7Q0FDRixDQUFBO0FBQ0QsSUFBSTtJQUNGLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtDQUN2QztBQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7QUFFZCxTQUFnQixnQkFBZ0IsQ0FBQyxHQUEwQztJQUN6RSxJQUFJO1FBQ0YsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQ2pDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hCO0FBQ0gsQ0FBQztBQU5ELDRDQU1DO0FBRUQsSUFBSTtJQUNELE1BQWMsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtDQUNwRDtBQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQ2xvdWRiYXNlIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcydcbmltcG9ydCB7IElDbG91ZGJhc2VDb21wb25lbnQgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2NvbXBvbmVudCdcbmltcG9ydCB7IElDYWxsRnVuY3Rpb25PcHRpb25zLCBJQ3VzdG9tUmVxT3B0cyB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvZnVuY3Rpb25zJ1xuaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnQGNsb3VkYmFzZS91dGlsaXRpZXMnXG5cbmRlY2xhcmUgY29uc3QgY2xvdWRiYXNlOiBJQ2xvdWRiYXNlXG5cbmNvbnN0IHsgRVJST1JTIH0gPSBjb25zdGFudHNcblxuY29uc3QgQ09NUE9ORU5UX05BTUUgPSAnY2xvdWRydW4nXG5cbmNsYXNzIENsb3VkYmFzZVJ1biB7XG4gIHB1YmxpYyBhc3luYyBjYWxsQ29udGFpbmVyKG9wdGlvbnM6IElDYWxsRnVuY3Rpb25PcHRpb25zLCBjdXN0b21SZXFPcHRzPzogSUN1c3RvbVJlcU9wdHMpIHtcbiAgICBjb25zdCB7IG5hbWUsIGRhdGEgfSA9IG9wdGlvbnNcblxuICAgIGlmICghbmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY29kZTogRVJST1JTLklOVkFMSURfUEFSQU1TLFxuICAgICAgICBtc2c6IGBbJHtDT01QT05FTlRfTkFNRX0uY2FsbENvbnRhaW5lcl0gaW52YWxpZCBuYW1lYCxcbiAgICAgIH0pLClcbiAgICB9XG4gICAgbGV0IGpzb25EYXRhXG4gICAgdHJ5IHtcbiAgICAgIGpzb25EYXRhID0gZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogJydcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjb2RlOiBFUlJPUlMuSU5WQUxJRF9QQVJBTVMsXG4gICAgICAgIG1zZzogYFske0NPTVBPTkVOVF9OQU1FfS5jYWxsQ29udGFpbmVyXSBpbnZhbGlkIGRhdGFgLFxuICAgICAgfSksKVxuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCByZXF1ZXN0Q29udGFpbmVyLmNhbGwodGhpcywgeyAuLi5vcHRpb25zLCBkYXRhOiBqc29uRGF0YSB9LCBjdXN0b21SZXFPcHRzKVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0Q29udGFpbmVyKHRoaXM6IGFueSwgb3B0aW9uczogSUNhbGxGdW5jdGlvbk9wdGlvbnMsIGN1c3RvbVJlcU9wdHM/OiBJQ3VzdG9tUmVxT3B0cykge1xuICBjb25zdCB7IG5hbWUsIGRhdGEsIHBhdGggPSAnJywgbWV0aG9kLCBoZWFkZXIgPSB7fSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IEJBU0VfVVJMLCBQUk9UT0NPTCB9ID0gdGhpcy5nZXRFbmRQb2ludFdpdGhLZXkoJ0dBVEVXQVknKVxuICBjb25zdCBlbmRwb2ludCA9IGAke1BST1RPQ09MfSR7QkFTRV9VUkx9L2Nsb3VkcnVuLyR7bmFtZX1gXG4gIGxldCByZXFQYXRoID0gcGF0aC5zdGFydHNXaXRoKCcvJykgPyBwYXRoIDogYC8ke3BhdGh9YFxuICBjb25zdCBpc0dldEFuZEhlYWQgPSBbJ0dFVCcsICdIRUFEJ10uaW5jbHVkZXMobWV0aG9kPy50b1VwcGVyQ2FzZT8uKCkpXG5cbiAgaWYgKGlzR2V0QW5kSGVhZCkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZGF0YVBhcnNlID0ge31cbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGFQYXJzZSA9IEpTT04ucGFyc2UoZGF0YSBhcyBhbnkpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBkYXRhUGFyc2UgPSBkYXRhIHx8IHt9XG4gICAgICB9XG4gICAgICByZXFQYXRoID0gYCR7cmVxUGF0aH0ke3JlcVBhdGguaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/J30ke09iamVjdC5rZXlzKGRhdGFQYXJzZSlcbiAgICAgICAgLm1hcChrZXkgPT4gYCR7a2V5fT0ke2RhdGFQYXJzZVtrZXldfWApXG4gICAgICAgIC5qb2luKCcmJyl9YFxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvL1xuICAgIH1cbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnJlcXVlc3QuZmV0Y2goe1xuICAgIG1ldGhvZDogbWV0aG9kIHx8ICdQT1NUJyxcbiAgICBoZWFkZXJzOiBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICAgICB9LFxuICAgICAgaGVhZGVyLFxuICAgICksXG4gICAgLy8gUmVxdWVzdCB3aXRoIEdFVC9IRUFEIG1ldGhvZCBjYW5ub3QgaGF2ZSBib2R5XG4gICAgLi4uKGlzR2V0QW5kSGVhZCA/IHt9IDogeyBib2R5OiBkYXRhIH0pLFxuICAgIHVybDogYCR7ZW5kcG9pbnR9JHtyZXFQYXRofWAsXG4gICAgY3VzdG9tUmVxT3B0cyxcbiAgfSlcblxuICBpZiAoY3VzdG9tUmVxT3B0cz8uZnJvbSA9PT0gJ25vZGUtc2RrJykge1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmRhdGFcbn1cblxuY29uc3QgY2xvdWRiYXNlUnVuID0gbmV3IENsb3VkYmFzZVJ1bigpXG5cbmNvbnN0IGNvbXBvbmVudDogSUNsb3VkYmFzZUNvbXBvbmVudCA9IHtcbiAgbmFtZTogQ09NUE9ORU5UX05BTUUsXG4gIGVudGl0eToge1xuICAgIGNhbGxDb250YWluZXI6IGNsb3VkYmFzZVJ1bi5jYWxsQ29udGFpbmVyLFxuICB9LFxufVxudHJ5IHtcbiAgY2xvdWRiYXNlLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudClcbn0gY2F0Y2ggKGUpIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNsb3VkcnVuKGFwcDogUGljazxJQ2xvdWRiYXNlLCAncmVnaXN0ZXJDb21wb25lbnQnPikge1xuICB0cnkge1xuICAgIGFwcC5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oZSlcbiAgfVxufVxuXG50cnkge1xuICAod2luZG93IGFzIGFueSkucmVnaXN0ZXJDbG91ZHJ1biA9IHJlZ2lzdGVyQ2xvdWRydW5cbn0gY2F0Y2ggKGUpIHt9XG4iXX0=
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1776008460202);
})()
//miniprogram-npm-outsideDeps=["@cloudbase/utilities"]
//# sourceMappingURL=index.js.map