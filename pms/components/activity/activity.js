/**
 * Created by yu on 2016/3/18.
 */
var Header = require('header'),
    COMMON_CONST = require('../common/js/const.js'),
    CommonUtil = require('../common/js/utils/common-util.js'),
    InnUtil = require('../common/js/utils/inn-util.js');

var activity = {
    init : function () {
        __inline('vm/vm_activity.vm')
        document.getElementById('content').innerHTML = __inline('tpl/activity.html')
        tmsky.getVm('vm_activity').scan()
        tmsky.getVm('vm_activity').init()
        avalon.ready(function(){
            require('js/banner.js');
        })
    },
    launch : function () {
        Header.active('activity').ready(function () {
            activity.init()
        })
    }
};


module.exports = activity