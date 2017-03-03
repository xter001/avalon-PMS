/**
 * Created by dai on 2016/8/31.
 */
var Header = require('header');

var integral = {
    init : function () {
        __inline('vm/vm_integral.vm')
        document.getElementById('content').innerHTML = __inline('tpl/integral-main.html')

        tmsky.getVm('vm_integral').scan()
        tmsky.getVm('vm_integral').init()
    },

    launch : function () {
        Header.active('Integral').ready(function () {
            integral.init()
        })
    },
};
module.exports = integral