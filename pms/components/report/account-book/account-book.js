/**
 * Created by X on 2016/5/27.
 */
var COMMON_CONST = require('../../common/js/const.js'),
    REPORT_CONST = require('../common/js/const.js'),
    nodeInnerContent = document.getElementById('innerContent')

var AccountBook = {
    init : function (divId) {
        if(divId){
            nodeInnerContent = document.getElementById(divId)
        }
        __inline('vm/vm_account_book.vm')
        nodeInnerContent.innerHTML = __inline('tpl/main-operate.html')
        tmsky.getVm('vm_account_book').init()
    },
    getVm : function (){
        return tmsky.getVm('vm_account_book')
    }
}

module.exports = AccountBook