/**
 * Created by X on 2016/5/27.
 */
var Header = require('header'),
    Access = require('../header/access.js'),
    AccountBook = require('report/account-book');

var report = {
    init : function () {
        var hasAccessToView = Header.hasAccessToView(Access.AC_REPORTVIEW, '报表')
        if(!hasAccessToView)return

        __inline('vm/vm_report_main.vm')
        tmsky.getVm('vm_report_main').init()
        AccountBook.init()
        var params = tmsky.location.params
        if(params.length == 0){
            AccountBook.getVm().getFinanceRecords(1)
        }else{
            tmsky.getVm('vm_report_main').changeTabs(params['tab'], params)
        }
        avalon.scan()
    },
    launch : function () {
        Header.active('report').ready(function () {
            report.init()
        })
    }
}

module.exports = report
