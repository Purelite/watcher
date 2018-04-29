/**
 * 
 * @authors purelite (zhuweilei@weidian.com)
 * @date    2018-04-28 17:35:39
 * @version $Id$
 */
var map = require('./sourcemap')
var _config;


function _isReportUrl(url) {
  return url.indexOf(_config.reportUrl) >= 0;
}

function _notNullObject(obj) {
  if (typeof obj !== "object") return false;
  if (obj === null) return false;
  return true;
}

function _isEmptyObject(obj) {
  var name
  for (name in obj) return false
  return true
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
    if (typeof val === "object" && val !== null) {
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
  var requestUrl = xhr._http.url;
  setTimeout(function() {
    if (xhr.readyState !== xhr.DONE) {
      _errorReport({
        type: "__XHR__",
        url: requestUrl,
        message: "slow-response",
      });
    }
  }, 3000);

  xhr.addEventListener("load", function() {
    var res = {};
    if (xhr.response) {
      res = _JSONParseSafty(xhr.response);
    }

    if (res && res.status && res.status.code !== 0 && res.status.status_code != 0) {
      _errorReport({
        type: "__XHR__",
        url: requestUrl,
        message: "response-unexpect",
        detail: {
          status: _JSONStringifySafty(res.status)
        }
      });
    }
  });
  // see: https://xhr.spec.whatwg.org/#events
  xhr.addEventListener("error", function(e) {
    _errorReport({
      type: "__XHR__",
      url: requestUrl,
      message: "response-error",
    });
  });
  xhr.addEventListener("abort", function() {
    _errorReport({
      type: "__XHR__",
      url: requestUrl,
      message: "response-abort",
    });
  });
  xhr.addEventListener("timeout", function() {
    _errorReport({
      type: "__XHR__",
      url: requestUrl,
      message: "response-timeout",
    });
  });
}

function _get(url, callback) {
    var  xhr = new XMLHttpRequest();
    xhr.onload = function(res) {
        callback && callback(xhr);
    }
    xhr.open("GET", url, true);
    xhr.send();
}

function _post(options) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 300 || xhr.status == 304) {
      try {
        options.callback && options.callback(_JSONParseSafty(this.response));
      }catch (e) {

      }
    }
  };
  xhr.open("POST", options.url, true);
  xhr.withCredentials = true;
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Accept", "application/json, text/plain, */*");
  xhr.send(_JSONStringifySafty(options.data));
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
  }
  _post({
    url: _config.reportUrl,
    data: error
  })
}

function _watchXhrError() {
  var xhrProto = XMLHttpRequest.prototype;
  xhrProto._open = xhrProto.open;
  xhrProto.open = function(method, url) {
    this._http = this._http || {};
    this._http.method = method;
    this._http.url = url;
    return xhrProto._open.apply(this, [].slice.call(arguments));
  };
  xhrProto._send = xhrProto.send;
  xhrProto.send = function() {
    var xhr = this;
    if (!_isReportUrl(xhr._http.url)) {
      _listenXhrResponse(xhr);
    }
    return xhrProto._send.apply(this, [].slice.call(arguments));
  };
}

function _watchWinError() {
  window.addEventListener("error", function(evt) {
    var line = evt.lineno;
    var col = evt.colno;
    var stack = evt.error.stack;
    /*_get(evt.filename + ".map", (xhr) => {
        if (xhr.status !== 200 && xhr.status !== 304) {
            console.warn("can't find sourcemap");
            return;
        }
        try {
            sourceMap = JSON.parse(xhr.responseText);
            var decodeMap = map.decodeSourceMap(sourceMap);
            var names = sourceMap.names;
            var sourceFiles = sourceMap.sources;
            var fixedPosition = map.fixPosDetail(line, col, decodeMap, names, sourceFiles, stack);

            var formatedStack = formatStack(stack);
        }catch(e){
        
        }
    })*/
    var error = _handleError(evt)
    if (error) {
      _errorReport(error)
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
  watchXhrError: _watchXhrError,
}