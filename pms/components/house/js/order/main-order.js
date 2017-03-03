/**
 * 主订单
 */

var CellUtil = require('../room/roomcell-util.js')

// 主订单
var MainOrder = function () {
}

// 工厂方法
MainOrder.init = function (obj) {
    var main = new MainOrder()

    main.id = obj.id
    main.status = obj.status

    main.channelName = obj.channelName
    main.cfColorValue = obj.cfColorValue
    main.guest = obj.guest
    main.contact = obj.contact

    main.totalAmount = obj.totalAmount
    main.paidAmount = obj.paidAmount
    main.paidPayment = obj.paidPayment
    main.discountAmount = obj.discountAmount
    main.updatedAt = obj.updatedAt

    main.icon = obj.icon
    main.orderFrom = obj.orderFrom,
        main.important = obj.important
    main.hasRmk = !!obj.hasRmk
    main.hasRemind = !!obj.hasRemind
    main.remind = obj.remind

    main.orders = []
    main.gradeName = obj.gradeName

    // orders

    // id: el.subId,
    // roomId: el.roomId,
    // price: el.bookRoomPrice || el.realRoomPrice || 0,
    // start: el.checkInAt,
    // stop: el.checkOutAt,
    // type: el.status,
    // main: main

    return main
}

MainOrder.prototype = {
    render : function (turnOn) {
        this.lazyRender(turnOn)

        CellUtil.batchRender()

    },
    // 批量渲染 / 需要自己触发
    lazyRender : function (turnOn) {
        var self = this,
            orders = this.orders
        orders.forEach(function (el) {
            CellUtil.renderOrderItem(self, el, turnOn)
        })
    },
    erase : function () {
        var self = this

        this.orders.forEach(function (el) {
            CellUtil.eraseOrderItem(el, self.id)
        })
    },
    turnOn : function () {
        var self = this
        this.orders.forEach(function (item) {
            var cell = CellUtil.getOrderItemFirstCell(item, self.id)
            if (cell)
                cell.turnOn()
        })
    },
    turnOff : function () {
        var self = this

        this.orders.forEach(function (item) {
            var cell = CellUtil.getOrderItemFirstCell(item, self.id)
            if (cell)
                cell.turnOff()
        })
    },
    getFirstGroup : function (validFirst) {
        var self = this,
            first = null,
            firstDate = $("#date_grid dl:first").attr("markdate")

        this.orders.forEach(function (el) {
            if (first == null || el.start < first.start) {
                first = el
                if (validFirst) {
                    first = first.start >= firstDate ? first : null
                }
            }
        })
        return first
    },
    getStartAndStop : function () {
        var start = null,
            stop = null,
            days = 0

        this.orders.forEach(function (el) {
            if (start == null || el.start < start) {
                start = el.start
            }
            if (stop == null || el.stop > stop) {
                stop = el.stop
            }
        })

        if (start && stop) {
            days = tmsky.date.getDatePeriod(start, stop)
        }

        return {
            start : start,
            stop : stop,
            days : days
        }
    }
}

module.exports = MainOrder.prototype.constructor = MainOrder
