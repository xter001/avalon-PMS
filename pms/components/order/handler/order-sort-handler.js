/**
 * 订单排序handler
 * Created by hai on 2016/4/6.
 */
var ORDER_CONST = require('../common/const.js')
var OrderSortHandler = {
    _SORT_CHECK_IN_AT_ : 'checkInAt',
    _SORT_CHECK_OUT_AT_ : 'checkOutAt',
    _SORT_CREATED_AT_ : 'createdAt',
    orderBy : null,//排序字段
    asc : true,//是否按升序模式排序
    isEnableSortByUpdateDate : true,//是否启用按更新时间排序
    ascByUpdateDate : false,//更新时间默认按降序排序

    /**
     * 配置项
     * @param orderBy Object|String
     * @param asc Boolean
     * @returns {OrderSortHandler}
     */
    config : function (orderBy, asc) {
        if (tmsky.isObject(orderBy)) {//options模式，key=OrderSortHandler.fieldName
            for (name in orderBy) {
                this[name] = orderBy[name]
            }
        } else {
            this.orderBy = tmsky.isEmpty(orderBy) ? this.orderBy : orderBy
            this.asc = tmsky.isEmpty(asc) ? this.asc : asc
        }
        return this
    },

    configByOrderFlag : function (orderFlag, searchType, asc) {
        var orderBy = null
        if (orderFlag == ORDER_CONST.MAIN_ORDER_TYPE.BOOK) {
            orderBy = this._SORT_CHECK_IN_AT_
        } else if (orderFlag == ORDER_CONST.MAIN_ORDER_TYPE.CHECKIN) {
            orderBy = this._SORT_CHECK_OUT_AT_
        }
        if (searchType == ORDER_CONST.ORDER_CONFIG.FIELDS.SEARCH_TYPE.CREATED_AT) {
            orderBy = this._SORT_CREATED_AT_
        }
        return this.config(orderBy, asc)
    },

    isValidOrderField : function () {
        return this.orderBy && (this._SORT_CHECK_IN_AT_ == this.orderBy || this._SORT_CHECK_OUT_AT_ == this.orderBy || this._SORT_CREATED_AT_ == this.orderBy)
    },

    isSortByCreatedDate : function () {
        return this._SORT_CREATED_AT_ == this.orderBy
    },

    getSortResult : function (diff, asc) {
        asc = tmsky.isNull(asc) ? this.asc : asc
        return asc ? diff : (diff > 0 ? -1 : diff < 0 ? 1 : 0)
    },

    sort : function (mainOrders) {
        var _self = this
        if (mainOrders && mainOrders.length && (this.isValidOrderField())) {
            mainOrders.forEach(function (data) {
                var subOrders = data.subOrders
                if (subOrders.length > 1) {
                    var _subOrders = subOrders.sort(function (sb1, sb2) {
                        var diff = 0
                        switch (_self.orderBy) {
                            case _self._SORT_CHECK_IN_AT_:
                                diff = _self.sortByCheckInAt(sb1, sb2)
                                break
                            case _self._SORT_CHECK_OUT_AT_:
                                diff = _self.sortByCheckOutAt(sb1, sb2)
                                break
                        }
                        return diff
                    })
                    data.subOrders = _subOrders
                }
            })
            _self.sortByUpdateDate(mainOrders)
        }
        return this
    },

    sortByCheckInAt : function (o1, o2) {
        var diff = 0
        if (o1.checkInAt == o2.checkInAt) {
            diff = o1.checkOutAt > o2.checkOutAt ? 1 : o1.checkOutAt == o2.checkOutAt ? 0 : -1
        } else if (o1.checkInAt > o2.checkInAt) {
            diff = 1
        } else {
            diff = -1
        }
        return this.getSortResult(diff)
    },

    sortByCheckOutAt : function (o1, o2) {
        var diff = 0
        if (o1.checkOutAt == o2.checkOutAt) {
            diff = o1.checkInAt > o2.checkInAt ? 1 : o1.checkInAt == o2.checkInAt ? 0 : -1
        } else if (o1.checkOutAt > o2.checkOutAt) {
            diff = 1
        } else {
            diff = -1
        }
        return this.getSortResult(diff)
    },

    sortByUpdateDate : function (mainOrders) {
        if (this.isEnableSortByUpdateDate && mainOrders.length > 1) {
            var _self = this
            mainOrders.sort(function (mo1, mo2) {
                var diff = 0
                if (mo1[_self.orderBy] == mo2[_self.orderBy]) {
                    diff = mo1.updatedAt > mo2.updatedAt ? 1 : mo1.updatedAt == mo2.updatedAt ? 0 : -1
                    diff = _self.getSortResult(diff, _self.ascByUpdateDate)
                } else if (mo1[_self.orderBy] > mo2[_self.orderBy]) {
                    diff = 1
                } else {
                    diff = -1
                }
                return diff
            })
        }
        return this
    }
}

module.exports = OrderSortHandler