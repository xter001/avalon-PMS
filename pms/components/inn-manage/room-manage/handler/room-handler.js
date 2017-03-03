/**
 * Created by hai on 2016/4/19.
 */
var CommonUtil = require('../../../common/js/utils/common-util.js'),
    User = require('../../../header/user.js'),
    COMMON_CONST = require('../../../common/js/const.js')


var RoomHandler = {
    roomManageNav : [true, false, false],
    isRoomType : false,
    isRoomNum : false,
    isAddClose : false,//添加锁房记录
    errorstate : false,//锁房未成功提示
    errorMsg : '',
    innId : '', //当前客栈id
    hasFoldPlug : false,
    allRoomList : [],
    roomList : [],
    closeMark : '0',
    modifyMark : '0',
    roomCloseList : [],//该客栈所有锁房记录
    allRoomId : [],//该客栈所有房间id
    roomClose : {    //当前该锁房的所有信息
        typeIndex : '',
        numIndex : '',
        roomId : '',
        roomTypeValue : '',//当前选中的房型
        roomNumValue : '',//当前选中的房间号
        startDate : '',
        endDate : '',
        note : ''
    },
    ROOM_CLOSE_STATUS_MAP : {
        pupOperate : '-1',//非法操作
        delFalse : '0',//删除失败
        hasReserve : '1',//已有预定记录
        hasIn : '2',//已有入住记录
        hasOut : '3',//已有退房记录
        hasClose : '9',//已有锁房记录
        errorFlag : '10'//备注信息最多10个
    },
    dragRoomMsg : {},      //当前拖拽房间信息

    init : function () {
        RoomHandler.innId = User.getUserInfo().innId
    },

    changeManageType : function (type) {
        var vm = avalon.vmodels.vm_room_type
        if (type == 'sort') {
            vm.room.roomManageNav = [true, false, false]
        } else if (type == 'close') {
            vm.room.roomManageNav = [false, true, false]
            if (RoomHandler.closeMark == '0') {
                RoomHandler.getAllCloseRoom()
                RoomHandler.closeMark = '1'
            }
        } else if (type == 'edit') {
            vm.room.roomManageNav = [false, false, true]
            if (RoomHandler.modifyMark == '0') {
                RoomHandler.dragRoom()
                RoomHandler.modifyMark = '1'
            }
        }
        location.hash = '#!/room/' + type + '/'
    },

    addRoomClose : function () {
        var vm = avalon.vmodels.vm_room_type

        vm.room.isAddClose = true
        CommonUtil.bindingDatepictureOnload('div.add-lock-time', 'input.time-start', 'input.time-end', 'true')
    },

    //获得房型
    getRoomType : function () {
        var vm = avalon.vmodels.vm_room_type
        vm.room.isRoomType = !vm.room.isRoomType
        vm.room.isRoomNum = false
    },

    //选择房型
    getTypeName : function (index) {
        var vm = avalon.vmodels.vm_room_type
        vm.room.roomClose.typeIndex = index
        vm.room.roomClose.roomTypeValue = vm.roomTypeList.$model[index].name
        vm.room.isRoomType = false
        vm.room.roomClose.roomNumValue = ''

    },

    //获得该房型下的所有房间号
    getRoomAllNum : function () {
        var vm = avalon.vmodels.vm_room_type
        vm.room.isRoomType = false
        if (RoomHandler.roomClose.typeIndex !== '') {
            vm.room.isRoomNum = !vm.room.isRoomNum
            vm.room.roomList = vm.roomTypeList.$model[RoomHandler.roomClose.typeIndex].rooms

        } else {
            tmsky.ui.dialog.errorTips('请选择房型！')
        }
    },

    //选择房间号
    getRoomNum : function (index) {
        var vm = avalon.vmodels.vm_room_type
        vm.room.roomClose.roomNumValue = vm.room.roomList[index].name
        vm.room.roomClose.roomId = vm.room.roomList[index].id
        vm.room.roomClose.numIndex = index
        vm.room.isRoomNum = false
    },

    //锁房
    addRoomCloses : function () {
        var vm = avalon.vmodels.vm_room_type
        var datas = {
            innId : RoomHandler.innId,
            roomId : vm.room.roomClose.roomId,
            startDate : vm.room.roomClose.startDate,
            endDate : vm.room.roomClose.endDate,
            note : vm.room.roomClose.note
        }
        if (datas.innId != '' && datas.roomId != '' && datas.startDate != '' && datas.endDate != '') {
            $.post('/room/close/save', datas).done(function (rs) {
                var alertMsg = RoomHandler.roomCloseCheckMsgByResultCode(rs, datas.startDate, datas.endDate)
                if (rs.status != '500') {
                    if (alertMsg == '') {
                        vm.room.roomClose = {    //当前该锁房的所有信息
                            typeIndex : '',
                            numIndex : '',
                            roomId : '',
                            roomTypeValue : '',//当前选中的房型
                            roomNumValue : '',//当前选中的房间号
                            startDate : '',
                            endDate : '',
                            note : '',
                            unote : ''
                        }
                        vm.room.isAddClose = false
                        vm.room.errorstate = false
                        vm.room.isRoomType = false
                        vm.room.isRoomNum = false
                        vm.room.roomCloseList = []
                        RoomHandler.getAllCloseRoom()
                    } else {
                        vm.room.errorMsg = alertMsg
                        vm.room.showErrors(alertMsg, 'room-close-error')
                        vm.room.errorstate = true
                    }
                }
            })
        } else {
            vm.room.errorMsg = '请选择锁房信息！'
            vm.room.showErrors('请选择锁房信息！', 'room-close-error')
            vm.room.errorstate = true
        }

    },

    roomCloseCheckMsgByResultCode : function (data, startDate, endDate) {
        var alertMsg = "";
        var isSameDate = startDate == endDate;
        if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.pupOperate) {
            alertMsg = "非法操作！";
        } else if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.delFalse) {
            alertMsg = "删除失败！";
        } else if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.hasReserve) {
            alertMsg = isSameDate ? "该房间已预定！" : "预定记录！";
        } else if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.hasIn) {
            alertMsg = isSameDate ? "该房间已入住！" : "入住记录！";
        } else if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.hasOut) {
            alertMsg = isSameDate ? "该房间有退房记录！" : "退房记录！";
        } else if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.hasClose) {
            alertMsg = isSameDate ? "该房间已锁！" : "锁房记录！";
        } else if (data == RoomHandler.ROOM_CLOSE_STATUS_MAP.errorFlag) {
            alertMsg = "备注信息最多填写10个字！";
        } else if (typeof data != 'string') {
            alertMsg = '请选择锁房信息！'
        }
        if ("" != alertMsg) {
            if (data != -1 && data != 0) {
                alertMsg = isSameDate ? alertMsg : "操作的房间在指定的锁房时段内已存在" + alertMsg;
            }
        }
        return alertMsg;
    },

    showErrors : function (errors, divId) {
        $("." + divId).slideDown().delay(2000).slideUp('slow');
    },

    //获取全部锁房记录
    getAllCloseRoom : function () {
        var vm = avalon.vmodels.vm_room_type
        var datas = {
            innId : RoomHandler.innId
        }
        $.get('/room/close/get', datas).done(function (rs) {
            if (rs.status == '200') {
                $.each(rs.data, function (i, elem) {
                    var map = vm.$model.roomMap[elem.roomId]
                    if (typeof map != 'undefined') {
                        var roomItem = {
                            roomId : elem.roomId,
                            roomNumValue : map.name,
                            roomTypeValue : map.roomType.name,
                            startDate : elem.start,
                            endDate : elem.end,
                            ustartDate : elem.start,
                            uendDate : elem.end,
                            note : elem.note,
                            uNote : elem.note,
                            flag : elem.flag,
                        }
                        vm.room.roomCloseList.push(roomItem)
                    }
                })
            }
        })
    },

    //修改锁房信息
    updateRoomClose : function (el, index) {
        var $this = $(this)
        var vm = avalon.vmodels.vm_room_type
        if (this.innerText == '修改') {
            $(this).parent().find('.add-lock-time input').removeAttr('disabled')
            $(this).parent().find('.add-lock-msg input').removeAttr('disabled')
            this.innerText = '确定'
            CommonUtil.bindingDatepictureOnload('div.add-lock-time', 'input.time-start', 'input.time-end', 'true')
        } else if (this.innerText == '确定') {
            var data = {
                innId : RoomHandler.innId,
                roomId : el.$model.roomId,
                startDate : el.$model.startDate,
                endDate : el.$model.endDate,
                ustartDate : el.$model.ustartDate,
                uendDate : el.$model.uendDate,
                flag : el.$model.flag,
                note : el.$model.uNote
            }
            if (data.startDate == data.ustartDate && data.endDate == data.uendDate && el.$model.note == data.note) {
                $this.html('修改')
                $this.parents('.record-group').find('.add-lock-time input').attr('disabled', true)
                $this.parents('.record-group').find('.add-lock-msg input').attr('disabled', true)
                //$('.record-group').eq(index + 1).find('.bg-write')[0].innerText = '修改'
                //$('.record-group').eq(index + 1).find('.add-lock-time input').attr('disabled', true)
                //$('.record-group').eq(index + 1).find('.add-lock-msg input').attr('disabled', true)
            } else if (data.startDate != data.ustartDate || data.endDate != data.uendDate || el.$model.note != data.note) {
                $.post('/room/close/update', data).done(function (rs) {
                    if (rs.length > 10) {
                        el.$model.flag = rs
                    }
                    var alertMsg = RoomHandler.roomCloseCheckMsgByResultCode(rs, data.ustartDate, data.uendDate)
                    if (alertMsg == '') {
                        el.$model.startDate = el.$model.ustartDate
                        el.$model.endDate = el.$model.uendDate
                        tmsky.ui.dialog.successTips('更新成功！')
                        $this.html('修改')
                        $this.parents('.record-group').find('.add-lock-time input').attr('disabled', true)
                        $this.parents('.record-group').find('.add-lock-msg input').attr('disabled', true)
                        //$('.record-group').eq(index + 1).find('.bg-write')[0].innerText = '修改'
                        //$('.record-group').eq(index + 1).find('.add-lock-time input').attr('disabled', true)
                        //$('.record-group').eq(index + 1).find('.add-lock-msg input').attr('disabled', true)
                    } else {
                        tmsky.ui.dialog.errorTips(alertMsg)
                    }
                })
            }

        }

    },

    //删除锁房记录
    deleteRoomClose : function (el, index) {
        var vm = avalon.vmodels.vm_room_type
        tmsky.ui.dialog.confirm('删除该锁房记录后，会将该房间对应时间内的锁房信息删除，</br>您确定要删除吗？', function () {
            var datas = {
                innId : RoomHandler.innId,
                roomId : el.$model.roomId,
                startDate : el.$model.startDate,
                endDate : el.$model.endDate,
                flag : el.$model.flag
            }
            $.post('/room/close/delete', datas).done(function (rs) {
                if (rs == "-1") {
                    tmsky.ui.dialog.tips('非法操作！', 'error');
                    return;
                }
                if (rs == "ok") {
                    tmsky.ui.dialog.tips('删除锁房设置成功！', 'success');
                    setTimeout(function () {
                        vm.room.roomCloseList.splice(index, 1)
                    }, 2000)
                } else {
                    tmsky.ui.dialog.tips('删除锁房设置失败！', 'error');
                }
            })
        })
    },

    ////拖拽房间
    dragRoom : function () {
        var vm = avalon.vmodels.vm_room_type, roomTypeId, _this
        $(".sortable").sortable({
            connectWith : ".connectedSortable",
            update : function (event, ui) {
                var r_roomId = ui.item[0].id, roomNo = ui.item[0].innerText, _typeId
                roomTypeId = $(this).attr('id')
                for (var i = 0; i < vm.roomTypeList.$model.length; i++) {

                    for (var j = 0; j < vm.roomTypeList.$model[i].rooms.length; j++) {
                        if (vm.roomTypeList.$model[i].rooms[j].id == r_roomId) {
                            _this = vm.roomTypeList.$model[i].id
                            vm.room.dragRoomMsg = vm.roomTypeList.$model[i].rooms[j]
                            vm.roomTypeList.$model[i].rooms.splice(j, 1)
                        }
                    }
                }
                if (_this != roomTypeId) {
                    for (var i = 0; i < vm.roomTypeList.$model.length; i++) {
                        if (vm.roomTypeList.$model[i].id == roomTypeId) {
                            vm.roomTypeList.$model[i].rooms.push(vm.room.dragRoomMsg)
                            _typeId = roomTypeId
                            var datas = {
                                roomNo : vm.room.dragRoomMsg.name,
                                id : vm.room.dragRoomMsg.id,
                                'roomType.id' : _typeId
                            }
                            $.post("/inns/" + RoomHandler.innId + "/room/updateEditRoom", datas).done(function (rs) {
                                if (rs.status == '200') {
                                    vm.roomInit.updateList()
                                    return
                                } else {
                                    tmsky.ui.dialog.errorTips(rs.message)
                                    setTimeout(function () {
                                        window.location.reload()
                                    }, 2000)
                                }
                            })
                            break
                        }
                    }
                }

            },
        }).disableSelection()
    },

    sortRooms : {
        //bind
        init : function () {
            var $roomManageSort = $('#room-manage-sort')
            $roomManageSort.sortable({
                containment : 'document',
                stop : function () {
                    avalon.vmodels.vm_room_type.room.sortRooms.update()
                }
            })
            $roomManageSort.disableSelection()
        },

        //update serialNo
        update : function () {

            var RoomSortUtil = {

                updateSort : function () {
                    var sortData = this.getSerialNoData()
                    $.post('/inns/room/updateSort', {
                        sortData : sortData.toString()
                    }, function (rs) {
                        if (rs.status != 200) {
                            tmsky.ui.dialog.tips('房间拖动排序失败！', 'error');
                            document.location.reload();
                        }
                        RoomSortUtil.resetRoomsSerialNo(rs.data);
                    })
                },

                getSerialNoData : function () {
                    return $('#room-manage-sort li').map(function (i, el) {
                        var $this = $(el),
                            roomId = $this.attr('roomId'),
                            serialNo = $this.attr('serialNo'),
                            newSerialNo = i + 1
                        if (serialNo != newSerialNo) {
                            return roomId + '#' + newSerialNo
                        }
                    }).get()
                },

                resetRoomsSerialNo : function (data) {
                    if (tmsky.isEmpty(data)) return
                    var vm = avalon.vmodels.vm_room_type
                    data = data.split(',')
                    data && data.length && data.forEach(function (el) {
                        var _data = el.split('#'),
                            roomId = Number(_data[0]),
                            serialNo = Number(_data[1])
                        $.each(vm.rooms, function (i, rm) {
                            if (rm.id == roomId) {
                                rm.serialNo = serialNo
                                return false
                            }
                        })
                    })
                }
            }

            RoomSortUtil.updateSort()
        }
    }
}
module.exports = RoomHandler