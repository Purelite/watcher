/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);

	var Watcher = function () {
	  var $w,
	      watcher = {};

	  watcher.init = function (config) {
	    if (!config.reportUrl) {
	      throw new Error('reportUrl is needed');
	    }
	    utils.watcherInit(config);
	  };

	  $w = function $w(config) {
	    return watcher.init(config);
	  };
	  $w.init = function () {
	    console.log('aaa');
	  };
	  return $w;
	}();

	window.Watcher = Watcher;
	window.$w === undefined && (window.$w = Watcher);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var map = __webpack_require__(2);
	var _config;

	function _isReportUrl(url) {
	  return url.indexOf(_config.reportUrl) >= 0;
	}

	function _notNullObject(obj) {
	  if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object") return false;
	  if (obj === null) return false;
	  return true;
	}

	function _isEmptyObject(obj) {
	  var name;
	  for (name in obj) {
	    return false;
	  }return true;
	}

	function _JSONStringifySafty(obj) {
	  if (!_notNullObject(obj)) return "";
	  if (_isEmptyObject(obj)) return "";
	  try {
	    return JSON.stringify(obj);
	  } catch (e) {
	    console.warn("illegal json object,can't JSON.stringify");
	    return "";
	  }
	}

	function _JSONParseSafty(str) {
	  try {
	    var val = JSON.parse(str);
	    if ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object" && val !== null) {
	      return val;
	    } else {
	      return {};
	    }
	  } catch (err) {
	    console.warn("illegal json string ,can't JSON.parse");
	    return {};
	  }
	}

	function _listenXhrResponse(xhr) {
	  var _httpInfo = xhr._http;
	  setTimeout(function () {
	    if (xhr.readyState !== xhr.DONE) {
	      _errorReport({
	        type: "__XHR__",
	        httpInfo: _httpInfo,
	        message: "slow-response"
	      });
	    }
	  }, 3000);

	  xhr.addEventListener("load", function () {
	    var res = {};
	    if (xhr.response) {
	      res = _JSONParseSafty(xhr.response);
	    }

	    if (res && res.status && res.status.code !== 0 && res.status.status_code != 0) {
	      _errorReport({
	        type: "__XHR__",
	        httpInfo: _httpInfo,
	        message: "response-unexpect",
	        detail: {
	          status: _JSONStringifySafty(res.status)
	        }
	      });
	    }
	  });

	  xhr.addEventListener("error", function (e) {
	    _errorReport({
	      type: "__XHR__",
	      httpInfo: _httpInfo,
	      message: "response-error"
	    });
	  });
	  xhr.addEventListener("abort", function () {
	    _errorReport({
	      type: "__XHR__",
	      httpInfo: _httpInfo,
	      message: "response-abort"
	    });
	  });
	  xhr.addEventListener("timeout", function () {
	    _errorReport({
	      type: "__XHR__",
	      httpInfo: _httpInfo,
	      message: "response-timeout"
	    });
	  });
	}

	function _get(url, callback) {
	  var xhr = new XMLHttpRequest();
	  xhr.onload = function (res) {
	    callback && callback(xhr);
	  };
	  xhr.open("GET", url, true);
	  xhr.send();
	}

	function _post(options) {
	  var xhr = new XMLHttpRequest();
	  xhr.onload = function () {
	    if (this.status >= 200 && this.status < 300 || xhr.status == 304) {
	      try {
	        options.callback && options.callback(_JSONParseSafty(this.response));
	      } catch (e) {}
	    } else {}
	  };
	  xhr.open("POST", options.url, true);
	  xhr.withCredentials = true;
	  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	  xhr.setRequestHeader("Accept", "application/json, text/plain, */*");
	  xhr.send(options.paramKeyString + _JSONStringifySafty(options.data));
	}

	function _handleError(evt) {
	  var error = evt.error;
	  if (!error) {
	    console.warn("Mark crossorigin on script tag to get detailed error message");
	    return null;
	  }
	  return {
	    message: error.message,
	    url: evt.filename,
	    type: "__WINDOW_ERROR__",
	    detail: {
	      stack: error.stack,
	      lineno: evt.lineno,
	      colno: evt.colno
	    }
	  };
	}

	function _errorReport(error) {
	  error.env = {
	    appCodeName: navigator.appCodeName,
	    appName: navigator.appName,
	    platform: navigator.platform,
	    appVersion: navigator.appVersion,
	    ua: navigator.userAgent
	  };
	  _post({
	    url: _config.reportUrl,
	    paramKeyString: _config.paramKey ? _config.paramKey + '=' : '',
	    data: error
	  });
	}

	function _watchXhrError() {
	  var xhrProto = XMLHttpRequest.prototype;
	  xhrProto._open = xhrProto.open;
	  xhrProto.open = function (method, url) {
	    this._http = this._http || {};
	    this._http.method = method;
	    this._http.url = url;
	    return xhrProto._open.apply(this, [].slice.call(arguments));
	  };
	  xhrProto._send = xhrProto.send;
	  xhrProto.send = function () {
	    var xhr = this;
	    if (!_isReportUrl(xhr._http.url)) {
	      xhr._http.param = decodeURIComponent([].slice.call(arguments));
	      _listenXhrResponse(xhr);
	    }
	    return xhrProto._send.apply(this, [].slice.call(arguments));
	  };
	}

	function _watchWinError() {
	  window.addEventListener("error", function (evt) {
	    var line = evt.lineno;
	    var col = evt.colno;
	    var stack = evt.error.stack;

	    var error = _handleError(evt);
	    if (error) {
	      _errorReport(error);
	    }
	  });
	}

	function _watcherInit(config) {
	  _config = config;
	  _watchWinError();
	  _watchXhrError();
	}

	module.exports = {
	  watcherInit: _watcherInit,
	  watchWinError: _watchWinError,
	  watchXhrError: _watchXhrError
	};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	

	function _decodeSourceMap(sourceMap) {
	  var mappings = sourceMap.mappings;

	  var uglyLineArr = mappings.split(";");
	  uglyLineArr = uglyLineArr.map(function (line) {
	    var keywordArr = line.split(",");
	    return keywordArr;
	  });
	  uglyLineArr = uglyLineArr.map(function (keywordArr) {
	    return keywordArr.map(function (keyword) {
	      return decode(keyword);
	    });
	  });

	  fixedMap = getAbsoultePosition(uglyLineArr);

	  return fixedMap;
	}

	function getAbsoultePosition(uglyLineArr) {
	  var sourceFileIndex = 0,
	      sourceCodeLine = 0,
	      sourceCodeColumn = 0,
	      nameIndex = 0;

	  var fixedMap = uglyLineArr.map(function (keywordArr) {
	    var generatedCodeColumn = 0;

	    return keywordArr.map(function (keyword) {
	      var absoluteKeyword = [];
	      generatedCodeColumn += keyword[0];
	      absoluteKeyword.push(generatedCodeColumn);

	      sourceFileIndex += keyword[1];
	      sourceCodeLine += keyword[2];
	      sourceCodeColumn += keyword[3];

	      absoluteKeyword.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);

	      if (keyword[4] !== undefined) {
	        nameIndex += keyword[4];
	        absoluteKeyword.push(nameIndex);
	      }

	      return absoluteKeyword;
	    });
	  });

	  return fixedMap;
	}

	function _fixPosDetail(line, col, map, names, sources) {
	  var colIndexInMap = col - 1;

	  var lineMap = map[line - 1];
	  var keywordMap = void 0;
	  lineMap.some(function (keyword) {
	    if (keyword[0] === col - 1) {
	      keywordMap = keyword;
	      return true;
	    }
	    return false;
	  });

	  var sourceCodeLine = keywordMap[2] + 1;
	  var sourceCodeColumn = keywordMap[3] + 1;
	  var sourceFile = sources[keywordMap[1]];

	  var sourceName = "";
	  if (keywordMap[4] !== undefined) {
	    sourceName = names[keywordMap[4]];
	  }

	  return {
	    sourceCodeLine: sourceCodeLine,
	    sourceCodeColumn: sourceCodeColumn,
	    sourceFile: sourceFile,
	    sourceName: sourceName
	  };
	}

	module.exports = {
	  decodeSourceMap: _decodeSourceMap,
	  fixPosDetail: _fixPosDetail
	};

/***/ })
/******/ ]);