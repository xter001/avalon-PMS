var CONST = require('../../../common/js/const.js')
//var Dialog = require('dialog')
//var Roomcell = require('./roomcell.js')
var CellUtil = require('./roomcell-util.js')
var MainOrderUtil = require('../order/main-order-util.js')
var Controller = null;

var __dragdata__ = {
    cell : null,
    target : null,
    $cellOrder : null,
    $targetOrder : null
}

var _startHandle = function (ui) {
    __dragdata__.resetTop = ui.position.top
    __dragdata__.resetLeft = ui.position.left
}

var _stopHandle = function (ui) {
    Controller.clearSelected()
    var $el = ui.helper,
        $cellEle = $el.parent(),
        w = $cellEle.width(),
        h = $cellEle.height()+1,
        xNum = Math.round((ui.position.left - ui.originalPosition.left) / w),
        yNum = Math.round((ui.position.top - ui.originalPosition.top) / h)

    var cell = CellUtil.getByUid($cellEle.attr('uid'))
    if (cell) {
        __dragdata__.cell = cell
        __dragdata__.$cellOrder = $el
        if (xNum == 0 && yNum == 0) {
            _reset()
            return
        }
        __dragdata__.target = CellUtil.getCellAfterMove(cell, xNum, yNum)
        if (_isAbleChange()) {
            _confirmDrag()
        }
    }
}

// 是否可以交换
var _isAbleChange = function () {
    var cell = __dragdata__.cell,
        target = __dragdata__.target,
        orderId = cell.orderId,
        mainSize = cell.mainLen,
        targetSize = target.mainLen,
        targetMainId = target.orderId,
        mainOrder = MainOrderUtil.getById(cell.mainId),
        $targetOrder, slibing, finalSize, finalCell, i

    // 换房为锁房的
    if (!target || target.isLock) {
        _failTips()
        return false
    }
    // 信用住订单不能更改入住日期
    if(!ratePlanIsCanChange(mainOrder, cell.date, target.date)){
        return false
    }

    __dragdata__.orderId = orderId
    // 换房为有订单的
    if (target.orderId && target.orderId != orderId) {
        __dragdata__.targetOrderId = target.orderId
        // 退房订单不能交换
        if (CONST.SUB_OUT === target.orderType) {
            _failTips('退房订单不能交换！')
            return false
        }
        mainOrder = MainOrderUtil.getById(target.mainId)
        // 信用住订单不能更改入住日期
        if(!ratePlanIsCanChange(mainOrder, cell.date, target.date)){
            return false
        }
        $targetOrder = target.$el.children('.order-item')
        // 必须放在头部
        if ($targetOrder.length === 0) {
            _failTips()
            return false
        }

        finalSize = targetSize > mainSize ? targetSize : mainSize
        finalCell = targetSize > mainSize ? cell : target

        for (i = 1; i < finalSize; i++) {
            slibing = CellUtil.next(finalCell, i)
            if (slibing && (slibing.orderId && slibing.orderId !== orderId && slibing.orderId !== targetMainId || slibing.isLock)) {
                _failTips()
                return false
            }
        }
        __dragdata__.$targetOrder = $targetOrder
    }
    // 换房为空格子/自身
    else {
        for (i = 1; i < mainSize; i++) {
            slibing = CellUtil.next(target, i)
            if (slibing && (slibing.orderId && slibing.orderId !== orderId || slibing.isLock)) {
                _failTips()
                return false
            }
        }
    }
    return true
}

var _exchange = function () {
    var cell = __dragdata__.cell,
        target = __dragdata__.target,
        $cellOrder = __dragdata__.$cellOrder,
        $targetOrder = __dragdata__.$targetOrder,
        cellPosi = cell.$el.offset(),
        targetPosi = target.$el.offset(),
        overageLeft = cellPosi.left - targetPosi.left,
        overageTop = cellPosi.top - targetPosi.top,
        resetLeft = __dragdata__.resetLeft,
        resetTop = __dragdata__.resetTop

    $cellOrder.css({
        left : overageLeft * -1 + resetLeft,
        top : overageTop * -1 + resetTop
    })
    if ($targetOrder && $targetOrder.length > 0 && __dragdata__.targetOrderId) {
        $targetOrder.css({
            left : overageLeft + resetLeft,
            top : overageTop + resetTop
        });
    }
}

//询问确认换房
function _confirmDrag() {
    var msg = '<div style="font-size: 16px;">确定要进行换房？</div>';
    tmsky.ui.dialog.confirm(
        msg,
        function () {
            _ajaxMoveOrder();
        },
        function () {
            _reset()
        }
    )
    _exchange()
}

