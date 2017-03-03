/**
 * Created by dai on 2016/11/3.
 */
var Header = require('header'),
    COMMON_CONST = require('../../common/js/const.js'),
    Access = require('../../header/access.js');

var customers = {
    init : function () {
        var hasAccessToView = Header.hasAccessToView(Access.AC_GUEST, '客户资料')
        if(!hasAccessToView)return

        __inline('vm/vm_customers.vm')

        __inline('vm/vm_blackList.vm')
        __inline('vm/vm_checkIn.vm')
        __inline('vm/vm_checkIn_new.vm')
        __inline('vm/vm_customersDatas.vm')
        __inline('vm/vm_vipManage.vm')

        document.getElementById('content').innerHTML = __inline('tpl/customers-main.html')
        document.getElementById('checkIn_new_div').innerHTML = __inline('tpl/customers-checkIn-new.html')
        document.getElementById('checkIn_div').innerHTML = __inline('tpl/customers-checkIn.html')
        document.getElementById('datas_div').innerHTML = __inline('tpl/customers-datas.html')
        document.getElementById('blacklist_div').innerHTML = __inline('tpl/customers-blacklist.html')
        document.getElementById('vipManage_div').innerHTML = __inline('tpl/customers-vipManage.html')
        avalon.scan()
        tmsky.getVm('vm_customers').init()
    },
    launch : function () {
        Header.active('Customers').ready(function () {
            customers.init()
        })
    },
}
module.exports = customers
