/**
 * Created by hai on 2016/1/18.
 */
var ORDER_CONST = require('../common/const.js')
var COMMON_CONST = require('../../common/js/const.js')
var OrderCommonUtil = {
    getMainOrderStatus : function (orderType) {
        var orderStatus = [];
        switch (orderType) {
            case ORDER_CONST.MAIN_ORDER_TYPE.BOOK:
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.NO_CHECKIN);
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.PART_CHECKIN);
                break;
            case ORDER_CONST.MAIN_ORDER_TYPE.CHECKIN:
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.NO_CHECKOUT);
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.PART_CHECKOUT);
                break;
            case ORDER_CONST.MAIN_ORDER_TYPE.CHECKOUT:
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.ALL_CHECKOUT);
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.ALL_PENALTY);
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.ALL_DEPOSIT);
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.ALL_DEBT);
                break;
            case ORDER_CONST.MAIN_ORDER_TYPE.CANCEL:
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.CANCEL);
                break;
            case ORDER_CONST.MAIN_ORDER_TYPE.YAFANG:
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.NULL);
                break;
            case ORDER_CONST.MAIN_ORDER_TYPE.ALL:
                orderStatus.push(COMMON_CONST.MAIN_ORDER_STATUS.ALL);
                break;
        }
        return orderStatus.length > 0 ? orderStatus.join(",") : "";
    },
    isNewTodayOrder : function (orderType) {
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.NEW_TODAY
    },
    isBookOrder : function (orderType) {
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.BOOK
    },
    isCheckInOrder : function (orderType) {
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.CHECKIN
    },
    isCheckOutOrder : function (orderType) {
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.CHECKOUT
    },
    isCancelOrder : function (orderType) {
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.CANCEL
    },
    isAllOrder : function (orderType) {
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.ALL
    },
    isErrorOrder:function(orderType){
        return orderType && orderType == ORDER_CONST.MAIN_ORDER_TYPE.ERROR
    }
}

module.exports = OrderCommonUtil