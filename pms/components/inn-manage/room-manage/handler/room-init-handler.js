/**
 * Created by yu on 2016/4/11.
 */

var GUIDE_CONST = require('../../../new-guide/js/guide_const.js')
var RoomInitHandler = {

    init : function (cb) {
        RoomInitHandler.getRoomRype();
        cb && tmsky.isFunction(cb) && cb()
    },

    getRoomRype : function () {
        var vm_room_type = avalon.vmodels.vm_room_type
        $.get('/room/roomTypes')
            .done(function (data) {
                tmsky.ui.dialog.loading.close()
                if (data.status === 200) {
                    data = data.result;
                    //排序  房间号为空的房型排最下面  时间最新的顺序
                    var newRoomList = [];
                    //data.forEach.sort(function (a, b) {
                    //    return parseInt(b.spendAt.replace(/-/g, ''), 10) - parseInt(a.spendAt.replace(/-/g, ''), 10);
                    //});
                    data.forEach(function(el,i){
                        if(el.rooms.length != 0){
                            newRoomList.push(el)
                        }
                    })
                    data.forEach(function(el,i){
                        if(el.rooms.length == 0){
                            newRoomList.push(el)
                        }
                    })
                    vm_room_type.roomTypeList = newRoomList;
                    var convertInfo = RoomInitHandler.covertRoomTypeToRooms(data)
                    vm_room_type.roomMap = convertInfo.roomMap
                    vm_room_type.rooms = convertInfo.rooms
                    RoomInitHandler.updateList()
                    //表头固定不滚动
                    $(".room-type-tb").scroll(function() {
                        var offset = $(this).offset();
                        $(".table-th").offset(offset);
                    }) ;

                    var newGuide = require('new-guide')
                    newGuide.init()
                    var finishedBack = function() {
                        //店铺管理引导已完成，则开启房型管理查询
                        tmsky.getVm('vm_new_guide').initNewGuide(GUIDE_CONST.GUIDES.ROOM)
                    }
                    tmsky.getVm('vm_new_guide').initNewGuide(GUIDE_CONST.GUIDES.HOTEL, finishedBack)
                    RoomInitHandler.router({
                        // 渠道管理
                        "/room/type/" : function () {
                            //RoomManage.initRoomType()
                        },
                        // 房型删除
                        "/room/trash/" : function () {
                            RoomInitHandler.initRoomTrash()
                        },
                        // 排序
                        "/room/sort/" : function () {
                            avalon.vmodels.vm_room_type.room.changeManageType('sort')
                        },
                        // 锁房
                        "/room/close/" : function () {
                            avalon.vmodels.vm_room_type.room.changeManageType('close')
                        },
                        // 修改房间归属
                        "/room/edit/" : function () {
                            avalon.vmodels.vm_room_type.room.changeManageType('edit')
                        }
                    })
                }
            })
            .error(function () {
                tmsky.ui.dialog.alert('设置失败，请检查网络情况！');
            })
    },
    router : function (param) {
        $.each(param, function (route, call) {
            avalon.router.get(route, function (route) {
                call && call(route)
            })
        })
        avalon.history.start({
            basepath : "/inn-manage/"
        })
        if (!avalon.history.location.hash) avalon.router.navigate("/room/type/")
    },
    initRoomTrash : function () {
        $('#content').html('')
            .append(__inline('../tpl/rooms-trash.html'))
        __inline('../vm/vm_room_trash.vm')
        avalon.vmodels.vm_room_trash.init()
        avalon.scan()
    },
    updateList : function () {
        var vm_room_type = avalon.vmodels.vm_room_type
        vm_room_type.roomNumberList = []
        vm_room_type.roomTypeList.$model.forEach(function (el, i) {
            var str = '';
            el.rooms.forEach(function (el2, i2) {
                if (i2 > 0) {
                    str += ' / ' + el2.name
                } else {
                    str += el2.name;
                }
            })
            vm_room_type.roomNumberList.push(str)
        })
    },
    covertRoomTypeToRooms : function (data) {
        var roomMap = {}, rooms = []
        data && data.length && data.forEach(function (el) {
            var _rooms = el.rooms
            _rooms && _rooms.length && _rooms.forEach(function (room) {
                var _roomType = $.extend({}, el)
                delete _roomType.rooms
                roomMap[room.id] = room
                roomMap[room.id].roomType = _roomType
                rooms.push(roomMap[room.id])
            })
        })

        rooms = rooms.sort(function (rm1, rm2) {
            return rm1.serialNo - rm2.serialNo
        })

        return {roomMap : roomMap, rooms : rooms}
    }
}

module.exports = RoomInitHandler