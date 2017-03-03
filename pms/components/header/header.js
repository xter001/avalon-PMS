var plug = require('./plug.js')
var Access = require('./access.js')
var user = require('./user.js')
var routeMap = require('./route-map.js')
var upgradePermission = require('./handler/upgradePermissionHandler.js')
var constant = require('../common/js/const.js')
var shopCost = require('../common/components/shopsCost/shopcost.js')
var COMMON_CONST = require('../common/js/const.js')
//var Handlebars = require("")
require('../finance/finance.css')

/**
 * 老版本header也要同步，切记！切记！切记！（ main.scala.html与 home.js）
 */
//require('skin/skin-default.css')  //默认css
//require('skin/skin-christmas.css')  //圣诞皮肤css
require('skin/skin-new-year.css')  //新年皮肤css

var readyList = [],
    initing = false,
    __common_cache_util__ = {
        innBaseInfo : null,
        initInnBaseInfo : function (auth, func, user, secure, specialAuth, updateInfo) {
            this.innBaseInfo = {
                auth : auth,
                func : func,
                user : user,
                secure : secure,
                specialAuth : specialAuth,
                updateInfo : updateInfo
            }
        }
    }

window.CommonCacheUtil = __common_cache_util__

var Header = {
    __active_nav__ : null,

    active : function (flag) {
        var route = routeMap[(flag && flag.toUpperCase()) || 'HOUSE_STATUS'];
        route.active = true
        this.__active_nav__ = route
        return this
    },

    init : function () {

        __inline('finance/vm/vm_handover.vm')
        var self = this
        if (!initing) {
            initing = true
            $.get('/inn/info/base', {"t" : new Date().valueOf()})
                .done(function (rs) {
                    if (typeof rs === 'string') {
                        window.location.href = constant.DOMAIN.SSO
                        return
                    }
                    if (rs.status == 200) {
                        rs = rs.result
                        if (rs.updateInfo.needShowUpdate) {
                            window.location.href = "/updDetail/version"
                            return
                        }
                        //init
                        var auth = Access.init(rs.auth, rs.specialAuth)
                        var func = plug.init(rs.func)
                        tmsky.getVm('vm_handover').plug = plug
                        tmsky.getVm('vm_handover').func = rs.func
                        var userInfo = user.init(rs.user, rs.inns, rs.logoutUrl, rs.currentInn).getUserInfo()
                        __common_cache_util__.initInnBaseInfo(auth, func, userInfo, rs.secure, Access.getSpecialAuth(true), rs.updateInfo)
                        self.render()
                        self._alertUpgradeSucceeded(rs.currentInn.level, rs.currentInn.applyAt, rs.currentInn.id)
                        self.fireReady()
                    } else {
                        tmsky.ui.dialog.errorTips(rs.message)
                    }
                })
        }

        return self
    },

    render : function () {
        var self = this
        routeMap.OMS.href = constant.DOMAIN.OMS + routeMap.OMS.href
        if (!this.__active_nav__) {
            routeMap.HOUSE_STATUS.active = true
        }

        var inns = user.getInns(),
            userInfo = user.getUserInfo(),
            currentInn = user.getCurrentInn(),
            data = {
                mainNavs : [],
                innsMgr : [routeMap.BASEINFO],
                user : userInfo,
                applyAt : currentInn.applyAt ? true : false,
                level : currentInn.level == 1 ? true : null,
                innName : user.getCurrentInn().name,
                inns : null,
                drMgr : null,
                joinFx : null,
                levelName : null,
                festivalNumber : null,
                houseStatus : routeMap.HOUSE_STATUS,
                //logo : "background:url(/public/c/views/1/header/logo_ty.png) no-repeat;",
                logo : "background:url(/public/c/views/1/header/christmas_logo.png) no-repeat center;",
                title : "番茄来了",
                fanbi : 0,
                jfHref : routeMap.INTEGRAL,
                noticeDisableTime : __common_cache_util__.innBaseInfo.updateInfo.noticeDisableTime,
                showNotice : __common_cache_util__.innBaseInfo.updateInfo.noticeMsg != "" && tmsky.date.diffSeconds(__common_cache_util__.innBaseInfo.updateInfo.noticeDisableTime, new Date()) < 0,
                noticeMsg : __common_cache_util__.innBaseInfo.updateInfo.noticeMsg,
                noticeUrl : __common_cache_util__.innBaseInfo.updateInfo.noticeUrl
            },
            mainNavs = data.mainNavs,
            innsMgr = data.innsMgr
        //客栈是否审核
        if (data.level && !data.applyAt) {
            data.levelName = '新手版'
        } else if (data.level && data.applyAt) {
            data.levelName = '审核中'
        }
        data.fanbi = user.getCurrentInn().availableIntegral == null ? 0 : user.getCurrentInn().availableIntegral

        routeMap.replaceHolder(userInfo.innId) // 替换占位符
        if (inns.length > 1) {
            data.inns = inns
        }
        // 主菜单
        if (Access.access(Access.AC_ROOM_STATUS)) {
            mainNavs.push(routeMap.HOUSE_STATUS)
            mainNavs.push(routeMap.ORDER)
        }
        if (Access.access(Access.AC_REPORTVIEW)) {
            mainNavs.push(routeMap.REPORT)
        }
        if (Access.access(Access.AC_INNBOOK)) {
            mainNavs.push(routeMap.FINANCE)
        }
        mainNavs.push(routeMap.ACTIVITY)

        // 客栈管理
        if (Access.access(Access.AC_ROOM_MGR)) {
            innsMgr.push(routeMap.ROOMS)
        }
        if (Access.access(Access.AC_PLUG_MGR)) {
            innsMgr.push(routeMap.PLUG)
        }
        if (Access.access(Access.AC_ACCESS_MGR)) {
            innsMgr.push(routeMap.ACCESS)
        }
        if (Access.access(Access.AC_GUEST)) {
            innsMgr.push(routeMap.CUSTOMERS)
        }
        if (Access.access(Access.AC_LOG)) {
            innsMgr.push(routeMap.LOG)
        }

        //记一笔是否有权限
        data.isAccessShopCost = Access.access(Access.AC_BOOK) || Access.access(Access.AC_ACC_OUT) || Access.access(Access.AC_ACC_IN) ? true : false

        //客栈积分
        if (!data.applyAt && data.level == null && data.levelName == null) {
            //innsMgr.push(routeMap.INTEGRAL)
        }

        // 分销管理
        if (Access.access(Access.AC_DR_MGR)) {
            //data.drMgr = routeMap.OMS
            data.drMgr = routeMap.ROOM_SELL
        }
        // data.joinFx = routeMap.DISTRIBUTION
        // 客栈个性化配置
        var personalizedLogo = currentInn.personalizedLogo
        var personalizedTitle = currentInn.personalizedTitle
        var hasPersonalized = currentInn.hasPersonalized
        if (hasPersonalized) {
            if (!personalizedLogo && !personalizedTitle) {
                $.get('/sso/personalized').done(function (rs) {
                    if (rs && rs.status == 200) {
                        var personalized = rs.personalized
                        data.logo = "background:url(" + constant.DOMAIN.PMS + personalized.pms_header_logo + ") no-repeat;"
                        data.title = personalized.login_header_title
                    }
                })
            } else if (personalizedLogo != 'nothing') { // 虽然设置了个性化权限，但是没有找到相关配置
                data.logo = "background:url(" + constant.DOMAIN.PMS + personalizedLogo + ") no-repeat;"
                data.title = personalizedTitle
            }
        }
        self._fixHeaderHtml(data)
        //获取未确认的节假日项目
        var url = constant.DOMAIN.OMS + "/festival/getFestivalConfirmNumber"
        $.get(url, function (rs) {
            if (rs.status == 200) {
                if (rs.festivalNumber != 0) {
                    data.festivalNumber = rs.festivalNumber
                    $("#Notice").html("您有" + rs.festivalNumber + "项节日价格尚未确认")
                    $(".modify-price-notice").css("display", "inline-block")
                    $("#header").on("click", "#Notice", function () {
                        window.location.reload()
                    })
                } else {
                    $(".modify-price-notice").css("display", "none")
                }
            }
        })
    },
    _fixHeaderHtml : function (data) {
        var tpl = __inline('header.handlebars')
        $('#header').html(tpl(data))
        this._bindClick()
        upgradePermission.addApplyEvent()
        // 交接班
        document.getElementById('comm_popups_div').innerHTML = __inline('finance/tpl/handover-popups.html')
        avalon.scan(document.getElementById('handover_btn'))
        avalon.scan(document.getElementById('handover_detail_popups'))
        avalon.scan(document.getElementById('handover_login_popups'))
        // 客栈申请正式版
        __inline('vm/vm_apply.vm')
        tmsky.getVm('vm_apply').init()
        document.getElementById('apply_popups_div').innerHTML = __inline('tpl/apply.html')
    },
    _bindClick : function () {
        var self = this
        // header 弹窗异步加载
        $('#header').on('click', '[data-ui="popups"]', function (e) {
            e.preventDefault()
            self._lazyloadPopups($(this))
        })
        $('.changeHotelList').on('click', function () {
            // 切换客栈
            var innId = $(this).attr('innId')
            window.location.href = "/index/changeInn?changeInnId=" + innId + "&referer=" + window.location.href;
        })
    },

    _lazyloadPopups : function ($el) {
        require.async(['header/h-popups'], function (popups) {
            var target = $el.data('target')
            popups.init(target)
            if ($el && $el.length) {
                $(target).popups()
            }
        })
    },

    ready : function (cb) {
        if (typeof cb !== 'function') return;
        if (readyList == null) {
            cb()
        } else {
            readyList.push(cb)
            if (!initing) {
                this.init()
            }
        }
    },

    fireReady : function () {
        if (readyList) {
            readyList.forEach(function (fn) {
                fn(__common_cache_util__.innBaseInfo)
            })
            readyList = null
        }
    },
    //是否有权限，没有则跳转房态或报表页
    hasAccessToView : function (ac, text) {
        var toText = '房态'
        if (!Access.access(ac)) {
            if (!Access.access(Access.AC_ROOM_STATUS) && Access.access(Access.AC_REPORTVIEW)) {
                toText = '报表'
            }
            var options = {
                title : '消息提示',
                content : '很抱歉，您没有进入该门店' + text + '的权限。点击确定后，进入该门店' + toText + '页！！',
                ok : Header.updateToView
            }
            tmsky.ui.dialog.alert(options);
            $('.ui-dialog-close').hide()
            return false
        }
        return true
    },
    updateToView : function () {
        if (!Access.access(Access.AC_ROOM_STATUS) && Access.access(Access.AC_REPORTVIEW)) {
            window.location.href = routeMap.REPORT.href;
            return false
        }
        window.location.href = '/public/views/1/index.html'
    },
    _alertUpgradeSucceeded : function (level, applyAt, innId) {
        var curVersion = 0,
            apply = applyAt ? true : false,
            level_b = level == 1 ? true : null
        if (level_b && !apply) {
            curVersion = 1
        } else if (level_b && apply) {
            curVersion = 2
        } else {
            curVersion = 3
        }
        if (!localStorage || curVersion !== 3) return

        // 状态由审核中变为完整版后提示升级成功
        var curStatus = JSON.parse(localStorage.getItem("inn_account_status")) || []
        // var index = -1;
        for (var i = 0, l = curStatus.length; i < l; i++) {
            if (curStatus[i].innId == innId) {
                //index = i
                //是否有 审核中 => 完整版？
                if (curStatus[i].status == COMMON_CONST.INN_ACCOUNT_STATUS.UNDER_REVIEW) {
                    $("#apply-success-popups").popups()
                    upgradePermission.addApplySuccessEvent()
                    curStatus.splice(i, 1)
                    localStorage.setItem("inn_account_status", JSON.stringify(curStatus))
                    break
                }
            }
        }
    }

}

// handebar helpers
Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
        case "==":
            return (v1 == v2) ? options.fn(this) : options.inverse(this);

        case "!=":
            return (v1 != v2) ? options.fn(this) : options.inverse(this);

        case "===":
            return (v1 === v2) ? options.fn(this) : options.inverse(this);

        case "!==":
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);

        case "&&":
            return (v1 && v2) ? options.fn(this) : options.inverse(this);

        case "||":
            return (v1 || v2) ? options.fn(this) : options.inverse(this);

        case "<":
            return (v1 < v2) ? options.fn(this) : options.inverse(this);

        case "<=":
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);

        case ">":
            return (v1 > v2) ? options.fn(this) : options.inverse(this);

        case ">=":
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);

        default:
            return eval("" + v1 + operator + v2) ? options.fn(this) : options.inverse(this);
    }
});

module.exports = Header
