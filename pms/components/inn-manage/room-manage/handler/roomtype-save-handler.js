/**
 * Created by yu on 2016/4/19.
 * 房型管理-保存
 */
var CommonUtil = require('../../../common/js/utils/common-util.js'),
    UserInfo = require('../../../header/user.js');
var RoomTypeSaveHandler = {
    //保存周末价特殊价
    savePrice : function () {
        var vm = avalon.vmodels.vm_room_type;
        var datas = RoomTypeSaveHandler.saveDatasConvert()
        if (!vm.price.checkSaveDatas(datas)) return false

        tmsky.ui.dialog.loading()
        $.post('/room/price/saveOrUpdate', tmsky.json.toForm(datas)).done(function (rs) {
            if (rs.status == 200) {

                vm.price.closeRoomSet();
                tmsky.ui.dialog.tips('保存成功！', 'success')
            } else {
                tmsky.ui.dialog.tips(rs.message);
            }
        }).always(function () {
            tmsky.ui.dialog.loading.close()
        })

    },
    //获取需要保存的数据及转换格式
    saveDatasConvert : function () {
        var vm = avalon.vmodels.vm_room_type;
        var innId = UserInfo.getCurrentInn().id;
        var roomTypeId = Number($('.saveBtn').attr('roomTypeId'));
        var speData = vm.spePrice.$model;   //特殊价
        var weekData = vm.weekPrice.$model; //周末价
        var speArray = [];  //特殊价数组
        var weekPrice = '';//周末价字符串
        var weeks = '';


        //周末价数据转换
        weekData.forEach(function (e, i) {
            if (e.value != '') {
                if (weekPrice == '') {
                    weeks = (i + 1);
                    weekPrice = e.value
                } else {
                    weeks = weeks + ',' + (i + 1);
                    weekPrice = weekPrice + ',' + e.value
                }
            }
        })
        //特殊价数据转换
        speData.forEach(function (e, i) {
            if (e.reason != '') {
                var js2 = {
                    endAt : e.endpriceipt,
                    price : Number(e.price),
                    startAt : e.startpriceipt,
                    reason : e.reason
                };
            } else {
                var js2 = {
                    endAt : e.endpriceipt,
                    price : Number(e.price),
                    startAt : e.startpriceipt
                };
            }
            speArray.push(js2)
        })
        if (speArray.length == 0) {
            var datas = {
                innId : innId,
                roomTypeId : roomTypeId,
                weekPrices : weekPrice,
                weeks : weeks
            }
        } else {

            var datas = {
                innId : innId,
                roomTypeId : roomTypeId,
                weekPrices : weekPrice,
                weeks : weeks,
                specialPrices : speArray
            }
        }
        return datas;
    },
    isEmptyRoomNo : function (arr) {
        var count = 0
        var newArr = arr.filter(function (item) {
            return item.roomNo != ''
        })
        return newArr
    },
    //保存房型
    saveRoomType : function () {
        // 每个房型最多创建100间房
        var vm = avalon.vmodels.vm_room_type;
        if (vm.editInfo.editRoomNo.length > vm.MAX_ROOM_NUM) {
            tmsky.ui.dialog.tips("每个房型最多创建" + vm.MAX_ROOM_NUM + "间房", "error");
            return;
        }

        var roomTypeId = vm.editInfo.roomTypeId;
        var roomTypeName = vm.editInfo.roomTypeName //房型名称
        var roomTypePrice = vm.editInfo.roomTypePrice  //房型价格
        var shortName = vm.editInfo.shortName  //房型简称
        var editInfo = vm.editInfo.$model,
            rooms = vm.editInfo.editRoomNo

        var datas = {
            id : editInfo.roomTypeId,
            name : editInfo.roomTypeName,
            shortName : editInfo.shortName,
            normalPrice : editInfo.roomTypePrice
        }
        if (RoomTypeSaveHandler.isEmptyRoomNo(editInfo.editRoomNo).length != 0) {
            datas.innRooms = RoomTypeSaveHandler.isEmptyRoomNo(editInfo.editRoomNo)
        }

        if (roomTypeName === '') {
            tmsky.ui.dialog.tips('房型名不能为空！', "error");
            return;
        }

        if (datas.normalPrice == '') {
            tmsky.ui.dialog.tips("默认价格不能为空！", "error");
            return false
        }
        if (isNaN(datas.normalPrice)) {
            tmsky.ui.dialog.tips("默认价格只能为数值！", 'error');
            return false;
        }

        if (avalon.vmodels.vm_room_type.hasNewGuide && rooms[0].roomNo === '') {
            tmsky.ui.dialog.tips("房间号不能为空！", 'error');
            return false;
        }

        tmsky.ui.dialog.loading()
        $.post('/inns/roomtype/saveOrUpdate', tmsky.ajax.serialize(datas)).done(function (rs) {
            if (rs.status == 200) {
                vm.button.closeRoomEdit();
                tmsky.ui.dialog.tips('保存成功！', 'success')
                avalon.vmodels.vm_room_type.init()
                avalon.vmodels.vm_room_type.room.init()
                if (!!avalon.vmodels.vm_guide_roomtype) {
                    //新手引导
                    avalon.vmodels.vm_guide_roomtype.guideRoomFunByStep(3)
                }
            } else {
                tmsky.ui.dialog.tips(rs.message, 'error');
            }
        }).always(function () {
            tmsky.ui.dialog.loading.close()
        })
    }
}

module.exports = RoomTypeSaveHandler