/**
 * Created by yu on 2016/3/18.
 */
var Header = require('header'),
    Access = require('../header/access.js')
var Functions = {
    init : function () {
        var hasAccessToView = Header.hasAccessToView(Access.AC_PLUG_MGR, '功能库')
        if(!hasAccessToView)return

        __inline('vm/vm_functions.vm')
        __inline('func-set/vm/vm_autoCheckOut.vm')
        __inline('func-set/vm/vm_innUnion.vm')
        __inline('func-set/vm/vm_accountBook.vm')
        __inline('func-set/vm/vm_funcSet.vm')
        __inline('func-set/vm/vm_eseMeg.vm')
        __inline('order-info/vm/vm_order_info.vm')
        __inline('order-info/vm/vm_print.vm')
        __inline('pay-set/vm/vm_pay_set.vm')
        document.getElementById('content').innerHTML = __inline('tpl/function-plug.html')
        $('.func_r').append(__inline('order-info/tpl/order-info.html'))
        $('.func_r').append(__inline('func-set/tpl/auto_out_func.html'))
        $('.func_r').append(__inline('func-set/tpl/func_set_info.html'))
        $('.func_r').append(__inline('pay-set/tpl/pay-set.html'))
        $('.func_r').append(__inline('func-set/tpl/inn_union_func.html'))
        $('.func_r').append(__inline('func-set/tpl/inn_account_book.html'))
        $('.func_r').append(__inline('func-set/tpl/eseMeg_func.html'))

        tmsky.getVm('vm_functions').scan()
        tmsky.getVm('vm_functions').init()

    },
    launch : function () {
        Header.active('Functions').ready(function () {
            Functions.init()
        })
    }
};

module.exports = Functions