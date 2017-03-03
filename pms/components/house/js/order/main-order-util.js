/**
 * 主订单帮助类
 *
 * @type {[type]}
 */
var MainOrder = require('main-order.js')
var Const = require('../../../common/js/const.js')

var _list = {}

module.exports = {
    // 解析主订单
    parse: function (mainOrder) {
        var obj = {
            id: mainOrder.id,
            guest: mainOrder.contactUser,
            contact: mainOrder.contactPhone,
            channelName: '',
            gradeName: mainOrder.gradeName,
            totalAmount: mainOrder.totalAmount,
            paidAmount: mainOrder.paidAmount,
            paidPayment: mainOrder.paidPayment,
            status: mainOrder.status,
            updatedAt: mainOrder.updatedAt,
            icon: mainOrder.icon,
            discountAmount: mainOrder.discountAmount,
            orderFrom: mainOrder.orderFrom,
            important: mainOrder.important,
            hasRmk: mainOrder.reminds.length > 0,
            hasRemind: mainOrder.reminds.length > 0 && mainOrder.reminds[0].remindTime,
            remind: ''
        }, main, child

        if (obj.hasRmk) {
            obj.remind = mainOrder.reminds[0].content
        }

        if (mainOrder.customerFrom) {
            obj.channelName = mainOrder.customerFrom.name
            obj.cfColorValue = mainOrder.customerFrom.colorValue
        }

        main = MainOrder.init(obj)

        mainOrder.subOrders.forEach(function (el) {
            child = {
                id: el.id,
                roomId: el.room.id,
                price: el.bookRoomPrice || el.realRoomPrice || 0,
                start: el.checkInAt,
                stop: el.checkOutAt,
                type: el.status,
                main: main
            }
            main.orders.push(child)
        })

        _list[main.id] = main

        return main
    },
    // 解析房态
    parseRoomStatus: function (mainOrder) {
        var obj = {
            id: mainOrder.mainId,
            guest: mainOrder.userName,
            contact: mainOrder.contact,
            channelName: mainOrder.cfName,
            cfColorValue: mainOrder.cfColorValue,
            totalAmount: mainOrder.totalAmount,
            paidAmount: mainOrder.paidAmount,
            paidPayment: mainOrder.paidPayment,
            status: mainOrder.orderStatus,
            updatedAt: mainOrder.updatedAt,
            icon: mainOrder.icon,
            gradeName: mainOrder.gradeName,
            discountAmount: mainOrder.discountAmount,
            hasRmk: mainOrder.reminds.length > 0,
            hasRemind: mainOrder.reminds.length > 0 && mainOrder.reminds[0].remindTime,
            remind: ''
        }, main, child, orders

        if (obj.hasRmk) {
            obj.remind = mainOrder.reminds[0].content
        }

        main = MainOrder.init(obj)
        orders = mainOrder.subs
        orders.forEach(function (el) {
            child = {
                id: el.subId,
                roomId: el.roomId,
                price: el.bookRoomPrice || el.realRoomPrice || 0,
                start: el.checkInAt,
                stop: el.checkOutAt,
                type: el.status,
                main: main
            }
            main.orders.push(child)
        })

        _list[main.id] = main

        return main

    },
    getById: function (id) {
        return _list[id]
    },
    hasMainOrder: function (mo) {
        return mo && mo.id
    },
    // is normal checkOut
    isNCO: function (g_mainOrder) {
        return g_mainOrder && g_mainOrder.checkOutAt <= tmsky.date.today();
    },
    isBeforehandCO: function (g_mainOrder) {
        return g_mainOrder && g_mainOrder.checkOutAt > tmsky.date.today();
    },
    // is totally beforehand checkOut
    isTBHCO: function (g_mainOrder) {
        var today = tmsky.date.today();
        return g_mainOrder && g_mainOrder.checkOutAt > today && g_mainOrder.checkInAt >= today;
    },
    isBookMainOrder: function (g_mainOrder) {
        return g_mainOrder && (g_mainOrder.orderStatus == Const.M_BOOK || g_mainOrder.orderStatus == Const.M_PART_IN);
    },
    isCheckInMainOrder: function (g_mainOrder) {
        return g_mainOrder && (g_mainOrder.orderStatus == Const.M_IN || g_mainOrder.orderStatus == Const.M_PART_OUT);
    },
    cgCurrGMainOrder: function (g_mainOrder, opt) {
        if (!g_mainOrder || !opt)
            return
        if (opt.mainOrderStatus)
            g_mainOrder.orderStatus = opt.mainOrderStatus
        if (opt.subOrderStatus && g_mainOrder.subOrders) {
            g_mainOrder.subOrders.forEach(function (sub, i) {
                sub.status = opt.subOrderStatus
            })
        }
    },
    getFirstDate: function () {
        return $("#date_grid dl:first").attr("markdate");
    },
    getValidOrderFristDate: function (g_mainOrder) {
        if (!g_mainOrder) {
            return;
        }
        var firstDate = this.getFirstDate();
        if (g_mainOrder.checkInAt < firstDate) {
            //如果订单跨日历
            for (var i = 0, len = g_mainOrder.subOrders.length; i < len; i++) {
                if (g_mainOrder.subOrders[i].checkInAt < firstDate && g_mainOrder.subOrders[i].checkOutAt > firstDate) {
                    //如果子订单跨日历  &&  入住日期小于第一天，离店日期大于第一天
                    return firstDate;
                } else {
                    //子订单入住日期大于第一天  或者   离店日期小于第一天
                    if (g_mainOrder.subOrders[i].checkInAt >= firstDate && g_mainOrder.subOrders[i].checkInAt != g_mainOrder.subOrders[i].checkOutAt) {
                        //子订单入住日期大于等于第一天
                        return g_mainOrder.subOrders[i].checkInAt;
                    }
                }
            }
        }
        return g_mainOrder.checkInAt;
    },
    clear: function () {
        _list = {}
    },
    calcRoomCellLength: function (mo) {
        if (!mo || !mo.subOrders || !mo.subOrders.length) {
            return
        }
        var subOrders = mo.subOrders,
            len = 0
        subOrders.forEach(function (item) {
            len += tmsky.date.getDatePeriod(item.checkInAt, item.checkOutAt, 'd')
        })
        return len
    },
    mappingOrderIdCard: function (orders) {
        var map = {
            11: 1,
            518: 3,
            13: 5,
            93: 4,
            92: 2,
            91: 2,
            90: 2,
            99: 5,
            112: 5,
            419: 5,
            513: 5,
            999: 5,
        };

        orders.subOrders.forEach(function (order) {
            order.persons.forEach(function (person) {
                if (person.cardType > 10) {
                    person.cardType = map[person.cardType];
                }
            });
        })
        return orders
    },
    validOrderBeforeSave: function (orders) {
        if (avalon.vmodels.vm_idcard_main.idcardType.roomToPerson_func || avalon.vmodels.vm_idcard_main.idcardType.psb_func) {
            var tipsStr = '';
            var isNeedTips = false;
            orders.subOrders.forEach(function (el) {
                if (el.persons.length == 0) {
                    //没有关联入住人
                    if (isNeedTips) return
                    isNeedTips = true
                    tipsStr = el.room.roomNo + ' ' + '尚未添加入住人！'
                }
            })
            if (isNeedTips) {
                tmsky.ui.dialog.alert(tipsStr)
                return false
            }
        }
        return true
    }
}