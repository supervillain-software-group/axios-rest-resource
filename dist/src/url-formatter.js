'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.interceptorUrlFormatter = void 0
var interceptorUrlFormatter = function(config) {
  if (!config.params) {
    return config
  }
  var _loop_1 = function(paramName) {
    var param = config.params[paramName]
    if (config.url && config.url.indexOf('{'.concat(paramName, '}')) > -1) {
      config.url = config.url.replace('{'.concat(paramName, '}'), function() {
        return param
      })
      delete config.params[paramName]
    }
  }
  for (var _i = 0, _a = Object.keys(config.params); _i < _a.length; _i++) {
    var paramName = _a[_i]
    _loop_1(paramName)
  }
  return config
}
exports.interceptorUrlFormatter = interceptorUrlFormatter
