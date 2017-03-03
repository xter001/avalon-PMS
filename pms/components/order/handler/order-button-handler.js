var COMMON_CONST = require('../../common/js/const.js'),
    ORDER_CONST = require('../common/const.js'),
    Access = require('../../header/access.js'),
//OrderSaveHandler = require('./order-save-handler.js'),
    today = tmsky.date.today()

var OrderButtonHandler = {
    visible : true,
    items : [],

    init : function (byUpdate) {
        var vm = tmsky.getVm('vm_order_operate'),
            buttonHandler = vm.buttonHandler,
            order = vm.order
        vm.showInputView = false
        buttonHandler.reset()
        if (vm.orderOperateFlag == ORDER_CONST.ORDER_OPERATE.VIEW) {//查看状态不允许操作
            return
        }
        switch (order.orderStatus) {
            case COMMON_CONST.M_BOOK:
                buttonHandler.initBookBtns(buttonHandler, order)
                break;
            case COMMON_CONST.M_PART_IN:
                buttonHandler.initPartInBtns(buttonHandler)
                break;
            case COMMON_CONST.M_IN:
            case COMMON_CONST.M_PART_OUT:
                buttonHandler.initCheckInBtns(buttonHandler)
                break;
            case COMMON_CONST.M_OUT:
                buttonHandler.initCheckOutBtns(buttonHandler)
                break;
            case COMMON_CONST.M_CANCLE:
                buttonHandler.initCancelBtns(buttonHandler)
                break;
        }
        buttonHandler.checkAccess()
    },

    initBookBtns : function (buttonHandler, order) {
        var BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        if (!(order.checkInAt > today)) {
            buttonHandler.items.push(COMMON_CONST.BTN_ENUM.in_act)
        }
        buttonHandler.items.push(BTN_ENUM.edit)
        //buttonHandler.items.push(COMMON_CONST.BTN_ENUM.book_cancle_act)
    },
    initCancelBtns : function (buttonHandler) {
        var BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        buttonHandler.items.push(BTN_ENUM.edit)
    },
    initPartInBtns : function (buttonHandler) {
        var BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        buttonHandler.items.push(BTN_ENUM.in_act)
        buttonHandler.items.push(BTN_ENUM.edit)
    },

    initCheckInBtns : function (buttonHandler) {
        var BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        buttonHandler.items.push(BTN_ENUM.out_act)
        buttonHandler.items.push(BTN_ENUM.edit)
    },
    initCheckOutBtns : function (buttonHandler) {
        var BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        buttonHandler.items.push(BTN_ENUM.out_revoke)
        buttonHandler.items.push(BTN_ENUM.edit)
    },

    update : function (flag) {
        var vm = tmsky.getVm('vm_order_operate'),
            order = vm.order,
            buttonHandler = vm.buttonHandler,
            isUpdateOpr = false,
            BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        buttonHandler.reset()
        switch (flag) {
            case COMMON_CONST.BTN_ENUM.part_in_act.fn:
            case COMMON_CONST.BTN_ENUM.in_act.fn:
                buttonHandler.items.push(BTN_ENUM.in_save)
                buttonHandler.items.push(BTN_ENUM.back)
                break
            case COMMON_CONST.BTN_ENUM.out_act.fn:
                vm.initCheckout()
                buttonHandler.items.push(BTN_ENUM.out_save)
                buttonHandler.items.push(BTN_ENUM.back)
                break
            case COMMON_CONST.BTN_ENUM.edit.fn:
                isUpdateOpr = true
                buttonHandler.genButtonsByMainOrderStatus()
                break
            case COMMON_CONST.BTN_ENUM.back.fn:
                if (avalon.vmodels.vm_order_main.params.orderFlag == 'ERROR') {
                    vm.orderHandle.initErrorOrderVm()
                } else {
                    vm.orderHandle.initByMainOrderVm()
                }
                buttonHandler.init()
                buttonHandler.toggleBtnActive(false)
                vm.reset()
                break
        }
        vm.orderHandle.toggleSubOrderEditorStatus(isUpdateOpr)
        buttonHandler.checkAccess()
    },

    toggleBtnActive : function (disabled) {
        $('#order-operate-popups-foot button').each(function () {
            if (disabled) {
                $(this).attr('disabled', 'disabled')
            } else {
                $(this).removeAttr('disabled')
            }
        })
    },

    genButtonsByMainOrderStatus : function () {
        var vm = tmsky.getVm('vm_order_operate'),
            buttonHandler = vm.buttonHandler,
            order = vm.order,
            BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        switch (order.orderStatus) {
            case COMMON_CONST.M_BOOK:
            case COMMON_CONST.M_PART_IN:
                buttonHandler.items.push(BTN_ENUM.book_save)
                break;
            case COMMON_CONST.M_IN:
            case COMMON_CONST.M_PART_OUT:
                buttonHandler.items.push(BTN_ENUM.in_save)
                break;
            case COMMON_CONST.M_OUT:
                buttonHandler.items.push(BTN_ENUM.out_save)
                break;
            case COMMON_CONST.M_CANCLE:
                buttonHandler.items.push(BTN_ENUM.book_cancle)
                break;
        }
        buttonHandler.items.push(BTN_ENUM.back)
    },

    reset : function () {
        this.items = []
        return this
    },

    //统一检查操作权限
    checkAccess : function () {
        var btns = [],
            BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM),
            buttonHandler = this
        buttonHandler.items.forEach(function (el) {
            switch (el.fn) {
                case BTN_ENUM.book_save.fn:
                    if (Access.access(Access.AC_BOOK))
                        btns.push(el)
                    break
                case BTN_ENUM.book_cancle_act.fn:
                case BTN_ENUM.book_cancle.fn:
                    if (Access.access(Access.AC_BOOK_CANCEL))
                        btns.push(el)
                    break
                case BTN_ENUM.part_in_act.fn:
                case BTN_ENUM.in_act.fn:
                case BTN_ENUM.in_save.fn:
                    if (Access.access(Access.AC_CHECK_IN))
                        btns.push(el)
                    break
                case BTN_ENUM.out_act.fn:
                case BTN_ENUM.b_out_act.fn:
                case BTN_ENUM.out_save.fn:
                case BTN_ENUM.b_out_save.fn:
                    if (Access.access(Access.AC_CHECK_OUT))
                        btns.push(el)
                    break
                case BTN_ENUM.edit.fn:
                    buttonHandler.checkEditAccess(el, btns)
                    break
                case BTN_ENUM.back.fn:
                    btns.push(el)
                    break
            }
        })
        if (buttonHandler.items.length != btns.length)
            buttonHandler.items = btns
        return btns
    },

    checkEditAccess : function (el, btns) {

        var vm = tmsky.getVm('vm_order_operate'),
            order = vm.order
        switch (order.orderStatus) {
            case COMMON_CONST.M_BOOK:
            case COMMON_CONST.M_PART_IN:
                if (Access.access(Access.AC_BOOK))
                    btns.push(el)
                break;
            case COMMON_CONST.M_IN:
            case COMMON_CONST.M_PART_OUT:
                if (Access.access(Access.AC_CHECK_IN))
                    btns.push(el)
                break;
            case COMMON_CONST.M_OUT:
                if (Access.access(Access.AC_CHECK_OUT_EDIT))
                    btns.push(el)
                break;
            case COMMON_CONST.M_CANCLE:
                if (Access.access(Access.AC_CANCEL_EDIT))
                    btns.push(el)
                break;
        }
    },

    btnClick : function (flag) {
        var vm = tmsky.getVm('vm_order_operate'),
            BTN_ENUM = $.extend(true,{},COMMON_CONST.BTN_ENUM)
        switch (flag) {
            case COMMON_CONST.BTN_ENUM.part_in_act.fn:
            case COMMON_CONST.BTN_ENUM.in_act.fn:
            case COMMON_CONST.BTN_ENUM.out_act.fn:
            case COMMON_CONST.BTN_ENUM.edit.fn:
            case COMMON_CONST.BTN_ENUM.back.fn:
                vm.finance.values = []
                OrderButtonHandler.update(flag)
                break;
            case COMMON_CONST.BTN_ENUM.book_save.fn:
            case COMMON_CONST.BTN_ENUM.in_save.fn:
            case COMMON_CONST.BTN_ENUM.out_save.fn:
            case COMMON_CONST.BTN_ENUM.book_cancle.fn:
                //OrderSaveHandler.save(flag)
                if (flag == BTN_ENUM.out_save.fn && vm.orderHandle.countActives() === 0 && vm.checkoutFlag) {
                    tmsky.ui.dialog.tips('没有可退房间！', 'error')
                    return false 
                }
                vm.orderHandle.save(flag)
                vm.reset()
                break;
            case COMMON_CONST.BTN_ENUM.out_revoke.fn:
                vm.orderHandle.revokeCheckOut()
                break
            case COMMON_CONST.BTN_ENUM.book_cancle_act.fn:
                //$('#cancle_order_popups').popups('show')
                break;
        }


        if (flag == COMMON_CONST.BTN_ENUM.book_cancle_act.fn || flag == COMMON_CONST.BTN_ENUM.back.fn) {

            vm.showInputView = false
            vm.hasViewShow = false //是否以消息展示类型显示
            vm.hasInputShow = true
        }
        if (flag != COMMON_CONST.BTN_ENUM.book_cancle_act.fn && flag != COMMON_CONST.BTN_ENUM.back.fn) {
            setTimeout(function () {
                $('.firstTab').focus()
            }, 500)
            vm.showInputView = true;
        }
        if (flag == COMMON_CONST.BTN_ENUM.out_act.fn) {
            //办理退房
            vm.hasViewShow = true;
            vm.hasInputShow = false;

            //刷新财务记录
            vm.initAccountRecords()
        }
        if (flag == COMMON_CONST.BTN_ENUM.edit.fn) {
            vm.hasViewShow = false;
            vm.hasInputShow = true;
        }
        // 百度统计
        _hmt.push(['_trackEvent', 'order', 'click', COMMON_CONST.BTN_ENUM[flag].text])
    }
}

module.exports = OrderButtonHandler