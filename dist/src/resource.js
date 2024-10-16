'use strict'
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.ResourceBuilder = exports.resourceSchemaDefault = void 0
var axios_1 = require('axios')
var url_formatter_1 = require('./url-formatter')
exports.resourceSchemaDefault = {
  create: {
    method: 'post',
  },
  read: {
    method: 'get',
  },
  readOne: {
    method: 'get',
    url: '/{id}',
  },
  remove: {
    method: 'delete',
    url: '/{id}',
  },
  update: {
    method: 'put',
    url: '/{id}',
  },
}
var ResourceBuilder = (function() {
  function ResourceBuilder(axiosConfig) {
    this._schemaDefault = exports.resourceSchemaDefault
    if (!axiosConfig.headers) {
      axiosConfig.headers = {}
    }
    if (axiosConfig.headers.Accept === undefined) {
      axiosConfig.headers.Accept = 'application/json'
    }
    this.axiosInstance = axios_1.default.create(axiosConfig)
    this.axiosInstance.interceptors.request.use(url_formatter_1.interceptorUrlFormatter)
  }
  ResourceBuilder.prototype.build = function(resourceUrl, schema) {
    if (!schema) {
      return this._build(resourceUrl, this._schemaDefault)
    }
    return this._build(resourceUrl, schema)
  }
  ResourceBuilder.prototype._build = function(resourceUrl, schema) {
    var _this = this
    var resource = {}
    var _loop_1 = function(methodName) {
      var methodSchema = schema[methodName]
      var url = methodSchema.url || ''
      url = ''.concat(resourceUrl).concat(url)
      resource[methodName] = function(requestConfig) {
        if (requestConfig === void 0) {
          requestConfig = {}
        }
        return _this.axiosInstance.request(__assign(__assign(__assign({}, requestConfig), methodSchema), { url: url }))
      }
    }
    for (var _i = 0, _a = Object.keys(schema); _i < _a.length; _i++) {
      var methodName = _a[_i]
      _loop_1(methodName)
    }
    return resource
  }
  return ResourceBuilder
})()
exports.ResourceBuilder = ResourceBuilder
