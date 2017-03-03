var Controller = require('../js/control.js')
require('css/bottomBar.css')

module.exports = {
    init : function () {
        __inline('vm/vm_bottombar.vm')
        /*调用拖拽*/
        avalon.ready(function () {
            $('body').append(__inline('tpl/bottomBar.html'))
            $(".house-message").Drap({
                DrapMove : ".house-message-head", IsLimit : true, Callback : function () {
                }
            });
            avalon.vmodels.vm_bottombar.init()
            avalon.scan()

            window.onresize = function () {
                $(".house-message").Drap({
                    DrapMove : ".house-message-head", IsLimit : true, Callback : function () {
                    }
                });
            }
        })
    }
}