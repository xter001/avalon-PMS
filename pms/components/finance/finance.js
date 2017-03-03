/**
 * Created by hai on 2016/2/15.
 */
var Header = require('header'),
    Access = require('../header/access.js'),
    Plug = require('../header/plug.js'),
    COMMON_CONST = require('../common/js/const.js');

var finance = {
    init : function () {
        var hasAccessToView = Header.hasAccessToView(Access.AC_ACC_VIEW, '财务')
        if (!hasAccessToView) return

        __inline('vm/vm_finance_main.vm')
        __inline('vm/vm_account_book.vm')
        __inline('vm/vm_bill_check.vm')
        __inline('vm/vm_collect_check.vm')
        __inline('vm/vm_bank_info.vm')
        __inline('vm/vm_handover_detail.vm')

        __inline('vm/vm_financeIndex.vm')
        __inline('vm/vm_roomSale.vm')
        __inline('vm/vm_goodSale.vm')
        __inline('vm/vm_customerIn.vm')
        __inline('vm/vm_inCome.vm')


        document.getElementById('content').innerHTML = __inline('tpl/main-operate.html')
        document.getElementById('bill_check_alert_div').innerHTML = __inline('tpl/bill-check-popups.html')
        document.getElementById('bank_info_alert_div').innerHTML = __inline('tpl/bank-info-popups.html')
        document.getElementById('collect_check_div').innerHTML = __inline('tpl/collect_check_popups.html')

        document.getElementById('financeIndex_div').innerHTML = __inline('tpl/finance-index.html')
        document.getElementById('roomSale_div').innerHTML = __inline('tpl/day-sale-room.html')
        document.getElementById('goodSale_div').innerHTML = __inline('tpl/day-sale-good.html')

        document.getElementById('customerIn_div').innerHTML = __inline('tpl/checkin-customer.html')

        document.getElementById('income_div').innerHTML = __inline('tpl/list-income.html')
        //document.getElementById('dayIncome_div').innerHTML = __inline('tpl/day-list-income.html')
        //tmsky.getVm('vm_dayIncome').init()

        tmsky.getVm('vm_finance_main').init()
        tmsky.getVm('vm_account_book').init()
        tmsky.getVm('vm_handover').init()
        tmsky.getVm('vm_bill_check').init()
        tmsky.getVm('vm_bank_info').init()

        tmsky.getVm('vm_roomSale').init()
        tmsky.getVm('vm_goodSale').init()

        //balance_of_payment  有则是新用户
        var auth = CommonCacheUtil.innBaseInfo.specialAuth
        if (!tmsky.isEmptyObject(auth)) {
            var isNew = auth.balance_of_payment || false
            if (isNew) {
                tmsky.getVm('vm_finance_main').isNewUser = true
                //新用户访问新版财务
            } else {
                tmsky.getVm('vm_finance_main').isNewUser = false
                //老用户访问旧版财务+新财务
                __inline('vm/vm_dayIncome.vm')
                document.getElementById('account_book_alert').innerHTML = __inline('tpl/account-book-popups.html')
            }
        } else {
            tmsky.getVm('vm_finance_main').isNewUser = false
            //老用户访问旧版财务+新财务
            __inline('vm/vm_dayIncome.vm')
            document.getElementById('account_book_alert').innerHTML = __inline('tpl/account-book-popups.html')
        }

        var params = location.hash
        if (params == '') {
            location.hash = params = '#tab=financeIndex'
        }
        params = params.split('#')
        var paramsJson = {}
        params.forEach(function (el, i) {
            if (el == '')return
            var type = el.split('=')[0],
                value = el.split('=')[1]
            paramsJson[type] = value
        })

        var urlParams = tmsky.util.urlParams()
        if (!tmsky.isEmptyObject(urlParams)) {
            for (var key in urlParams) {
                paramsJson[key] = urlParams[key]
            }
        }


        if (tmsky.isEmptyObject(paramsJson)) {
            tmsky.getVm('vm_account_book').getFinanceRecords(1)
        } else {
            tmsky.getVm('vm_finance_main').changeTabs(paramsJson['tab'], paramsJson)
        }
        avalon.scan()
    },
    launch : function () {
        Header.active('finance').ready(function () {
            finance.init()
        })
    }
}

module.exports = finance
