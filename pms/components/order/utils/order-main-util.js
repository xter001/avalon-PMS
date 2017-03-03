/**
 * Created by hai on 2016/1/22.
 */
var COMMON_CONST = require('../../common/js/const.js'),
    ORDER_CONST = require('../common/const.js'),
    CommonUtil = require('../../common/js/utils/common-util.js')

var MainOrderUtil = {
    get : function (id, cb) {
        $.post('/order/view/' + ORDER_CONST.ORDER_OPERATE.FROM + "/" + id, function (rs) {
            CommonUtil.fire(cb, rs)
        })
    },
    //转换为业务对象
    convert : function (order) {
        //this.convertCustomerFrom(main)
        order.overage = order.totalAmount - order.paidAmount
        order.isPartStatus = order.orderStatus == COMMON_CONST.M_PART_IN || order.orderStatus == COMMON_CONST.M_PART_OUT
        this.attachPhoneInfo(order)
        this.hasExistPerson(order)
        this.convertSubOrder(order)
        this.convertRoomFee(order)
        return order
    },
    attachPhoneInfo : function (order) {
        order.persons.forEach(function (el) {
            el.province = null
            el.city = null
        })
    },
    hasExistPerson : function (order) {
        var hasExistPerson = false
        order.persons.forEach(function (el) {
            if (el.name || el.phone) {
                hasExistPerson = true
                //return false
            }

            if (el.cardType == 0) {
                el.cardType = 1
            }

        })
        if (order.persons.length) {
            order.persons[0].isPayMan = 1
        }
        order.hasExistPerson = hasExistPerson
    },
    convertCustomerFrom : function (order) {
        order.customerFrom.id = parseInt(order.customerFrom.id)
    },
    convertSubOrder : function (order) {
        if (order && order.subOrders && order.subOrders.length) {
            var orders = order.subOrders
            order.subOrders.forEach(function (el, i) {
                el.active = true
                el.days = tmsky.date.diffDays(el.checkInAt, el.checkOutAt)
                el.dayOptions = [];
                //for (var i = 1; i <= el.days; i++) {
                //    el.dayOptions.push({days: i, text: i + '晚'})
                //}
                //当日住没有住退房也可以选择1~100晚
                //if(el.dayOptions == ''){
                for (var i = 1; i <= 100; i++) {
                    el.dayOptions.push({days : i, text : i + '晚'})
                }
                //  }

                MainOrderUtil.getSubOrderDisabledStatus(el, order)
                el.updateDisabled = false
            })
        }
    },
    //子订单是否可编辑
    getSubOrderDisabledStatus : function (el, order) {
        if (order.isPartStatus) {
            switch (order.orderStatus) {
                case COMMON_CONST.M_PART_IN:
                    el.disabled = el.status == COMMON_CONST.SUB_IN
                    break
                case COMMON_CONST.M_PART_OUT:
                    el.disabled = el.status == COMMON_CONST.SUB_OUT
                    break
            }
        } else {
            el.disabled = false
        }
    },

    toggleSubOrderEditorStatus : function (disabled, order) {
        order.subOrders.forEach(function (el) {
            if (disabled) {
                if (!el.disabled) {
                    el.disabled = disabled
                    el.updateDisabled = true
                }
            } else {
                if (el.updateDisabled) {
                    el.disabled = disabled
                    el.updateDisabled = false
                }
            }
        })
    },

    convertRoomFee : function (order) {

    }
}

module.exports = MainOrderUtil
