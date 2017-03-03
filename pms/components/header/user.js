var CONST = require('../common/js/const.js')
var mobile,
    userCode,
    name,
    mainInnId,
    innType,
    roomStyle,
    hasBoundWx,
    innList,
    _currentInn,
    mainAccount,
    logoutUrl;

var User = {
    init : function (user, inns, outUrl, currentInn) {
        mobile = user.mobile
        name = user.name || user.userCode
        roomStyle = user.roomStatus
        userCode = user.userCode
        hasBoundWx = user.hasBoundWx
        innList = [].concat(inns)
        logoutUrl = outUrl
        _currentInn = currentInn
        mainInnId = user.innId
        mainAccount = user.mainAccount
        return this
    },
    getInns : function () {
        return innList
    },
    getCurrentInn : function () {
        return _currentInn
    },
    isXYRoomStyle : function () {
        return roomStyle == CONST.STYLE_XY
    },
    getUserInfo : function () {
        return {
            mobile : mobile,
            name : name,
            code : userCode,
            roomStyle : roomStyle,
            hasBoundWx : hasBoundWx,
            innId : _currentInn.id, //当前的innId
            innName : _currentInn.name,
            logoutUrl : logoutUrl,
            mainInnId : mainInnId, //账号的innId
            superInnId : _currentInn.superInnId, //总店innId
            innType : _currentInn.innType,
            level : _currentInn.level,
            mainAccount : mainAccount
        }
    }
}

module.exports = User