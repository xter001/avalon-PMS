/**
 * Created by hai on 2016/1/22.
 */
var CommonUtil = require('../../common/js/utils/common-util.js'),
    OrderMainUtil = require('../utils/order-main-util.js')

var _def_mem_ = {
        phone : null,
        memberGrade : {name : '无', discountPercent : 100},
        unionInfo : {id : 0, name : ''},
        privilegePrice : 0,
        integral : 0
    },
    _def_union_ = {
        id : 0,
        integralRatio : 0,
        maxInnNum : 0,
        name : "请选择所属会员联盟",
        rmk : null,
        status : 0,
        updateType : 0
    }

var MemberUnionHandler = {
    currMem : {},
    currUnion : {},
    unions : {},
    showMemUnion : false,
    getDefaultMem : function () {
        return _def_mem_
    },
    getDefaultUnion : function () {
        return _def_union_
    },
    resetUnionMember : function () {
        tmsky.getVm('vm_order_operate').memberUnion.currMem = _def_mem_
    },
    init : function () {
        var vm = tmsky.getVm('vm_order_operate'),
            mainPerson = vm.order.persons[0] || {}
        vm.memberUnion.currUnion = vm.memberUnion.unions[mainPerson.unionId] || this.getDefaultUnion()
        vm.memberUnion.changeMember()
    },
    updateMemDiscount : function (fee) {
        var vm = tmsky.getVm('vm_order_operate'),
            discountPercent = vm.memberUnion.currMem.memberGrade.discountPercent
        vm.memberUnion.currMem.privilegePrice = 0
        if (discountPercent != 100) {
            var privilegePrice = (tmsky.isEmpty(fee) ? vm.finance.getTotalRoomFee(vm) : fee) * ((100 - discountPercent) / 100)
            vm.memberUnion.currMem.privilegePrice = Number(privilegePrice).toFixed(2) * 1
        }
    },
    refreshMemUnion : function (contact, isPayMan,index) {
        var vm = tmsky.getVm('vm_order_operate'),
            mainPerson = vm.user.persons[0] || {}
        contact = contact.replace(/[^0-9]/g, '')
        vm.user.persons[index].phone=contact
        if (isPayMan && vm.user.preMainContact != contact) {
            if (contact && tmsky.isMobile(contact)) {
                vm.user.preMainContact = contact
                vm.memberUnion.changeMember()
            } else {
                vm.memberUnion.resetUnionMember()
            }
        }
    },
    changeMember : function () {

        var vm = tmsky.getVm('vm_order_operate')
        var mainPerson = vm.order.persons[0] || {},
            union = vm.memberUnion.currUnion

        //刷新
        if (union.id == _def_mem_.unionInfo.id) {
            vm.memberUnion.resetUnionMember()
            vm.finance.items[11].isHide = true;
            return
        }
        MemberUnionHandler.getMemberInfo(mainPerson.phone, union.id)
    },
    getMemberInfo : function (contact, unionId, cb) {


        if (!contact || tmsky.isEmpty(unionId)) {
            CommonUtil.fire(cb)
            return
        }
        $.get("/union/memberInfo/" + contact + "/" + unionId, {temp : new Date().valueOf()})
            .done(function (rs) {
                var vm = tmsky.getVm('vm_order_operate')
                if (CommonUtil.isSuccess(rs)) {
                    var mem = rs.result || _def_mem_
                    mem.privilegePrice = 0
                    vm.memberUnion.currMem = mem
                    vm.memberUnion.updateMemDiscount()
                    vm.showMemUnion = tmsky.isEmptyObject(rs.result)

                    //抵扣积分显示
                    if (vm.memberUnion.currMem.currentIntegral != undefined && vm.memberUnion.currMem.currentIntegral > 0) {
                        vm.finance.items[11].isHide = false;
                    }
                } else {
                    vm.memberUnion.resetUnionMember()
                }
                CommonUtil.fire(cb, rs)
            })
        //账户有积分时

    }
}

module.exports = MemberUnionHandler