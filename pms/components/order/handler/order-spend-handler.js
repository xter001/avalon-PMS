/**
 * Created by hai on 2016/1/21.
 */
var OrderSpendHandler = {
    datas: {},
    goodSpends: [],

    add: function () {
        var vm = tmsky.getVm('vm_order_operate')
        vm.spend.goodSpends.push({
            good: {
                id: 0,
                name: '请选择',
                price: 0
            },
            hasPay: 0,
            id: 0,
            realPrice: null,
            spendTime: null
        })
    },

    checkPrice: function (spend, e) {
        var val = e && e.target && e.target.value,
            val = Number(val)
        if (isNaN(val) || val < 0) {
            spend.realPrice = null
        }
    },

    getTotalGoodSpend: function () {
        var gsFee = 0
        this.goodSpends.forEach(function (el) {
            gsFee += Number(el.realPrice)
        })
        return gsFee
    },

    dataConvert: function () {
        var gs = []
        this.goodSpends.forEach(function (el) {
            if (Number(el.good.id) && !tmsky.isEmpty(el.realPrice) && !isNaN(el.realPrice)) {
                gs.push({
                    'good.id': el.good.id,
                    id: el.id || null,
                    realPrice: el.realPrice
                })
            }
        })
        return gs
    }
}

module.exports = OrderSpendHandler