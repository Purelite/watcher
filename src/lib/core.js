/**
 * 
 * @authors zhuweilei
 * @date    2016-10-14 10:43:00
 * @version 1.0.3
 */
(function() {
    var win = window;
    var loc = location;
    var doc = document;
    if (win.watcher) return;
    var W =  win.watcher = {};
    var random = function(){
        return (+new Date()) + '.r' + Math.floor(Math.random() * 1000);
    };
    /**
     * [name description]
     * @return {[type]} [description]
     */
    W.name = function(name){
        window.WDMOD = name;
    }
    /**
     * [error 浏览器抛错]
     * @param  {[type]} err [description]
     * @return {[type]}    [description]
     */
    W.error = function(err) {
        if (!(err instanceof Error)) {
            return;
        }
        return error({
            type : 'catched',
            errorType: err.errorType || 1,
            msg  : err.message || err.description,
            file : err.filename || err.fileName || err.sourceURL,
            line : err.lineno || err.lineNumber || err.line,
            col  : err.colno || err.columnNumber,
            error: err
        });
    }
    /**
     * [ajaxErr ajax请求抛错]
     * @param  {[type]} res [服务器返回错误信息]
     * @return {[type]}     [description]
     * @todo [增加接口名字的上报]
     */
    W.ajaxErr = function(obj){
        return error({
            type    : 'ajaxErr',
            ajaxurl : obj.url,
            ajaxreq : obj.req,
            ajaxrep : obj.rep,
            errorType : obj.errorType
        })
    }

    /**
     * JavaScript 异常统一处理函数
     * @param  {String} msg  [报错信息]
     * @param  {String} file [报错所在文件]
     * @param  {Number} line [报错行数]
     * @return [Array]      [description]
     */
    function error(obj) {
        var type      = obj.type,
            msg       = obj.msg || '',
            file      = obj.file || '',
            line      = obj.line || '',
            error     = obj.error || '',
            col       = obj.col || '',
            ajaxurl   = obj.ajaxurl || '',
            ajaxreq   = JSON.stringify(obj.ajaxreq) || '',
            ajaxrep   = JSON.stringify(obj.ajaxrep)|| '',
            errorType = obj.errorType || '';

        //Script error.不上报！上报也不知道错误 排除掉Uncaught ReferenceError: WeixinJSBridge is not defined不上报
        if (msg == "Script error." || 
            msg == "Uncaught ReferenceError: WeixinJSBridge is not defined" || 
            msg == "Uncaught ReferenceError: ToutiaoJSBridge is not defined" || 
            msg == "ReferenceError: Can't find variable: WeixinJSBridge"
            ){
            errorType = 6;
        }
        
        var data = {
                projectName:window.WDMOD || location.href,//需要手动传
                url: loc.href,
                param:{//扩展字段
                    ref: doc.referrer || "-",
                    errGetFrom:type,
                    clnt:{
                        appCodeName:navigator.appCodeName,
                        appName:navigator.appName,
                        platform:navigator.platform,
                        appVersion:navigator.appVersion,
                        UA:navigator.userAgent
                    }
                }
            }
        if(type === 'window' || type === 'catched'){
            data.type = errorType || 1;//1,js报错，2，接口报错 
            data.errorParam = {
                errorMessage: msg || '',
                scriptURI: file || '',
                lineNumber: line || 0,
                columnNumber: col || 0,
                errorObj:'',////错误的详细信息
            }
            
            if (!!error && !!error.stack){
                //如果浏览器有堆栈信息  直接使用
                data.errorParam.stackErr = error.stack.toString();
            }else if (!!arguments.callee){
                //尝试通过callee拿堆栈信息
                var ext = [];
                var f = arguments.callee.caller, c = 3;//堆栈层数 可以自己定制 
                //只拿三层堆栈信息
                while (f && (--c>0)) {
                   ext.push(f.toString());
                   if (f  === f.caller) {
                        break;//如果有环
                   }
                   f = f.caller;
                }
                ext = ext.join(",");
                data.errorParam.stackErr = ext;
            }
        }else{
            data.type = errorType || 2;//1,js报错，2，接口报错 3,4,5自定义 try catch报错 
            data.errorParam = {
                apiUrl:ajaxurl,
                apiRequest:ajaxreq,
                apiResponse:ajaxrep
            }
        }
        //防止浏览器内存回收导致get请求无法发出
        var n = 'img_' + random(),
            img = win[n] = new Image();
            img.onload = img.onerror = img.onabort = function(){
                img.onload = img.onerror = img.onabort = null;
                win[n] = null;
            };
        var url = '<%= url %>?param='+encodeURIComponent(JSON.stringify(data));
        img.src = url;
        console.log(data);
    }
    
    win.onerror = function(msg,file,line,col,err) {
        error({
            type : 'window',
            msg  : msg,
            file : file,
            line : line,
            col  : col,
            error: err
        })
        return false;
    }

})();
