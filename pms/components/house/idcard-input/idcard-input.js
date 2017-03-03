/**
 * Created by yu on 2017/1/19.
 */
    require('css/idcard-input.css');
var editor = {
    init : function () {
        console.log('异步引入了身份证录入模块')
        $('#content').append(__inline('tpl/checkin-list.html'))//入住人列表
        $('#content').append(__inline('tpl/input-type.html'))//录入方式
        $('#content').append(__inline('tpl/edit-checkin.html'))//入住人信息

        __inline('vm/vm_idcard_main.vm')
        tmsky.getVm('vm_idcard_main').init()
        __inline('vm/vm_idcard_input.vm')
        tmsky.getVm('vm_idcard_input').init()
        
    }
}


module.exports = editor