function _failTips(msg) {
    msg = msg || '房量不足，不能换房！'
    tmsky.ui.dialog.tips(msg, 'error')
    _reset()
}

// 真实切换dom
function _exchangeDom() {
    var cell = __dragdata__.cell,
        target = __dragdata__.target,
        $cellOrder = __dragdata__.$cellOrder,
        $targetOrder = __dragdata__.$targetOrder,

        cellSize = cell.mainLen,
        cellMainId = cell.mainId,
        cellOrderId = cell.orderId,
        cellOrderType = cell.orderType,

        resetLeft = __dragdata__.resetLeft,
        resetTop = __dragdata__.resetTop,

        targetSize = target.mainLen,
        targetMainId = target.mainId,
        targetOrderId = target.orderId,
        targetOrderType = target.orderType,

        isDoubleCell = targetOrderId && targetOrderId !== cell.orderId // 两个对换

    target.empty()
    target.$el.append($cellOrder.css({left : resetLeft, top : resetTop}))
    for (i = 0; i < cellSize; i++) {
        slibing = CellUtil.next(target, i)
        if (slibing) {
            slibing.mainId = cellMainId
            slibing.orderId = cellOrderId
            slibing.orderType = cellOrderType
            slibing.mainLen = cellSize
        }
    }
    cell.empty()
    if (isDoubleCell) {
        cell.$el.append($targetOrder.css({left : resetLeft, top : resetTop}))
    }
    for (i = 0; i < targetSize; i++) {
        slibing = CellUtil.next(cell, i)
        if (slibing) {
            slibing.mainId = targetMainId || null
            slibing.orderId = targetOrderId || null
            slibing.orderType = targetOrderType || null
            slibing.mainLen = targetSize || 0
        }
    }
}

// 信用住订单不能更改入住日期
function ratePlanIsCanChange(mainOrder, sourseDate, targetDate) {
    if (mainOrder && mainOrder.icon == 4 && sourseDate != targetDate) {
        _failTips('信用住订单不能更改入住日期！')
        return false
    } else {
        return true
    }
}

var _reset = function () {
    var $cellOrder = __dragdata__.$cellOrder,
        $targetOrder = __dragdata__.$targetOrder;
    [$cellOrder, $targetOrder].forEach(function (el) {
        if (el && el.length) {
            el.css({
                left : __dragdata__.resetLeft,
                top : __dragdata__.resetTop
            })
        }
    })
    __dragdata__ = {}
}

var _resetOrderId = function () {
    __dragdata__.orderId = null
    __dragdata__.targetOrderId = null
}

/**
 * 移动订单
 */
var _ajaxMoveOrder = function () {
    var cell = __dragdata__.cell,
        target = __dragdata__.target,
        cellDate = cell.date,
        targetDate = target.date

    var sData = {
        firstChangeRoomId : cell.roomId,
        firstFromDate : cellDate,
        secondChangeRoomId : target.roomId,
        secondFromDate : targetDate,
        firstSubOrder : [{
            checkInAt : cellDate,
            checkOutAt : tmsky.date.plusDate(cellDate, cell.mainLen, 'd', 'yyyy-MM-dd'),
            orderId : cell.orderId,
            status : cell.orderType
        }]
    }

    // 订单对调
    if (target.orderId && target.orderId !== cell.orderId) {
        sData.secondSubOrder = [{
            checkInAt : targetDate,
            checkOutAt : tmsky.date.plusDate(targetDate, target.mainLen, 'd', 'yyyy-MM-dd'),
            orderId : target.orderId,
            status : target.orderType
        }]
    }

    tmsky.ui.dialog.loading()
    $.ajax({
        type : "POST",
        url : "/order/moveOrder",
        contentType : "application/json;charset=utf-8",
        data : JSON.stringify(sData)
    }).done(function (json) {
        if (json.status == 200) {
            tmsky.ui.dialog.tips('换房成功！', 'success')
            _exchangeDom()
        } else {
            _failTips()
        }
    }).fail(function () {
        _failTips('换房请求被拒绝！')
    }).always(tmsky.ui.dialog.loading.close)

    _resetOrderId()
}

module.exports = {
    bindDrag : function ($containment) {
        if (!Controller) {
            Controller = require('../control.js')
        }
        $containment.on('mouseover', ".checkin,.booked", function (event) {
            var $this = $(this)

            if (!$this.data("init_draggable")) {
                $this.data("init_draggable", true)
                    .draggable({
                        containment : $containment,
                        cursor : "move",
                        addClasses : false,
                        zIndex : 100,
                        start : function (e, ui) {
                            _startHandle(ui)
                        },
                        stop : function (e, ui) {
                            _stopHandle(ui)
                        }
                    })
            }
        });
    }
}