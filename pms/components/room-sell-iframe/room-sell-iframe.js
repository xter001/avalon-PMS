var Header = require('header')
var CONST = require('/components/common/js/const.js')

module.exports = {
    launch: function () {
        Header.active('ROOM_SELL').ready(function () {
            $.get('/inn/info/base', {"t": new Date().valueOf()}).done(function (rs) {
                if (rs.status == 200) {
                    rs = rs.result
                    //为iframe设置相同的domain
                    document.domain = window.location.hostname
                    rs.secure.domain = document.domain
                    //if(tmsky.location.params.route) rs.secure.route = tmsky.location.params.route

                    rs.secure.mainInnId = rs.user.innId
                    rs.secure.innName = rs.user.innName
                    rs.secure.mobile = rs.user.mobile
                    rs.secure.name = rs.user.name
                    rs.secure.roomStatus = rs.user.roomStatus
                    rs.secure.userCode = rs.user.userCode
                    window.location.hash
                        ? $('#room_sell_iframe').attr('src', CONST.DOMAIN.ROOM_SELL + '/public/views/1.0.0/room-sell.html?' + $.param(rs.secure, true) + window.location.hash)
                        : $('#room_sell_iframe').attr('src', CONST.DOMAIN.ROOM_SELL + '/public/views/1.0.0/room-sell.html?' + $.param(rs.secure, true))

                } else {
                    tmsky.ui.dialog.errorTips(rs.message)
                }
            })
        })
    }
}