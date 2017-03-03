/**
 * 客栈管理启动器
 * Created by hai on 2016/3/28.
 */
var InnManageBootLaunchUtil = {
    bootInn : function () {
        require.async(['inn-manage/info'], function (info) {
            info.launch()
        })
    },
    bootRoomManage : function () {
        require.async(['inn-manage/room-manage'], function (roomManage) {
            roomManage.launch()
        })
    },
    bootFunctions : function () {
        require.async(['inn-manage/functions'], function (functions) {
            functions.launch()
        })
    },
    bootAuthority : function () {
        require.async(['inn-manage/authority'], function (authority) {
            authority.launch()
        })
    },
    bootCustomers : function () {
        require.async(['inn-manage/customers'], function (customers) {
            customers.launch()
        })
    },
    bootLog : function () {
        require.async(['inn-manage/log'], function (log) {
            log.launch()
        })
    },
    boot : function () {
        var boot = $('#inn-manage-module').val()
        if (boot) {
            this['boot' + boot]()
        }
    }
}
window.InnManageBootLaunchUtil = InnManageBootLaunchUtil