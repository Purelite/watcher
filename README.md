# watcher.js

### 前言
watcher.js是一个用于监控并上报用户浏览器端发生的脚本错误或者ajax请求错误的插件,用于监控线上脚本执行异常,方便跟踪定位错误。
### 使用

`watcher.js`  必须在全局首先注册执行,才能监测错误。所以确保在`.html`文件头部作为第一个js文件引入。

```javascript
<script type="text/javascript" src="watcher.min.js"></script>
<script>
window.Watcher && window.Watcher({
    reportUrl:'',//上报API
    paramKey:'param'
})
</script>
```
由于每个使用者ajax请求返回的状态码跟数据结构不一致,所以需要在源码`_listenXhrResponse`方法中去添加符合自己业务返回状态的标识,然后重新编译生成watcher.min.js文件

### 自行编译
```bash
git clone https://github.com/Purelite/watcher.git
cd watcher
npm install
gulp dev
```
然后打开<http://127.0.0.1:8080/example/test.html>进行调试
### 参数说明

|    参数      |        定义    |    类型    |  补充  |
|:-----------:|:-------------:|:----------:|:----------:|
|    reportUrl|       错误上报API接口     |      string     |   必选       |
|    paramKey |      上报参数字段名     |      string     |      可选    |

### TODO
* sourcemap
* 必要的全局扩展方法






