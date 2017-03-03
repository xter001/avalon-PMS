//var Dialog = require('dialog')
var _ = require('lodash'),
    CONST = require('../../common/js/const.js'),
    roomUtil = require('../js/room/room-util.js'),
    CellUtil = require('../js/room/roomcell-util.js'),
    Plug = require('../../header/plug.js'),
    User = require('../../header/user.js'),
    Access = require('../../header/access.js'),
    InnUtil = require('../../common/js/utils/inn-util.js')

var BTN_ENUM = CONST.BTN_ENUM

var _black_list_tpl_ = __inline('black-list.handlebars')
var _spend_list_tpl_ = __inline('spend-list.handlebars')

var btnClickList = [], $editor
var editor = {
    init: function (dom, cb) {
        var self = this

        dom.innerHTML = __inline('editor.html')
        $('.checkOutView').html(__inline('tpl/checkOut.html'))
        // 短信
        __inline('vm/vm_msg.vm')
        // 消费
        __inline('vm/vm_orders.vm')
        // 订单日志
        __inline('vm/vm_order_log.vm')
        // 财务记录
        __inline('vm/vm_finances.vm')
        // 财务记录 详情
        __inline('vm/vm_finance_detail.vm')
        // 客人信息
        __inline('vm/vm_guests.vm')
        // 按钮
        __inline('vm/vm_btns.vm')
        // 提醒
        __inline('vm/vm_remark.vm')
        // 提前退房方式选择
        __inline('vm/vm_b_checkout_model.vm')

        // 金额保留多少位， 末位0 则不显示 默认为2位
        avalon.filters.pricefixed = function (str, len) {
            len = len === void 0 ? 2 : len;
            return str.toFixed(len) * 1;
        }

        this.getPlugData()

        if ('function' === typeof cb) {
            vmodels = avalon.vmodels
            cb(vmodels, this)
        }
        $editor = $(dom)

        $('#slider_trigger').on('click', function (e) {
            self.isOpen() ? self.close() : self.open()
        })



    },
    getPlugData: function () {
        var plugArr = [], spend = Plug.hasFunc(Plug.F_SPEND), msg = Plug.hasFunc(Plug.F_MSG), union = Plug.hasFunc(Plug.F_UNION), vmodels = avalon.vmodels

        plugArr.push(Plug.QF_PAY)
        plugArr.push(Plug.QF_ORIGIN)
        plugArr.push(Plug.QF_COMMISSION)
        plugArr.push(Plug.QF_PRINT_TPL)
        plugArr.push(Plug.QF_SPEND)

        if (msg) {
            plugArr.push(Plug.QF_MSG_TPL)
        }
        if (union) {
            plugArr.push(Plug.QF_MEMBER_UNION)
        }

        // 插件开关
        vmodels.vm_finances.cashierFunc = Plug.hasFunc(Plug.F_CASHIER)
        vmodels.vm_finances.saomaFunc = Plug.hasFunc(Plug.F_SAOMA)

        vmodels.vm_guests.orderNoFunc = Plug.hasFunc(Plug.F_ORDER_CODE)
        vmodels.vm_guests.multiFunc = Plug.hasFunc(Plug.F_MULTI_INFO)
        vmodels.vm_guests.cardFunc = Plug.hasFunc(Plug.F_CARD)
        vmodels.vm_guests.addressFunc = Plug.hasFunc(Plug.F_ADDR)
        vmodels.vm_guests.integralFunc = Plug.hasFunc(Plug.F_INTEGRAL)
        vmodels.vm_guests.unionFunc = union

        vmodels.vm_finance_detail.editeAccess = Access.access(Access.AC_EDITE_FINANCE)

        $.get('/inn/info/base/' + plugArr.join(), {
            t: new Date().valueOf()
        }).done(function (rs) {
            if (rs.status == 200) {
                rs = rs.result
                vmodels.vm_finances.initPayEnum(rs[Plug.QF_PAY])
                vmodels.vm_guests.initGuestFromEnum(rs[Plug.QF_ORIGIN])
                vmodels.vm_guests.initCommission(rs[Plug.QF_COMMISSION])
                vmodels.vm_orders.initSpendEnum(rs[Plug.QF_SPEND])

                if (msg) {
                    vmodels.vm_msg.initEnum(rs[Plug.QF_MSG_TPL])
                    vmodels.vm_msg.initMsgAuth(User.getCurrentInn().msgSendAuth)
                }
                if (union) {
                    vmodels.vm_guests.initMemberUnionEnum(rs[Plug.QF_MEMBER_UNION])
                }
                __PrintTplUtil__.init(rs[Plug.QF_PRINT_TPL])
                // todo test
                avalon.scan($editor.get(0));
            }
        })
    },
    onClick: function (cb) {
        if ('function' === typeof cb)
            btnClickList.push(cb)
    },
    triggerClick: function (btn) {
        btnClickList.forEach(function (el) {
            el(btn)
        })
    },
    isOpen: function () {
        return $editor.hasClass('content-slide-open')
    },
    open: function () {
        $('.bottomBar').addClass('orderOpen')
        $editor.addClass('content-slide-open').parent().addClass('open')
    },
    close: function () {
        $('.bottomBar').removeClass('orderOpen')
        $editor.removeClass('content-slide-open').parent().removeClass('open')
    },
    showError: function (msg) {
        $editor.validator('validate')
        $('#editor_error').html(msg).clearQueue().slideDown().delay(3000).slideUp();
    },
    getPrintTplUtil: function () {
        return __PrintTplUtil__
    }
}

var __PrintTplUtil__ = (function () {
    var util = {}
    var datas = []

    util.init = function (list) {
        datas = list || []
    }
    // 是否设置入住打印模板
    util.hasCkinTpl = function () {
        var rs = false;
        datas.forEach(function (el) {
            if (el.printType === "3") {
                rs = true;
            }
        });
        return rs;
    }
    // 是否设置退房打印模板
    util.hasCkoutTpl = function () {
        var rs = false;
        datas.forEach(function (el) {
            if (el.printType === "4") {
                rs = true;
            }
        });
        return rs;
    }
    return util;
})();

module.exports = editor