/**
 * Created by yu on 2016/4/19.
 * 房型管理-新增、编辑、删除
 */
var RoomTypeSaveHandler = require('../handler/roomtype-save-handler.js');
var RoomTypeButtonHandler = {
    //删除房型
    removeRoomType : function () {
        var vm = avalon.vmodels.vm_room_type;
        var roomTypeId = vm.roomTypeId;
        tmsky.ui.dialog.loading()
        if (vm.roomTypeId == 0)
            return;
        $.ajax({
            type : "GET",
            async : false,
            cache : false,
            url : "/roomType/ajaxRemove/" + roomTypeId,
            success : function (json) {
                tmsky.ui.dialog.loading.close()
                if (json.status == 200) {
                    document.location.reload();
                } else {
                    tmsky.ui.dialog.tips(json.message + '', 'error');
                }
            }
        });

    },
    // 删除房型弹出确定层
    isSureRemoveRoomType : function (typeId) {
        var vm = avalon.vmodels.vm_room_type;
        vm.roomTypeId = typeId;
        tmsky.ui.dialog.confirm('删除房型，会将该房型全部房间及相关订单删除至回收站，如没有相关订单则直接物理删除该房型，<br/>您确定要删除吗？', RoomTypeButtonHandler.removeRoomType, function () {
            vm.roomTypeId = 0;
        })
    },
    //新增房型
    addNewRoomtype : function () {
        var vm = avalon.vmodels.vm_room_type;
        RoomTypeButtonHandler.resetRoomtype()
        vm.popupShow.roomEdit = true
        vm.popupShow.roomAdd = true
        vm.editInfo.editBtn = '确认新增'
    },
    //重置房型
    resetRoomtype : function () {
        var vm = avalon.vmodels.vm_room_type;
        vm.editInfo = {
            editBtn : '新增房型',
            editRoomNo : [
                {id : null, roomNo : '', status : 1}
            ],
            roomTypeId : '',
            roomTypeName : '',
            shortName : '',
            roomTypePrice : ''
        }
    },
    //弹出编辑房型
    getRoomEdit : function (index) {
        var vm = avalon.vmodels.vm_room_type;
        vm.popupShow.roomEdit = true;
        vm.editInfo.editBtn = '确认编辑'
        var roomList = vm.roomTypeList.$model[index];
        var arrList = []
        roomList.rooms.forEach(function (e, i) {
            var brr = {
                id : e.id,
                roomNo : e.name,
                status : e.status
            };
            arrList.push(brr)
        })

        var json = {
            editBtn : '确认编辑',
            editRoomNo : arrList,
            roomTypeId : roomList.id,
            roomTypeName : roomList.name,
            shortName : roomList.shortName,
            roomTypePrice : roomList.normalPrice
        }
        vm.editInfo = json;
    },
    closeRoomEdit : function () {
        var vm = avalon.vmodels.vm_room_type;
        vm.popupShow.roomEdit = false;
        vm.popupShow.roomAdd = false;
    },
    //保存房型
    saveRoomType : function () {
        RoomTypeSaveHandler.saveRoomType()
    },
    //添加房间号
    addRoomNo : function () {
        var vm = avalon.vmodels.vm_room_type;
        var json = {
            id : null,
            roomNo : '',
            status : 1
        }
        vm.editInfo.editRoomNo.push(json)
        var addRoomNo = document.getElementById("addRoomNo");
        addRoomNo.scrollTop = addRoomNo.scrollHeight;

    },
    //删除房号
    removeRoomNo : function (index) {
        var vm = avalon.vmodels.vm_room_type;
        if(vm.editInfo.editRoomNo[index].id!=null&&vm.editInfo.editRoomNo[index].id!=''){
            vm.editInfo.editRoomNo[index].status = 0;
        }else{
            avalon.Array.removeAt(vm.editInfo.editRoomNo, index)
        }
    }
}

module.exports = RoomTypeButtonHandler