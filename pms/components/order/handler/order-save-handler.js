/**
 * Created by hai on 2016/1/21.
 */
var COMMON_CONST = require('../../common/js/const.js')
var OrderSaveHandler = {

    save : function (flag, cb) {

        var vm = avalon.vmodels.vm_order_operate
        vm.__dom__.$model.popups('hide')
        tmsky.ui.dialog.loading('订单保存中...')
        var params = OrderSaveHandler.convert(vm, flag)
        $.ajax({
            url : "/order/save",
            data : JSON.stringify(params),
            type : 'POST',
            contentType : 'application/json;charset=utf-8',
            success : function (rs) {
                if (rs && rs.status == 200) {
                    tmsky.ui.dialog.successTips('订单保存成功')
                    cb && cb()

                    // 快捷支付
                    var PayModule = require('order/pay')
                    if (rs.needPayFinanceId) {
                        PayModule.openQuickPay(rs.needPayFinanceId)
                    }

                    // 条码支付
                    if (rs.needBarFinanceId) {
                        PayModule.openSaomaPay(rs.needBarFinanceId)
                    }
                } else {
                    tmsky.ui.dialog.errorTips(rs.message || '订单保存失败')
                    if (flag == COMMON_CONST.BTN_ENUM.out_save.fn)return
                    vm.__dom__.$model.popups('show')
                }
            },
            error : function (rs) {
                tmsky.ui.dialog.errorTips(rs.message || '订单保存出错')
                vm.__dom__.$model.popups('show')
            }
        }).always(tmsky.ui.dialog.loading.close)
    },
    converSubOrderStatus : function (vm, flag) {
        var order = vm.order.$model
        if (flag == COMMON_CONST.BTN_ENUM.out_save.fn) {
            order.subOrders.forEach(function (el, i) {
                if (el.active) {
                    el.status = COMMON_CONST.SUB_OUT
                }
            })
        }
        if (flag == COMMON_CONST.BTN_ENUM.in_save.fn) {
            order.subOrders.forEach(function (el, i) {
                if (el.active) {
                    el.status = COMMON_CONST.SUB_IN
                }
            })
        }
        vm.order = order
    },
    mappingOrderIdCard: function (orders) {
        var map = {
            11:1,
            518:3,
            13:5,
            93:4,
            92:2,
            91:2,
            90:2,
            99:5,
            112:5,
            419:5,
            513:5,
            999:5,
        };

        orders.subOrders.forEach(function(order){
            order.persons.forEach(function(person){
                if (person.cardType > 10) {
                    person.cardType = map[person.cardType];
                }
            });
        })
        return orders
    },
    convert : function (vm, flag) {
        OrderSaveHandler.converSubOrderStatus(vm, flag)
        var order = {}
        this.convertBaseInfo(vm, order, flag)
        this.convertCustomerFrom(vm, order)
        this.convertSubOrder(vm, order, flag)
        order = this.mappingOrderIdCard(order);
        // order.persons = vm.user.dataConvert()
        //order.goodSpends = vm.spend.dataConvert()
        order.financeRecords = vm.finance.dataConvert()
        var remark = vm.remark.curr.$model
        remark.icon = vm.order.icon
        order.reminds = [remark]
        return order
    },

    convertBaseInfo : function (vm, order, flag) {
        var _order = vm.order.$model
        order.id = _order.id
        order.orderAction = this.getOrderAction(flag, vm)
        order.orderStatus = this.getOrderStatus(flag, vm)
        order.orderNo = _order.orderNo
        order.commission = _order.commission
        order.icon = _order.icon
        order.orderUpdateFrom = COMMON_CONST.ORDER_FROM.WEB_ORDER_MODULE
        order.paidAmount = vm.finance.changeTwoDecimal(_order.paidAmount + vm.finance.getPaidAmount());  //订单已收金额
        order.paidPayment = vm.finance.changeTwoDecimal(_order.paidPayment + vm.finance.getPaidPayment())   //已收押金
        order.roomFee = vm.finance.changeTwoDecimal(vm.finance.getTotalRoomFee(vm))
        order.totalAmount = vm.finance.changeTwoDecimal(vm.finance.getTotalAmount(vm, true))
        order.penalty = vm.finance.changeTwoDecimal(vm.finance.penalty)
        return this
    },

    convertCustomerFrom : function (vm, order) {
        var customerFrom = vm.customerFrom.$model
        order.customerFrom = customerFrom.datas[customerFrom.currId] || customerFrom.curr
        return this
    },

    convertSubOrder : function (vm, order, flag) {
        var subOrders = []
        vm.order.subOrders.$model.forEach(function (el) {
            subOrders.push({
                id : el.id,
                checkInAt : el.checkInAt,
                checkOutAt : el.active ? el.b_checkout || el.checkOutAt : el.checkOutAt,
                room : {
                    id : el.room.id,
                    roomNo : el.room.roomNo
                },
                persons:el.persons, // 订单 修改入住人
                roomPrice : vm.finance.changeTwoDecimal(el.roomPrice),
                status : OrderSaveHandler.getSubOrderStatus(el, order.orderStatus, flag),
                subOrderPrices : el.subOrderPrices
            })
        })
        order.subOrders = subOrders
        return this
    },

    getOrderStatus : function (flag, vm) {
        var hasBook = false,
            hasCheckin = false,
            hasCheckout = false,
            hasCancle = false,
            vm = vm || tmsky.getVm('vm_order_operate'),
            order = vm.order,
            orderStatus
        order.subOrders.forEach(function (el) {
            switch (el.status) {
                case COMMON_CONST.SUB_BOOK:
                    hasBook = true
                    break
                case COMMON_CONST.SUB_IN:
                    hasCheckin = true
                    break
                case COMMON_CONST.SUB_OUT:
                    hasCheckout = true
                    break
                case COMMON_CONST.SUB_CANCLE:
                    hasCancle = true
                    break
            }
        })
        // 只有预定
        if (hasBook && !hasCheckin) {
            orderStatus = COMMON_CONST.M_BOOK
        }
        // 预定和入住
        if (hasBook && hasCheckin) {
            orderStatus = COMMON_CONST.M_PART_IN
        }
        // 只有入住
        if (!hasBook && hasCheckin && !hasCheckout) {
            orderStatus = COMMON_CONST.M_IN
        }
        // 退房和入住
        if (!hasBook && hasCheckin && hasCheckout) {
            orderStatus = COMMON_CONST.M_PART_OUT
        }
        // 退房
        if (!hasBook && !hasCheckin && hasCheckout) {
            orderStatus = COMMON_CONST.M_OUT
        }
        // 取消
        if (hasCancle) {
            orderStatus = COMMON_CONST.M_CANCLE
        }
        return orderStatus
    },

    getOrderAction : function (flag, vm) {
        var hasBook = false,
            hasCheckin = false,
            hasCheckout = false,
            hasCancle = false,
            vm = vm || tmsky.getVm('vm_order_operate'),
            order = vm.order,
            orderAction
        order.subOrders.forEach(function (el) {
            switch (el.status) {
                case COMMON_CONST.SUB_BOOK:
                    hasBook = true
                    break
                case COMMON_CONST.SUB_IN:
                    hasCheckin = true
                    break
                case COMMON_CONST.SUB_OUT:
                    hasCheckout = true
                    break
                case COMMON_CONST.SUB_CANCLE:
                    hasCancle = true
                    break
            }
        })

        // 只有预定
        if (hasBook && !hasCheckin) {
            orderAction = order.id == null ? COMMON_CONST.ACT_BOOK : COMMON_CONST.ACT_BOOK_UPDATE
        }
        // 预定和入住
        if (hasBook && hasCheckin) {
            orderAction = COMMON_CONST.ACT_PART_IN
        }
        // 只有入住
        if (!hasBook && hasCheckin && !hasCheckout) {
            orderAction = order.id == null ? COMMON_CONST.ACT_IN : COMMON_CONST.ACT_IN_UPDATE
            if (order.orderStatus === COMMON_CONST.M_BOOK || order.orderStatus === COMMON_CONST.M_PART_IN) {
                orderAction = COMMON_CONST.ACT_PART_IN
            }
        }
        // 退房和入住
        if (!hasBook && hasCheckin && hasCheckout) {
            orderAction = COMMON_CONST.ACT_PART_OUT
        }
        // 退房
        if (!hasBook && !hasCheckin && hasCheckout) {
            orderAction = order.orderStatus === COMMON_CONST.G_OUT_UPDATE ? COMMON_CONST.ACT_OUT_UPDATE : COMMON_CONST.ACT_OUT
        }
        // 取消
        if (hasCancle) {
            orderAction = COMMON_CONST.ACT_BOOK_CANCLE
        }
        return orderAction
    },

    getSubOrderStatus : function (el, orderStatus, flag) {
        var subOrderStatus
        switch (orderStatus) {
            case COMMON_CONST.M_CANCLE:
                subOrderStatus = COMMON_CONST.SUB_CANCLE
                break
            case COMMON_CONST.M_BOOK:
                subOrderStatus = COMMON_CONST.SUB_BOOK
                break
            case COMMON_CONST.M_PART_IN:
                subOrderStatus = el.active ? COMMON_CONST.SUB_IN : COMMON_CONST.SUB_BOOK
                break
            case COMMON_CONST.M_IN:
                subOrderStatus = COMMON_CONST.SUB_IN
                break
            case COMMON_CONST.M_PART_OUT:
                subOrderStatus = el.active ? COMMON_CONST.SUB_OUT : COMMON_CONST.SUB_IN
                break
            case COMMON_CONST.M_OUT:
                subOrderStatus = COMMON_CONST.SUB_OUT
                break
        }

        return subOrderStatus
    }
}

module.exports = OrderSaveHandler
