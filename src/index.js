/**
 * 
 * @authors purelite (zhuweilei@weidian.com)
 * @date    2018-04-28 11:44:13
 * @version $Id$
 */
var utils = require('./lib')

var Watcher = (function(){
  var $w,watcher = {};

  watcher.init = function(config){
    if(!config.reportUrl){
      throw new Error('reportUrl is needed')
    }
    utils.watcherInit(config)
  }

  $w = function(config){
    return watcher.init(config)
  }
  $w.init = function(){
    console.log('aaa')
  }
  return $w;
})()

window.Watcher = Watcher
window.$w === undefined && (window.$w = Watcher)