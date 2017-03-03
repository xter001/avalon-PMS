/**
 * Created by leasong on 2017/2/22.
*/
var COMMON_CONST = require('../const.js')
var User = require('../../../header/user.js')

var BASE_URL = COMMON_CONST.DOMAIN;
var PSB_API_URL = BASE_URL.PSB
var Pms2PsbOrderUtil = {
    getPsbHeader: function () {
        return {
            HotelID: User.getCurrentInn().psbHotelId,
            HotelKey: User.getCurrentInn().psbHotelKey,
            PMSKey: CommonCacheUtil.innBaseInfo.secure.pmsToPsbKey
        }

    },
    /**
     *
     * @param subOrders
     * @param actionType 入住：1， 修改信息：2， 换房：3， 退房：4
     * @returns {*}
     */
    orderBeforeCurd: function (subOrders, actionType, mainId) {
        // 将订单信息传给PSB，如果通过才能继续保存到PMS
        if(CommonCacheUtil.innBaseInfo.func.psb_func
            && CommonCacheUtil.innBaseInfo.func.psb_func == true){

            if(actionType !== 1){
                subOrders = Pms2PsbOrderUtil.getOrderByMainId(mainId)
            }
            // 将psb返回的keyId对应到订单的入住人
            Pms2PsbOrderUtil.pmsOrderAddPsbKeyId(subOrders, Pms2PsbOrderUtil.orderSavabeforeToPms(subOrders, actionType))
        }
    },
    /**
     * format psm's order.suborders to psbGuestInfo
     * would call personPms2Psb
     * @param pmsOrder order.suborders
     * @param actionType 入住：1, 修改信息：2, 换房：3, 退房：4
     * @returns {Array}
     */
    pmsOrder2PsbGuestInfo: function (pmsOrder, actionType) {
        var psbGuestInfos = []
        pmsOrder.forEach(function(order){
            order.persons.forEach(function(person){
                // PSB 要求的数据格式
                psbGuestInfos.push({
                    ISForeign: 0, // 0：国内 1：国外
                    GestType: actionType,
                    CheckInTime: tmsky.date.format(order.checkInAt, 'yyyy-MM-dd hh:mm:ss:000'), // YYYY-MM-DD hh:mm:ss:zzz
                    CheckOutTime: tmsky.date.format(order.checkOutAt, 'yyyy-MM-dd hh:mm:ss:000'),
                    ChangeRoomTime: '',
                    RoomNo: order.room.roomNo,
                    OldRoomNo: '',
                    KeyID: person.psbKeyId || '',
                    Data: JSON.stringify(Pms2PsbOrderUtil.personPms2Psb(person, order))
                })
            })
        })
        return psbGuestInfos
    },

    /**
     * format person in pms to the data format needed by psb
     * @param pmsPerson
     */
    personPms2Psb: function (pmsPerson, order) {
        return {
            IDCType: Pms2PsbOrderUtil.idCardTypeMap(pmsPerson.cardType),
            Name: pmsPerson.name,
            Nation: pmsPerson.nationCode,
            Sex: pmsPerson.sex,
            IDC: pmsPerson.cardNo,
            Birthday: pmsPerson.birthday,
            Small_Photo: pmsPerson.picStream,
            Address: pmsPerson.address,
            SSX : pmsPerson.ssxCode,
            RoomNO: order.room.roomNo,
            CheckInTime: tmsky.date.format(order.checkInAt, 'yyyy-MM-dd hh:mm:ss:000')
        }
    },
    idCardTypeMap: function (pmsIdcardType) {
        var map = {
            1: 11,
            2: 518,
            5: 13,
            4: 93,
            2: 92,
            2: 91,
            2: 90,
            5: 99,
            5: 112,
            5: 419,
            5: 513,
            5: 999
        };
        return map[pmsIdcardType]
    },
    pmsOrderAddPsbKeyId: function (subOrders, keyIdMap) {
        // subOrders = $.extend({}, {}, subOrders)
        subOrders.forEach(function (order) {
            order.persons.forEach(function (person) {
                person.psbKeyId = keyIdMap[person.cardNo]
            });
        })
        // return subOrders
    },
    /**
     * push data to psb
     * @param psbGuestInfos
     */
    toPsbValidData: function (psbGuestInfo) {
        var result;
        $.ajax({
            url : PSB_API_URL + "/UploadHotelGuestInfo",
            type : "POST",
            async: false,
            headers: Pms2PsbOrderUtil.getPsbHeader(),
            dataType : "json",
            data : psbGuestInfo,
            success: function (rs) {
                if(rs.code == 1){
                    result = {status: true, msg: rs, person: psbGuestInfo}
                }else{
                    result = {status: false, msg: rs, person: psbGuestInfo}
                }
            },
            error:function (rs) {
                result = {status: false, msg: rs, person: psbGuestInfo}
            }
        })
        return result
    },
    /**
     * 上传psb
     * @param subOrders
     * @param actionType
     * @returns {Array}
     */
    orderSavabeforeToPms: function (subOrders, actionType) {
        var toPsbOrders = Pms2PsbOrderUtil.pmsOrder2PsbGuestInfo(subOrders, actionType),
            result = []
        tmsky.ui.dialog.loading('正在上传公安系统...')
        for(var i = 0, l = toPsbOrders.length; i < l; i++){
            var psbResult = Pms2PsbOrderUtil.toPsbValidData(toPsbOrders[i])
            result.push(psbResult)
            // 一旦有一个人上报失败就退出，暂不返回任何数据
            if(!psbResult.status) {
                tmsky.ui.dialog.loading.close()
                tmsky.ui.dialog.tips('上传公安系统失败，请到PSB系统中进行订单办理！', 'error')
                return false
            }
        }

        // 成功时返回入住人对应的keyId
        var personMapKeyId = {}
        result.forEach(function (el) {
            if(el.status){
                personMapKeyId[JSON.parse(el.person.Data).IDC] = el.msg.KeyID || ''
            }
        })
        tmsky.ui.dialog.loading.close()
        return personMapKeyId
    },
    getOrderByMainId: function (mainId) {
        var result;
        $.ajax({
            url: '/order/view/' + COMMON_CONST.ORDER_FROM.WEB_ROOM_STATUS + "/" + mainId,
            async: false,
            type : "GET",
            headers: Pms2PsbOrderUtil.getPsbHeader(),
            dataType: "json",
            data:{'t': new Date().valueOf()},
            success: function (rs) {
                if (rs.status == 200) {
                    result ={
                        status: true,
                        data: rs.mainOrder.subOrders
                    }
                } else {
                    result ={
                        status: false,
                        data: rs.message
                    }
                }
            },
            error: function (rs) {
                result ={
                    status: false,
                    data: rs
                }
            }
        })
        if(result.status){
            return result.data
        }else{
            tmsky.ui.dialog.tips(result.data, 'error')
            return false
        }
    }

}

module.exports = Pms2PsbOrderUtil