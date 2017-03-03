/**
 * Created by hai on 2016/3/28.
 */
var Header = require('header'),
    Access = require('../../header/access.js')
var RoomManage = {
    init : function () {
        var hasAccessToView = Header.hasAccessToView(Access.AC_ROOM_MGR, '房间管理')
        if (!hasAccessToView)return
        RoomManage.initRoomType()
    },
    initRoomType : function () {
        $('#content').html(__inline('tpl/room-type.html'))
        __inline('vm/vm_room_type.vm')
        //__inline('vm/vm_room.vm')
        avalon.vmodels.vm_room_type.init()
        //avalon.vmodels.vm_room.init()
        avalon.vmodels.vm_room_type.room.init()
        avalon.scan()
    },
    launch : function () {
        Header.active('ROOMS').ready(function (info) {
            RoomManage.init()
        })
    },
}

module.exports = RoomManage