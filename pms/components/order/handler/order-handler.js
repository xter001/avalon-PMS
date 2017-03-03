/**
 * Created by hai on 2016/1/21.
 */
var COMMON_CONST = require('../../common/js/const.js'),
    ORDER_CONST = require('../common/const.js'),
    OrderInitHandler = require('./order-init-handler.js'),
    MemberUnionHandler = require('./order-member-handler.js'),
    MainOrderUtil = require('../utils/order-main-util.js'),
    OrderButtonHandler = require('./order-button-handler.js'),
    OrderFinanceHandler = require('./order-finance-handler.js'),
    OrderSaveHandler = require('./order-save-handler.js'),
    today = tmsky.date.today()

var OrderHandler = {
    //显示操作弹框
    showOrderOperatePopup : function (vm_order_main) {
        //tmsky.ui.dialog.loading()
        this.initByMainOrderVm(vm_order_main)
        $('#order-operate-popups').popups('show');
        var vm = tmsky.getVm('vm_order_operate');
        vm.showInputView = false
        vm.hasViewShow = false //是否以消息展示类型显示
        vm.hasInputShow = true
    },
    showErrorOrderOperatePopup : function (vm_order_main, order) {
        //tmsky.ui.dialog.loading()
        this.initErrorOrderVm(vm_order_main, order)
        $('#order-operate-popups').popups('show');
        var vm = tmsky.getVm('vm_order_operate');
        vm.showInputView = false
        vm.hasViewShow = false //是否以消息展示类型显示
        vm.hasInputShow = true
    },

    initByMainOrderVm : function (vm_order_main) {
        var vm_order_main = vm_order_main || tmsky.getVm('vm_order_main'),
            vm_order_operate = tmsky.getVm('vm_order_operate')
        this.reset()
        vm_order_operate.text.title = vm_order_main.text.operate
        vm_order_operate.orderOperateFlag =
            vm_order_main.display.todayTomorrow ? vm_order_main.isToday ? ORDER_CONST.ORDER_OPERATE.OPR : ORDER_CONST.ORDER_OPERATE.VIEW : ORDER_CONST.ORDER_OPERATE.OPR
        vm_order_main.orders = tmsky.extend(true, [], vm_order_main.$order)
        //var order = $.extend(true, {}, vm_order_main.orders[vm_order_main.currOrderIndex].$model)
        var order = tmsky.extend(true, [], vm_order_main.$order)[vm_order_main.currOrderIndex]
        //init order
        vm_order_operate.order = MainOrderUtil.convert(order)
        vm_order_operate.finance.penalty = vm_order_operate.order.penalty
        //init busi
        vm_order_operate.isFromDx = COMMON_CONST.ORDER_FROM.DXPT.indexOf(vm_order_operate.order.orderFrom) != -1 ? true : false
        vm_order_operate.isFromOTA = COMMON_CONST.ORDER_FROM.OTA.indexOf(vm_order_operate.order.orderFrom) != -1 ? true : false
        vm_order_operate.user.init(vm_order_operate.order.persons)
        vm_order_operate.mainId = vm_order_operate.order.$model.id
        vm_order_operate.checkInAt = vm_order_operate.order.$model.checkInAt
        vm_order_operate.spend.goodSpends = vm_order_operate.order.goodSpends || []
        vm_order_operate.spend.goodSpends = vm_order_operate.spend.goodSpends.reverse()
        vm_order_operate.customerFrom.init()
        vm_order_operate.remark.curr = vm_order_operate.order.reminds.length ? vm_order_operate.order.reminds[0] : OrderInitHandler.initDefaultRemind()
        vm_order_operate.memberUnion.init()
        vm_order_operate.buttonHandler.init()
        OrderHandler.updateOrderInfo()
        $('.goChangeRoom').attr('mainId', vm_order_operate.mainId)
        $('.goChangeRoom').attr('checkInAt', vm_order_operate.checkInAt)
    },
    //异常订单
    initErrorOrderVm : function (vm_order_main) {
        var vm_order_main = vm_order_main || tmsky.getVm('vm_order_main')
        var vm_order_operate = tmsky.getVm('vm_order_operate')
        this.reset()
        var order = vm_order_main.$errorOrders
        vm_order_operate.text.title = vm_order_main.text.operate
        vm_order_operate.orderOperateFlag =
            vm_order_main.display.todayTomorrow ? vm_order_main.isToday ? ORDER_CONST.ORDER_OPERATE.OPR : ORDER_CONST.ORDER_OPERATE.VIEW : ORDER_CONST.ORDER_OPERATE.OPR
        //init order
        vm_order_operate.order = MainOrderUtil.convert(order)
        vm_order_operate.finance.penalty = vm_order_operate.order.penalty
        //init busi
        vm_order_operate.user.init(order.persons)
        vm_order_operate.mainId = vm_order_operate.order.id
        vm_order_operate.checkInAt = vm_order_operate.order.checkInAt
        vm_order_operate.spend.goodSpends = vm_order_operate.order.goodSpends || []
        vm_order_operate.spend.goodSpends = vm_order_operate.spend.goodSpends.reverse()
        vm_order_operate.customerFrom.init()
        vm_order_operate.remark.curr = vm_order_operate.order.reminds.length ? vm_order_operate.order.reminds[0] : OrderInitHandler.initDefaultRemind()
        vm_order_operate.memberUnion.init()
        vm_order_operate.buttonHandler.init()
        OrderHandler.updateOrderInfo()
        $('.goChangeRoom').attr('mainId', vm_order_operate.mainId)
        $('.goChangeRoom').attr('checkInAt', vm_order_operate.checkInAt)
    },

    reset : function () {
    },
    //退房系列
    isNoCheckInTruely : function (start) {
        var sub = tmsky.date.diffDays(tmsky.date.today(), start)
        if (sub > 0) {
            //入住时间在今天以后
            return true
        } else {
            return false
        }
    },
    //统一退房勾选
    allCheckOut : function () {
        var vm_order_operate = tmsky.getVm('vm_order_operate')
        var bool = vm_order_operate.allCheckout
        vm_order_operate.allCheckout = !bool
        if (!bool) {
            //统一退房
            var orders = $.extend(true, {}, vm_order_operate.order.$model)
            orders.subOrders.forEach(function (el, i) {
                if (!OrderHandler.isNoCheckInTruely(el.checkInAt)) {
                    OrderHandler.toggleActive(el, '', true, i)
                }
            })
            vm_order_operate.order = orders
            OrderHandler.subOrdersCheckDate(tmsky.date.today())
            OrderHandler.updateOrderInfo()
        } else {
            vm_order_operate.disabledIndex = null
        }
    },
    compare : function (propertyName) {
        return function (object1, object2) {
            var value1 = object1[propertyName];
            var value2 = object2[propertyName];
            if (value2 < value1) {
                return -1;
            }
            else if (value2 > value1) {
                return 1;
            }
            else {
                return 0;
            }
        }
    },
    //每个子订单取最大退房日期
    subOrdersCheckDate : function (value) {
        var order = $.extend(true, {}, tmsky.getVm('vm_order_operate').order.$model)
        var subOrders = $.extend(true, [], order.subOrders)
        subOrders.forEach(function (item, i) {
            if (!OrderHandler.isNoCheckInTruely(item.checkInAt)) {
                if (tmsky.date.diffDays(item.checkOutAt, value) >= 0) {
                    item.b_checkout = item.checkOutAt
                } else {
                    item.b_checkout = value
                }
            }
        })
        order.subOrders = subOrders
        tmsky.getVm('vm_order_operate').order = order
        OrderHandler.plusTotalCheckoutPrice()
    },
    //计算不同退房日期的价格
    plusTotalCheckoutPrice : function () {
        var vm = tmsky.getVm('vm_order_operate'),
            order = $.extend(true, {}, vm.order.$model),
            subOrders = $.extend(true, [], order.subOrders)
        subOrders.forEach(function (el, i) {
            var checkoutDate = el.active ? el.b_checkout : el.checkOutAt
            var fee = 0
            if (checkoutDate != undefined || checkoutDate) {
                el.days = tmsky.date.diffDays(el.checkInAt, checkoutDate)
                if (el.days == 0) {
                    if (el.subOrderPrices.length == 0)return
                    fee += Number(el.subOrderPrices[0].price)
                } // 当日住当日退为半天，取第一天房价
                else {
                    for (var j = 0; j < el.days; j++) {
                        fee += Number(el.subOrderPrices[j].price)
                    }
                }
                el.roomPrice = fee
            }
        })
        order.subOrders = subOrders
        vm.order = order
        OrderHandler.updateOrderInfo()
    },
    initCheckoutDate : function () {
        var vm_order_operate = tmsky.getVm('vm_order_operate')
        var checkoutDate = []
        for (var i = 0; i <= tmsky.date.diffDays(tmsky.date.today(), vm_order_operate.order.checkOutAt); i++) {
            checkoutDate.push(tmsky.date.addDays(tmsky.date.today(), i, 'yyyy-MM-dd'))
        }
        vm_order_operate.checkoutDate = checkoutDate
    },
    sortOrder : function (orders) {
        var vm = tmsky.getVm('vm_order_operate')
        //orders.subOrders.sort(OrderHandler.compare('checkOutAt'))
        orders.subOrders.forEach(function (el, i) {
            if (OrderHandler.isNoCheckInTruely(el.checkInAt) || el.status != 3) {
                el.active = false
            }
        })
        return orders
    },
    toggleActive : function (el, e, allChecked, i) {
        var vm = tmsky.getVm('vm_order_operate'),
            subOrders = vm.order.$model.subOrders,
            actives = OrderHandler.countActives(vm, el.active)

        if (!allChecked && el.active && !(actives > 1)) {
            tmsky.ui.dialog.errorTips('最后一个，不能再取消了哟 ^_^')
            return
        }

        el.active = !el.active
        if (allChecked) {
            el.active = true
        }
        OrderHandler.plusTotalCheckoutPrice()
        //标记是否为部分入住、退房操作
        actives = OrderHandler.countActives(vm, el.active)
        vm.isPartOpr = actives != OrderHandler.getCheckInStatusOrdersLength()
    },
    //所有已住状态的订单数
    getCheckInStatusOrdersLength : function () {
        var vm = tmsky.getVm('vm_order_operate'),
            subOrders = vm.order.$model.subOrders,
            count = 0
        subOrders.forEach(function (el, i) {
            if (el.status == 3) {
                count++
            }
        })
        return count
    },
    //修改退房时间
    changeCheckoutDate : function () {
        var value = $(this).attr('data-value')
        OrderHandler.subOrdersCheckDate(value)
    },
    //修改或非今日可操作订单时不能进行子订单勾选操作
    toggleSubOrderEditorStatus : function (disabled) {
        MainOrderUtil.toggleSubOrderEditorStatus(disabled, tmsky.getVm('vm_order_operate').order)
    },
    countActives : function (vm, currActive) {
        var vm = vm || tmsky.getVm('vm_order_operate'),
            order = vm.order.$model,
            subOrders = order.subOrders,
            len = subOrders.length,
            actives = 0
        //if (len == 1) {
        //    return false
        //}
        subOrders.forEach(function (el) {
            actives += (!el.disabled && el.active) ? 1 : 0
        })
        //actives = currActive ? actives - 1 : actives + 1
        return actives
    },

    updateOrderInfo : function () {
        var vm = tmsky.getVm('vm_order_operate'),
            order = vm.order
        var roomFee = OrderFinanceHandler.getTotalRoomFee(vm)
        order.totalRoomFee = roomFee
        order.totalAmount = OrderFinanceHandler.getTotalAmount(vm, false)
        if (!order.discountAmount) {
            order.discountAmount = 0
        }
        vm.finance.overage = order.totalAmount - order.paidAmount - order.discountAmount
        vm.memberUnion.updateMemDiscount(roomFee)
    },

    save : function (flag) {
        OrderSaveHandler.save(flag, avalon.vmodels.vm_order_main.dataReload)
    },

    revokeCheckOut : function () {
        this.__dom__.popups('hide')
        tmsky.ui.dialog.loading('撤销退房中...')
        $.get('/order/revokeCheckOut/' + this.order.id, function (rs) {
            if (rs.status == 200) {
                tmsky.ui.dialog.successTips('撤销退房成功')
                avalon.vmodels.vm_order_main.dataReload()
            } else {
                tmsky.ui.dialog.errorTips(rs.message || '撤销退房失败')
                this.__dom__.popups('show')
            }
        }).fail(function (rs) {
            tmsky.ui.dialog.errorTips(rs.message || '撤销退房出错')
            this.__dom__.popups('show')
        }).always(tmsky.ui.dialog.loading.close)
    }
}

module.exports = OrderHandler