/**
 * 房态入口文件
 *
 * @type {[type]}
 */
var Header = require('header')
var CONST = require('../common/js/const.js')
var RoomUtil = require('js/room/room-util.js')
var CellUtil = require('js/room/roomcell-util.js')
var Controller = require('js/control.js')
var Access = require('../header/access.js'),
    GUIDE_CONST = require('../new-guide/js/guide_const.js')

module.exports = function () {
    Header.ready(function () {
        //新手引导入口，如果新手引导完整完成过一次，则跳过。否则跳转到进行中的引导模块所在界面
        var hasAccessToView = Header.hasAccessToView(Access.AC_ROOM_STATUS, '房态')
        if (!hasAccessToView) return

        var newGuide = require('new-guide')
        newGuide.init()
        tmsky.getVm('vm_new_guide').guideHouseBack()

        RoomUtil.ready(function () {
            var today = tmsky.date.today()
            var date = tmsky.date.plusDate(today, CONST.VIEW_PRE_DAYS, 'd', 'yyyy-MM-dd')

            CellUtil.renderRoomGrid(CONST.VIEW_DAYS, date).init()
            Controller.renderRoomStatus(date)
            Controller.renderLockAndPrice(date)
            // 异步获取 操作区信息
            require.async(['house/editor'], function (editor) {
                var dom = document.getElementById('avalon_contrl')

                editor.init(dom, function (vm, editor) {
                    $("#remind_time_picker").datetimepicker()
                    Controller.initVModels(vm, editor).bindEvent()
                    // avalon.scan(dom)
                })
            })

            // 异步获取 身份证录入模块
            require.async(['house/idcard-input'],
                function (idcard) {
                    idcard.init()
                })

            // 异步获取 房型筛选 / 底部菜单 / 支付 / 搜索 / 读卡器  / bottomBar
            require.async(['house/room-filter', 'house/footnav', 'house/pay', 'house/search', 'house/idcard', 'house/bottomBar'],
                function (filter, footnav, pay, search, idcard, bottomBar) {
                    filter.init()
                    footnav.init()
                    pay.init()
                    search.init()
                    bottomBar.init()
                    idcard.start()
                    Controller.setPayModule(pay)
                })
        })
    })
    RoomUtil.init()
}

avalon.ready(function () {
    // 统一绑定键盘特殊事件
    $(document).keyup(function (e) {
        // 绑定回车
        if (e.keyCode == 13) {
            // 搜索订单
            if (e.target.id == "order-search-ipt") {
                try {
                    avalon.modules.exports.exports.vmodels.vm_top_search.searchHandle(e, $("#order-search-btn"));
                }
                catch (e) {
                }
            }
        }
    });
    // 统一绑定鼠标特殊事件
    $(document).mouseup(function (e) {
        // 搜索订单
        if (!tmsky.inDomScope($(e.target), ".top-search")) {
            try {
                avalon.modules.exports.exports.vmodels.vm_top_search.open = false;
            }
            catch (e) {
            }
        }
    });
})