/**
 * Created by leasong on 2017/2/.
 */
var COMMON_CONST = require('../../common/js/const.js')
var Pms2PsbOrder = require('../../common/js/utils/pms-to-psb-util.js')
var BASE_URL = COMMON_CONST.DOMAIN;
var PSB_API_URL = BASE_URL.PSB

var PSB_HEADER = Pms2PsbOrder.getPsbHeader()

var IdcardService = {

    /**
     * 提供旅客信息录入项
     * @param data
     * @returns {*}
     */
    getInputConfig : function (data){
        return $.getJSON ("/public/c/views/1/house/services/get-input-config.json")

        // return $.ajax({
        //     url : "http://localhost:13579/getInputConfig",
        //     type : "POST",
        //     headers: PSB_HEADER,
        //     dataType : "json",
        //     data : data
        // })
    },
    getInfoFromCardReader : function (data){
        return $.ajax({
            url : PSB_API_URL + "/GetReadCardInfo",
            async: false,
            type : "POST",
            headers: PSB_HEADER,
            dataType : "json",
            data : data
        })
    },
    getDeviceList : function (data){
        return $.ajax({
            url : PSB_API_URL + "/GetDeviceList",
            type : "POST",
            headers: PSB_HEADER,
            dataType : "json",
            data : data
        })
    },
    uploadHotelGuestInfo: function (data) {
        return $.ajax({
            url : PSB_API_URL + "/UploadHotelGuestInfo",
            type : "POST",
            headers: PSB_HEADER,
            dataType : "json",
            data : data
        })
    }
}
module.exports = IdcardService


