/**
 * Created by yu on 2016/5/26.
 */

var shopcost = {
    init : function () {
        __inline('vm/vm_shopcost.vm')
        __inline('vm/vm_shop.vm')
        __inline('vm/vm_spent.vm')
        $('body').append(__inline('tpl/main.html'))
        $('#tem-shop').append(__inline('tpl/template-shop.html'))
        $('#tem-spent').append(__inline('tpl/template-spent.html'))
        tmsky.getVm('vm_shopcost').scan()
        tmsky.getVm('vm_shopcost').init()
    }
};

module.exports = shopcost.init()