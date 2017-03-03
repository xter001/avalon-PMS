/**
 * Created by yu on 2016/4/19.
 * 房型管理-周末价、特殊价
 */
var CommonUtil = require('../../../common/js/utils/common-util.js'),
    RoomTypeSaveHandler = require('../handler/roomtype-save-handler.js'),
    UserInfo = require('../../../header/user.js');
var RoomTypePriceHandler = {
    //弹出设置周末价特殊价
    getRoomSet : function (roomTypeId,normalPrice) {
        var vm = avalon.vmodels.vm_room_type;
        $('.saveBtn').attr('roomTypeId', roomTypeId);
        RoomTypePriceHandler.getWeekPrice(roomTypeId);
        vm.popupShow.roomSet = true
    },
    closeRoomSet : function () {
        var vm = avalon.vmodels.vm_room_type;
        vm.popupShow.roomSet = false;
        RoomTypePriceHandler.resetWeekData()
        vm.spePrice = [];
    },
    //获取周末价、特殊价
    getWeekPrice : function (roomTypeId,normalPrice) {
        var vm = avalon.vmodels.vm_room_type;
        tmsky.ui.dialog.loading()
        var innId = UserInfo.getCurrentInn().id;
        var url = "/room/price/find/" + innId + "/" + roomTypeId;
        $.get(url, function (data) {
            tmsky.ui.dialog.loading.close()
            if (data.status === 200) {
                $('.saveBtn').attr('normalPrice', normalPrice)



                // 查询周末价
                var dataWeek = data.weekPrice;


                if (dataWeek == '') {
                    RoomTypePriceHandler.resetWeekData()
                } else {
                    vm.weekPrice = RoomTypePriceHandler.forInWeekPrice(dataWeek)
                }


                //输出特殊价

                var dataSpe = data.specialPrice;
                if (dataSpe == '') {
                    vm.spePrice = []
                    return false;
                }
                var speArray = [],
                    speJson = {};

                dataSpe.forEach(function (e, i) {
                    speJson = {
                        startpriceipt : e.start,
                        endpriceipt : e.end,
                        price : e.price,
                        reason : e.reason,
                        roomTypeId : e.roomTypeId
                    }
                    speArray.push(speJson)
                })
                vm.spePrice = speArray;
                CommonUtil.bindingDatepictureOnload("div.room-set-div", "input.startpriceipt", "input.endpriceipt", false);


            } else {
                tmsky.ui.dialog.alert(data.message)
            }
        }).fail(function (data) {

            tmsky.ui.dialog.alert('设置失败，请检查网络情况！');

        });


    },
    //重置周末价
    resetWeekData : function () {
        var vm = avalon.vmodels.vm_room_type;
        var orArray = []
        var weeks = ['一', '二', '三', '四', '五', '六', '日'];
        weeks.forEach(function (el, i) {
            orArray[i] = {
                name : '周' + weeks[i],
                value : ''
            }
        })
        vm.weekPrice = orArray;
    },
    //保存周末价特殊价
    savePrice : function () {
        RoomTypeSaveHandler.savePrice()
    },
    //遍历周末价到model上
    forInWeekPrice : function (dataWeek) {
        var vm = avalon.vmodels.vm_room_type;
        var arr = [],
            brr = [],
            diffarr = dataWeek.week,
            price = dataWeek.price;
        arr.length = 7;

        if (diffarr != '' && diffarr != undefined) {
            diffarr = diffarr.split(',');
        }
        if (price != '' && price != undefined) {
            price = price.split(',');
        }


        for (var i = 0; i < 7; i++) {
            arr[i] = '';
        }
        for (var j = 0; j < diffarr.length; j++) {
            arr[parseInt(diffarr[j] - 1)] = parseInt(price[j])
        }
        for (var z = 0; z < arr.length; z++) {
            brr.push({
                name : vm.weekPrice[z].$model.name,
                value : arr[z]
            })
        }
        return brr
    },
    //添加特殊价
    addSpePrice : function () {
        var vm = avalon.vmodels.vm_room_type;
        if (vm.spePrice.$model != 0) {
            var speArr = vm.spePrice.$model;
            speArr = speArr[speArr.length - 1];
            RoomTypePriceHandler.checkAll(speArr.startpriceipt, speArr.endpriceipt, speArr.price, $('.saveBtn').attr('normalPrice'))
            if (!RoomTypePriceHandler.checkAll(speArr.startpriceipt, speArr.endpriceipt, speArr.price, $('.saveBtn').attr('normalPrice')))return;
        }

        var json = {
            startpriceipt : '',
            endpriceipt : '',
            price : '',
            reason : '',
            roomTypeId : ''
        }
        vm.spePrice.push(json)
        CommonUtil.bindingDatepictureOnload("div.room-set-div", "input.startpriceipt", "input.endpriceipt", false);
    },
    removeSpePrice : function (index) {
        var vm = avalon.vmodels.vm_room_type;
        var speList = vm.spePrice.$model,
            speNewList = [];
        speList.forEach(function (e, i) {
            if (i == index) return
            speNewList.push(e)
        });
        vm.spePrice = speNewList;
        CommonUtil.bindingDatepictureOnload("div.room-set-div", "input.startpriceipt", "input.endpriceipt", false);
    },
    //周末特殊价编辑需传值是否满足条件
    checkSaveDatas : function (datas) {
        var vm = avalon.vmodels.vm_room_type;
        if (!datas.specialPrices)return true
        var speDatas = datas.specialPrices;
        var speArr = vm.spePrice.$model;

        for (var i = 0; i < speDatas.length; i++) {
            var bool = RoomTypePriceHandler.checkAll(speDatas[i].startAt, speDatas[i].endAt, speDatas[i].price, $('.saveBtn').attr('normalPrice'));
            if (!bool) {
                return false;
            }
        }
        return true

    },
    //小数点只能在一位
    checkPoint : function (str) {
        str = tmsky.toString(str)
        if (str == '')return
        str = str.split('');
        var newStr = [];
        var pointN = 0;
        str.forEach(function (e, i) {
            if (e == '.') {
                pointN++
            }
        })
        if (pointN > 1)return false;
        return true
    },
    //特殊价格检测
    checkAll : function (startVal, endVal, priceval, normalPrice) {
        var vm = avalon.vmodels.vm_room_type;
        if (startVal == "") {
            tmsky.ui.dialog.tips('请选择特殊价格开始时间！', 'error');
            return false;
        }
        if (endVal == "") {
            tmsky.ui.dialog.tips('请选择特殊价格结束时间！', 'error');
            return false;
        }
        if (Date.parse(startVal) > Date.parse(endVal)) {
            tmsky.ui.dialog.tips('要添加的特殊价格的开始时间大于结束时间！', 'error');
            return false;
        }
        if (priceval == "") {
            tmsky.ui.dialog.tips('请设置特殊价格！', 'error');
            return false;
        }
        if (!RoomTypePriceHandler.checkPoint(priceval) || priceval.length > 5 || isNaN(priceval)) {
            tmsky.ui.dialog.tips('特殊价格请输入数值，该价格最多为5位且最多包含一位小数！', 'error');
            return false;
        }
        if (Number(priceval) <= 0) {
            tmsky.ui.dialog.tips('特殊价格必须大于0！', 'error');
            return false
        }
        if (Number(priceval) == normalPrice) {
            tmsky.ui.dialog.tips('要添加的特殊价格与挂牌价相同！', 'error');
            return false;
        }
        return true;
    },
    checkPrice : function (priceval) {
        if (priceval.length > 5) {
            return false
        } else {
            return true;
        }
    }
}

module.exports = RoomTypePriceHandler