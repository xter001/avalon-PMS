/**
 * Created by hai on 2016/1/21.
 */
var COMMON_CONST = require('../../common/js/const.js')
var _def_item_ = {
    id : null,
    item : 2,
    payChannel : {
        id : 4
    },
    payStatus : null,
    price : null,
    canModify : 1
}

var OrderFinanceHandler = {
    overage : null,
    penalty : null, // 违约金
    items : COMMON_CONST.FINANCE_ITEMS,
    values : [],
    payChannels : {},
    init : function (vm) {
        vm = vm || avalon.vmodels.vm_order_operate
        vm.finance.values.push({
            id : null,
            item : 2,
            payChannel : {
                id : 4
            },
            payStatus : null,
            price : null,
            canModify : 1
        })
    },

    add : function () {
        var vm = tmsky.getVm('vm_order_operate')
        vm.finance.init(vm)
    },
    //办理退房财务记录增加
    outActFinanceRecord : function () {
        var finance2 = [];
        vm = avalon.vmodels.vm_order_operate
        var id = vm.order.$model.id,
            price = vm.backRoomFee.amount,
            payId = vm.backRoomFee.payId,
            payName = vm.backRoomFee.payName,
            item = vm.backRoomFee.financeId,

            paymentid = vm.backPayment.payId,
            paymentprice = vm.backPayment.amount,
            paymentitem = vm.backPayment.financeId;

        //房费
        if (price > 0) {
            finance2.push({
                id : null,
                item : item,
                payChannel : {
                    id : payId
                },
                payStatus : null,
                price : price,
                canModify : 1
            })
        }

        //押金
        if (paymentprice > 0) {
            finance2.push({
                id : null,
                item : paymentitem,
                payChannel : {
                    id : paymentid
                },
                payStatus : null,
                price : paymentprice,
                canModify : 1
            })
        }

        return finance2;

    },
    //订单总房费（仅含房费，不含其它费用）
    getTotalRoomFee : function (vm) {
        var subOrders = vm.order.subOrders,
            fee = 0
        subOrders.forEach(function (el) {
           // if (el.active) {   //无论勾选，不影响订单总金额
                fee += Number(el.roomPrice)
          //  }
        })
        return fee
    },

    //总金额 订单总金额=房费+其他消费
    getTotalAmount : function (vm, calcRoomFee) {
        var order = vm.order,
            roomFee = order.totalRoomFee,
            goodSpend = 0
        if (calcRoomFee) {
            roomFee = this.getTotalRoomFee(vm)
        }
        goodSpend = this.getTotalGoodSpend(vm)
        return roomFee + goodSpend
    },

    //总消费
    getTotalGoodSpend : function (vm) {
        var goodSpends = vm.spend.goodSpends,
            totalGoodSpends = 0
        goodSpends.forEach(function (el) {
            totalGoodSpends += Number(el.realPrice)*Number(el.goodNum)
        })
        return totalGoodSpends
    },

    //订单已收金额（不含押金）= 收取订金 + 收取房费 + 商品收入 - (退还订金 + 退还房费 + 商品支出)
    getPaidAmount : function () {
        var persist = 0,
            abandon = 0,
            finances = this.dataConvert(),
            FINANCE_ITEMS_ID = COMMON_CONST.FINANCE_ITEMS_ID

        for (var i = 0; i < finances.length; i++) {
            if (finances[i].item == FINANCE_ITEMS_ID.ZFDJ || finances[i].item == FINANCE_ITEMS_ID.ZFFF || finances[i].item == FINANCE_ITEMS_ID.QTSR) {
                persist += parseInt(finances[i].price)
            } else if (finances[i].item == FINANCE_ITEMS_ID.THDJ || finances[i].item == FINANCE_ITEMS_ID.THFF || finances[i].item == FINANCE_ITEMS_ID.QTZC) {
                abandon += parseInt(finances[i].price)
            }
        }
        return persist - abandon
    },


    //订单已付押金 = 支付押金 - 退还押金
    getPaidPayment : function () {
        return this.getPaidForegift() - this.getRefundForegift()
    },

    //获取支付押金
    getPaidForegift : function (finances) {
        var paidForegift = 0
        finances = finances || this.dataConvert()
        finances.forEach(function (el) {
            if (el.item == COMMON_CONST.FINANCE_ITEMS_ID.ZFYJ) {
                paidForegift += el.price
            }
        })
        return paidForegift
    },

    //获取退还押金
    getRefundForegift : function (finances) {
        var refundForegift = 0
        finances = finances || this.dataConvert()
        finances.forEach(function (el) {
            if (el.item == COMMON_CONST.FINANCE_ITEMS_ID.THYJ) {
                refundForegift += el.price
            }
        })
        return refundForegift
    },
    //小数点保留两位
    changeTwoDecimal : function (x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return x
        }
        f_x = Math.round(f_x * 100) / 100;

        return f_x;

        return x
    },
    dataConvert : function () {
        var finances = []
        var vm = avalon.vmodels.vm_order_operate
        this.values.forEach(function (el) {
            if (!tmsky.isEmpty(el.price) && !isNaN(el.price)) {
                var curr = el.$model
                curr.item = Number(curr.item)
                curr.payChannel.id = Number(curr.payChannel.id)
                curr.price = Number(el.price)
                curr.canModify = vm.payChannels[curr.payChannel.id].canModify
                finances.push(curr)
            }
        })
        var vm = tmsky.getVm('vm_order_operate');
        if (vm.finance.outActFinanceRecord().length != 0) {
            for (var i = 0; i < vm.finance.outActFinanceRecord().length; i++) {
                finances.push(vm.finance.outActFinanceRecord()[i]);
            }

        }
        return finances
    }
}

module.exports = OrderFinanceHandler