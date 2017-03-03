/**
 * 客栈公用功能util
 * Created by hai on 2016/1/20.
 */
var COMMON_CONST = require('../const.js'),
    CommonUtil = require('common-util.js')
var InnUtil = {
    /**
     * 获取客栈基本信息
     * @param func 插件字符、多个以逗号相隔
     * @param cbs 回调 类型：fn |{success : fn, error : fn[非必须], always : fn[非必须]}
     */
    getInnBaseInfo: function (func, cbs) {
        var url = '/inn/info/base'
        if (!tmsky.isEmpty(func)) {
            url += '/' + (tmsky.isArray(func) ? func.join() : func)
        }
        $.get(url, function (rs) {

            CommonUtil.fireCallbacks(cbs, CommonUtil.__ENUMS__.METHOD.SUCCESS, rs)
        }).error(function (rs) {
            CommonUtil.fire(CommonUtil.__ENUMS__.METHOD.ERROR, rs)
        }).always(function (rs) {
            CommonUtil.fire(CommonUtil.__ENUMS__.METHOD.ALWAYS, rs)
        })
    },
    /**
     * 批量获取用户电话归属地等信息
     * @param phones 批量查询电话；array|string【字符以逗号分隔】
     * @param cb 回调，由于存在多条处理情景，故返回值必须通过回调获得
     * @param sync 是否同步获取
     */
    phoneInfo: function (phones, cb, sync) {
        var _phone_info_util_ = {
            getQueryPhones: function (start, end) {
                var arr = []
                for (; start <= end; start++) {
                    if (phones[start]) {
                        arr.push(phones[start])
                    }
                }
                return arr.join()
            },
            get: function () {
                phones = phones || ''
                phones = tmsky.isString(phones) ? phones.split(',') : phones
                var step = 15,
                    len = Math.ceil(phones.length / step)
                for (var i = 0; i < len; i++) {
                    this.toGetInfo(this.getQueryPhones(i * step, i * step + step - 1))
                }
            },
            toGetInfo: function (phones) {
                if (!tmsky.isEmpty(phones)) {
                    var result = __phone_cache_util__.get(phones)
                    if (result.values && !result.unvalues) {
                        result = result.values
                        result.status = 200
                        if (cb && tmsky.isFunction(cb)) {
                            CommonUtil.fire(cb, result)
                            return result
                        } else {
                            return result
                        }
                    }
                    $.ajax({
                        url: '/common/phoneInfo/' + result.unvalues,
                        type: 'GET',
                        async: tmsky.isEmpty(sync) ? true : !sync,
                        success: function (rs) {
                            __phone_cache_util__.cache(rs)
                            if (cb && tmsky.isFunction(cb)) {
                                if (result.values)
                                    rs = $.extend({}, rs, result.values)
                                CommonUtil.fire(cb, rs)
                            } else {
                                return rs
                            }
                        },
                        error: function (rs) {
                            tmsky.log(rs && rs.message ? rs.message : '获取用户' + result.unvalues + '电话信息失败')
                        }
                    })
                }
            }
        }
        _phone_info_util_.get()
    }
}

var __phone_cache_util__ = {
    key: '_tmsky_phone_info_cache_key_',
    all: function () {
        var caches = tmsky.cipher.getFromCache(this.key)
        return !tmsky.isEmpty(caches) ? tmsky.json.parse(caches) : null
    },
    get: function (phones) {
        var result = {values: null, unvalues: phones},
            caches = this.all()
        if (caches) {
            var values = {},
                _unvalues_ = ''
            phones = phones + ''
            phones = phones.split(',')
            phones.forEach(function (el) {
                if (caches[el])
                    values[el] = caches[el]
                else
                    _unvalues_ += el + ','
            })
            _unvalues_ = _unvalues_.length > 0 ? _unvalues_.substring(0, _unvalues_.length - 1) : ''
            result.unvalues = _unvalues_
            if (!tmsky.isEmptyObject(values))
                result.values = values
        }
        return result
    },
    cache: function (rs) {
        if (rs && rs.status == 200) {
            var caches = this.all()
            var phoneInfo = $.extend({}, caches, rs)
            delete phoneInfo.status
            tmsky.cipher.cache(this.key, phoneInfo)
        }
    }
}

module.exports = InnUtil