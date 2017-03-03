var Header = require('header'),
    Access1 = require('../header/access.js'),
    Plug = require('../header/plug.js'),
    CommonUtil = require('../common/js/utils/common-util.js'),
    InnUtil = require('../common/js/utils/inn-util.js')
var __caches__ = {},
    __cache_fields__ = {
        BASE_INFO : 'baseInfo'
    }
var PayModule = null;
function setPayModule(module) {
    PayModule = module
}

var Order = {
    init : function () {
        var hasAccessToView = Header.hasAccessToView(Access1.AC_ROOM_STATUS, '订单')
        if (!hasAccessToView) return

        // inline tpl
        document.getElementById('content').innerHTML = __inline('tpl/order-main.html')
        document.getElementById('order-operate-popups-container').innerHTML = __inline('tpl/order-operate.html')
        $('#order-info-input-container').append(__inline('tpl/order-operate-input.html'))
        $('#order-info-input-container').append(__inline('tpl/order-check-out.html'))
        // inline vm
        __inline('vm/vm_order_main.vm')
        __inline('vm/vm_order_operate.vm')
        __inline('vm/vm_finance_detail.vm')
        __inline('vm/vm_order_shop.vm')
        tmsky.ui.component.navTab.bind()
        // init
        tmsky.getVm('vm_order_main').init()
        this.initData()
        this.initVmOrderOperate()
        avalon.scan();
        
        // 异步获取 支付
        require.async(['order/pay'],
            function (pay) {
                pay.init()
                setPayModule(pay)
            })

        require.async(['house/idcard-input'],
            function (idcard) {
                idcard.init()
            })
    },
    initData : function () {
        this.initInnBaseInfo(tmsky.getVm('vm_order_operate').init)
    },
    initVmOrderOperate : function () {
        avalon.vmodels.vm_order_operate.plugs = Plug
    },
    initInnBaseInfo : function (cb) {
        var plugArr = []
        plugArr.push(Plug.QF_PAY)
        plugArr.push(Plug.QF_ORIGIN)
        plugArr.push(Plug.QF_COMMISSION)
        plugArr.push(Plug.QF_PRINT_TPL)
        plugArr.push(Plug.QF_SPEND)
        plugArr.push(Plug.QF_ACCOUNT_ITEM)

        if (Plug.hasFunc(Plug.F_MSG)) {
            plugArr.push(Plug.QF_MSG_TPL)
        }
        if (Plug.hasFunc(Plug.F_UNION)) {
            plugArr.push(Plug.QF_MEMBER_UNION)
        }

        InnUtil.getInnBaseInfo(plugArr.join(), function (rs) {
            if (CommonUtil.isSuccess(rs)) {
                avalon.vmodels.vm_order_operate.initPayEnum(rs.result[Plug.QF_PAY])
                OrderCacheUtil.cache(rs.result || rs, __cache_fields__.BASE_INFO, true)
                //tmsky.cipher.cache(__storage_keys__.inn_base_info, __caches__[__cache_fields__.BASE_INFO])
                CommonUtil.fire(cb)
                avalon.vmodels.vm_order_operate.printInit(rs.result[Plug.QF_PRINT_TPL])
            } else {
                tmsky.log(rs.message || '获取客栈基本信息失败')
            }
        })
    },
    launch : function () {
        Header.active('order').ready(function (info) {
            Order.init()
        })
    }
}

var OrderCacheUtil = {
    CONST : {
        __cache_fields__ : __cache_fields__
    },
    cache : function (data, name, toMap) {
        if (tmsky.isEmpty(data)) {
            return
        }
        toMap ? __caches__[name] = {original : data} : __caches__[name] = data
        toMap ? this[name + 'ToMap']() : void 0
    },
    baseInfoToMap : function () {
        var cache = __caches__[__cache_fields__.BASE_INFO],
            map = {}
        if (!cache || !cache.original) {
            return
        }
        if (tmsky.isObject(cache.original)) {
            for (name in cache.original) {
                var curr = cache.original[name]
                map[name] = {}
                tmsky.isArray(curr) ? curr.forEach(function (item, i) {
                    if (item.id) {
                        map[name][item.id] = item
                    } else {
                        map[name] = curr
                        return false
                    }
                }) : map[name] = curr
            }
        } else if (tmsky.isArray(cache.original)) {
            cache.original.forEach(function (item, i) {
                if (item.id) {
                    map[item.name][item.id] = item[name]
                }
            })
        }
        __caches__[__cache_fields__.BASE_INFO].map = map
    },
    getInnBaseInfo : function (getMapData) {
        return this.get(this.CONST.__cache_fields__.BASE_INFO, getMapData)
    },
    getChannelCommission : function () {
        var info = this.getInnBaseInfo(false),
            cn = info['CN'],
            cc = {}

        cn && cn.length && cn.forEach(function (el) {
            cc[el.channelId] = el
        })

        return cc
    },
    /**
     * 获取缓存信息
     * @param key 缓存字段。参考 __cache_util__.CONST
     * @param getMapData
     *  场景：
     *  1、null，undefined、不传 - 直接返回key对应的cache
     *  2、true  - 返回key对应的cache.map
     *  3、false - 返回key对应的cache.original
     * @returns {*}
     */
    get : function (key, getMapData) {
        var cache
        if (key) {
            cache = __caches__[key]
            cache = tmsky.isNull(getMapData) ? cache : cache[getMapData === true ? 'map' : 'original']
        }
        return cache
    },
    getCaches : function () {
        return __caches__
    }
}

window.OrderCacheUtil = OrderCacheUtil

module.exports = Order
