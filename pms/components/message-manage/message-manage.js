/**
 * Created by yu on 2016/3/18.
 */
var Header = require('header');
    require('sidebar/sidebar.css')

var MessageManage = {
    init : function () {
        __inline('vm/vm_message_main.vm')
        document.getElementById('message-l').innerHTML = __inline('sidebar/sidebar.html')
        document.getElementById('message-r').innerHTML = __inline('tpl/message-main.html')
        tmsky.getVm('vm_message_main').init().scan()
    },
    launch : function () {
        Header.active('MESSAGE_MANAGE').ready(function () {
            MessageManage.init()
        })
    }
};


module.exports = MessageManage

