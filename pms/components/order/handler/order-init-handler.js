/**
 * Created by hai on 2016/1/21.
 */
var vm_order_main = avalon.vmodels['vm_order_main'],
    vm_order_operate,
    MemberUnionHandler = require('order-member-handler.js'),
    Plug = require('../../header/plug.js'),
    Access = require('../../header/access.js');

var OrderInitHandler = {
    init : function () {

        vm_order_operate = avalon.vmodels['vm_order_operate']
        //是否开启打印功能库

        if (Plug.hasFunc(Plug.F_PRINT)) {
            vm_order_operate.funcPrint = true

        }

        var vm_finance_detail = avalon.vmodels['vm_finance_detail']
        OrderInitHandler.initInnBaseInfo(vm_order_operate)
        //OrderInitHandler.preInit(vm_order_operate)
        vm_order_operate.bindEvents.binds()


        // 财务记录历史
        vm_finance_detail.editeAccess = Access.access(Access.AC_EDITE_FINANCE)
        var plugArr = []
        //spend = Plug.hasFunc(Plug.F_SPEND), msg = Plug.hasFunc(Plug.F_MSG), union = Plug.hasFunc(Plug.F_UNION), vmodels = avalon.vmodels
        plugArr.push(Plug.QF_PAY)
        plugArr.push(Plug.QF_ORIGIN)
        plugArr.push(Plug.QF_COMMISSION)
        plugArr.push(Plug.QF_PRINT_TPL)
        plugArr.push(Plug.QF_SPEND)

        //if (msg) {
        //    plugArr.push(Plug.QF_MSG_TPL)
        //}
        //if (union) {
        //    plugArr.push(Plug.QF_MEMBER_UNION)
        //}


        if (Access.access(Access.AC_DEL_ORDER)) {
            vm_order_operate.ec_del_order = true

        } else {
            vm_order_operate.ec_del_order = false
        }

        if (Access.access(Access.AC_BOOK)) {
            vm_order_operate.accessBtn.shop = true
        }

        $('#finance_popups').on('show.tc.popups', function (e) {
            var uniqueCode = vm_order_operate.order.$model.uniqueCode;
            e.preventDefault()
            if (!uniqueCode) {
                tmsky.ui.dialog.alert('暂无订单财务记录')
                return
            }
            vm_finance_detail.flushData(uniqueCode)
        })
    },
    preInit : function (vm) {
        OrderInitHandler.initInnBaseInfo(vm)
        OrderInitHandler.initByMainOrderVm()
    },
    initInnBaseInfo : function (vm) {
        vm_order_operate = vm
        this.initCustomerFrom()
        this.initChannelCommission()
        this.initGuestGoods()
        this.initMsgTemplate()
        this.initMemberUnion()
        this.initPayChannel()
        this.initPrintTemplate()
    },
    initCustomerFrom : function () {
        var innBaseInfo = OrderCacheUtil.getInnBaseInfo(true)
        vm_order_operate.customerFrom.datas = innBaseInfo && innBaseInfo['CF'] || [{
                id : 4,
                color : 'c_touming',
                name : '其它渠道',
                serialNo : 4
            }]
    },
    initChannelCommission : function () {
        vm_order_operate.commissions = OrderCacheUtil.getChannelCommission() || {}
    },
    initGuestGoods : function () {
        var innBaseInfo = OrderCacheUtil.getInnBaseInfo(true)
        vm_order_operate.spend.datas = innBaseInfo && innBaseInfo['GS'] || []
        vm_order_operate.hasSpendItem = !tmsky.isEmptyObject(innBaseInfo['GS'])

        //shopcost添加GS
        var shopList = innBaseInfo && innBaseInfo['GS'] || []
        var newShopList = []
        for (var item in shopList) {
            newShopList.push(shopList[item])
        }

        //shopcost添加PC
        var shopPC = innBaseInfo && innBaseInfo['PC'] || {}
        var newShopPC = []
        for (var item in shopPC) {
            newShopPC.push(shopPC[item])
        }

        //shopcost添加AC
        var shopAC = innBaseInfo && innBaseInfo['AC'] || {}
        var newShopAC = []
        for (var item in shopAC) {
            newShopAC.push(shopAC[item])
        }

        avalon.vmodels.vm_shopcost.getGsList(newShopList, newShopPC, newShopAC)
        avalon.vmodels.vm_order_shop.payList = newShopPC
        avalon.vmodels.vm_order_shop.spendsList = avalon.vmodels.vm_shop.shopsList

    },
    initMsgTemplate : function () {
        var innBaseInfo = OrderCacheUtil.getInnBaseInfo(false)
        vm_order_operate.msgTemplate = innBaseInfo && innBaseInfo['MT'] || []
    },
    initMemberUnion : function () {
        var innBaseInfo = OrderCacheUtil.getInnBaseInfo(true)
        var memberUnions = innBaseInfo && innBaseInfo['MU'] || {}
        memberUnions['0'] = MemberUnionHandler.getDefaultUnion()
        vm_order_operate.memberUnion.unions = memberUnions
        vm_order_operate.memberUnion.currMem = vm_order_operate.memberUnion.getDefaultMem()
    },
    initPayChannel : function () {
        var innBaseInfo = OrderCacheUtil.getInnBaseInfo(true)
        var PC = innBaseInfo && innBaseInfo['PC'] || {}
        for (var i in PC) {
            PC[i].show = true
        }
        vm_order_operate.payChannels = PC
    },
    initPrintTemplate : function () {
        var innBaseInfo = OrderCacheUtil.getInnBaseInfo(false)
        vm_order_operate.printTemplate = innBaseInfo && innBaseInfo['PT'] || []
    },
    initDefaultRemind : function () {
        return {
            id : null,
            content : null,
            createFlag : 1,
            icon : 0,
            isTop : 0,
            remindTime : null,
            status : 1
        }
    },
    bindEvents : {
        remindTimePicker : function () {
            $("#remind_time_picker").datetimepicker()
        },
        binds : function () {
            this.remindTimePicker()
        }
    }
}

module.exports = OrderInitHandler