module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1776008460203, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Db = exports.DocumentReference = exports.CollectionReference = exports.Query = void 0;
var Geo = require("./geo/index");
var collection_1 = require("./collection");
var command_1 = require("./command");
var index_1 = require("./serverDate/index");
var index_2 = require("./regexp/index");
var index_3 = require("./transaction/index");
var logic_1 = require("./commands/logic");
var query_1 = require("./commands/query");
var update_1 = require("./commands/update");
var query_2 = require("./query");
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return query_2.Query; } });
var collection_2 = require("./collection");
Object.defineProperty(exports, "CollectionReference", { enumerable: true, get: function () { return collection_2.CollectionReference; } });
var document_1 = require("./document");
Object.defineProperty(exports, "DocumentReference", { enumerable: true, get: function () { return document_1.DocumentReference; } });
var Db = (function () {
    function Db(config) {
        this.config = config;
        this.Geo = Geo;
        this.serverDate = index_1.ServerDateConstructor;
        this.command = command_1.Command;
        this.RegExp = index_2.RegExpConstructor;
        this.startTransaction = index_3.startTransaction;
        this.runTransaction = index_3.runTransaction;
        this.logicCommand = logic_1.LogicCommand;
        this.updateCommand = update_1.UpdateCommand;
        this.queryCommand = query_1.QueryCommand;
    }
    Db.createRequest = function (config) {
        var request = new Db.reqClass(config);
        var originalSend = request.send;
        request.send = function (action, data) {
            if (config.instance) {
                data.instance = config.instance;
            }
            if (config.database) {
                data.database = config.database;
            }
            return originalSend.call(this, action, data);
        };
        return request;
    };
    Db.prototype.collection = function (collName) {
        if (!collName) {
            throw new Error('Collection name is required');
        }
        return new collection_1.CollectionReference(this, collName);
    };
    Db.prototype.createCollection = function (collName) {
        var request = Db.createRequest(this.config);
        var params = {
            collectionName: collName
        };
        return request.send('database.addCollection', params);
    };
    return Db;
}());
exports.Db = Db;

}, function(modId) {var map = {"./geo/index":1776008460204,"./collection":1776008460218,"./command":1776008460232,"./serverDate/index":1776008460209,"./regexp/index":1776008460233,"./transaction/index":1776008460234,"./commands/logic":1776008460225,"./commands/query":1776008460224,"./commands/update":1776008460222,"./query":1776008460229,"./document":1776008460219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460204, function(require, module, exports) {

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./point"), exports);
__exportStar(require("./lineString"), exports);
__exportStar(require("./polygon"), exports);
__exportStar(require("./multiPoint"), exports);
__exportStar(require("./multiLineString"), exports);
__exportStar(require("./multiPolygon"), exports);

}, function(modId) { var map = {"./point":1776008460205,"./lineString":1776008460213,"./polygon":1776008460214,"./multiPoint":1776008460215,"./multiLineString":1776008460216,"./multiPolygon":1776008460217}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460205, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
var validate_1 = require("../validate");
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var Point = (function () {
    function Point(longitude, latitude) {
        validate_1.Validate.isGeopoint('longitude', longitude);
        validate_1.Validate.isGeopoint('latitude', latitude);
        this.longitude = longitude;
        this.latitude = latitude;
    }
    Point.prototype.parse = function (key) {
        var _a;
        return _a = {},
            _a[key] = {
                type: 'Point',
                coordinates: [this.longitude, this.latitude]
            },
            _a;
    };
    Point.prototype.toJSON = function () {
        return {
            type: 'Point',
            coordinates: [
                this.longitude,
                this.latitude,
            ],
        };
    };
    Point.prototype.toReadableString = function () {
        return "[".concat(this.longitude, ",").concat(this.latitude, "]");
    };
    Point.validate = function (point) {
        return point.type === 'Point' &&
            (0, type_1.isArray)(point.coordinates) &&
            validate_1.Validate.isGeopoint('longitude', point.coordinates[0]) &&
            validate_1.Validate.isGeopoint('latitude', point.coordinates[1]);
    };
    Object.defineProperty(Point.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_GEO_POINT;
        },
        enumerable: false,
        configurable: true
    });
    return Point;
}());
exports.Point = Point;

}, function(modId) { var map = {"../validate":1776008460206,"../helper/symbol":1776008460210,"../utils/type":1776008460212}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460206, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
var constant_1 = require("./constant");
var util_1 = require("./util");
var Validate = (function () {
    function Validate() {
    }
    Validate.isGeopoint = function (point, degree) {
        if (util_1.Util.whichType(degree) !== constant_1.FieldType.Number) {
            throw new Error('Geo Point must be number type');
        }
        var degreeAbs = Math.abs(degree);
        if (point === 'latitude' && degreeAbs > 90) {
            throw new Error('latitude should be a number ranges from -90 to 90');
        }
        else if (point === 'longitude' && degreeAbs > 180) {
            throw new Error('longitude should be a number ranges from -180 to 180');
        }
        return true;
    };
    Validate.isInteger = function (param, num) {
        if (!Number.isInteger(num)) {
            throw new Error(param + constant_1.ErrorCode.IntergerError);
        }
        return true;
    };
    Validate.isFieldOrder = function (direction) {
        if (constant_1.OrderDirectionList.indexOf(direction) === -1) {
            throw new Error(constant_1.ErrorCode.DirectionError);
        }
        return true;
    };
    Validate.isFieldPath = function (path) {
        if (!/^[a-zA-Z0-9-_\.]/.test(path)) {
            throw new Error();
        }
        return true;
    };
    Validate.isOperator = function (op) {
        if (constant_1.WhereFilterOpList.indexOf(op) === -1) {
            throw new Error(constant_1.ErrorCode.OpStrError);
        }
        return true;
    };
    Validate.isCollName = function (name) {
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-_]){1,32}$/.test(name)) {
            throw new Error(constant_1.ErrorCode.CollNameError);
        }
        return true;
    };
    Validate.isDocID = function (docId) {
        if (!/^([a-fA-F0-9]){24}$/.test(docId)) {
            throw new Error(constant_1.ErrorCode.DocIDError);
        }
        return true;
    };
    return Validate;
}());
exports.Validate = Validate;

}, function(modId) { var map = {"./constant":1776008460207,"./util":1776008460208}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460207, function(require, module, exports) {

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryType = exports.UpdateOperatorList = exports.OrderDirectionList = exports.OperatorMap = exports.Opeartor = exports.WhereFilterOpList = exports.FieldType = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["DocIDError"] = "\u6587\u6863ID\u4E0D\u5408\u6CD5";
    ErrorCode["CollNameError"] = "\u96C6\u5408\u540D\u79F0\u4E0D\u5408\u6CD5";
    ErrorCode["OpStrError"] = "\u64CD\u4F5C\u7B26\u4E0D\u5408\u6CD5";
    ErrorCode["DirectionError"] = "\u6392\u5E8F\u5B57\u7B26\u4E0D\u5408\u6CD5";
    ErrorCode["IntergerError"] = "must be integer";
    ErrorCode["QueryParamTypeError"] = "\u67E5\u8BE2\u53C2\u6570\u5FC5\u987B\u4E3A\u5BF9\u8C61";
    ErrorCode["QueryParamValueError"] = "\u67E5\u8BE2\u53C2\u6570\u5BF9\u8C61\u503C\u4E0D\u80FD\u5747\u4E3Aundefined";
})(ErrorCode || (ErrorCode = {}));
exports.ErrorCode = ErrorCode;
var FieldType = {
    String: 'String',
    Number: 'Number',
    Object: 'Object',
    Array: 'Array',
    Boolean: 'Boolean',
    Null: 'Null',
    GeoPoint: 'GeoPoint',
    GeoLineString: 'GeoLineString',
    GeoPolygon: 'GeoPolygon',
    GeoMultiPoint: 'GeoMultiPoint',
    GeoMultiLineString: 'GeoMultiLineString',
    GeoMultiPolygon: 'GeoMultiPolygon',
    Timestamp: 'Date',
    Command: 'Command',
    ServerDate: 'ServerDate',
    BsonDate: 'BsonDate'
};
exports.FieldType = FieldType;
var OrderDirectionList = ['desc', 'asc'];
exports.OrderDirectionList = OrderDirectionList;
var WhereFilterOpList = ['<', '<=', '==', '>=', '>'];
exports.WhereFilterOpList = WhereFilterOpList;
var Opeartor;
(function (Opeartor) {
    Opeartor["lt"] = "<";
    Opeartor["gt"] = ">";
    Opeartor["lte"] = "<=";
    Opeartor["gte"] = ">=";
    Opeartor["eq"] = "==";
})(Opeartor || (Opeartor = {}));
exports.Opeartor = Opeartor;
var OperatorMap = (_a = {},
    _a[Opeartor.eq] = '$eq',
    _a[Opeartor.lt] = '$lt',
    _a[Opeartor.lte] = '$lte',
    _a[Opeartor.gt] = '$gt',
    _a[Opeartor.gte] = '$gte',
    _a);
