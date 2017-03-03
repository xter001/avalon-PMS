/**
 * Created by hai on 2016/1/21.
 */
var COMMON_CONST = require('../../common/js/const.js'),
    InnUtil = require('../../common/js/utils/inn-util.js')
var UserInfoHandler = {
    toggleMultiPersonText: '收起',
    showMultiPerson: true,
    preMainContact: null,
    persons: [],
    mainPerson: {},

    init: function (persons) {
        this.persons = persons
        if (persons.length) {
            var main = persons[0]
            main.city = null
            main.province = null
            this.mainPerson = main
        }
        this.preMainContact = this.mainPerson.phone || null
        this.queryPhoneInfos()
    },

    queryPhoneInfos: function () {
        InnUtil.phoneInfo(this.persons.map(function (person) {
            if (!tmsky.isEmpty(person.phone)) {
                return person.phone
            }
        }), function (rs) {
            if (rs && rs.status == 200) {
                var vm = tmsky.getVm('vm_order_operate')
                for (name in rs) {
                    $.each(vm.user.persons, function (i, el) {
                        if (el.phone == name) {
                            var info = rs[name]
                            el.province = info.province
                            el.city = info.city
                            return false
                        }
                    })
                    //vm.user.persons.forEach(function (el) {
                    //    if (el.phone == name) {
                    //        var info = rs[name]
                    //        el.province = info.province
                    //        el.city = info.city
                    //        return false
                    //    }
                    //})
                }
            }
        })
    },

    add: function () {
        var vm = avalon.vmodels['vm_order_operate']
        vm.user.persons.push({
            id: null,
            name: '',
            phone: '',
            cardType: COMMON_CONST.CARD_TYPE_VALUE.ID,
            cardNo: '',
            nation: '',
            address: '',
            picStream: '',
            delIntegral: 0,
            addIntegral: 0,
            isPayMan: 0,
            unionId: 0,
            gradeName: '无',
            discountPercent: 100
        })
        vm.user.showMultiPerson = true
    },

    toggleMultiPerson: function () {
        var vm = avalon.vmodels['vm_order_operate']
        vm.user.showMultiPerson = !vm.user.showMultiPerson
        vm.user.toggleMultiPersonText = vm.user.showMultiPerson ? '收起' : '更多'
    },

    customerSearch: function () {

    },

    showCustomerSearchArr: function () {

    },

    hideCustomerSearchArr: function () {

    },

    customerFix: function () {

    },

    dataConvert: function () {
        var persons = []
        this.persons.forEach(function (el) {
            var el = el.$model || el
            if (!tmsky.isEmpty(el.name) || !tmsky.isEmpty(el.phone)) {
                persons.push(el)
            }
        })
        return persons
    }
}

module.exports = UserInfoHandler