exports.OperatorMap = OperatorMap;
var UpdateOperatorList = [
    '$set',
    '$inc',
    '$mul',
    '$unset',
    '$push',
    '$pop',
    '$unshift',
    '$shift',
    '$currentDate',
    '$each',
    '$position'
];
exports.UpdateOperatorList = UpdateOperatorList;
var QueryType;
(function (QueryType) {
    QueryType["WHERE"] = "WHERE";
    QueryType["DOC"] = "DOC";
})(QueryType || (QueryType = {}));
exports.QueryType = QueryType;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460208, function(require, module, exports) {

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
var constant_1 = require("./constant");
var index_1 = require("./geo/index");
var index_2 = require("./serverDate/index");
var Util = (function () {
    function Util() {
    }
    Util.formatResDocumentData = function (documents) {
        return documents.map(function (document) {
            return Util.formatField(document);
        });
    };
    Util.formatField = function (document) {
        var keys = Object.keys(document);
        var protoField = {};
        if (Array.isArray(document)) {
            protoField = [];
        }
        keys.forEach(function (key) {
            var item = document[key];
            var type = Util.whichType(item);
            var realValue;
            switch (type) {
                case constant_1.FieldType.GeoPoint:
                    realValue = new index_1.Point(item.coordinates[0], item.coordinates[1]);
                    break;
                case constant_1.FieldType.GeoLineString:
                    realValue = new index_1.LineString(item.coordinates.map(function (point) { return new index_1.Point(point[0], point[1]); }));
                    break;
                case constant_1.FieldType.GeoPolygon:
                    realValue = new index_1.Polygon(item.coordinates.map(function (line) { return new index_1.LineString(line.map(function (_a) {
                        var _b = __read(_a, 2), lng = _b[0], lat = _b[1];
                        return new index_1.Point(lng, lat);
                    })); }));
                    break;
                case constant_1.FieldType.GeoMultiPoint:
                    realValue = new index_1.MultiPoint(item.coordinates.map(function (point) { return new index_1.Point(point[0], point[1]); }));
                    break;
                case constant_1.FieldType.GeoMultiLineString:
                    realValue = new index_1.MultiLineString(item.coordinates.map(function (line) { return new index_1.LineString(line.map(function (_a) {
                        var _b = __read(_a, 2), lng = _b[0], lat = _b[1];
                        return new index_1.Point(lng, lat);
                    })); }));
                    break;
                case constant_1.FieldType.GeoMultiPolygon:
                    realValue = new index_1.MultiPolygon(item.coordinates.map(function (polygon) {
                        return new index_1.Polygon(polygon.map(function (line) { return new index_1.LineString(line.map(function (_a) {
                            var _b = __read(_a, 2), lng = _b[0], lat = _b[1];
                            return new index_1.Point(lng, lat);
                        })); }));
                    }));
                    break;
                case constant_1.FieldType.Timestamp:
                    realValue = new Date(item.$timestamp * 1000);
                    break;
                case constant_1.FieldType.Object:
                case constant_1.FieldType.Array:
                    realValue = Util.formatField(item);
                    break;
                case constant_1.FieldType.ServerDate:
                    realValue = new Date(item.$date);
                    break;
                default:
                    realValue = item;
            }
            if (Array.isArray(protoField)) {
                protoField.push(realValue);
            }
            else {
                protoField[key] = realValue;
            }
        });
        return protoField;
    };
    Util.whichType = function (obj) {
        var type = Object.prototype.toString.call(obj).slice(8, -1);
        if (type === constant_1.FieldType.Timestamp) {
            return constant_1.FieldType.BsonDate;
        }
        if (type === constant_1.FieldType.Object) {
            if (obj instanceof index_1.Point) {
                return constant_1.FieldType.GeoPoint;
            }
            else if (obj instanceof Date) {
                return constant_1.FieldType.Timestamp;
            }
            else if (obj instanceof index_2.ServerDate) {
                return constant_1.FieldType.ServerDate;
            }
            if (obj.$timestamp) {
                type = constant_1.FieldType.Timestamp;
            }
            else if (obj.$date) {
                type = constant_1.FieldType.ServerDate;
            }
            else if (index_1.Point.validate(obj)) {
                type = constant_1.FieldType.GeoPoint;
            }
            else if (index_1.LineString.validate(obj)) {
                type = constant_1.FieldType.GeoLineString;
            }
            else if (index_1.Polygon.validate(obj)) {
                type = constant_1.FieldType.GeoPolygon;
            }
            else if (index_1.MultiPoint.validate(obj)) {
                type = constant_1.FieldType.GeoMultiPoint;
            }
            else if (index_1.MultiLineString.validate(obj)) {
                type = constant_1.FieldType.GeoMultiLineString;
            }
            else if (index_1.MultiPolygon.validate(obj)) {
                type = constant_1.FieldType.GeoMultiPolygon;
            }
        }
        return type;
    };
    Util.generateDocId = function () {
        var chars = 'ABCDEFabcdef0123456789';
        var autoId = '';
        for (var i = 0; i < 24; i++) {
            autoId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return autoId;
    };
    return Util;
}());
exports.Util = Util;

}, function(modId) { var map = {"./constant":1776008460207,"./geo/index":1776008460204,"./serverDate/index":1776008460209}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460209, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDateConstructor = exports.ServerDate = void 0;
var symbol_1 = require("../helper/symbol");
var ServerDate = (function () {
    function ServerDate(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c;
        this.offset = offset;
    }
    Object.defineProperty(ServerDate.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_SERVER_DATE;
        },
        enumerable: false,
        configurable: true
    });
    ServerDate.prototype.parse = function () {
        return {
            $date: {
                offset: this.offset
            }
        };
    };
    return ServerDate;
}());
exports.ServerDate = ServerDate;
function ServerDateConstructor(opt) {
    return new ServerDate(opt);
}
exports.ServerDateConstructor = ServerDateConstructor;

}, function(modId) { var map = {"../helper/symbol":1776008460210}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460210, function(require, module, exports) {

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYMBOL_REGEXP = exports.SYMBOL_SERVER_DATE = exports.SYMBOL_GEO_MULTI_POLYGON = exports.SYMBOL_GEO_MULTI_LINE_STRING = exports.SYMBOL_GEO_MULTI_POINT = exports.SYMBOL_GEO_POLYGON = exports.SYMBOL_GEO_LINE_STRING = exports.SYMBOL_GEO_POINT = exports.SYMBOL_LOGIC_COMMAND = exports.SYMBOL_QUERY_COMMAND = exports.SYMBOL_UPDATE_COMMAND = exports.SYMBOL_UNSET_FIELD_NAME = void 0;
var symbol_1 = require("../utils/symbol");
__exportStar(require("../utils/symbol"), exports);
exports.SYMBOL_UNSET_FIELD_NAME = symbol_1.default.for('UNSET_FIELD_NAME');
exports.SYMBOL_UPDATE_COMMAND = symbol_1.default.for('UPDATE_COMMAND');
exports.SYMBOL_QUERY_COMMAND = symbol_1.default.for('QUERY_COMMAND');
exports.SYMBOL_LOGIC_COMMAND = symbol_1.default.for('LOGIC_COMMAND');
exports.SYMBOL_GEO_POINT = symbol_1.default.for('GEO_POINT');
exports.SYMBOL_GEO_LINE_STRING = symbol_1.default.for('SYMBOL_GEO_LINE_STRING');
exports.SYMBOL_GEO_POLYGON = symbol_1.default.for('SYMBOL_GEO_POLYGON');
exports.SYMBOL_GEO_MULTI_POINT = symbol_1.default.for('SYMBOL_GEO_MULTI_POINT');
exports.SYMBOL_GEO_MULTI_LINE_STRING = symbol_1.default.for('SYMBOL_GEO_MULTI_LINE_STRING');
exports.SYMBOL_GEO_MULTI_POLYGON = symbol_1.default.for('SYMBOL_GEO_MULTI_POLYGON');
exports.SYMBOL_SERVER_DATE = symbol_1.default.for('SERVER_DATE');
exports.SYMBOL_REGEXP = symbol_1.default.for('REGEXP');

}, function(modId) { var map = {"../utils/symbol":1776008460211}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460211, function(require, module, exports) {

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
exports.InternalSymbol = void 0;
var _symbols = [];
var __internalMark__ = {};
var HiddenSymbol = (function () {
    function HiddenSymbol(target) {
        Object.defineProperties(this, {
            target: {
                enumerable: false,
                writable: false,
                configurable: false,
                value: target,
            },
        });
    }
    return HiddenSymbol;
}());
var InternalSymbol = (function (_super) {
    __extends(InternalSymbol, _super);
    function InternalSymbol(target, __mark__) {
        if (__mark__ !== __internalMark__) {
            throw new TypeError('InternalSymbol cannot be constructed with new operator');
        }
        return _super.call(this, target) || this;
    }
    InternalSymbol.for = function (target) {
        for (var i = 0, len = _symbols.length; i < len; i++) {
            if (_symbols[i].target === target) {
                return _symbols[i].instance;
            }
        }
        var symbol = new InternalSymbol(target, __internalMark__);
        _symbols.push({
            target: target,
            instance: symbol,
        });
        return symbol;
    };
    return InternalSymbol;
}(HiddenSymbol));
exports.InternalSymbol = InternalSymbol;
exports.default = InternalSymbol;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460212, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainObject = exports.isInternalObject = exports.isRegExp = exports.isDate = exports.isArray = exports.isFunction = exports.isPromise = exports.isNumber = exports.isString = exports.isObject = exports.getType = void 0;
var symbol_1 = require("./symbol");
var getType = function (x) { return Object.prototype.toString.call(x).slice(8, -1).toLowerCase(); };
exports.getType = getType;
var isObject = function (x) { return (0, exports.getType)(x) === 'object'; };
exports.isObject = isObject;
var isString = function (x) { return (0, exports.getType)(x) === 'string'; };
exports.isString = isString;
var isNumber = function (x) { return (0, exports.getType)(x) === 'number'; };
exports.isNumber = isNumber;
var isPromise = function (x) { return (0, exports.getType)(x) === 'promise'; };
exports.isPromise = isPromise;
var isFunction = function (x) { return typeof x === 'function'; };
exports.isFunction = isFunction;
var isArray = function (x) { return Array.isArray(x); };
exports.isArray = isArray;
var isDate = function (x) { return (0, exports.getType)(x) === 'date'; };
exports.isDate = isDate;
var isRegExp = function (x) { return (0, exports.getType)(x) === 'regexp'; };
exports.isRegExp = isRegExp;
var isInternalObject = function (x) { return x && (x._internalType instanceof symbol_1.InternalSymbol); };
exports.isInternalObject = isInternalObject;
var isPlainObject = function (obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    var proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto;
};
exports.isPlainObject = isPlainObject;

}, function(modId) { var map = {"./symbol":1776008460211}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460213, function(require, module, exports) {

var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineString = void 0;
var symbol_1 = require("../helper/symbol");
var point_1 = require("./point");
var type_1 = require("../utils/type");
var LineString = (function () {
    function LineString(points) {
        if (!(0, type_1.isArray)(points)) {
            throw new TypeError("\"points\" must be of type Point[]. Received type ".concat(typeof points));
        }
        if (points.length < 2) {
            throw new Error('"points" must contain 2 points at least');
        }
        points.forEach(function (point) {
            if (!(point instanceof point_1.Point)) {
                throw new TypeError("\"points\" must be of type Point[]. Received type ".concat(typeof point, "[]"));
            }
        });
        this.points = points;
    }
    LineString.prototype.parse = function (key) {
        var _a;
        return _a = {},
            _a[key] = {
                type: 'LineString',
                coordinates: this.points.map(function (point) { return point.toJSON().coordinates; })
            },
            _a;
    };
    LineString.prototype.toJSON = function () {
        return {
            type: 'LineString',
            coordinates: this.points.map(function (point) { return point.toJSON().coordinates; })
        };
    };
    LineString.validate = function (lineString) {
        var e_1, _a;
        if (lineString.type !== 'LineString' || !(0, type_1.isArray)(lineString.coordinates)) {
            return false;
        }
        try {
            for (var _b = __values(lineString.coordinates), _c = _b.next(); !_c.done; _c = _b.next()) {
                var point = _c.value;
                if (!(0, type_1.isNumber)(point[0]) || !(0, type_1.isNumber)(point[1])) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    LineString.isClosed = function (lineString) {
        var firstPoint = lineString.points[0];
        var lastPoint = lineString.points[lineString.points.length - 1];
        if (firstPoint.latitude === lastPoint.latitude && firstPoint.longitude === lastPoint.longitude) {
            return true;
        }
    };
    Object.defineProperty(LineString.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_GEO_LINE_STRING;
        },
        enumerable: false,
        configurable: true
    });
    return LineString;
}());
exports.LineString = LineString;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"./point":1776008460205,"../utils/type":1776008460212}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460214, function(require, module, exports) {

var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Polygon = void 0;
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var lineString_1 = require("./lineString");
var Polygon = (function () {
    function Polygon(lines) {
        if (!(0, type_1.isArray)(lines)) {
            throw new TypeError("\"lines\" must be of type LineString[]. Received type ".concat(typeof lines));
        }
        if (lines.length === 0) {
            throw new Error('Polygon must contain 1 linestring at least');
        }
        lines.forEach(function (line) {
            if (!(line instanceof lineString_1.LineString)) {
                throw new TypeError("\"lines\" must be of type LineString[]. Received type ".concat(typeof line, "[]"));
            }
            if (!lineString_1.LineString.isClosed(line)) {
                throw new Error("LineString ".concat(line.points.map(function (p) { return p.toReadableString(); }), " is not a closed cycle"));
            }
        });
        this.lines = lines;
    }
    Polygon.prototype.parse = function (key) {
        var _a;
        return _a = {},
            _a[key] = {
                type: 'Polygon',
                coordinates: this.lines.map(function (line) {
                    return line.points.map(function (point) { return [point.longitude, point.latitude]; });
                })
            },
            _a;
    };
    Polygon.prototype.toJSON = function () {
        return {
            type: 'Polygon',
            coordinates: this.lines.map(function (line) {
                return line.points.map(function (point) { return [point.longitude, point.latitude]; });
            })
        };
    };
    Polygon.validate = function (polygon) {
        var e_1, _a, e_2, _b;
        if (polygon.type !== 'Polygon' || !(0, type_1.isArray)(polygon.coordinates)) {
            return false;
        }
        try {
            for (var _c = __values(polygon.coordinates), _d = _c.next(); !_d.done; _d = _c.next()) {
                var line = _d.value;
                if (!this.isCloseLineString(line)) {
                    return false;
                }
                try {
                    for (var line_1 = (e_2 = void 0, __values(line)), line_1_1 = line_1.next(); !line_1_1.done; line_1_1 = line_1.next()) {
                        var point = line_1_1.value;
                        if (!(0, type_1.isNumber)(point[0]) || !(0, type_1.isNumber)(point[1])) {
                            return false;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (line_1_1 && !line_1_1.done && (_b = line_1.return)) _b.call(line_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    Polygon.isCloseLineString = function (lineString) {
        var firstPoint = lineString[0];
        var lastPoint = lineString[lineString.length - 1];
        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
            return false;
        }
        return true;
    };
    Object.defineProperty(Polygon.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_GEO_MULTI_POLYGON;
        },
        enumerable: false,
        configurable: true
    });
    return Polygon;
}());
exports.Polygon = Polygon;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"../utils/type":1776008460212,"./lineString":1776008460213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460215, function(require, module, exports) {

var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiPoint = void 0;
var symbol_1 = require("../helper/symbol");
var point_1 = require("./point");
var type_1 = require("../utils/type");
var MultiPoint = (function () {
    function MultiPoint(points) {
        if (!(0, type_1.isArray)(points)) {
            throw new TypeError("\"points\" must be of type Point[]. Received type ".concat(typeof points));
        }
        if (points.length === 0) {
            throw new Error('"points" must contain 1 point at least');
        }
        points.forEach(function (point) {
            if (!(point instanceof point_1.Point)) {
                throw new TypeError("\"points\" must be of type Point[]. Received type ".concat(typeof point, "[]"));
            }
        });
        this.points = points;
    }
    MultiPoint.prototype.parse = function (key) {
        var _a;
        return _a = {},
            _a[key] = {
                type: 'MultiPoint',
                coordinates: this.points.map(function (point) { return point.toJSON().coordinates; })
            },
            _a;
    };
    MultiPoint.prototype.toJSON = function () {
        return {
            type: 'MultiPoint',
            coordinates: this.points.map(function (point) { return point.toJSON().coordinates; })
        };
    };
    MultiPoint.validate = function (multiPoint) {
        var e_1, _a;
        if (multiPoint.type !== 'MultiPoint' || !(0, type_1.isArray)(multiPoint.coordinates)) {
            return false;
        }
        try {
            for (var _b = __values(multiPoint.coordinates), _c = _b.next(); !_c.done; _c = _b.next()) {
                var point = _c.value;
                if (!(0, type_1.isNumber)(point[0]) || !(0, type_1.isNumber)(point[1])) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    Object.defineProperty(MultiPoint.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_GEO_MULTI_POINT;
        },
        enumerable: false,
        configurable: true
    });
    return MultiPoint;
}());
exports.MultiPoint = MultiPoint;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"./point":1776008460205,"../utils/type":1776008460212}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460216, function(require, module, exports) {

var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLineString = void 0;
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var lineString_1 = require("./lineString");
var MultiLineString = (function () {
    function MultiLineString(lines) {
        if (!(0, type_1.isArray)(lines)) {
            throw new TypeError("\"lines\" must be of type LineString[]. Received type ".concat(typeof lines));
        }
        if (lines.length === 0) {
            throw new Error('Polygon must contain 1 linestring at least');
        }
        lines.forEach(function (line) {
            if (!(line instanceof lineString_1.LineString)) {
                throw new TypeError("\"lines\" must be of type LineString[]. Received type ".concat(typeof line, "[]"));
            }
        });
        this.lines = lines;
    }
    MultiLineString.prototype.parse = function (key) {
        var _a;
        return _a = {},
            _a[key] = {
                type: 'MultiLineString',
                coordinates: this.lines.map(function (line) {
                    return line.points.map(function (point) { return [point.longitude, point.latitude]; });
                })
            },
            _a;
    };
    MultiLineString.prototype.toJSON = function () {
        return {
            type: 'MultiLineString',
            coordinates: this.lines.map(function (line) {
                return line.points.map(function (point) { return [point.longitude, point.latitude]; });
            })
        };
    };
    MultiLineString.validate = function (multiLineString) {
        var e_1, _a, e_2, _b;
        if (multiLineString.type !== 'MultiLineString' || !(0, type_1.isArray)(multiLineString.coordinates)) {
            return false;
        }
        try {
            for (var _c = __values(multiLineString.coordinates), _d = _c.next(); !_d.done; _d = _c.next()) {
                var line = _d.value;
                try {
                    for (var line_1 = (e_2 = void 0, __values(line)), line_1_1 = line_1.next(); !line_1_1.done; line_1_1 = line_1.next()) {
                        var point = line_1_1.value;
                        if (!(0, type_1.isNumber)(point[0]) || !(0, type_1.isNumber)(point[1])) {
                            return false;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (line_1_1 && !line_1_1.done && (_b = line_1.return)) _b.call(line_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    Object.defineProperty(MultiLineString.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_GEO_MULTI_LINE_STRING;
        },
        enumerable: false,
        configurable: true
    });
    return MultiLineString;
}());
exports.MultiLineString = MultiLineString;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"../utils/type":1776008460212,"./lineString":1776008460213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460217, function(require, module, exports) {

var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiPolygon = void 0;
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var polygon_1 = require("./polygon");
var MultiPolygon = (function () {
    function MultiPolygon(polygons) {
        var e_1, _a;
        if (!(0, type_1.isArray)(polygons)) {
            throw new TypeError("\"polygons\" must be of type Polygon[]. Received type ".concat(typeof polygons));
        }
        if (polygons.length === 0) {
            throw new Error('MultiPolygon must contain 1 polygon at least');
        }
        try {
            for (var polygons_1 = __values(polygons), polygons_1_1 = polygons_1.next(); !polygons_1_1.done; polygons_1_1 = polygons_1.next()) {
                var polygon = polygons_1_1.value;
                if (!(polygon instanceof polygon_1.Polygon)) {
                    throw new TypeError("\"polygon\" must be of type Polygon[]. Received type ".concat(typeof polygon, "[]"));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (polygons_1_1 && !polygons_1_1.done && (_a = polygons_1.return)) _a.call(polygons_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.polygons = polygons;
    }
    MultiPolygon.prototype.parse = function (key) {
        var _a;
        return _a = {},
            _a[key] = {
                type: 'MultiPolygon',
                coordinates: this.polygons.map(function (polygon) {
                    return polygon.lines.map(function (line) {
                        return line.points.map(function (point) { return [point.longitude, point.latitude]; });
                    });
                })
            },
            _a;
    };
    MultiPolygon.prototype.toJSON = function () {
        return {
            type: 'MultiPolygon',
            coordinates: this.polygons.map(function (polygon) {
                return polygon.lines.map(function (line) {
                    return line.points.map(function (point) { return [point.longitude, point.latitude]; });
                });
            })
        };
    };
    MultiPolygon.validate = function (multiPolygon) {
        var e_2, _a, e_3, _b, e_4, _c;
        if (multiPolygon.type !== 'MultiPolygon' || !(0, type_1.isArray)(multiPolygon.coordinates)) {
            return false;
        }
        try {
            for (var _d = __values(multiPolygon.coordinates), _e = _d.next(); !_e.done; _e = _d.next()) {
                var polygon = _e.value;
                try {
                    for (var polygon_2 = (e_3 = void 0, __values(polygon)), polygon_2_1 = polygon_2.next(); !polygon_2_1.done; polygon_2_1 = polygon_2.next()) {
                        var line = polygon_2_1.value;
                        try {
                            for (var line_1 = (e_4 = void 0, __values(line)), line_1_1 = line_1.next(); !line_1_1.done; line_1_1 = line_1.next()) {
                                var point = line_1_1.value;
                                if (!(0, type_1.isNumber)(point[0]) || !(0, type_1.isNumber)(point[1])) {
                                    return false;
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (line_1_1 && !line_1_1.done && (_c = line_1.return)) _c.call(line_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (polygon_2_1 && !polygon_2_1.done && (_b = polygon_2.return)) _b.call(polygon_2);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return true;
    };
    Object.defineProperty(MultiPolygon.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_GEO_POLYGON;
        },
        enumerable: false,
        configurable: true
    });
    return MultiPolygon;
}());
exports.MultiPolygon = MultiPolygon;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"../utils/type":1776008460212,"./polygon":1776008460214}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460218, function(require, module, exports) {

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
exports.CollectionReference = void 0;
var document_1 = require("./document");
var query_1 = require("./query");
var aggregate_1 = require("./aggregate");
var CollectionReference = (function (_super) {
    __extends(CollectionReference, _super);
    function CollectionReference(db, coll) {
        return _super.call(this, db, coll) || this;
    }
    Object.defineProperty(CollectionReference.prototype, "name", {
        get: function () {
            return this._coll;
        },
        enumerable: false,
        configurable: true
    });
    CollectionReference.prototype.doc = function (docID) {
        if (typeof docID !== 'string' && typeof docID !== 'number') {
            throw new Error('docId必须为字符串或数字');
        }
        return new document_1.DocumentReference(this._db, this._coll, docID);
    };
    CollectionReference.prototype.add = function (data, callback) {
        var docRef = new document_1.DocumentReference(this._db, this._coll, undefined);
        return docRef.create(data, callback);
    };
    CollectionReference.prototype.aggregate = function () {
        return new aggregate_1.default(this._db, this._coll);
    };
    return CollectionReference;
}(query_1.Query));
exports.CollectionReference = CollectionReference;

}, function(modId) { var map = {"./document":1776008460219,"./query":1776008460229,"./aggregate":1776008460231}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460219, function(require, module, exports) {

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
exports.DocumentReference = void 0;
var util_1 = require("./lib/util");
var index_1 = require("./index");
var util_2 = require("./util");
var update_1 = require("./serializer/update");
var datatype_1 = require("./serializer/datatype");
var update_2 = require("./commands/update");
var constant_1 = require("./constant");
var utils_1 = require("./utils/utils");
var DocumentReference = (function () {
    function DocumentReference(db, coll, docID, projection) {
        if (projection === void 0) { projection = {}; }
        var _this = this;
        this.watch = function (options) {
            var ws = (0, utils_1.getWsInstance)(_this._db);
            return ws.watch(__assign(__assign({}, options), { envId: _this._db.config.env, collectionName: _this._coll, query: JSON.stringify({
                    _id: _this.id
                }) }));
        };
        this._db = db;
        this._coll = coll;
        this.id = docID;
        this.request = index_1.Db.createRequest(this._db.config);
        this.projection = projection;
    }
    DocumentReference.prototype.create = function (data, callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        var params = {
            collectionName: this._coll,
            data: (0, datatype_1.serialize)(data)
        };
        if (this.id) {
            params['_id'] = this.id;
        }
        this.request
            .send('database.addDocument', params)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    id: res.data._id,
                    requestId: res.requestId
                });
            }
        })
            .catch(function (err) {
            callback(err);
        });
        return callback.promise;
    };
    DocumentReference.prototype.set = function (data, callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        if (!this.id) {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: 'docId不能为空'
            });
        }
        if (!data || typeof data !== 'object') {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: '参数必需是非空对象'
            });
        }
        if (data.hasOwnProperty('_id')) {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: '不能更新_id的值'
            });
        }
        var hasOperator = false;
        var checkMixed = function (objs) {
            if (typeof objs === 'object') {
                for (var key in objs) {
                    if (objs[key] instanceof update_2.UpdateCommand) {
                        hasOperator = true;
                    }
                    else if (typeof objs[key] === 'object') {
                        checkMixed(objs[key]);
                    }
                }
            }
        };
        checkMixed(data);
        if (hasOperator) {
            return Promise.resolve({
                code: 'DATABASE_REQUEST_FAILED',
                message: 'update operator complicit'
            });
        }
        var merge = false;
        var param = {
            collectionName: this._coll,
            queryType: constant_1.QueryType.DOC,
            data: (0, datatype_1.serialize)(data),
            multi: false,
            merge: merge,
            upsert: true
        };
        if (this.id) {
            param['query'] = { _id: this.id };
        }
        this.request
            .send('database.updateDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    updated: res.data.updated,
                    upsertedId: res.data.upserted_id,
                    requestId: res.requestId
                });
            }
        })
            .catch(function (err) {
            callback(err);
        });
        return callback.promise;
    };
    DocumentReference.prototype.update = function (data, callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        if (!data || typeof data !== 'object') {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: '参数必需是非空对象'
            });
        }
        if (data.hasOwnProperty('_id')) {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: '不能更新_id的值'
            });
        }
        var query = { _id: this.id };
        var merge = true;
        var param = {
            collectionName: this._coll,
            data: update_1.UpdateSerializer.encode(data),
            query: query,
            queryType: constant_1.QueryType.DOC,
            multi: false,
            merge: merge,
            upsert: false
        };
        this.request
            .send('database.updateDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    updated: res.data.updated,
                    upsertedId: res.data.upserted_id,
                    requestId: res.requestId
                });
            }
        })
            .catch(function (err) {
            callback(err);
        });
        return callback.promise;
    };
    DocumentReference.prototype.remove = function (callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        var query = { _id: this.id };
        var param = {
            collectionName: this._coll,
            query: query,
            queryType: constant_1.QueryType.DOC,
            multi: false
        };
        this.request
            .send('database.deleteDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    deleted: res.data.deleted,
                    requestId: res.requestId
                });
            }
        })
            .catch(function (err) {
            callback(err);
        });
        return callback.promise;
    };
    DocumentReference.prototype.get = function (callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        var query = { _id: this.id };
        var param = {
            collectionName: this._coll,
            query: query,
            queryType: constant_1.QueryType.DOC,
            multi: false,
            projection: this.projection
        };
        this.request
            .send('database.queryDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                var documents = util_2.Util.formatResDocumentData(res.data.list);
                callback(0, {
                    data: documents,
                    requestId: res.requestId
                });
            }
        })
            .catch(function (err) {
            callback(err);
        });
        return callback.promise;
    };
    DocumentReference.prototype.field = function (projection) {
        for (var k in projection) {
            if (projection[k]) {
                projection[k] = 1;
            }
            else {
                projection[k] = 0;
            }
        }
        return new DocumentReference(this._db, this._coll, this.id, projection);
    };
    return DocumentReference;
}());
exports.DocumentReference = DocumentReference;

}, function(modId) { var map = {"./lib/util":1776008460220,"./index":1776008460203,"./util":1776008460208,"./serializer/update":1776008460221,"./serializer/datatype":1776008460227,"./commands/update":1776008460222,"./constant":1776008460207,"./utils/utils":1776008460228}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460220, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromiseCallback = void 0;
var createPromiseCallback = function () {
    var cb = function () { };
    if (!Promise) {
        cb.promise = {};
        var throwPromiseNotDefined = function () {
            throw new Error('Your Node runtime does support ES6 Promises. ' +
                'Set "global.Promise" to your preferred implementation of promises.');
        };
        Object.defineProperty(cb.promise, 'then', { get: throwPromiseNotDefined });
        Object.defineProperty(cb.promise, 'catch', { get: throwPromiseNotDefined });
        return cb;
    }
    var promise = new Promise(function (resolve, reject) {
        cb = function (err, data) {
            if (err)
                return reject(err);
            return resolve(data);
        };
    });
    cb.promise = promise;
    return cb;
};
exports.createPromiseCallback = createPromiseCallback;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460221, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSerializer = void 0;
var update_1 = require("../commands/update");
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var operator_map_1 = require("../operator-map");
var common_1 = require("./common");
var UpdateSerializer = (function () {
    function UpdateSerializer() {
    }
    UpdateSerializer.encode = function (query) {
        var stringifier = new UpdateSerializer();
        return stringifier.encodeUpdate(query);
    };
    UpdateSerializer.prototype.encodeUpdate = function (query) {
        if ((0, update_1.isUpdateCommand)(query)) {
            return this.encodeUpdateCommand(query);
        }
        else if ((0, type_1.getType)(query) === 'object') {
            return this.encodeUpdateObject(query);
        }
        else {
            return query;
        }
    };
    UpdateSerializer.prototype.encodeUpdateCommand = function (query) {
        if (query.fieldName === symbol_1.SYMBOL_UNSET_FIELD_NAME) {
            throw new Error('Cannot encode a comparison command with unset field name');
        }
        switch (query.operator) {
            case update_1.UPDATE_COMMANDS_LITERAL.PUSH:
            case update_1.UPDATE_COMMANDS_LITERAL.PULL:
            case update_1.UPDATE_COMMANDS_LITERAL.PULL_ALL:
            case update_1.UPDATE_COMMANDS_LITERAL.POP:
            case update_1.UPDATE_COMMANDS_LITERAL.SHIFT:
            case update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT:
            case update_1.UPDATE_COMMANDS_LITERAL.ADD_TO_SET: {
                return this.encodeArrayUpdateCommand(query);
            }
            default: {
                return this.encodeFieldUpdateCommand(query);
            }
        }
    };
    UpdateSerializer.prototype.encodeFieldUpdateCommand = function (query) {
        var _a, _b, _c, _d;
        var $op = (0, operator_map_1.operatorToString)(query.operator);
        switch (query.operator) {
            case update_1.UPDATE_COMMANDS_LITERAL.REMOVE: {
                return _a = {},
                    _a[$op] = (_b = {},
                        _b[query.fieldName] = '',
                        _b),
                    _a;
            }
            default: {
                return _c = {},
                    _c[$op] = (_d = {},
                        _d[query.fieldName] = query.operands[0],
                        _d),
                    _c;
            }
        }
    };
    UpdateSerializer.prototype.encodeArrayUpdateCommand = function (query) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var $op = (0, operator_map_1.operatorToString)(query.operator);
        switch (query.operator) {
            case update_1.UPDATE_COMMANDS_LITERAL.PUSH: {
                var modifiers = void 0;
                if ((0, type_1.isArray)(query.operands)) {
                    modifiers = {
                        $each: query.operands.map(common_1.encodeInternalDataType)
                    };
                }
                else {
                    modifiers = query.operands;
                }
                return _a = {},
                    _a[$op] = (_b = {},
                        _b[query.fieldName] = modifiers,
                        _b),
                    _a;
            }
            case update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT: {
                var modifiers = {
                    $each: query.operands.map(common_1.encodeInternalDataType),
                    $position: 0
                };
                return _c = {},
                    _c[$op] = (_d = {},
                        _d[query.fieldName] = modifiers,
                        _d),
                    _c;
            }
            case update_1.UPDATE_COMMANDS_LITERAL.POP: {
                return _e = {},
                    _e[$op] = (_f = {},
                        _f[query.fieldName] = 1,
                        _f),
                    _e;
            }
            case update_1.UPDATE_COMMANDS_LITERAL.SHIFT: {
                return _g = {},
                    _g[$op] = (_h = {},
                        _h[query.fieldName] = -1,
                        _h),
                    _g;
            }
            default: {
                return _j = {},
                    _j[$op] = (_k = {},
                        _k[query.fieldName] = (0, common_1.encodeInternalDataType)(query.operands),
                        _k),
                    _j;
            }
        }
    };
    UpdateSerializer.prototype.encodeUpdateObject = function (query) {
        var flattened = (0, common_1.flattenQueryObject)(query);
        for (var key in flattened) {
            if (/^\$/.test(key))
                continue;
            var val = flattened[key];
            if ((0, update_1.isUpdateCommand)(val)) {
                flattened[key] = val._setFieldName(key);
                var condition = this.encodeUpdateCommand(flattened[key]);
                (0, common_1.mergeConditionAfterEncode)(flattened, condition, key);
            }
            else {
                flattened[key] = val = (0, common_1.encodeInternalDataType)(val);
                var $setCommand = new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.SET, [val], key);
                var condition = this.encodeUpdateCommand($setCommand);
                (0, common_1.mergeConditionAfterEncode)(flattened, condition, key);
            }
        }
        return flattened;
    };
    return UpdateSerializer;
}());
exports.UpdateSerializer = UpdateSerializer;

}, function(modId) { var map = {"../commands/update":1776008460222,"../helper/symbol":1776008460210,"../utils/type":1776008460212,"../operator-map":1776008460223,"./common":1776008460226}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460222, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isKnownUpdateCommand = exports.isUpdateCommand = exports.UpdateCommand = exports.UPDATE_COMMANDS_LITERAL = void 0;
var symbol_1 = require("../helper/symbol");
var UPDATE_COMMANDS_LITERAL;
(function (UPDATE_COMMANDS_LITERAL) {
    UPDATE_COMMANDS_LITERAL["SET"] = "set";
    UPDATE_COMMANDS_LITERAL["REMOVE"] = "remove";
    UPDATE_COMMANDS_LITERAL["INC"] = "inc";
    UPDATE_COMMANDS_LITERAL["MUL"] = "mul";
    UPDATE_COMMANDS_LITERAL["PUSH"] = "push";
    UPDATE_COMMANDS_LITERAL["PULL"] = "pull";
    UPDATE_COMMANDS_LITERAL["PULL_ALL"] = "pullAll";
    UPDATE_COMMANDS_LITERAL["POP"] = "pop";
    UPDATE_COMMANDS_LITERAL["SHIFT"] = "shift";
    UPDATE_COMMANDS_LITERAL["UNSHIFT"] = "unshift";
    UPDATE_COMMANDS_LITERAL["ADD_TO_SET"] = "addToSet";
    UPDATE_COMMANDS_LITERAL["BIT"] = "bit";
    UPDATE_COMMANDS_LITERAL["RENAME"] = "rename";
    UPDATE_COMMANDS_LITERAL["MAX"] = "max";
    UPDATE_COMMANDS_LITERAL["MIN"] = "min";
})(UPDATE_COMMANDS_LITERAL = exports.UPDATE_COMMANDS_LITERAL || (exports.UPDATE_COMMANDS_LITERAL = {}));
var UpdateCommand = (function () {
    function UpdateCommand(operator, operands, fieldName) {
        this._internalType = symbol_1.SYMBOL_UPDATE_COMMAND;
        Object.defineProperties(this, {
            _internalType: {
                enumerable: false,
                configurable: false,
            },
        });
        this.operator = operator;
        this.operands = operands;
        this.fieldName = fieldName || symbol_1.SYMBOL_UNSET_FIELD_NAME;
    }
    UpdateCommand.prototype._setFieldName = function (fieldName) {
        var command = new UpdateCommand(this.operator, this.operands, fieldName);
        return command;
    };
    return UpdateCommand;
}());
exports.UpdateCommand = UpdateCommand;
function isUpdateCommand(object) {
    return object && (object instanceof UpdateCommand) && (object._internalType === symbol_1.SYMBOL_UPDATE_COMMAND);
}
exports.isUpdateCommand = isUpdateCommand;
function isKnownUpdateCommand(object) {
    return isUpdateCommand(object) && (object.operator.toUpperCase() in UPDATE_COMMANDS_LITERAL);
}
exports.isKnownUpdateCommand = isKnownUpdateCommand;
exports.default = UpdateCommand;

}, function(modId) { var map = {"../helper/symbol":1776008460210}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460223, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.operatorToString = exports.OperatorMap = void 0;
var query_1 = require("./commands/query");
var logic_1 = require("./commands/logic");
var update_1 = require("./commands/update");
exports.OperatorMap = {};
for (var key in query_1.QUERY_COMMANDS_LITERAL) {
    exports.OperatorMap[key] = '$' + key;
}
for (var key in logic_1.LOGIC_COMMANDS_LITERAL) {
    exports.OperatorMap[key] = '$' + key;
}
for (var key in update_1.UPDATE_COMMANDS_LITERAL) {
    exports.OperatorMap[key] = '$' + key;
}
exports.OperatorMap[query_1.QUERY_COMMANDS_LITERAL.NEQ] = '$ne';
exports.OperatorMap[update_1.UPDATE_COMMANDS_LITERAL.REMOVE] = '$unset';
exports.OperatorMap[update_1.UPDATE_COMMANDS_LITERAL.SHIFT] = '$pop';
exports.OperatorMap[update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT] = '$push';
function operatorToString(operator) {
    return exports.OperatorMap[operator] || '$' + operator;
}
exports.operatorToString = operatorToString;

}, function(modId) { var map = {"./commands/query":1776008460224,"./commands/logic":1776008460225,"./commands/update":1776008460222}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460224, function(require, module, exports) {

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
exports.isComparisonCommand = exports.isKnownQueryCommand = exports.isQueryCommand = exports.QueryCommand = exports.QUERY_COMMANDS_LITERAL = exports.MOD = exports.SIZE = exports.EXISTS = exports.ELEM_MATCH = exports.ALL = exports.NIN = exports.IN = exports.LTE = exports.LT = exports.GTE = exports.GT = exports.NEQ = exports.EQ = void 0;
var logic_1 = require("./logic");
var symbol_1 = require("../helper/symbol");
var index_1 = require("../geo/index");
var type_1 = require("../utils/type");
exports.EQ = 'eq';
exports.NEQ = 'neq';
exports.GT = 'gt';
exports.GTE = 'gte';
exports.LT = 'lt';
exports.LTE = 'lte';
exports.IN = 'in';
exports.NIN = 'nin';
exports.ALL = 'all';
exports.ELEM_MATCH = 'elemMatch';
exports.EXISTS = 'exists';
exports.SIZE = 'size';
exports.MOD = 'mod';
var QUERY_COMMANDS_LITERAL;
(function (QUERY_COMMANDS_LITERAL) {
    QUERY_COMMANDS_LITERAL["EQ"] = "eq";
    QUERY_COMMANDS_LITERAL["NEQ"] = "neq";
    QUERY_COMMANDS_LITERAL["GT"] = "gt";
    QUERY_COMMANDS_LITERAL["GTE"] = "gte";
    QUERY_COMMANDS_LITERAL["LT"] = "lt";
    QUERY_COMMANDS_LITERAL["LTE"] = "lte";
    QUERY_COMMANDS_LITERAL["IN"] = "in";
    QUERY_COMMANDS_LITERAL["NIN"] = "nin";
    QUERY_COMMANDS_LITERAL["ALL"] = "all";
    QUERY_COMMANDS_LITERAL["ELEM_MATCH"] = "elemMatch";
    QUERY_COMMANDS_LITERAL["EXISTS"] = "exists";
    QUERY_COMMANDS_LITERAL["SIZE"] = "size";
    QUERY_COMMANDS_LITERAL["MOD"] = "mod";
    QUERY_COMMANDS_LITERAL["GEO_NEAR"] = "geoNear";
    QUERY_COMMANDS_LITERAL["GEO_WITHIN"] = "geoWithin";
    QUERY_COMMANDS_LITERAL["GEO_INTERSECTS"] = "geoIntersects";
})(QUERY_COMMANDS_LITERAL = exports.QUERY_COMMANDS_LITERAL || (exports.QUERY_COMMANDS_LITERAL = {}));
var QueryCommand = (function (_super) {
    __extends(QueryCommand, _super);
    function QueryCommand(operator, operands, fieldName) {
        var _this = _super.call(this, operator, operands, fieldName) || this;
        _this.operator = operator;
        _this._internalType = symbol_1.SYMBOL_QUERY_COMMAND;
        return _this;
    }
    QueryCommand.prototype.toJSON = function () {
        var _a, _b;
        switch (this.operator) {
            case QUERY_COMMANDS_LITERAL.IN:
            case QUERY_COMMANDS_LITERAL.NIN:
                return _a = {},
                    _a['$' + this.operator] = this.operands,
                    _a;
            default:
                return _b = {},
                    _b['$' + this.operator] = this.operands[0],
                    _b;
        }
    };
    QueryCommand.prototype._setFieldName = function (fieldName) {
        var command = new QueryCommand(this.operator, this.operands, fieldName);
        return command;
    };
    QueryCommand.prototype.eq = function (val) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.EQ, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.neq = function (val) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.NEQ, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.gt = function (val) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.GT, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.gte = function (val) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.GTE, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.lt = function (val) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.LT, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.lte = function (val) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.LTE, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.in = function (list) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.IN, list, this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.nin = function (list) {
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.NIN, list, this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.geoNear = function (val) {
        if (!(val.geometry instanceof index_1.Point)) {
            throw new TypeError("\"geometry\" must be of type Point. Received type ".concat(typeof val.geometry));
        }
        if (val.maxDistance !== undefined && !(0, type_1.isNumber)(val.maxDistance)) {
            throw new TypeError("\"maxDistance\" must be of type Number. Received type ".concat(typeof val.maxDistance));
        }
        if (val.minDistance !== undefined && !(0, type_1.isNumber)(val.minDistance)) {
            throw new TypeError("\"minDistance\" must be of type Number. Received type ".concat(typeof val.minDistance));
        }
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.GEO_NEAR, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.geoWithin = function (val) {
        if (!(val.geometry instanceof index_1.MultiPolygon) && !(val.geometry instanceof index_1.Polygon)) {
            throw new TypeError("\"geometry\" must be of type Polygon or MultiPolygon. Received type ".concat(typeof val.geometry));
        }
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.GEO_WITHIN, [val], this.fieldName);
        return this.and(command);
    };
    QueryCommand.prototype.geoIntersects = function (val) {
        if (!(val.geometry instanceof index_1.Point) &&
            !(val.geometry instanceof index_1.LineString) &&
            !(val.geometry instanceof index_1.Polygon) &&
            !(val.geometry instanceof index_1.MultiPoint) &&
            !(val.geometry instanceof index_1.MultiLineString) &&
            !(val.geometry instanceof index_1.MultiPolygon)) {
            throw new TypeError("\"geometry\" must be of type Point, LineString, Polygon, MultiPoint, MultiLineString or MultiPolygon. Received type ".concat(typeof val.geometry));
        }
        var command = new QueryCommand(QUERY_COMMANDS_LITERAL.GEO_INTERSECTS, [val], this.fieldName);
        return this.and(command);
    };
    return QueryCommand;
}(logic_1.LogicCommand));
exports.QueryCommand = QueryCommand;
function isQueryCommand(object) {
    return object && object instanceof QueryCommand && object._internalType === symbol_1.SYMBOL_QUERY_COMMAND;
}
exports.isQueryCommand = isQueryCommand;
function isKnownQueryCommand(object) {
    return isQueryCommand(object) && object.operator.toUpperCase() in QUERY_COMMANDS_LITERAL;
}
exports.isKnownQueryCommand = isKnownQueryCommand;
function isComparisonCommand(object) {
    return isQueryCommand(object);
}
exports.isComparisonCommand = isComparisonCommand;
exports.default = QueryCommand;

}, function(modId) { var map = {"./logic":1776008460225,"../helper/symbol":1776008460210,"../geo/index":1776008460204,"../utils/type":1776008460212}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460225, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isKnownLogicCommand = exports.isLogicCommand = exports.LogicCommand = exports.LOGIC_COMMANDS_LITERAL = exports.NOR = exports.NOT = exports.OR = exports.AND = void 0;
var symbol_1 = require("../helper/symbol");
var query_1 = require("./query");
exports.AND = 'and';
exports.OR = 'or';
exports.NOT = 'not';
exports.NOR = 'nor';
var LOGIC_COMMANDS_LITERAL;
(function (LOGIC_COMMANDS_LITERAL) {
    LOGIC_COMMANDS_LITERAL["AND"] = "and";
    LOGIC_COMMANDS_LITERAL["OR"] = "or";
    LOGIC_COMMANDS_LITERAL["NOT"] = "not";
    LOGIC_COMMANDS_LITERAL["NOR"] = "nor";
})(LOGIC_COMMANDS_LITERAL = exports.LOGIC_COMMANDS_LITERAL || (exports.LOGIC_COMMANDS_LITERAL = {}));
var LogicCommand = (function () {
    function LogicCommand(operator, operands, fieldName) {
        this._internalType = symbol_1.SYMBOL_LOGIC_COMMAND;
        Object.defineProperties(this, {
            _internalType: {
                enumerable: false,
                configurable: false,
            },
        });
        this.operator = operator;
        this.operands = operands;
        this.fieldName = fieldName || symbol_1.SYMBOL_UNSET_FIELD_NAME;
        if (this.fieldName !== symbol_1.SYMBOL_UNSET_FIELD_NAME) {
            if (Array.isArray(operands)) {
                operands = operands.slice();
                this.operands = operands;
                for (var i = 0, len = operands.length; i < len; i++) {
                    var query = operands[i];
                    if (isLogicCommand(query) || (0, query_1.isQueryCommand)(query)) {
                        operands[i] = query._setFieldName(this.fieldName);
                    }
                }
            }
            else {
                var query = operands;
                if (isLogicCommand(query) || (0, query_1.isQueryCommand)(query)) {
                    operands = query._setFieldName(this.fieldName);
                }
            }
        }
    }
    LogicCommand.prototype._setFieldName = function (fieldName) {
        var operands = this.operands.map(function (operand) {
            if (operand instanceof LogicCommand) {
                return operand._setFieldName(fieldName);
            }
            else {
                return operand;
            }
        });
        var command = new LogicCommand(this.operator, operands, fieldName);
        return command;
    };
    LogicCommand.prototype.and = function () {
        var __expressions__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __expressions__[_i] = arguments[_i];
        }
        var expressions = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments);
        expressions.unshift(this);
        return new LogicCommand(LOGIC_COMMANDS_LITERAL.AND, expressions, this.fieldName);
    };
    LogicCommand.prototype.or = function () {
        var __expressions__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __expressions__[_i] = arguments[_i];
        }
        var expressions = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments);
        expressions.unshift(this);
        return new LogicCommand(LOGIC_COMMANDS_LITERAL.OR, expressions, this.fieldName);
    };
    return LogicCommand;
}());
exports.LogicCommand = LogicCommand;
function isLogicCommand(object) {
    return object && (object instanceof LogicCommand) && (object._internalType === symbol_1.SYMBOL_LOGIC_COMMAND);
}
exports.isLogicCommand = isLogicCommand;
function isKnownLogicCommand(object) {
    return isLogicCommand && (object.operator.toUpperCase() in LOGIC_COMMANDS_LITERAL);
}
exports.isKnownLogicCommand = isKnownLogicCommand;
exports.default = LogicCommand;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"./query":1776008460224}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460226, function(require, module, exports) {

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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeInternalDataType = exports.encodeInternalDataType = exports.isConversionRequired = exports.mergeConditionAfterEncode = exports.flattenObject = exports.flattenQueryObject = void 0;
var type_1 = require("../utils/type");
var datatype_1 = require("./datatype");
function flatten(query, shouldPreserverObject, parents, visited) {
    var cloned = __assign({}, query);
    for (var key in query) {
        if (/^\$/.test(key))
            continue;
        var value = query[key];
        if (!value)
            continue;
        if ((0, type_1.isObject)(value) && !shouldPreserverObject(value)) {
            if (visited.indexOf(value) > -1) {
                throw new Error('Cannot convert circular structure to JSON');
            }
            var newParents = __spreadArray(__spreadArray([], __read(parents), false), [
                key,
            ], false);
            var newVisited = __spreadArray(__spreadArray([], __read(visited), false), [
                value,
            ], false);
            var flattenedChild = flatten(value, shouldPreserverObject, newParents, newVisited);
            cloned[key] = flattenedChild;
            var hasKeyNotCombined = false;
            for (var childKey in flattenedChild) {
                if (!/^\$/.test(childKey)) {
                    cloned["".concat(key, ".").concat(childKey)] = flattenedChild[childKey];
                    delete cloned[key][childKey];
                }
                else {
                    hasKeyNotCombined = true;
                }
            }
            if (!hasKeyNotCombined) {
                delete cloned[key];
            }
        }
    }
    return cloned;
}
function flattenQueryObject(query) {
    return flatten(query, isConversionRequired, [], [query]);
}
exports.flattenQueryObject = flattenQueryObject;
function flattenObject(object) {
    return flatten(object, function (_) { return false; }, [], [object]);
}
exports.flattenObject = flattenObject;
function mergeConditionAfterEncode(query, condition, key) {
    if (!condition[key]) {
        delete query[key];
    }
    for (var conditionKey in condition) {
        if (query[conditionKey]) {
            if ((0, type_1.isArray)(query[conditionKey])) {
                query[conditionKey].push(condition[conditionKey]);
            }
            else if ((0, type_1.isObject)(query[conditionKey])) {
                if ((0, type_1.isObject)(condition[conditionKey])) {
                    Object.assign(query[conditionKey], condition[conditionKey]);
                }
                else {
                    console.warn("unmergable condition, query is object but condition is ".concat((0, type_1.getType)(condition), ", can only overwrite"), condition, key);
                    query[conditionKey] = condition[conditionKey];
                }
            }
            else {
                console.warn("to-merge query is of type ".concat((0, type_1.getType)(query), ", can only overwrite"), query, condition, key);
                query[conditionKey] = condition[conditionKey];
            }
        }
        else {
            query[conditionKey] = condition[conditionKey];
        }
    }
}
exports.mergeConditionAfterEncode = mergeConditionAfterEncode;
function isConversionRequired(val) {
    return (0, type_1.isInternalObject)(val) || (0, type_1.isDate)(val) || (0, type_1.isRegExp)(val);
}
exports.isConversionRequired = isConversionRequired;
function encodeInternalDataType(val) {
    return (0, datatype_1.serialize)(val);
}
exports.encodeInternalDataType = encodeInternalDataType;
function decodeInternalDataType(object) {
    return (0, datatype_1.deserialize)(object);
}
exports.decodeInternalDataType = decodeInternalDataType;

}, function(modId) { var map = {"../utils/type":1776008460212,"./datatype":1776008460227}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460227, function(require, module, exports) {

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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = exports.serialize = void 0;
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var index_1 = require("../geo/index");
var index_2 = require("../serverDate/index");
function serialize(val) {
    return serializeHelper(val, [val]);
}
exports.serialize = serialize;
function serializeHelper(val, visited) {
    if ((0, type_1.isInternalObject)(val)) {
        switch (val._internalType) {
            case symbol_1.SYMBOL_GEO_POINT: {
                return val.toJSON();
            }
            case symbol_1.SYMBOL_SERVER_DATE: {
                return val.parse();
            }
            case symbol_1.SYMBOL_REGEXP: {
                return val.parse();
            }
            default: {
                return val.toJSON ? val.toJSON() : val;
            }
        }
    }
    else if ((0, type_1.isDate)(val)) {
        return {
            $date: +val,
        };
    }
    else if ((0, type_1.isRegExp)(val)) {
        return {
            $regex: val.source,
            $options: val.flags,
        };
    }
    else if ((0, type_1.isArray)(val)) {
        return val.map(function (item) {
            if (visited.indexOf(item) > -1) {
                throw new Error('Cannot convert circular structure to JSON');
            }
            return serializeHelper(item, __spreadArray(__spreadArray([], __read(visited), false), [
                item,
            ], false));
        });
    }
    else if ((0, type_1.isObject)(val)) {
        var ret = __assign({}, val);
        for (var key in ret) {
            if (visited.indexOf(ret[key]) > -1) {
                throw new Error('Cannot convert circular structure to JSON');
            }
            ret[key] = serializeHelper(ret[key], __spreadArray(__spreadArray([], __read(visited), false), [
                ret[key],
            ], false));
        }
        return ret;
    }
    else {
        return val;
    }
}
function deserialize(object) {
    var ret = __assign({}, object);
    for (var key in ret) {
        switch (key) {
            case '$date': {
                switch ((0, type_1.getType)(ret[key])) {
                    case 'number': {
                        return new Date(ret[key]);
                    }
                    case 'object': {
                        return new index_2.ServerDate(ret[key]);
                    }
                }
                break;
            }
            case 'type': {
                switch (ret.type) {
                    case 'Point': {
                        if ((0, type_1.isArray)(ret.coordinates) && (0, type_1.isNumber)(ret.coordinates[0]) && (0, type_1.isNumber)(ret.coordinates[1])) {
                            return new index_1.Point(ret.coordinates[0], ret.coordinates[1]);
                        }
                        break;
                    }
                }
                break;
            }
        }
    }
    return object;
}
exports.deserialize = deserialize;

}, function(modId) { var map = {"../helper/symbol":1776008460210,"../utils/type":1776008460212,"../geo/index":1776008460204,"../serverDate/index":1776008460209}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460228, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getWsInstance = exports.autoCount = exports.sleep = void 0;
var __1 = require("../");
var sleep = function (ms) {
    if (ms === void 0) { ms = 0; }
    return new Promise(function (r) { return setTimeout(r, ms); });
};
exports.sleep = sleep;
var counters = {};
var autoCount = function (domain) {
    if (domain === void 0) { domain = 'any'; }
    if (!counters[domain]) {
        counters[domain] = 0;
    }
    return counters[domain]++;
};
exports.autoCount = autoCount;
var wsList = {};
function getWsInstance(db) {
    if (!__1.Db.wsClientClass) {
        throw new Error('to use realtime you must import realtime module first');
    }
    var env = db.config.env;
    if (!wsList[env]) {
        wsList[env] = new __1.Db.wsClientClass({
            context: {
                appConfig: {
                    docSizeLimit: 1000,
                    realtimePingInterval: 10000,
                    realtimePongWaitTimeout: 5000,
                    request: __1.Db.createRequest(db.config)
                }
            }
        });
    }
    return wsList[env];
}
exports.getWsInstance = getWsInstance;

}, function(modId) { var map = {"../":1776008460203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460229, function(require, module, exports) {

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
exports.Query = void 0;
var util_1 = require("./lib/util");
var constant_1 = require("./constant");
var index_1 = require("./index");
var validate_1 = require("./validate");
var util_2 = require("./util");
var query_1 = require("./serializer/query");
var update_1 = require("./serializer/update");
var constant_2 = require("./constant");
var utils_1 = require("./utils/utils");
var Query = (function () {
    function Query(db, coll, fieldFilters, fieldOrders, queryOptions) {
        var _this = this;
        this.watch = function (options) {
            var ws = (0, utils_1.getWsInstance)(_this._db);
            return ws.watch(__assign(__assign({}, options), { envId: _this._db.config.env, collectionName: _this._coll, query: JSON.stringify(_this._fieldFilters || {}), limit: _this._queryOptions.limit, orderBy: _this._fieldOrders
                    ? _this._fieldOrders.reduce(function (acc, cur) {
                        acc[cur.field] = cur.direction;
                        return acc;
                    }, {})
                    : undefined }));
        };
        this._db = db;
        this._coll = coll;
        this._fieldFilters = fieldFilters;
        this._fieldOrders = fieldOrders || [];
        this._queryOptions = queryOptions || {};
        this._request = index_1.Db.createRequest(this._db.config);
    }
    Query.prototype.get = function (callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        var newOder = [];
        if (this._fieldOrders) {
            this._fieldOrders.forEach(function (order) {
                newOder.push(order);
            });
        }
        var param = {
            collectionName: this._coll,
            queryType: constant_1.QueryType.WHERE
        };
        if (this._fieldFilters) {
            param.query = this._fieldFilters;
        }
        if (newOder.length > 0) {
            param.order = newOder;
        }
        if (this._queryOptions.offset) {
            param.offset = this._queryOptions.offset;
        }
        if (this._queryOptions.limit) {
            param.limit = this._queryOptions.limit < 1000 ? this._queryOptions.limit : 1000;
        }
        else {
            param.limit = 100;
        }
        if (this._queryOptions.projection) {
            param.projection = this._queryOptions.projection;
        }
        this._request
            .send('database.queryDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                var documents = util_2.Util.formatResDocumentData(res.data.list);
                var result = {
                    data: documents,
                    requestId: res.requestId
                };
                if (res.total !== undefined)
                    result.total = res.total;
                if (res.limit !== undefined)
                    result.limit = res.limit;
                if (res.offset !== undefined)
                    result.offset = res.offset;
                callback(0, result);
            }
        })
            .catch(function (err) {
            callback(err);
        });
        return callback.promise;
    };
    Query.prototype.count = function (callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        var param = {
            collectionName: this._coll,
            queryType: constant_1.QueryType.WHERE
        };
        if (this._fieldFilters) {
            param.query = this._fieldFilters;
        }
        this._request
            .send('database.countDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    requestId: res.requestId,
                    total: res.data.total
                });
            }
        })
            .catch(function (e) {
            callback(e);
        });
        return callback.promise;
    };
    Query.prototype.where = function (query) {
        if (Object.prototype.toString.call(query).slice(8, -1) !== 'Object') {
            throw Error(constant_2.ErrorCode.QueryParamTypeError);
        }
        var keys = Object.keys(query);
        var checkFlag = keys.some(function (item) {
            return query[item] !== undefined;
        });
        if (keys.length && !checkFlag) {
            throw Error(constant_2.ErrorCode.QueryParamValueError);
        }
        return new Query(this._db, this._coll, query_1.QuerySerializer.encode(query), this._fieldOrders, this._queryOptions);
    };
    Query.prototype.orderBy = function (fieldPath, directionStr) {
        validate_1.Validate.isFieldPath(fieldPath);
        validate_1.Validate.isFieldOrder(directionStr);
        var newOrder = {
            field: fieldPath,
            direction: directionStr
        };
        var combinedOrders = this._fieldOrders.concat(newOrder);
        return new Query(this._db, this._coll, this._fieldFilters, combinedOrders, this._queryOptions);
    };
    Query.prototype.limit = function (limit) {
        validate_1.Validate.isInteger('limit', limit);
        var option = __assign({}, this._queryOptions);
        option.limit = limit;
        return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option);
    };
    Query.prototype.skip = function (offset) {
        validate_1.Validate.isInteger('offset', offset);
        var option = __assign({}, this._queryOptions);
        option.offset = offset;
        return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option);
    };
    Query.prototype.update = function (data, callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        if (!data || typeof data !== 'object') {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: '参数必需是非空对象'
            });
        }
        if (data.hasOwnProperty('_id')) {
            return Promise.resolve({
                code: 'INVALID_PARAM',
                message: '不能更新_id的值'
            });
        }
        var param = {
            collectionName: this._coll,
            query: this._fieldFilters,
            queryType: constant_1.QueryType.WHERE,
            multi: true,
            merge: true,
            upsert: false,
            data: update_1.UpdateSerializer.encode(data)
        };
        this._request
            .send('database.updateDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    requestId: res.requestId,
                    updated: res.data.updated,
                    upsertId: res.data.upsert_id
                });
            }
        })
            .catch(function (e) {
            callback(e);
        });
        return callback.promise;
    };
    Query.prototype.field = function (projection) {
        for (var k in projection) {
            if (projection[k]) {
                if (typeof projection[k] !== 'object') {
                    projection[k] = 1;
                }
            }
            else {
                projection[k] = 0;
            }
        }
        var option = __assign({}, this._queryOptions);
        option.projection = projection;
        return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option);
    };
    Query.prototype.remove = function (callback) {
        callback = callback || (0, util_1.createPromiseCallback)();
        if (Object.keys(this._queryOptions).length > 0) {
            console.warn('`offset`, `limit` and `projection` are not supported in remove() operation');
        }
        if (this._fieldOrders.length > 0) {
            console.warn('`orderBy` is not supported in remove() operation');
        }
        var param = {
            collectionName: this._coll,
            query: query_1.QuerySerializer.encode(this._fieldFilters),
            queryType: constant_1.QueryType.WHERE,
            multi: true
        };
        this._request
            .send('database.deleteDocument', param)
            .then(function (res) {
            if (res.code) {
                callback(0, res);
            }
            else {
                callback(0, {
                    requestId: res.requestId,
                    deleted: res.data.deleted
                });
            }
        })
            .catch(function (e) {
            callback(e);
        });
        return callback.promise;
    };
    return Query;
}());
exports.Query = Query;

}, function(modId) { var map = {"./lib/util":1776008460220,"./constant":1776008460207,"./index":1776008460203,"./validate":1776008460206,"./util":1776008460208,"./serializer/query":1776008460230,"./serializer/update":1776008460221,"./utils/utils":1776008460228}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460230, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.QuerySerializer = void 0;
var query_1 = require("../commands/query");
var logic_1 = require("../commands/logic");
var symbol_1 = require("../helper/symbol");
var type_1 = require("../utils/type");
var operator_map_1 = require("../operator-map");
var common_1 = require("./common");
var QuerySerializer = (function () {
    function QuerySerializer() {
    }
    QuerySerializer.encode = function (query) {
        var encoder = new QueryEncoder();
        return encoder.encodeQuery(query);
    };
    return QuerySerializer;
}());
exports.QuerySerializer = QuerySerializer;
var QueryEncoder = (function () {
    function QueryEncoder() {
    }
    QueryEncoder.prototype.encodeQuery = function (query, key) {
        var _a;
        if ((0, common_1.isConversionRequired)(query)) {
            if ((0, logic_1.isLogicCommand)(query)) {
                return this.encodeLogicCommand(query);
            }
            else if ((0, query_1.isQueryCommand)(query)) {
                return this.encodeQueryCommand(query);
            }
            else {
                return _a = {}, _a[key] = this.encodeQueryObject(query), _a;
            }
        }
        else {
            if ((0, type_1.isObject)(query)) {
                return this.encodeQueryObject(query);
            }
            else {
                return query;
            }
        }
    };
    QueryEncoder.prototype.encodeRegExp = function (query) {
        return {
            $regex: query.source,
            $options: query.flags
        };
    };
    QueryEncoder.prototype.encodeLogicCommand = function (query) {
        var _a, _b, _c, _d, _e, _f, _g;
        var _this = this;
        switch (query.operator) {
            case logic_1.LOGIC_COMMANDS_LITERAL.NOR:
            case logic_1.LOGIC_COMMANDS_LITERAL.AND:
            case logic_1.LOGIC_COMMANDS_LITERAL.OR: {
                var $op = (0, operator_map_1.operatorToString)(query.operator);
                var subqueries = query.operands.map(function (oprand) {
                    return _this.encodeQuery(oprand, query.fieldName);
                });
                return _a = {},
                    _a[$op] = subqueries,
                    _a;
            }
            case logic_1.LOGIC_COMMANDS_LITERAL.NOT: {
                var $op = (0, operator_map_1.operatorToString)(query.operator);
                var operatorExpression = query.operands[0];
                if ((0, type_1.isRegExp)(operatorExpression)) {
                    return _b = {},
                        _b[query.fieldName] = (_c = {},
                            _c[$op] = this.encodeRegExp(operatorExpression),
                            _c),
                        _b;
                }
                else {
                    var subqueries = this.encodeQuery(operatorExpression)[query.fieldName];
                    return _d = {},
                        _d[query.fieldName] = (_e = {},
                            _e[$op] = subqueries,
                            _e),
                        _d;
                }
            }
            default: {
                var $op = (0, operator_map_1.operatorToString)(query.operator);
                if (query.operands.length === 1) {
                    var subquery = this.encodeQuery(query.operands[0]);
                    return _f = {},
                        _f[$op] = subquery,
                        _f;
                }
                else {
                    var subqueries = query.operands.map(this.encodeQuery.bind(this));
                    return _g = {},
                        _g[$op] = subqueries,
                        _g;
                }
            }
        }
    };
    QueryEncoder.prototype.encodeQueryCommand = function (query) {
        if ((0, query_1.isComparisonCommand)(query)) {
            return this.encodeComparisonCommand(query);
        }
        else {
            return this.encodeComparisonCommand(query);
        }
    };
    QueryEncoder.prototype.encodeComparisonCommand = function (query) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (query.fieldName === symbol_1.SYMBOL_UNSET_FIELD_NAME) {
            throw new Error('Cannot encode a comparison command with unset field name');
        }
        var $op = (0, operator_map_1.operatorToString)(query.operator);
        switch (query.operator) {
            case query_1.QUERY_COMMANDS_LITERAL.EQ:
            case query_1.QUERY_COMMANDS_LITERAL.NEQ:
            case query_1.QUERY_COMMANDS_LITERAL.LT:
            case query_1.QUERY_COMMANDS_LITERAL.LTE:
            case query_1.QUERY_COMMANDS_LITERAL.GT:
            case query_1.QUERY_COMMANDS_LITERAL.GTE:
            case query_1.QUERY_COMMANDS_LITERAL.ELEM_MATCH:
            case query_1.QUERY_COMMANDS_LITERAL.EXISTS:
            case query_1.QUERY_COMMANDS_LITERAL.SIZE:
            case query_1.QUERY_COMMANDS_LITERAL.MOD: {
                return _a = {},
                    _a[query.fieldName] = (_b = {},
                        _b[$op] = (0, common_1.encodeInternalDataType)(query.operands[0]),
                        _b),
                    _a;
            }
            case query_1.QUERY_COMMANDS_LITERAL.IN:
            case query_1.QUERY_COMMANDS_LITERAL.NIN:
            case query_1.QUERY_COMMANDS_LITERAL.ALL: {
                return _c = {},
                    _c[query.fieldName] = (_d = {},
                        _d[$op] = (0, common_1.encodeInternalDataType)(query.operands),
                        _d),
                    _c;
            }
            case query_1.QUERY_COMMANDS_LITERAL.GEO_NEAR: {
                var options = query.operands[0];
                return _e = {},
                    _e[query.fieldName] = {
                        $nearSphere: {
                            $geometry: options.geometry.toJSON(),
                            $maxDistance: options.maxDistance,
                            $minDistance: options.minDistance
                        }
                    },
                    _e;
            }
            case query_1.QUERY_COMMANDS_LITERAL.GEO_WITHIN: {
                var options = query.operands[0];
                return _f = {},
                    _f[query.fieldName] = {
                        $geoWithin: {
                            $geometry: options.geometry.toJSON()
                        }
                    },
                    _f;
            }
            case query_1.QUERY_COMMANDS_LITERAL.GEO_INTERSECTS: {
                var options = query.operands[0];
                return _g = {},
                    _g[query.fieldName] = {
                        $geoIntersects: {
                            $geometry: options.geometry.toJSON()
                        }
                    },
                    _g;
            }
            default: {
                return _h = {},
                    _h[query.fieldName] = (_j = {},
                        _j[$op] = (0, common_1.encodeInternalDataType)(query.operands[0]),
                        _j),
                    _h;
            }
        }
    };
    QueryEncoder.prototype.encodeQueryObject = function (query) {
        var flattened = (0, common_1.flattenQueryObject)(query);
        for (var key in flattened) {
            var val = flattened[key];
            if ((0, logic_1.isLogicCommand)(val)) {
                flattened[key] = val._setFieldName(key);
                var condition = this.encodeLogicCommand(flattened[key]);
                this.mergeConditionAfterEncode(flattened, condition, key);
            }
            else if ((0, query_1.isComparisonCommand)(val)) {
                flattened[key] = val._setFieldName(key);
                var condition = this.encodeComparisonCommand(flattened[key]);
                this.mergeConditionAfterEncode(flattened, condition, key);
            }
            else if ((0, common_1.isConversionRequired)(val)) {
                flattened[key] = (0, common_1.encodeInternalDataType)(val);
            }
        }
        return flattened;
    };
    QueryEncoder.prototype.mergeConditionAfterEncode = function (query, condition, key) {
        if (!condition[key]) {
            delete query[key];
        }
        for (var conditionKey in condition) {
            if (query[conditionKey]) {
                if ((0, type_1.isArray)(query[conditionKey])) {
                    query[conditionKey] = query[conditionKey].concat(condition[conditionKey]);
                }
                else if ((0, type_1.isObject)(query[conditionKey])) {
                    if ((0, type_1.isObject)(condition[conditionKey])) {
                        Object.assign(query, condition);
                    }
                    else {
                        console.warn("unmergable condition, query is object but condition is ".concat((0, type_1.getType)(condition), ", can only overwrite"), condition, key);
                        query[conditionKey] = condition[conditionKey];
                    }
                }
                else {
                    console.warn("to-merge query is of type ".concat((0, type_1.getType)(query), ", can only overwrite"), query, condition, key);
                    query[conditionKey] = condition[conditionKey];
                }
            }
            else {
                query[conditionKey] = condition[conditionKey];
            }
        }
    };
    return QueryEncoder;
}());

}, function(modId) { var map = {"../commands/query":1776008460224,"../commands/logic":1776008460225,"../helper/symbol":1776008460210,"../utils/type":1776008460212,"../operator-map":1776008460223,"./common":1776008460226}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460231, function(require, module, exports) {

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
var index_1 = require("./index");
var bson_1 = require("bson");
var query_1 = require("./serializer/query");
var geo_1 = require("./geo");
var Aggregation = (function () {
    function Aggregation(db, collectionName) {
        this._stages = [];
        if (db && collectionName) {
            this._db = db;
            this._request = index_1.Db.createRequest(this._db.config);
            this._collectionName = collectionName;
        }
    }
    Aggregation.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._collectionName || !this._db) {
                            throw new Error('Aggregation pipeline cannot send request');
                        }
                        return [4, this._request.send('database.aggregate', {
                                collectionName: this._collectionName,
                                stages: this._stages
                            })];
                    case 1:
                        result = _a.sent();
                        if (result && result.data && result.data.list) {
                            return [2, {
                                    requestId: result.requestId,
                                    data: JSON.parse(result.data.list).map(bson_1.EJSON.parse)
                                }];
                        }
                        return [2, result];
                }
            });
        });
    };
    Aggregation.prototype.unwrap = function () {
        return this._stages;
    };
    Aggregation.prototype.done = function () {
        return this._stages.map(function (_a) {
            var _b;
            var stageKey = _a.stageKey, stageValue = _a.stageValue;
            return _b = {},
                _b[stageKey] = JSON.parse(stageValue),
                _b;
        });
    };
    Aggregation.prototype._pipe = function (stage, param) {
        this._stages.push({
            stageKey: "$".concat(stage),
            stageValue: JSON.stringify(param)
        });
        return this;
    };
    Aggregation.prototype.addFields = function (param) {
        return this._pipe('addFields', param);
    };
    Aggregation.prototype.bucket = function (param) {
        return this._pipe('bucket', param);
    };
    Aggregation.prototype.bucketAuto = function (param) {
        return this._pipe('bucketAuto', param);
    };
    Aggregation.prototype.count = function (param) {
        return this._pipe('count', param);
    };
    Aggregation.prototype.geoNear = function (param) {
        if (param.query) {
            param.query = query_1.QuerySerializer.encode(param.query);
        }
        if (param.distanceMultiplier && typeof (param.distanceMultiplier) === 'number') {
            param.distanceMultiplier = param.distanceMultiplier;
        }
        if (param.near) {
            param.near = new geo_1.Point(param.near.longitude, param.near.latitude).toJSON();
        }
        return this._pipe('geoNear', param);
    };
    Aggregation.prototype.group = function (param) {
        return this._pipe('group', param);
    };
    Aggregation.prototype.limit = function (param) {
        return this._pipe('limit', param);
    };
    Aggregation.prototype.match = function (param) {
        return this._pipe('match', query_1.QuerySerializer.encode(param));
    };
    Aggregation.prototype.project = function (param) {
        return this._pipe('project', param);
    };
    Aggregation.prototype.lookup = function (param) {
        return this._pipe('lookup', param);
    };
    Aggregation.prototype.replaceRoot = function (param) {
        return this._pipe('replaceRoot', param);
    };
    Aggregation.prototype.sample = function (param) {
        return this._pipe('sample', param);
    };
    Aggregation.prototype.skip = function (param) {
        return this._pipe('skip', param);
    };
    Aggregation.prototype.sort = function (param) {
        return this._pipe('sort', param);
    };
    Aggregation.prototype.sortByCount = function (param) {
        return this._pipe('sortByCount', param);
    };
    Aggregation.prototype.unwind = function (param) {
        return this._pipe('unwind', param);
    };
    return Aggregation;
}());
exports.default = Aggregation;

}, function(modId) { var map = {"./index":1776008460203,"./serializer/query":1776008460230,"./geo":1776008460204}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460232, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
var query_1 = require("./commands/query");
var logic_1 = require("./commands/logic");
var update_1 = require("./commands/update");
var type_1 = require("./utils/type");
var aggregate_1 = require("./aggregate");
exports.Command = {
    eq: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.EQ, [val]);
    },
    neq: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.NEQ, [val]);
    },
    lt: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.LT, [val]);
    },
    lte: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.LTE, [val]);
    },
    gt: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.GT, [val]);
    },
    gte: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.GTE, [val]);
    },
    in: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.IN, val);
    },
    nin: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.NIN, val);
    },
    all: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.ALL, val);
    },
    elemMatch: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.ELEM_MATCH, [val]);
    },
    exists: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.EXISTS, [val]);
    },
    size: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.SIZE, [val]);
    },
    mod: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.MOD, [val]);
    },
    geoNear: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.GEO_NEAR, [val]);
    },
    geoWithin: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.GEO_WITHIN, [val]);
    },
    geoIntersects: function (val) {
        return new query_1.QueryCommand(query_1.QUERY_COMMANDS_LITERAL.GEO_INTERSECTS, [val]);
    },
    and: function () {
        var __expressions__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __expressions__[_i] = arguments[_i];
        }
        var expressions = (0, type_1.isArray)(arguments[0]) ? arguments[0] : Array.from(arguments);
        return new logic_1.LogicCommand(logic_1.LOGIC_COMMANDS_LITERAL.AND, expressions);
    },
    nor: function () {
        var __expressions__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __expressions__[_i] = arguments[_i];
        }
        var expressions = (0, type_1.isArray)(arguments[0]) ? arguments[0] : Array.from(arguments);
        return new logic_1.LogicCommand(logic_1.LOGIC_COMMANDS_LITERAL.NOR, expressions);
    },
    or: function () {
        var __expressions__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __expressions__[_i] = arguments[_i];
        }
        var expressions = (0, type_1.isArray)(arguments[0]) ? arguments[0] : Array.from(arguments);
        return new logic_1.LogicCommand(logic_1.LOGIC_COMMANDS_LITERAL.OR, expressions);
    },
    not: function () {
        var __expressions__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __expressions__[_i] = arguments[_i];
        }
        var expressions = (0, type_1.isArray)(arguments[0]) ? arguments[0] : Array.from(arguments);
        return new logic_1.LogicCommand(logic_1.LOGIC_COMMANDS_LITERAL.NOT, expressions);
    },
    set: function (val) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.SET, [val]);
    },
    remove: function () {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.REMOVE, []);
    },
    inc: function (val) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.INC, [val]);
    },
    mul: function (val) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.MUL, [val]);
    },
    push: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var values;
        if ((0, type_1.isObject)(args[0]) && args[0].hasOwnProperty('each')) {
            var options = args[0];
            values = {
                $each: options.each,
                $position: options.position,
                $sort: options.sort,
                $slice: options.slice
            };
        }
        else if ((0, type_1.isArray)(args[0])) {
            values = args[0];
        }
        else {
            values = Array.from(args);
        }
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.PUSH, values);
    },
    pull: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.PULL, values);
    },
    pullAll: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.PULL_ALL, values);
    },
    pop: function () {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.POP, []);
    },
    shift: function () {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.SHIFT, []);
    },
    unshift: function () {
        var __values__ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            __values__[_i] = arguments[_i];
        }
        var values = (0, type_1.isArray)(arguments[0]) ? arguments[0] : Array.from(arguments);
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.UNSHIFT, values);
    },
    addToSet: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.ADD_TO_SET, values);
    },
    rename: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.RENAME, [values]);
    },
    bit: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.BIT, [values]);
    },
    max: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.MAX, [values]);
    },
    min: function (values) {
        return new update_1.UpdateCommand(update_1.UPDATE_COMMANDS_LITERAL.MIN, [values]);
    },
    expr: function (values) {
        return {
            $expr: values
        };
    },
    jsonSchema: function (schema) {
        return {
            $jsonSchema: schema
        };
    },
    text: function (values) {
        if ((0, type_1.isString)(values)) {
            return {
                $search: values.search
            };
        }
        else {
            return {
                $search: values.search,
                $language: values.language,
                $caseSensitive: values.caseSensitive,
                $diacriticSensitive: values.diacriticSensitive
            };
        }
    },
    aggregate: {
        pipeline: function () {
            return new aggregate_1.default();
        },
        abs: function (param) { return new AggregationOperator('abs', param); },
        add: function (param) { return new AggregationOperator('add', param); },
        ceil: function (param) { return new AggregationOperator('ceil', param); },
        divide: function (param) { return new AggregationOperator('divide', param); },
        exp: function (param) { return new AggregationOperator('exp', param); },
        floor: function (param) { return new AggregationOperator('floor', param); },
        ln: function (param) { return new AggregationOperator('ln', param); },
        log: function (param) { return new AggregationOperator('log', param); },
        log10: function (param) { return new AggregationOperator('log10', param); },
        mod: function (param) { return new AggregationOperator('mod', param); },
        multiply: function (param) { return new AggregationOperator('multiply', param); },
        pow: function (param) { return new AggregationOperator('pow', param); },
        sqrt: function (param) { return new AggregationOperator('sqrt', param); },
        subtract: function (param) { return new AggregationOperator('subtract', param); },
        trunc: function (param) { return new AggregationOperator('trunc', param); },
        arrayElemAt: function (param) { return new AggregationOperator('arrayElemAt', param); },
        arrayToObject: function (param) { return new AggregationOperator('arrayToObject', param); },
        concatArrays: function (param) { return new AggregationOperator('concatArrays', param); },
        filter: function (param) { return new AggregationOperator('filter', param); },
        in: function (param) { return new AggregationOperator('in', param); },
        indexOfArray: function (param) { return new AggregationOperator('indexOfArray', param); },
        isArray: function (param) { return new AggregationOperator('isArray', param); },
        map: function (param) { return new AggregationOperator('map', param); },
        range: function (param) { return new AggregationOperator('range', param); },
        reduce: function (param) { return new AggregationOperator('reduce', param); },
        reverseArray: function (param) { return new AggregationOperator('reverseArray', param); },
        size: function (param) { return new AggregationOperator('size', param); },
        slice: function (param) { return new AggregationOperator('slice', param); },
        zip: function (param) { return new AggregationOperator('zip', param); },
        and: function (param) { return new AggregationOperator('and', param); },
        not: function (param) { return new AggregationOperator('not', param); },
        or: function (param) { return new AggregationOperator('or', param); },
        cmp: function (param) { return new AggregationOperator('cmp', param); },
        eq: function (param) { return new AggregationOperator('eq', param); },
        gt: function (param) { return new AggregationOperator('gt', param); },
        gte: function (param) { return new AggregationOperator('gte', param); },
        lt: function (param) { return new AggregationOperator('lt', param); },
        lte: function (param) { return new AggregationOperator('lte', param); },
        neq: function (param) { return new AggregationOperator('ne', param); },
        cond: function (param) { return new AggregationOperator('cond', param); },
        ifNull: function (param) { return new AggregationOperator('ifNull', param); },
        switch: function (param) { return new AggregationOperator('switch', param); },
        dateFromParts: function (param) { return new AggregationOperator('dateFromParts', param); },
        dateFromString: function (param) { return new AggregationOperator('dateFromString', param); },
        dayOfMonth: function (param) { return new AggregationOperator('dayOfMonth', param); },
        dayOfWeek: function (param) { return new AggregationOperator('dayOfWeek', param); },
        dayOfYear: function (param) { return new AggregationOperator('dayOfYear', param); },
        isoDayOfWeek: function (param) { return new AggregationOperator('isoDayOfWeek', param); },
        isoWeek: function (param) { return new AggregationOperator('isoWeek', param); },
        isoWeekYear: function (param) { return new AggregationOperator('isoWeekYear', param); },
        millisecond: function (param) { return new AggregationOperator('millisecond', param); },
        minute: function (param) { return new AggregationOperator('minute', param); },
        month: function (param) { return new AggregationOperator('month', param); },
        second: function (param) { return new AggregationOperator('second', param); },
        hour: function (param) { return new AggregationOperator('hour', param); },
        week: function (param) { return new AggregationOperator('week', param); },
        year: function (param) { return new AggregationOperator('year', param); },
        literal: function (param) { return new AggregationOperator('literal', param); },
        mergeObjects: function (param) { return new AggregationOperator('mergeObjects', param); },
        objectToArray: function (param) { return new AggregationOperator('objectToArray', param); },
        allElementsTrue: function (param) { return new AggregationOperator('allElementsTrue', param); },
        anyElementTrue: function (param) { return new AggregationOperator('anyElementTrue', param); },
        setDifference: function (param) { return new AggregationOperator('setDifference', param); },
        setEquals: function (param) { return new AggregationOperator('setEquals', param); },
        setIntersection: function (param) { return new AggregationOperator('setIntersection', param); },
        setIsSubset: function (param) { return new AggregationOperator('setIsSubset', param); },
        setUnion: function (param) { return new AggregationOperator('setUnion', param); },
        concat: function (param) { return new AggregationOperator('concat', param); },
        dateToString: function (param) { return new AggregationOperator('dateToString', param); },
        indexOfBytes: function (param) { return new AggregationOperator('indexOfBytes', param); },
        indexOfCP: function (param) { return new AggregationOperator('indexOfCP', param); },
        split: function (param) { return new AggregationOperator('split', param); },
        strLenBytes: function (param) { return new AggregationOperator('strLenBytes', param); },
        strLenCP: function (param) { return new AggregationOperator('strLenCP', param); },
        strcasecmp: function (param) { return new AggregationOperator('strcasecmp', param); },
        substr: function (param) { return new AggregationOperator('substr', param); },
        substrBytes: function (param) { return new AggregationOperator('substrBytes', param); },
        substrCP: function (param) { return new AggregationOperator('substrCP', param); },
        toLower: function (param) { return new AggregationOperator('toLower', param); },
        toUpper: function (param) { return new AggregationOperator('toUpper', param); },
        meta: function (param) { return new AggregationOperator('meta', param); },
        addToSet: function (param) { return new AggregationOperator('addToSet', param); },
        avg: function (param) { return new AggregationOperator('avg', param); },
        first: function (param) { return new AggregationOperator('first', param); },
        last: function (param) { return new AggregationOperator('last', param); },
        max: function (param) { return new AggregationOperator('max', param); },
        min: function (param) { return new AggregationOperator('min', param); },
        push: function (param) { return new AggregationOperator('push', param); },
        stdDevPop: function (param) { return new AggregationOperator('stdDevPop', param); },
        stdDevSamp: function (param) { return new AggregationOperator('stdDevSamp', param); },
        sum: function (param) { return new AggregationOperator('sum', param); },
        let: function (param) { return new AggregationOperator('let', param); }
    },
    project: {
        slice: function (param) { return new ProjectionOperator('slice', param); },
        elemMatch: function (param) { return new ProjectionOperator('elemMatch', param); }
    }
};
var AggregationOperator = (function () {
    function AggregationOperator(name, param) {
        this['$' + name] = param;
    }
    return AggregationOperator;
}());
var ProjectionOperator = (function () {
    function ProjectionOperator(name, param) {
        this['$' + name] = param;
    }
    return ProjectionOperator;
}());
exports.default = exports.Command;

}, function(modId) { var map = {"./commands/query":1776008460224,"./commands/logic":1776008460225,"./commands/update":1776008460222,"./utils/type":1776008460212,"./aggregate":1776008460231}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460233, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.RegExpConstructor = exports.RegExp = void 0;
var symbol_1 = require("../helper/symbol");
var RegExp = (function () {
    function RegExp(_a) {
        var regexp = _a.regexp, options = _a.options;
        if (!regexp) {
            throw new TypeError('regexp must be a string');
        }
        this.$regex = regexp;
        this.$options = options;
    }
    RegExp.prototype.parse = function () {
        return {
            $regex: this.$regex,
            $options: this.$options
        };
    };
    Object.defineProperty(RegExp.prototype, "_internalType", {
        get: function () {
            return symbol_1.SYMBOL_REGEXP;
        },
        enumerable: false,
        configurable: true
    });
    return RegExp;
}());
exports.RegExp = RegExp;
function RegExpConstructor(param) {
    return new RegExp(param);
}
exports.RegExpConstructor = RegExpConstructor;

}, function(modId) { var map = {"../helper/symbol":1776008460210}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460234, function(require, module, exports) {

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
exports.runTransaction = exports.startTransaction = exports.Transaction = void 0;
var index_1 = require("../index");
var collection_1 = require("./collection");
var code_1 = require("../const/code");
var START = 'database.startTransaction';
var COMMIT = 'database.commitTransaction';
var ABORT = 'database.abortTransaction';
var Transaction = (function () {
    function Transaction(db) {
        this._db = db;
        this._request = index_1.Db.createRequest(this._db.config);
        this.aborted = false;
        this.commited = false;
        this.inited = false;
    }
    Transaction.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._request.send(START)];
                    case 1:
                        res = _a.sent();
                        if (res.code) {
                            throw res;
                        }
                        this.inited = true;
                        this._id = res.transactionId;
                        return [2];
                }
            });
        });
    };
    Transaction.prototype.collection = function (collName) {
        if (!collName) {
            throw new Error('Collection name is required');
        }
        return new collection_1.CollectionReference(this, collName);
    };
    Transaction.prototype.getTransactionId = function () {
        return this._id;
    };
    Transaction.prototype.getRequestMethod = function () {
        return this._request;
    };
    Transaction.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var param, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        param = {
                            transactionId: this._id
                        };
                        return [4, this._request.send(COMMIT, param)];
                    case 1:
                        res = _a.sent();
                        if (res.code)
                            throw res;
                        this.commited = true;
                        return [2, res];
                }
            });
        });
    };
    Transaction.prototype.rollback = function (customRollbackRes) {
        return __awaiter(this, void 0, void 0, function () {
            var param, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        param = {
                            transactionId: this._id
                        };
                        return [4, this._request.send(ABORT, param)];
                    case 1:
                        res = _a.sent();
                        if (res.code)
                            throw res;
                        this.aborted = true;
                        this.abortReason = customRollbackRes;
                        return [2, res];
                }
            });
        });
    };
    return Transaction;
}());
exports.Transaction = Transaction;
function startTransaction() {
    return __awaiter(this, void 0, void 0, function () {
        var transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transaction = new Transaction(this);
                    return [4, transaction.init()];
                case 1:
                    _a.sent();
                    return [2, transaction];
            }
        });
    });
}
exports.startTransaction = startTransaction;
function runTransaction(callback, times) {
    if (times === void 0) { times = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var transaction, callbackRes, error_1, throwWithRollback;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 10]);
                    transaction = new Transaction(this);
                    return [4, transaction.init()];
                case 1:
                    _a.sent();
                    return [4, callback(transaction)];
                case 2:
                    callbackRes = _a.sent();
                    if (transaction.aborted === true) {
                        throw transaction.abortReason;
                    }
                    return [4, transaction.commit()];
                case 3:
                    _a.sent();
                    return [2, callbackRes];
                case 4:
                    error_1 = _a.sent();
                    if (transaction.inited === false) {
                        throw error_1;
                    }
                    throwWithRollback = function (error) { return __awaiter(_this, void 0, void 0, function () {
                        var err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(!transaction.aborted && !transaction.commited)) return [3, 5];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4, transaction.rollback()];
                                case 2:
                                    _a.sent();
                                    return [3, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    return [3, 4];
                                case 4: throw error;
                                case 5:
                                    if (transaction.aborted === true) {
                                        throw transaction.abortReason;
                                    }
                                    throw error;
                            }
                        });
                    }); };
                    if (!(times <= 0)) return [3, 6];
                    return [4, throwWithRollback(error_1)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (!(error_1 && error_1.code === code_1.ERRORS.DATABASE_TRANSACTION_CONFLICT.code)) return [3, 8];
                    return [4, runTransaction.bind(this)(callback, --times)];
                case 7: return [2, _a.sent()];
                case 8: return [4, throwWithRollback(error_1)];
                case 9:
                    _a.sent();
                    return [3, 10];
                case 10: return [2];
            }
        });
    });
}
exports.runTransaction = runTransaction;

}, function(modId) { var map = {"../index":1776008460203,"./collection":1776008460235,"../const/code":1776008460237}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460235, function(require, module, exports) {

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
exports.CollectionReference = void 0;
var document_1 = require("./document");
var query_1 = require("./query");
var CollectionReference = (function (_super) {
    __extends(CollectionReference, _super);
    function CollectionReference(transaction, coll) {
        return _super.call(this, transaction, coll) || this;
    }
    Object.defineProperty(CollectionReference.prototype, "name", {
        get: function () {
            return this._coll;
        },
        enumerable: false,
        configurable: true
    });
    CollectionReference.prototype.doc = function (docID) {
        if (typeof docID !== 'string' && typeof docID !== 'number') {
            throw new Error('docId必须为字符串或数字');
        }
        return new document_1.DocumentReference(this._transaction, this._coll, docID);
    };
    CollectionReference.prototype.add = function (data) {
        var docID;
        if (data._id !== undefined) {
            docID = data._id;
        }
        var docRef = new document_1.DocumentReference(this._transaction, this._coll, docID);
        return docRef.create(data);
    };
    return CollectionReference;
}(query_1.Query));
exports.CollectionReference = CollectionReference;

}, function(modId) { var map = {"./document":1776008460236,"./query":1776008460238}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460236, function(require, module, exports) {

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
exports.DocumentReference = void 0;
var bson_1 = require("bson");
var code_1 = require("../const/code");
var update_1 = require("../serializer/update");
var datatype_1 = require("../serializer/datatype");
var util_1 = require("../util");
var GET_DOC = 'database.getInTransaction';
var UPDATE_DOC = 'database.updateDocInTransaction';
var DELETE_DOC = 'database.deleteDocInTransaction';
var INSERT_DOC = 'database.insertDocInTransaction';
var DocumentReference = (function () {
    function DocumentReference(transaction, coll, docID) {
        this._coll = coll;
        this.id = docID;
        this._transaction = transaction;
        this._request = this._transaction.getRequestMethod();
        this._transactionId = this._transaction.getTransactionId();
    }
    DocumentReference.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var params, res, inserted, ok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            collectionName: this._coll,
                            transactionId: this._transactionId,
                            data: bson_1.EJSON.stringify((0, datatype_1.serialize)(data), { relaxed: false })
                        };
                        if (this.id) {
                            params['_id'] = this.id;
                        }
                        return [4, this._request.send(INSERT_DOC, params)];
                    case 1:
                        res = _a.sent();
                        if (res.code) {
                            throw res;
                        }
                        inserted = bson_1.EJSON.parse(res.inserted);
                        ok = bson_1.EJSON.parse(res.ok);
                        if (ok == 1 && inserted == 1) {
                            return [2, __assign(__assign({}, res), { ok: ok, inserted: inserted })];
                        }
                        else {
                            throw new Error(code_1.ERRORS.INSERT_DOC_FAIL.message);
                        }
                        return [2];
                }
            });
        });
    };
    DocumentReference.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var param, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        param = {
                            collectionName: this._coll,
                            transactionId: this._transactionId,
                            query: {
                                _id: { $eq: this.id }
                            }
                        };
                        return [4, this._request.send(GET_DOC, param)];
                    case 1:
                        res = _a.sent();
                        if (res.code)
                            throw res;
                        return [2, {
                                data: res.data !== 'null' ? util_1.Util.formatField(bson_1.EJSON.parse(res.data)) : bson_1.EJSON.parse(res.data),
                                requestId: res.requestId
                            }];
                }
            });
        });
    };
    DocumentReference.prototype.set = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var param, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        param = {
                            collectionName: this._coll,
                            transactionId: this._transactionId,
                            query: {
                                _id: { $eq: this.id }
                            },
                            data: bson_1.EJSON.stringify((0, datatype_1.serialize)(data), { relaxed: false }),
                            upsert: true
                        };
                        return [4, this._request.send(UPDATE_DOC, param)];
                    case 1:
                        res = _a.sent();
                        if (res.code)
                            throw res;
                        return [2, __assign(__assign({}, res), { updated: bson_1.EJSON.parse(res.updated), upserted: res.upserted
                                    ? JSON.parse(res.upserted)
                                    : null })];
                }
            });
        });
    };
    DocumentReference.prototype.update = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var param, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        param = {
                            collectionName: this._coll,
                            transactionId: this._transactionId,
                            query: {
                                _id: { $eq: this.id }
                            },
                            data: bson_1.EJSON.stringify(update_1.UpdateSerializer.encode(data), {
                                relaxed: false
                            })
                        };
                        return [4, this._request.send(UPDATE_DOC, param)];
                    case 1:
                        res = _a.sent();
                        if (res.code)
                            throw res;
                        return [2, __assign(__assign({}, res), { updated: bson_1.EJSON.parse(res.updated) })];
                }
            });
        });
    };
    DocumentReference.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var param, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        param = {
                            collectionName: this._coll,
                            transactionId: this._transactionId,
                            query: {
                                _id: { $eq: this.id }
                            }
                        };
                        return [4, this._request.send(DELETE_DOC, param)];
                    case 1:
                        res = _a.sent();
                        if (res.code)
                            throw res;
                        return [2, __assign(__assign({}, res), { deleted: bson_1.EJSON.parse(res.deleted) })];
                }
            });
        });
    };
    return DocumentReference;
}());
exports.DocumentReference = DocumentReference;

}, function(modId) { var map = {"../const/code":1776008460237,"../serializer/update":1776008460221,"../serializer/datatype":1776008460227,"../util":1776008460208}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460237, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ERRORS = void 0;
exports.ERRORS = {
    CREATE_WATCH_NET_ERROR: {
        code: 'CREATE_WATCH_NET_ERROR',
        message: 'create watch network error'
    },
    CREATE_WACTH_EXCEED_ERROR: {
        code: 'CREATE_WACTH_EXCEED_ERROR',
        message: 'maximum connections exceed'
    },
    CREATE_WATCH_SERVER_ERROR: {
        code: 'CREATE_WATCH_SERVER_ERROR',
        message: 'create watch server error'
    },
    CONN_ERROR: {
        code: 'CONN_ERROR',
        message: 'connection error'
    },
    INVALID_PARAM: {
        code: 'INVALID_PARAM',
        message: 'Invalid request param'
    },
    INSERT_DOC_FAIL: {
        code: 'INSERT_DOC_FAIL',
        message: 'insert document failed'
    },
    DATABASE_TRANSACTION_CONFLICT: {
        code: 'DATABASE_TRANSACTION_CONFLICT',
        message: 'database transaction conflict'
    }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1776008460238, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
var Query = (function () {
    function Query(transaction, coll) {
        this._coll = coll;
        this._transaction = transaction;
    }
    return Query;
}());
exports.Query = Query;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1776008460203);
})()
//miniprogram-npm-outsideDeps=["bson"]
//# sourceMappingURL=index.js.map